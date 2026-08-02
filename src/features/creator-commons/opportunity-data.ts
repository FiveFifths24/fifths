import { rankRecommendationCandidates } from "@/lib/recommendations/score-candidates";
import type {
  PulseRecommendationInput,
  RankedRecommendation,
  RecommendationCandidate,
} from "@/lib/recommendations/types";
import type {
  CreatorOpportunity,
  Interest,
  Mode,
  OpportunityResponse,
  Skill,
} from "@/types/database";
import type { OpportunityCardItem } from "./opportunity-card";

export type OpportunitySkillLink = {
  opportunity_id: string;
  skill_id: string;
};
export type OpportunityInterestLink = {
  opportunity_id: string;
  interest_id: string;
};

export function assembleOpportunityCards(
  opportunities: CreatorOpportunity[],
  modes: Array<Pick<Mode, "id" | "name">>,
  skills: Array<Pick<Skill, "id" | "name">>,
  interests: Array<Pick<Interest, "id" | "name">>,
  skillLinks: OpportunitySkillLink[],
  interestLinks: OpportunityInterestLink[],
  recommendations: RankedRecommendation[] = [],
  savedIds: string[] = [],
  responses: Array<Pick<OpportunityResponse, "opportunity_id" | "status">> = [],
): OpportunityCardItem[] {
  const modeNames = new Map(modes.map((mode) => [mode.id, mode.name]));
  const skillNames = new Map(skills.map((skill) => [skill.id, skill.name]));
  const interestNames = new Map(
    interests.map((interest) => [interest.id, interest.name]),
  );
  const skillsByOpportunity = new Map<string, string[]>();
  const interestsByOpportunity = new Map<string, string[]>();
  for (const link of skillLinks) {
    const current = skillsByOpportunity.get(link.opportunity_id) ?? [];
    current.push(link.skill_id);
    skillsByOpportunity.set(link.opportunity_id, current);
  }
  for (const link of interestLinks) {
    const current = interestsByOpportunity.get(link.opportunity_id) ?? [];
    current.push(link.interest_id);
    interestsByOpportunity.set(link.opportunity_id, current);
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
  const saved = new Set(savedIds);
  const responseByOpportunity = new Map(
    responses.map((response) => [response.opportunity_id, response.status]),
  );

  return opportunities.map((opportunity) => ({
    ...opportunity,
    modeName: modeNames.get(opportunity.mode_id) ?? "Create",
    skillNames: (skillsByOpportunity.get(opportunity.id) ?? [])
      .map((id) => skillNames.get(id))
      .filter((name): name is string => Boolean(name)),
    interestNames: (interestsByOpportunity.get(opportunity.id) ?? [])
      .map((id) => interestNames.get(id))
      .filter((name): name is string => Boolean(name)),
    reasons: reasons.get(opportunity.id),
    fit: fits.get(opportunity.id),
    saved: saved.has(opportunity.id),
    responseStatus: responseByOpportunity.get(opportunity.id),
  }));
}

export function rankOpportunities(
  pulse: PulseRecommendationInput,
  opportunities: CreatorOpportunity[],
  modes: Array<Pick<Mode, "id" | "slug">>,
  interestLinks: OpportunityInterestLink[],
) {
  return rankRecommendationCandidates(
    pulse,
    toOpportunityRecommendationCandidates(opportunities, modes, interestLinks),
  );
}

export function toOpportunityRecommendationCandidates(
  opportunities: CreatorOpportunity[],
  modes: Array<Pick<Mode, "id" | "slug">>,
  interestLinks: OpportunityInterestLink[],
) {
  const modeSlugs = new Map(modes.map((mode) => [mode.id, mode.slug]));
  const interestsByOpportunity = new Map<string, string[]>();
  for (const link of interestLinks) {
    const current = interestsByOpportunity.get(link.opportunity_id) ?? [];
    current.push(link.interest_id);
    interestsByOpportunity.set(link.opportunity_id, current);
  }

  const candidates: RecommendationCandidate[] = opportunities.map(
    (opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      module: "commons",
      startsAt: opportunity.response_deadline,
      modeSlugs: modeSlugs.has(opportunity.mode_id)
        ? [modeSlugs.get(opportunity.mode_id)!]
        : [],
      energyRange: {
        minimum: opportunity.minimum_energy,
        maximum: opportunity.maximum_energy,
      },
      stimulationLevels: [opportunity.stimulation_level],
      socialIntensities: [opportunity.social_intensity],
      format: opportunity.format,
      durationMinutes: opportunity.estimated_minutes,
      interestIds: interestsByOpportunity.get(opportunity.id) ?? [],
    }),
  );

  return candidates;
}
