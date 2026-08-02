import type {
  PulseRecommendationInput,
  RankedRecommendation,
  RecommendationCandidate,
  RecommendationReason,
} from "./types";

type ScoredCandidate = RankedRecommendation & { score: number };

function scoreCandidate(
  pulse: PulseRecommendationInput,
  candidate: RecommendationCandidate,
): ScoredCandidate {
  let score = 0;
  const reasons: RecommendationReason[] = [];

  if (candidate.modeSlugs?.includes(pulse.modeSlug)) {
    score += 24;
    reasons.push("Fits your current mode");
  }

  if (
    candidate.energyRange &&
    pulse.energyLevel >= candidate.energyRange.minimum &&
    pulse.energyLevel <= candidate.energyRange.maximum
  ) {
    score += 18;
    reasons.push("Matches your available energy");
  }

  if (candidate.stimulationLevels?.includes(pulse.stimulationLevel)) {
    score += 14;
    reasons.push("Matches your preferred stimulation");
  }

  if (candidate.socialIntensities?.includes(pulse.socialIntensity)) {
    score += 14;
    reasons.push("Matches your social pace");
  }

  if (
    candidate.format &&
    (candidate.format === "either" ||
      pulse.preferredFormat === "either" ||
      candidate.format === pulse.preferredFormat)
  ) {
    score += 12;
    reasons.push("Works with your preferred format");
  }

  if (
    candidate.durationMinutes != null &&
    candidate.durationMinutes <= pulse.availableMinutes
  ) {
    score += 12;
    reasons.push("Fits your available time");
  }

  const matchingInterests = new Set(pulse.interestIds);
  const candidateInterests = new Set(candidate.interestIds ?? []);
  const interestMatchCount = [...candidateInterests].filter((id) =>
    matchingInterests.has(id),
  ).length;
  if (interestMatchCount > 0) {
    score += Math.min(18, interestMatchCount * 6);
    reasons.push("Connects with today's interests");
  }

  if (
    pulse.maximumTravelMiles != null &&
    candidate.distanceMiles != null &&
    candidate.distanceMiles <= pulse.maximumTravelMiles
  ) {
    score += 8;
    reasons.push("Within your travel range");
  }

  return { candidate, reasons, score };
}

function startTime(candidate: RecommendationCandidate) {
  if (!candidate.startsAt) return Number.POSITIVE_INFINITY;
  const value = Date.parse(candidate.startsAt);
  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value;
}

export function rankRecommendationCandidates(
  pulse: PulseRecommendationInput,
  candidates: RecommendationCandidate[],
  limit = candidates.length,
): RankedRecommendation[] {
  return candidates
    .map((candidate) => scoreCandidate(pulse, candidate))
    .sort(
      (left, right) =>
        right.score - left.score ||
        startTime(left.candidate) - startTime(right.candidate) ||
        left.candidate.id.localeCompare(right.candidate.id),
    )
    .slice(0, Math.max(0, limit))
    .map(({ candidate, reasons }) => ({ candidate, reasons }));
}
