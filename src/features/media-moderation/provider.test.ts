import { describe, expect, it, vi } from "vitest";
import { createImageModerator, ModerationConfigurationError } from "./provider";
import { contextualImageFixtures } from "./provider-policy.fixtures";

function createAzureTestModerator(categoriesAnalysis: unknown) {
  const fetchImplementation = vi.fn(
    async () =>
      new Response(JSON.stringify({ categoriesAnalysis }), { status: 200 }),
  );

  return createImageModerator(
    {
      NODE_ENV: "production",
      IMAGE_MODERATION_PROVIDER: "azure",
      AZURE_CONTENT_SAFETY_ENDPOINT:
        "https://signal-moderation.cognitiveservices.azure.com",
      AZURE_CONTENT_SAFETY_KEY: "secret",
    } as NodeJS.ProcessEnv,
    fetchImplementation,
  );
}

describe("createImageModerator", () => {
  it("fails closed when production credentials are missing", () => {
    expect(() =>
      createImageModerator({
        NODE_ENV: "production",
      } as NodeJS.ProcessEnv),
    ).toThrow(ModerationConfigurationError);
  });

  it("does not permit the development allow adapter in production", () => {
    expect(() =>
      createImageModerator({
        NODE_ENV: "production",
        IMAGE_MODERATION_PROVIDER: "development-allow",
      } as NodeJS.ProcessEnv),
    ).toThrow(ModerationConfigurationError);
  });

  it("normalizes Azure severity into review without exposing vendor labels", async () => {
    const moderator = createAzureTestModerator([
      { category: "Hate", severity: 2 },
      { category: "SelfHarm", severity: 0 },
      { category: "Sexual", severity: 0 },
      { category: "Violence", severity: 0 },
    ]);
    const result = await moderator.moderateImage({
      bytes: Buffer.from("image"),
      mimeType: "image/webp",
      sha256: "a".repeat(64),
    });
    expect(result.outcome).toBe("review");
    expect(result.categories.hate_extremism).toBeCloseTo(2 / 6);
  });

  it.each(contextualImageFixtures)(
    "handles contextual fixture: $name",
    async ({ categoriesAnalysis, expected }) => {
      const moderator = createAzureTestModerator(categoriesAnalysis);
      const result = await moderator.moderateImage({
        bytes: Buffer.from("synthetic-test-image"),
        mimeType: "image/webp",
        sha256: "a".repeat(64),
      });

      expect(result.outcome).toBe(expected);
    },
  );

  it("forces specialist child-safety signals to rejected", async () => {
    const fetchImplementation = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            decision: "REVIEW",
            categories: { sexual_minors: 0.3 },
            suspectedMinorSexualContent: true,
          }),
          { status: 200 },
        ),
    );
    const moderator = createImageModerator(
      {
        NODE_ENV: "production",
        IMAGE_MODERATION_PROVIDER: "webhook",
        IMAGE_MODERATION_WEBHOOK_URL: "https://moderation.example.com/images",
        IMAGE_MODERATION_WEBHOOK_TOKEN: "secret",
      } as NodeJS.ProcessEnv,
      fetchImplementation,
    );
    const result = await moderator.moderateImage({
      bytes: Buffer.from("image"),
      mimeType: "image/webp",
      sha256: "a".repeat(64),
    });
    expect(result.outcome).toBe("rejected");
    expect(result.requiresSpecialHandling).toBe(true);
  });
});
