import { describe, expect, it } from "vitest";
import { rankRecommendationCandidates } from "./score-candidates";
import type {
  PulseRecommendationInput,
  RecommendationCandidate,
} from "./types";

const pulse: PulseRecommendationInput = {
  modeSlug: "connect",
  energyLevel: 3,
  stimulationLevel: "moderate",
  socialIntensity: "light",
  preferredFormat: "either",
  availableMinutes: 60,
  maximumTravelMiles: 15,
  interestIds: ["music", "community"],
};

const candidates: RecommendationCandidate[] = [
  {
    id: "later-mismatch",
    title: "Later mismatch",
    module: "sessions",
    startsAt: "2026-08-04T18:00:00.000Z",
    modeSlugs: ["focus"],
    energyRange: { minimum: 5, maximum: 5 },
    stimulationLevels: ["high"],
    socialIntensities: ["social"],
    format: "in_person",
    durationMinutes: 120,
    distanceMiles: 25,
    interestIds: ["gaming"],
  },
  {
    id: "strong-match",
    title: "Strong match",
    module: "sessions",
    startsAt: "2026-08-03T18:00:00.000Z",
    modeSlugs: ["connect"],
    energyRange: { minimum: 2, maximum: 4 },
    stimulationLevels: ["moderate"],
    socialIntensities: ["light"],
    format: "online",
    durationMinutes: 60,
    distanceMiles: 10,
    interestIds: ["music"],
  },
];

describe("deterministic recommendation ranking", () => {
  it("ranks the strongest Pulse match first with plain-language reasons", () => {
    const ranked = rankRecommendationCandidates(pulse, candidates);
    expect(ranked).toHaveLength(2);
    const first = ranked[0]!;
    expect(first.candidate.id).toBe("strong-match");
    expect(first.fit).toBe("strong");
    expect(first.reasons).toEqual(
      expect.arrayContaining([
        "Fits Your Current Mode",
        "Matches Your Available Energy",
        "Works With Your Preferred Platform",
        "Fits Your Available Time",
        "Connects With Today's Interests",
      ]),
    );
  });

  it("uses start time and stable ID as deterministic tie-breakers", () => {
    const tied: RecommendationCandidate[] = [
      { id: "b", title: "B", module: "circles", startsAt: null },
      {
        id: "c",
        title: "C",
        module: "circles",
        startsAt: "2026-08-03T12:00:00.000Z",
      },
      {
        id: "a",
        title: "A",
        module: "circles",
        startsAt: "2026-08-03T12:00:00.000Z",
      },
    ];
    expect(
      rankRecommendationCandidates(pulse, tied).map(
        ({ candidate }) => candidate.id,
      ),
    ).toEqual(["a", "c", "b"]);
  });

  it("never returns internal numeric scores", () => {
    const ranked = rankRecommendationCandidates(pulse, candidates, 1);
    expect(ranked).toHaveLength(1);
    expect(ranked[0]).not.toHaveProperty("score");
    expect(ranked[0]).not.toHaveProperty("matchedWeight");
    expect(ranked[0]).not.toHaveProperty("availableWeight");
  });

  it("does not award reasons for candidate signals that are missing", () => {
    const [ranked] = rankRecommendationCandidates(pulse, [
      { id: "unknown", title: "Unknown", module: "circles" },
    ]);
    expect(ranked?.reasons).toEqual([]);
    expect(ranked?.fit).toBe("possible");
  });

  it("normalizes by applicable signals so modules are not penalized for fields they do not own", () => {
    const [circle, session] = rankRecommendationCandidates(pulse, [
      {
        id: "circle",
        title: "Circle",
        module: "circles",
        modeSlugs: ["connect"],
        energyRange: { minimum: 2, maximum: 4 },
        stimulationLevels: ["moderate"],
        socialIntensities: ["light"],
        format: "online",
      },
      {
        id: "session",
        title: "Session",
        module: "sessions",
        modeSlugs: ["connect"],
        energyRange: { minimum: 2, maximum: 4 },
        stimulationLevels: ["moderate"],
        socialIntensities: ["light"],
        format: "online",
        durationMinutes: 120,
      },
    ]);
    expect(circle?.candidate.id).toBe("circle");
    expect(circle?.fit).toBe("strong");
    expect(session?.fit).toBe("strong");
    expect(session?.reasons).not.toContain("Fits your available time");
  });

  it("weights interest alignment by the candidate interests that are known", () => {
    const ranked = rankRecommendationCandidates(pulse, [
      {
        id: "partial",
        title: "Partial interest match",
        module: "sessions",
        interestIds: ["music", "gaming", "outdoors"],
      },
      {
        id: "complete",
        title: "Complete interest match",
        module: "circles",
        interestIds: ["music"],
      },
    ]);
    expect(ranked.map(({ candidate }) => candidate.id)).toEqual([
      "complete",
      "partial",
    ]);
    expect(ranked[0]?.fit).toBe("strong");
  });

  it("uses module and ID as deterministic final tie-breakers", () => {
    const tied: RecommendationCandidate[] = [
      { id: "same", title: "Session", module: "sessions" },
      { id: "same", title: "Circle", module: "circles" },
    ];
    expect(
      rankRecommendationCandidates(pulse, tied).map(
        ({ candidate }) => candidate.module,
      ),
    ).toEqual(["circles", "sessions"]);
  });
});
