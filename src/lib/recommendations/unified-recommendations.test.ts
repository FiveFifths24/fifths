import { describe, expect, it } from "vitest";
import type {
  PulseRecommendationInput,
  RecommendationCandidate,
} from "./types";
import {
  rankUnifiedRecommendations,
  recommendationKey,
} from "./unified-recommendations";

const pulse: PulseRecommendationInput = {
  modeSlug: "connect",
  energyLevel: 3,
  stimulationLevel: "moderate",
  socialIntensity: "light",
  preferredFormat: "online",
  availableMinutes: 90,
  maximumTravelMiles: null,
  interestIds: ["community"],
};

function candidate(
  id: string,
  module: RecommendationCandidate["module"],
  matching = true,
): RecommendationCandidate {
  return {
    id,
    title: `${module} ${id}`,
    module,
    modeSlugs: [matching ? "connect" : "focus"],
    energyRange: matching
      ? { minimum: 2, maximum: 4 }
      : { minimum: 5, maximum: 5 },
    stimulationLevels: [matching ? "moderate" : "high"],
    socialIntensities: [matching ? "light" : "social"],
    format: matching ? "online" : "in_person",
    interestIds: [matching ? "community" : "gaming"],
  };
}

describe("unified recommendation ranking", () => {
  it("balances the initial feed across eligible modules before filling spare slots", () => {
    const ranked = rankUnifiedRecommendations(
      pulse,
      [
        candidate("s1", "sessions"),
        candidate("s2", "sessions"),
        candidate("s3", "sessions"),
        candidate("c1", "circles"),
        candidate("c2", "commons"),
        candidate("r1", "realm"),
      ],
      { limit: 5, initialModuleLimit: 1 },
    );
    expect(ranked.map(({ candidate }) => candidate.module)).toEqual([
      "circles",
      "commons",
      "realm",
      "sessions",
      "sessions",
    ]);
  });

  it("removes duplicate module records with a stable composite key", () => {
    const duplicate = candidate("same-id", "sessions");
    const ranked = rankUnifiedRecommendations(pulse, [
      duplicate,
      { ...duplicate, title: "Duplicate read" },
      candidate("same-id", "circles"),
    ]);
    expect(ranked).toHaveLength(2);
    expect(recommendationKey(duplicate)).toBe("sessions:same-id");
  });

  it("excludes candidates with no truthful explanation from Personal Home", () => {
    const ranked = rankUnifiedRecommendations(pulse, [
      candidate("relevant", "sessions"),
      candidate("unrelated", "realm", false),
    ]);
    expect(ranked.map(({ candidate }) => candidate.id)).toEqual(["relevant"]);
  });

  it("is independent of input order and never exposes numeric scores", () => {
    const values = [
      candidate("b", "sessions"),
      candidate("a", "circles"),
      candidate("c", "commons"),
    ];
    const forward = rankUnifiedRecommendations(pulse, values);
    const reversed = rankUnifiedRecommendations(pulse, [...values].reverse());
    expect(forward).toEqual(reversed);
    expect(forward.every((item) => !("score" in item))).toBe(true);
  });

  it("respects zero and bounded result limits", () => {
    const values = [candidate("a", "sessions"), candidate("b", "circles")];
    expect(rankUnifiedRecommendations(pulse, values, { limit: 0 })).toEqual([]);
    expect(
      rankUnifiedRecommendations(pulse, values, { limit: 1 }),
    ).toHaveLength(1);
  });
});
