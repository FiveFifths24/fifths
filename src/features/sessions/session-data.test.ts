import { describe, expect, it } from "vitest";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import type { Session } from "@/types/database";
import { rankSessions } from "./session-data";

const base: Session = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  host_user_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  host_display_name: "Jordan",
  source_module: "platform",
  circle_id: null,
  campaign_id: null,
  title: "Quiet creative sprint",
  summary: "A focused making session.",
  description: "A focused making session with a clear beginning and ending.",
  status: "published",
  format: "online",
  starts_at: "2027-01-15T18:00:00.000Z",
  ends_at: "2027-01-15T19:00:00.000Z",
  timezone: "UTC",
  capacity: 20,
  confirmed_registration_count: 0,
  location_label: null,
  mode_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  minimum_energy: 1,
  maximum_energy: 3,
  stimulation_level: "low",
  social_intensity: "light",
  published_at: "2027-01-01T00:00:00.000Z",
  created_at: "2027-01-01T00:00:00.000Z",
  updated_at: "2027-01-01T00:00:00.000Z",
};

const pulse: PulseRecommendationInput = {
  modeSlug: "create",
  energyLevel: 2,
  stimulationLevel: "low",
  socialIntensity: "light",
  preferredFormat: "online",
  availableMinutes: 60,
  maximumTravelMiles: null,
  interestIds: ["dddddddd-dddd-4ddd-8ddd-dddddddddddd"],
};

describe("rankSessions", () => {
  it("adapts real Session records to the shared deterministic scorer", () => {
    const ranked = rankSessions(
      pulse,
      [base],
      [{ id: base.mode_id, slug: "create" }],
      [
        {
          session_id: base.id,
          interest_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        },
      ],
    );

    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.candidate.id).toBe(base.id);
    expect(ranked[0]?.reasons).toEqual(
      expect.arrayContaining([
        "Fits Your Current Mode",
        "Matches Your Available Energy",
        "Connects With Today's Interests",
      ]),
    );
    expect(ranked[0]).not.toHaveProperty("score");
  });
});
