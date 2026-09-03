import { describe, expect, it } from "vitest";
import { onboardingSchema } from "./schemas";

const validOnboarding = {
  username: "fifthsuser",
  displayName: "FIFTHS User",
  pronouns: "they/them",
  timezone: "America/New_York",
  locationVisibility: "hidden",
  friendListVisibility: "private",
  profileVisibility: "members",
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

  it("accepts 20-character handles and rejects longer handles", () => {
    expect(
      onboardingSchema.safeParse({
        ...validOnboarding,
        username: "a1234567890123456789",
      }).success,
    ).toBe(true);
    expect(
      onboardingSchema.safeParse({
        ...validOnboarding,
        username: "a12345678901234567890",
      }).success,
    ).toBe(false);
  });

  it("allows twenty interests but not twenty-one", () => {
    const interestIds = Array.from(
      { length: 20 },
      (_, index) =>
        `aaaaaaaa-aaaa-4aaa-8aaa-${index.toString().padStart(12, "0")}`,
    );
    expect(
      onboardingSchema.safeParse({ ...validOnboarding, interestIds }).success,
    ).toBe(true);
    expect(
      onboardingSchema.safeParse({
        ...validOnboarding,
        interestIds: [...interestIds, "aaaaaaaa-aaaa-4aaa-8aaa-000000000020"],
      }).success,
    ).toBe(false);
  });
});
