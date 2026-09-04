import { describe, expect, it } from "vitest";
import {
  campaignApplicationSchema,
  campaignStatusSchema,
  createCampaignSchema,
} from "./schemas";

const validCampaign = {
  circleId: "",
  title: "The Lantern Archive",
  summary: "An original collaborative mystery about a changing archive.",
  premise:
    "Participants explore an original world and decide together what the archive should preserve.",
  genre: "mystery",
  tone: "Hopeful, curious, and low-conflict",
  safetyExpectations:
    "Use regular check-ins, respect stated boundaries, and allow anyone to pause without explanation.",
  format: "online",
  locationLabel: "",
  scheduleSummary: "Two Saturday afternoons each month for eight weeks.",
  timezone: "America/New_York",
  estimatedSessionMinutes: "120",
  applicationDeadlineLocal: "2026-09-01T17:00",
  playerCapacity: "5",
  experienceLevel: "new",
  modeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  minimumEnergy: "2",
  maximumEnergy: "4",
  stimulationLevel: "moderate",
  socialIntensity: "social",
  interestIds: ["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"],
};

describe("Fifth Realm schemas", () => {
  it("accepts bounded, system-neutral campaign profile fields", () => {
    const result = createCampaignSchema.parse(validCampaign);
    expect(result.circleId).toBeNull();
    expect(result.estimatedSessionMinutes).toBe(120);
    expect(result.playerCapacity).toBe(5);
  });

  it("rejects inverted energy and missing interests", () => {
    const result = createCampaignSchema.safeParse({
      ...validCampaign,
      minimumEnergy: "5",
      maximumEnergy: "2",
      interestIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.maximumEnergy).toBeDefined();
      expect(result.error.flatten().fieldErrors.interestIds).toBeDefined();
    }
  });

  it("explains the safety expectations length requirements", () => {
    const tooShort = createCampaignSchema.safeParse({
      ...validCampaign,
      safetyExpectations: "Too short",
    });
    const tooLong = createCampaignSchema.safeParse({
      ...validCampaign,
      safetyExpectations: "x".repeat(2001),
    });

    expect(tooShort.success).toBe(false);
    expect(tooLong.success).toBe(false);
    if (!tooShort.success) {
      expect(tooShort.error.flatten().fieldErrors.safetyExpectations).toContain(
        "Describe the safety expectations in at least 20 characters.",
      );
    }
    if (!tooLong.success) {
      expect(tooLong.error.flatten().fieldErrors.safetyExpectations).toContain(
        "Keep the safety expectations to 2,000 characters or fewer.",
      );
    }
  });

  it("requires explicit safety acknowledgement on applications", () => {
    const result = campaignApplicationSchema.safeParse({
      campaignId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      motivation: "I value collaborative storytelling and this campaign tone.",
      availability: "Most Saturday afternoons in the listed timezone.",
      experienceLevel: "new",
      safetyAcknowledged: null,
    });
    expect(result.success).toBe(false);
  });

  it("allows only explicit GM lifecycle targets", () => {
    expect(
      campaignStatusSchema.safeParse({
        campaignId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "active",
      }).success,
    ).toBe(true);
    expect(
      campaignStatusSchema.safeParse({
        campaignId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "archived",
      }).success,
    ).toBe(false);
  });
});
