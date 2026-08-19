import { describe, expect, it } from "vitest";
import type { RealmCampaign } from "@/types/database";
import { assembleCampaignCards, rankCampaigns } from "./campaign-data";

const campaign: RealmCampaign = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  created_by: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  game_master_display_name: "Avery",
  circle_id: null,
  title: "The Lantern Archive",
  summary: "An original collaborative mystery about a changing archive.",
  premise: "An original, system-neutral premise for collaborative play.",
  genre: "Mystery",
  tone: "Hopeful and curious",
  safety_expectations:
    "Regular check-ins and participant boundaries guide every Session.",
  status: "recruiting",
  format: "online",
  location_label: null,
  schedule_summary: "Two Saturday afternoons each month.",
  timezone: "America/New_York",
  estimated_session_minutes: 120,
  application_deadline: "2026-09-01T21:00:00.000Z",
  player_capacity: 5,
  active_player_count: 1,
  experience_level: "new",
  mode_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  minimum_energy: 2,
  maximum_energy: 4,
  stimulation_level: "moderate",
  social_intensity: "social",
  published_at: "2026-08-01T12:00:00.000Z",
  recruiting_closed_at: null,
  completed_at: null,
  created_at: "2026-08-01T11:00:00.000Z",
  updated_at: "2026-08-01T12:00:00.000Z",
};

describe("Fifth Realm campaign data", () => {
  it("adapts campaigns into explainable Realm candidates", () => {
    const ranked = rankCampaigns(
      {
        modeSlug: "immerse",
        energyLevel: 3,
        stimulationLevel: "moderate",
        socialIntensity: "social",
        preferredFormat: "online",
        availableMinutes: 180,
        maximumTravelMiles: null,
        interestIds: ["dddddddd-dddd-4ddd-8ddd-dddddddddddd"],
      },
      [campaign],
      [{ id: campaign.mode_id, slug: "immerse" }],
      [
        {
          campaign_id: campaign.id,
          interest_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        },
      ],
    );
    expect(ranked[0]?.candidate.module).toBe("realm");
    expect(ranked[0]?.reasons).toContain("Connects With Today's Interests");
    expect(ranked[0]).not.toHaveProperty("score");
  });

  it("assembles interest, application, and membership state", () => {
    const cards = assembleCampaignCards(
      [campaign],
      [{ id: campaign.mode_id, name: "Immerse" }],
      [{ id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", name: "Storytelling" }],
      [
        {
          campaign_id: campaign.id,
          interest_id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        },
      ],
      [],
      [{ campaign_id: campaign.id, status: "submitted" }],
      [campaign.id],
    );
    expect(cards[0]).toMatchObject({
      modeName: "Immerse",
      interestNames: ["Storytelling"],
      applicationStatus: "submitted",
      isMember: true,
    });
  });
});
