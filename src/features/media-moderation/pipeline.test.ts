import { describe, expect, it, vi } from "vitest";
import type { PreparedImage } from "./image-validation";
import {
  executeModeratedImageUpload,
  MediaUploadAuthenticationError,
  type MediaModerationStore,
} from "./pipeline";
import type { ImageModerator } from "./types";

const prepared: PreparedImage = {
  publicationBytes: Buffer.from("safe-publication"),
  moderationBytes: Buffer.from("safe-moderation-copy"),
  originalMimeType: "image/png",
  originalByteSize: 20,
  normalizedByteSize: 16,
  width: 100,
  height: 100,
  sha256: "a".repeat(64),
};

function fixture(
  userId: string | null,
  outcome: "approved" | "review" | "rejected",
) {
  const updates: Array<Record<string, unknown>> = [];
  const store: MediaModerationStore = {
    authenticate: vi.fn(async () => userId),
    begin: vi.fn(async () => "audit-id"),
    uploadQuarantine: vi.fn(async () => undefined),
    publish: vi.fn(async () => undefined),
    updateAudit: vi.fn(async (_id, update) => {
      updates.push(update);
    }),
    deleteQuarantine: vi.fn(async () => undefined),
  };
  const moderator: ImageModerator = {
    moderateImage: vi.fn(async () => ({
      outcome,
      categories: outcome === "approved" ? {} : { sexual_nudity: 0.5 },
      provider: "test-provider",
    })),
  };
  return { store, moderator, updates };
}

describe("executeModeratedImageUpload", () => {
  it("rejects an unauthenticated upload before quarantine", async () => {
    const { store, moderator } = fixture(null, "approved");
    await expect(
      executeModeratedImageUpload(
        { prepared, surface: "profile_avatar", currentPath: null },
        { store, moderator },
      ),
    ).rejects.toBeInstanceOf(MediaUploadAuthenticationError);
    expect(store.begin).not.toHaveBeenCalled();
    expect(store.uploadQuarantine).not.toHaveBeenCalled();
  });

  it("publishes only after an approved moderation result", async () => {
    const { store, moderator } = fixture("user-1", "approved");
    const result = await executeModeratedImageUpload(
      { prepared, surface: "profile_avatar", currentPath: "old.webp" },
      { store, moderator, randomUUID: () => "random-id" },
    );
    expect(store.uploadQuarantine).toHaveBeenCalledOnce();
    expect(moderator.moderateImage).toHaveBeenCalledOnce();
    expect(store.publish).toHaveBeenCalledOnce();
    expect(result).toEqual({
      path: "user-1/avatar-random-id.webp",
      outcome: "approved",
    });
  });

  it("keeps review results private and preserves the approved replacement", async () => {
    const { store, moderator } = fixture("user-1", "review");
    const result = await executeModeratedImageUpload(
      { prepared, surface: "profile_wallpaper", currentPath: "old.webp" },
      { store, moderator },
    );
    expect(store.publish).not.toHaveBeenCalled();
    expect(store.deleteQuarantine).not.toHaveBeenCalled();
    expect(result).toEqual({ path: "old.webp", outcome: "review" });
  });

  it("audits and deletes rejected content without publishing it", async () => {
    const { store, moderator, updates } = fixture("user-1", "rejected");
    const result = await executeModeratedImageUpload(
      { prepared, surface: "profile_featured", currentPath: "old.webp" },
      { store, moderator },
    );
    expect(store.publish).not.toHaveBeenCalled();
    expect(store.deleteQuarantine).toHaveBeenCalledOnce();
    expect(updates[0]?.status).toBe("rejected");
    expect(
      vi.mocked(store.updateAudit).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(store.deleteQuarantine).mock.invocationCallOrder[0]!,
    );
    expect(result).toEqual({ path: "old.webp", outcome: "rejected" });
  });

  it("fails closed on provider errors", async () => {
    const { store, moderator } = fixture("user-1", "approved");
    vi.mocked(moderator.moderateImage).mockRejectedValueOnce(
      new Error("provider down"),
    );
    const result = await executeModeratedImageUpload(
      { prepared, surface: "profile_landscape", currentPath: "old.webp" },
      { store, moderator },
    );
    expect(store.publish).not.toHaveBeenCalled();
    expect(result).toEqual({ path: "old.webp", outcome: "review" });
  });
});
