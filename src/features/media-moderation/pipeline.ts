import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";
import type { PreparedImage } from "./image-validation";
import { createImageModerator } from "./provider";
import type {
  ImageModerator,
  MediaUploadResult,
  MediaUploadSurface,
  NormalizedModerationResult,
} from "./types";

const QUARANTINE_BUCKET = "media-quarantine";
const PUBLISHED_BUCKET = "profile-media";

export class MediaUploadAuthenticationError extends Error {
  constructor() {
    super("Authentication is required to upload an image.");
    this.name = "MediaUploadAuthenticationError";
  }
}

export class MediaUploadStorageError extends Error {
  constructor() {
    super("The image could not be stored safely.");
    this.name = "MediaUploadStorageError";
  }
}

type AuditUpdate = {
  status: "approved" | "review" | "rejected" | "error";
  provider?: string;
  provider_request_id?: string;
  categories?: Json;
  provider_metadata?: Json;
  decision_reason?: string;
  legal_escalation_required?: boolean;
  moderated_at?: string;
  published_bucket?: string;
  published_path?: string;
  quarantine_deleted_at?: string;
};

export interface MediaModerationStore {
  authenticate(): Promise<string | null>;
  begin(input: {
    userId: string;
    surface: MediaUploadSurface;
    quarantinePath: string;
    prepared: PreparedImage;
  }): Promise<string>;
  uploadQuarantine(path: string, bytes: Buffer): Promise<void>;
  publish(path: string, bytes: Buffer): Promise<void>;
  updateAudit(id: string, update: AuditUpdate): Promise<void>;
  deleteQuarantine(path: string): Promise<void>;
}

function publicKind(surface: MediaUploadSurface) {
  return surface.replace(/^profile_/, "").replace("featured_2", "featured-2");
}

function auditDecision(result: NormalizedModerationResult): AuditUpdate {
  return {
    status: result.outcome,
    provider: result.provider,
    provider_request_id: result.requestId,
    categories: result.categories,
    provider_metadata: {},
    decision_reason: result.requiresSpecialHandling
      ? "specialized_legal_handling_required"
      : `automated_${result.outcome}`,
    legal_escalation_required: result.requiresSpecialHandling ?? false,
    moderated_at: new Date().toISOString(),
  };
}

export async function executeModeratedImageUpload(
  input: {
    prepared: PreparedImage;
    surface: MediaUploadSurface;
    currentPath: string | null;
  },
  dependencies: {
    store: MediaModerationStore;
    moderator: ImageModerator;
    randomUUID?: () => string;
  },
): Promise<MediaUploadResult> {
  const userId = await dependencies.store.authenticate();
  if (!userId) throw new MediaUploadAuthenticationError();

  const randomUUID = dependencies.randomUUID ?? (() => crypto.randomUUID());
  const quarantinePath = `${userId}/${randomUUID()}.webp`;
  const publishedPath = `${userId}/${publicKind(input.surface)}-${randomUUID()}.webp`;
  const auditId = await dependencies.store.begin({
    userId,
    surface: input.surface,
    quarantinePath,
    prepared: input.prepared,
  });

  try {
    await dependencies.store.uploadQuarantine(
      quarantinePath,
      input.prepared.publicationBytes,
    );
  } catch {
    await dependencies.store.updateAudit(auditId, {
      status: "error",
      decision_reason: "quarantine_upload_failed",
    });
    throw new MediaUploadStorageError();
  }

  let decision: NormalizedModerationResult;
  try {
    decision = await dependencies.moderator.moderateImage({
      bytes: input.prepared.moderationBytes,
      mimeType: "image/webp",
      sha256: input.prepared.sha256,
    });
  } catch {
    await dependencies.store.updateAudit(auditId, {
      status: "review",
      decision_reason: "provider_unavailable",
    });
    return { path: input.currentPath, outcome: "review" };
  }

  if (decision.outcome === "review") {
    await dependencies.store.updateAudit(auditId, auditDecision(decision));
    return { path: input.currentPath, outcome: "review" };
  }

  if (decision.outcome === "rejected") {
    await dependencies.store.updateAudit(auditId, auditDecision(decision));
    try {
      await dependencies.store.deleteQuarantine(quarantinePath);
      await dependencies.store.updateAudit(auditId, {
        ...auditDecision(decision),
        quarantine_deleted_at: new Date().toISOString(),
      });
    } catch {
      // Cleanup retries the already-audited rejected object.
    }
    return { path: input.currentPath, outcome: "rejected" };
  }

  try {
    await dependencies.store.publish(
      publishedPath,
      input.prepared.publicationBytes,
    );
  } catch {
    await dependencies.store.updateAudit(auditId, {
      status: "error",
      provider: decision.provider,
      categories: decision.categories,
      decision_reason: "approved_publication_failed",
      moderated_at: new Date().toISOString(),
    });
    throw new MediaUploadStorageError();
  }

  await dependencies.store.updateAudit(auditId, {
    ...auditDecision(decision),
    published_bucket: PUBLISHED_BUCKET,
    published_path: publishedPath,
  });
  try {
    await dependencies.store.deleteQuarantine(quarantinePath);
    await dependencies.store.updateAudit(auditId, {
      ...auditDecision(decision),
      published_bucket: PUBLISHED_BUCKET,
      published_path: publishedPath,
      quarantine_deleted_at: new Date().toISOString(),
    });
  } catch {
    // Cleanup retries without affecting the already-approved publication.
  }
  return { path: publishedPath, outcome: "approved" };
}

