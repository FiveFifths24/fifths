import type {
  PulseRecommendationInput,
  RankedRecommendation,
  RecommendationCandidate,
  RecommendationReason,
} from "./types";

const weights = {
  mode: 24,
  energy: 18,
  stimulation: 14,
  social: 14,
  format: 12,
  time: 12,
  interests: 18,
  travel: 8,
} as const;

type ScoredCandidate = RankedRecommendation & {
  matchedWeight: number;
  availableWeight: number;
};

function fitLevel(matchedWeight: number, availableWeight: number) {
  if (availableWeight === 0) return "possible" as const;
  const percentage = (matchedWeight * 100) / availableWeight;
  if (percentage >= 70) return "strong" as const;
  if (percentage >= 40) return "good" as const;
  return "possible" as const;
}

function scoreCandidate(
  pulse: PulseRecommendationInput,
  candidate: RecommendationCandidate,
): ScoredCandidate {
  let matchedWeight = 0;
  let availableWeight = 0;
  const reasons: RecommendationReason[] = [];

  if (candidate.modeSlugs?.length) {
    availableWeight += weights.mode;
    if (candidate.modeSlugs.includes(pulse.modeSlug)) {
      matchedWeight += weights.mode;
      reasons.push("Fits Your Current Mode");
    }
  }

  if (candidate.energyRange) {
    availableWeight += weights.energy;
    if (
      pulse.energyLevel >= candidate.energyRange.minimum &&
      pulse.energyLevel <= candidate.energyRange.maximum
    ) {
      matchedWeight += weights.energy;
      reasons.push("Matches Your Available Energy");
    }
  }

  if (candidate.stimulationLevels?.length) {
    availableWeight += weights.stimulation;
    if (candidate.stimulationLevels.includes(pulse.stimulationLevel)) {
      matchedWeight += weights.stimulation;
      reasons.push("Matches Your Preferred Stimulation");
    }
  }

  if (candidate.socialIntensities?.length) {
    availableWeight += weights.social;
    if (candidate.socialIntensities.includes(pulse.socialIntensity)) {
      matchedWeight += weights.social;
      reasons.push("Matches Your Social Pace");
    }
  }

  if (candidate.format) {
    availableWeight += weights.format;
    if (
      candidate.format === "either" ||
      pulse.preferredFormat === "either" ||
      candidate.format === pulse.preferredFormat
    ) {
      matchedWeight += weights.format;
      reasons.push("Works With Your Preferred Platform");
    }
  }

  if (candidate.durationMinutes != null) {
    availableWeight += weights.time;
    if (candidate.durationMinutes <= pulse.availableMinutes) {
      matchedWeight += weights.time;
      reasons.push("Fits Your Available Time");
    }
  }

  const matchingInterests = new Set(pulse.interestIds);
  const candidateInterests = new Set(candidate.interestIds ?? []);
  if (matchingInterests.size > 0 && candidateInterests.size > 0) {
    availableWeight += weights.interests;
    const interestMatchCount = [...candidateInterests].filter((id) =>
      matchingInterests.has(id),
    ).length;
    if (interestMatchCount > 0) {
      matchedWeight +=
        weights.interests * (interestMatchCount / candidateInterests.size);
      reasons.push("Connects With Today's Interests");
    }
  }

  if (pulse.maximumTravelMiles != null && candidate.distanceMiles != null) {
    availableWeight += weights.travel;
    if (candidate.distanceMiles <= pulse.maximumTravelMiles) {
      matchedWeight += weights.travel;
      reasons.push("Within Your Travel Range");
    }
  }

  return {
    candidate,
    reasons,
    fit: fitLevel(matchedWeight, availableWeight),
    matchedWeight,
    availableWeight,
  };
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
    .sort((left, right) => {
      const ratioComparison =
        right.matchedWeight * left.availableWeight -
        left.matchedWeight * right.availableWeight;
      return (
        ratioComparison ||
        right.reasons.length - left.reasons.length ||
        startTime(left.candidate) - startTime(right.candidate) ||
        left.candidate.module.localeCompare(right.candidate.module) ||
        left.candidate.id.localeCompare(right.candidate.id)
      );
    })
    .slice(0, Math.max(0, limit))
    .map(({ candidate, reasons, fit }) => ({ candidate, reasons, fit }));
}
