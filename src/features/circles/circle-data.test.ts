import { describe, expect, it } from "vitest";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import type { Circle } from "@/types/database";
import { rankCircles } from "./circle-data";

const circle: Circle = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  created_by: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  name: "Quiet creators",
  slug: "quiet-creators",
  summary: "A focused community for thoughtful creative practice.",
  description:
    "A detailed community description for thoughtful creative practice.",
  rules:
    "Respect privacy, consent, focus, and every member's stated boundaries.",
  status: "published",
  visibility: "public",
  join_policy: "request",
  format: "online",
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

describe("rankCircles", () => {
  it("adapts eligible Circles to the shared scorer without exposing a score", () => {
    const ranked = rankCircles(
      pulse,
      [circle],
      [{ id: circle.mode_id, slug: "create" }],
      [{ circle_id: circle.id, interest_id: pulse.interestIds[0]! }],
    );
    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.candidate.module).toBe("circles");
    expect(ranked[0]?.reasons).toEqual(
      expect.arrayContaining([
        "Fits Your Current Mode",
        "Matches Your Preferred Stimulation",
        "Connects With Today's Interests",
      ]),
    );
    expect(ranked[0]).not.toHaveProperty("score");
  });
});
