import "server-only";

import { z } from "zod";
import {
  moderationCategories,
  type ImageModerator,
  type ModerationCategoryScores,
} from "./types";

export class ModerationConfigurationError extends Error {
  constructor(message = "Image moderation is not configured.") {
    super(message);
    this.name = "ModerationConfigurationError";
  }
}

export class ModerationProviderError extends Error {
  constructor(message = "The image moderation provider failed.") {
    super(message);
    this.name = "ModerationProviderError";
  }
}

const azureResponseSchema = z.object({
  categoriesAnalysis: z.array(
    z.object({
      category: z.enum(["Hate", "SelfHarm", "Sexual", "Violence"]),
      severity: z.union([
        z.literal(0),
        z.literal(2),
        z.literal(4),
        z.literal(6),
      ]),
    }),
  ),
});

type AzureAnalysis = z.infer<typeof azureResponseSchema>["categoriesAnalysis"];

/**
 * Azure returns only a broad harm category and a four-level severity. Its low
 * Sexual tier explicitly includes fashion, figure art, and body art, while its
 * low Violence tier includes fictional/game violence and displayed weapons.
 * Those signals are therefore legitimate enough to allow on their own.
 *
 * Medium signals and non-sexual high signals lack the context needed to tell,
 * for example, fiction from real-world harm or education from propaganda. They
 * stay private for review. Azure's high Sexual tier is reserved for explicit
 * sexual acts and illegal sexual content, so that tier can be blocked without
 * publishing it or routing it through the ordinary review gallery.
 */
function outcomeFromAzureAnalysis(analysis: AzureAnalysis) {
  if (
    analysis.some(
      ({ category, severity }) => category === "Sexual" && severity === 6,
    )
  ) {
    return "rejected" as const;
  }

  if (
    analysis.some(({ category, severity }) => {
      if (severity === 0) return false;
      if (category === "Sexual" || category === "Violence") {
        return severity >= 4;
      }
      return true;
    })
  ) {
    return "review" as const;
  }

  return "approved" as const;
}

function createAzureModerator(
  endpoint: string,
  apiKey: string,
  fetchImplementation: typeof fetch = fetch,
): ImageModerator {
  const url = new URL(
    "/contentsafety/image:analyze?api-version=2024-09-01",
    endpoint,
  );

  return {
    async moderateImage(input) {
      let response: Response;
      try {
        response = await fetchImplementation(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": apiKey,
          },
          body: JSON.stringify({
            image: { content: input.bytes.toString("base64") },
            categories: ["Hate", "SelfHarm", "Sexual", "Violence"],
            outputType: "FourSeverityLevels",
          }),
          signal: AbortSignal.timeout(15_000),
        });
      } catch {
        throw new ModerationProviderError();
      }
      if (!response.ok) throw new ModerationProviderError();

      const parsed = azureResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new ModerationProviderError();

      const categories: ModerationCategoryScores = {};
      for (const item of parsed.data.categoriesAnalysis) {
        const score = item.severity / 6;
        if (item.category === "Sexual") {
          categories[
            item.severity === 6 ? "sexual_explicit" : "sexual_nudity"
          ] = score;
        } else if (item.category === "Violence") {
          categories.graphic_violence = score;
        } else if (item.category === "Hate") {
          categories.hate_extremism = score;
        } else {
          categories.self_harm = score;
        }
      }

      return {
        outcome: outcomeFromAzureAnalysis(parsed.data.categoriesAnalysis),
        categories,
        provider: "azure-content-safety",
        requestId: response.headers.get("apim-request-id") ?? undefined,
      };
    },
  };
}

const webhookResponseSchema = z.object({
  decision: z.enum(["ALLOW", "REVIEW", "BLOCK"]),
  categories: z.partialRecord(
    z.enum(moderationCategories),
    z.number().min(0).max(1),
  ),
  requestId: z.string().max(200).optional(),
  suspectedMinorSexualContent: z.boolean().optional().default(false),
});

function createWebhookModerator(
  endpoint: string,
  token: string,
  fetchImplementation: typeof fetch = fetch,
): ImageModerator {
  const url = new URL(endpoint);
  if (url.protocol !== "https:") {
    throw new ModerationConfigurationError(
      "The moderation webhook must use HTTPS.",
    );
  }
  return {
    async moderateImage(input) {
      let response: Response;
      try {
        response = await fetchImplementation(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: input.bytes.toString("base64"),
            mimeType: input.mimeType,
            sha256: input.sha256,
          }),
          signal: AbortSignal.timeout(15_000),
        });
      } catch {
        throw new ModerationProviderError();
      }
      if (!response.ok) throw new ModerationProviderError();
      const parsed = webhookResponseSchema.safeParse(await response.json());
      if (!parsed.success) throw new ModerationProviderError();

      const requiresSpecialHandling =
        parsed.data.suspectedMinorSexualContent ||
        (parsed.data.categories.sexual_minors ?? 0) > 0;
      return {
        outcome: requiresSpecialHandling
          ? "rejected"
          : parsed.data.decision === "ALLOW"
            ? "approved"
            : parsed.data.decision === "REVIEW"
              ? "review"
              : "rejected",
        categories: parsed.data.categories,
        provider: "moderation-webhook",
        requestId: parsed.data.requestId,
        requiresSpecialHandling,
      };
    },
  };
}

export function createImageModerator(
  environment: NodeJS.ProcessEnv = process.env,
  fetchImplementation: typeof fetch = fetch,
): ImageModerator {
  const provider = environment.IMAGE_MODERATION_PROVIDER;
  if (provider === "azure") {
    const endpoint = environment.AZURE_CONTENT_SAFETY_ENDPOINT;
    const apiKey = environment.AZURE_CONTENT_SAFETY_KEY;
    if (!endpoint || !apiKey) throw new ModerationConfigurationError();
    return createAzureModerator(endpoint, apiKey, fetchImplementation);
  }
  if (provider === "webhook") {
    const endpoint = environment.IMAGE_MODERATION_WEBHOOK_URL;
    const token = environment.IMAGE_MODERATION_WEBHOOK_TOKEN;
    if (!endpoint || !token) throw new ModerationConfigurationError();
    return createWebhookModerator(endpoint, token, fetchImplementation);
  }
  if (
    provider === "development-allow" &&
    environment.NODE_ENV !== "production"
  ) {
    return {
      async moderateImage() {
        return {
          outcome: "approved",
          categories: {},
          provider: "development-allow",
        };
      },
    };
  }
  throw new ModerationConfigurationError();
}
