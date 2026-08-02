import { rankRecommendationCandidates } from "@/lib/recommendations/score-candidates";
import type {
  PulseRecommendationInput,
  RankedRecommendation,
  RecommendationCandidate,
} from "@/lib/recommendations/types";
import type { Circle, CircleMember, Interest, Mode } from "@/types/database";
import type { CircleCardItem } from "./circle-card";

export type CircleInterestLink = { circle_id: string; interest_id: string };

export function assembleCircleCards(
  circles: Circle[],
  modes: Array<Pick<Mode, "id" | "name">>,
  interests: Array<Pick<Interest, "id" | "name">>,
  links: CircleInterestLink[],
  recommendations: RankedRecommendation[] = [],
  memberships: Array<Pick<CircleMember, "circle_id" | "role" | "status">> = [],
): CircleCardItem[] {
  const modeNames = new Map(modes.map((mode) => [mode.id, mode.name]));
  const interestNames = new Map(
    interests.map((interest) => [interest.id, interest.name]),
  );
  const linksByCircle = new Map<string, string[]>();
  for (const link of links) {
    const current = linksByCircle.get(link.circle_id) ?? [];
    current.push(link.interest_id);
    linksByCircle.set(link.circle_id, current);
  }
  const reasons = new Map(
    recommendations.map((recommendation) => [
      recommendation.candidate.id,
      recommendation.reasons,
    ]),
  );
  const fits = new Map(
    recommendations.map((recommendation) => [
      recommendation.candidate.id,
      recommendation.fit,
    ]),
  );
  const membershipByCircle = new Map(
    memberships.map((membership) => [membership.circle_id, membership]),
  );

  return circles.map((circle) => ({
    ...circle,
    modeName: modeNames.get(circle.mode_id) ?? "Circle",
    interestNames: (linksByCircle.get(circle.id) ?? [])
      .map((id) => interestNames.get(id))
      .filter((name): name is string => Boolean(name)),
    reasons: reasons.get(circle.id),
    fit: fits.get(circle.id),
    membership: membershipByCircle.get(circle.id),
  }));
}

export function rankCircles(
  pulse: PulseRecommendationInput,
  circles: Circle[],
  modes: Array<Pick<Mode, "id" | "slug">>,
  links: CircleInterestLink[],
) {
  return rankRecommendationCandidates(
    pulse,
    toCircleRecommendationCandidates(circles, modes, links),
  );
}

export function toCircleRecommendationCandidates(
  circles: Circle[],
  modes: Array<Pick<Mode, "id" | "slug">>,
  links: CircleInterestLink[],
) {
  const modeSlugs = new Map(modes.map((mode) => [mode.id, mode.slug]));
  const linksByCircle = new Map<string, string[]>();
  for (const link of links) {
    const current = linksByCircle.get(link.circle_id) ?? [];
    current.push(link.interest_id);
    linksByCircle.set(link.circle_id, current);
  }

  const candidates: RecommendationCandidate[] = circles.map((circle) => ({
    id: circle.id,
    title: circle.name,
    module: "circles",
    modeSlugs: modeSlugs.has(circle.mode_id)
      ? [modeSlugs.get(circle.mode_id)!]
      : [],
    energyRange: {
      minimum: circle.minimum_energy,
      maximum: circle.maximum_energy,
    },
    stimulationLevels: [circle.stimulation_level],
    socialIntensities: [circle.social_intensity],
    format: circle.format,
    interestIds: linksByCircle.get(circle.id) ?? [],
  }));

  return candidates;
}
