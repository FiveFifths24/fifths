import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./schemas";

const validOnboarding = {
  username: "fifthsuser",
  displayName: "FIFTHS User",
  pronouns: "they/them",
  timezone: "America/New_York",
  locationVisibility: "hidden",
  friendListVisibility: "private",
  interestIds: ["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"],
  skillIds: ["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"],
};

describe("onboarding validation", () => {
  it("normalizes valid profile data", () => {
    const result = onboardingSchema.parse({
      ...validOnboarding,
      username: "  FIFTHSuser  ",
    });
    expect(result.username).toBe("fifthsuser");
  });

  it("rejects unsafe usernames", () => {
    const result = onboardingSchema.safeParse({
      ...validOnboarding,
      username: "not allowed!",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.username).toBeDefined();
    }
  });

  it("limits taxonomy selections to twelve", () => {
    const interestIds = Array.from(
      { length: 13 },
      (_, index) =>
        `aaaaaaaa-aaaa-4aaa-8aaa-${index.toString().padStart(12, "0")}`,
    );
    expect(
      onboardingSchema.safeParse({ ...validOnboarding, interestIds }).success,
    ).toBe(false);
  });
});
