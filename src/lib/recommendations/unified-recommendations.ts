import { rankRecommendationCandidates } from "./score-candidates";
import type {
  PulseRecommendationInput,
  RankedRecommendation,
  RecommendationCandidate,
  RecommendationModule,
} from "./types";

export const unifiedRecommendationDefaults = {
  limit: 8,
  initialModuleLimit: 2,
} as const;

export function recommendationKey(
  candidate: Pick<RecommendationCandidate, "id" | "module">,
) {
  return `${candidate.module}:${candidate.id}`;
}

export function rankUnifiedRecommendations(
  pulse: PulseRecommendationInput,
  candidates: RecommendationCandidate[],
  options: { limit?: number; initialModuleLimit?: number } = {},
): RankedRecommendation[] {
  const limit = Math.max(
    0,
    options.limit ?? unifiedRecommendationDefaults.limit,
  );
  const initialModuleLimit = Math.max(
    1,
    options.initialModuleLimit ??
      unifiedRecommendationDefaults.initialModuleLimit,
  );
  if (limit === 0) return [];

  const uniqueCandidates = [
    ...new Map(
      candidates.map((candidate) => [recommendationKey(candidate), candidate]),
    ).values(),
  ];
  const ranked = rankRecommendationCandidates(pulse, uniqueCandidates).filter(
    (recommendation) => recommendation.reasons.length > 0,
  );
  const selected: RankedRecommendation[] = [];
  const deferred: RankedRecommendation[] = [];
  const moduleCounts = new Map<RecommendationModule, number>();

  for (const recommendation of ranked) {
    const candidateModule = recommendation.candidate.module;
    const count = moduleCounts.get(candidateModule) ?? 0;
    if (count < initialModuleLimit && selected.length < limit) {
      selected.push(recommendation);
      moduleCounts.set(candidateModule, count + 1);
    } else {
      deferred.push(recommendation);
    }
  }

  if (selected.length < limit) {
    selected.push(...deferred.slice(0, limit - selected.length));
  }

  return selected;
}