function createSupabaseStore(
  userClient: SupabaseClient<Database>,
  serviceClient: SupabaseClient<Database>,
): MediaModerationStore {
  return {
    async authenticate() {
      const { data } = await userClient.auth.getUser();
      return data.user?.id ?? null;
    },
    async begin({ surface, quarantinePath, prepared }) {
      const { data, error } = await userClient.rpc(
        "begin_media_moderation_upload",
        {
          p_upload_surface: surface,
          p_quarantine_path: quarantinePath,
          p_original_mime_type: prepared.originalMimeType,
          p_normalized_byte_size: prepared.normalizedByteSize,
          p_original_byte_size: prepared.originalByteSize,
          p_image_width: prepared.width,
          p_image_height: prepared.height,
          p_file_sha256: prepared.sha256,
        },
      );
      if (error || !data) throw new MediaUploadStorageError();
      return data;
    },
    async uploadQuarantine(path, bytes) {
      const { error } = await serviceClient.storage
        .from(QUARANTINE_BUCKET)
        .upload(path, bytes, {
          cacheControl: "0",
          contentType: "image/webp",
          upsert: false,
        });
      if (error) throw new MediaUploadStorageError();
    },
    async publish(path, bytes) {
      const { error } = await serviceClient.storage
        .from(PUBLISHED_BUCKET)
        .upload(path, bytes, {
          cacheControl: "31536000",
          contentType: "image/webp",
          upsert: false,
        });
      if (error) throw new MediaUploadStorageError();
    },
    async updateAudit(id, update) {
      const { error } = await serviceClient
        .from("media_moderation_records")
        .update(update)
        .eq("id", id);
      if (error) throw new MediaUploadStorageError();
    },
    async deleteQuarantine(path) {
      const { error } = await serviceClient.storage
        .from(QUARANTINE_BUCKET)
        .remove([path]);
      if (error) throw new MediaUploadStorageError();
    },
  };
}

export async function moderatePreparedProfileImage(
  prepared: PreparedImage,
  surface: MediaUploadSurface,
  currentPath: string | null,
) {
  const moderator = createImageModerator();
  const userClient = await createClient();
  const serviceClient = createServiceClient();
  return executeModeratedImageUpload(
    { prepared, surface, currentPath },
    {
      moderator,
      store: createSupabaseStore(userClient, serviceClient),
    },
  );
}

export async function removePublishedModeratedImage(path: string) {
  const serviceClient = createServiceClient();
  await serviceClient.storage.from(PUBLISHED_BUCKET).remove([path]);
}

export async function discardUnreferencedModeratedImage(path: string) {
  const serviceClient = createServiceClient();
  await serviceClient.storage.from(PUBLISHED_BUCKET).remove([path]);
  await serviceClient
    .from("media_moderation_records")
    .update({
      status: "error",
      decision_reason: "profile_reference_update_failed",
    })
    .eq("published_path", path)
    .eq("status", "approved");
}
