import { describe, expect, it } from "vitest";
import type { CreatorOpportunity } from "@/types/database";
import {
  assembleOpportunityCards,
  rankOpportunities,
} from "./opportunity-data";

const opportunity: CreatorOpportunity = {
  id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  created_by: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  creator_display_name: "Avery",
  circle_id: null,
  title: "Launch interview series",
  summary: "Produce a short creator interview series.",
  description: "A complete and intentionally bounded creator collaboration.",
  deliverables: "Three captioned interviews and one production handoff guide.",
  kind: "collaboration",
  status: "published",
  close_reason: null,
  format: "online",
  location_label: null,
  response_deadline: "2026-09-01T21:00:00.000Z",
  timezone: "America/New_York",
  estimated_minutes: 120,
  positions: 2,
  accepted_count: 0,
  mode_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  minimum_energy: 2,
  maximum_energy: 4,
  stimulation_level: "moderate",
  social_intensity: "light",
  published_at: "2026-08-01T12:00:00.000Z",
  closed_at: null,
  completed_at: null,
  created_at: "2026-08-01T11:00:00.000Z",
  updated_at: "2026-08-01T12:00:00.000Z",
};

describe("Creator Commons opportunity data", () => {
  it("adapts opportunities into explainable Pulse candidates", () => {
    const ranked = rankOpportunities(
      {
        modeSlug: "create",
        energyLevel: 3,
        stimulationLevel: "moderate",
        socialIntensity: "light",
        preferredFormat: "online",
        availableMinutes: 180,
        maximumTravelMiles: null,
        interestIds: ["dddddddd-dddd-4ddd-8ddd-dddddddddddd"],
      },
      [opportunity],
      [{ id: opportunity.mode_id, slug: "create" }],
      [
        {
          opportunity_id: opportunity.id,
          interest_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        },
      ],
    );

    expect(ranked[0]?.candidate.module).toBe("commons");
    expect(ranked[0]?.reasons).toContain("Connects with today's interests");
    expect(ranked[0]).not.toHaveProperty("score");
  });

  it("assembles taxonomy, save, and response state", () => {
    const cards = assembleOpportunityCards(
      [opportunity],
      [{ id: opportunity.mode_id, name: "Create" }],
      [{ id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", name: "Production" }],
      [{ id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", name: "Media" }],
      [
        {
          opportunity_id: opportunity.id,
          skill_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        },
      ],
      [
        {
          opportunity_id: opportunity.id,
          interest_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        },
      ],
      [],
      [opportunity.id],
      [{ opportunity_id: opportunity.id, status: "submitted" }],
    );

    expect(cards[0]).toMatchObject({
      modeName: "Create",
      skillNames: ["Production"],
      interestNames: ["Media"],
      saved: true,
      responseStatus: "submitted",
    });
  });
});
