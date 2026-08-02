import { rankRecommendationCandidates } from "@/lib/recommendations/score-candidates";
import type {
  PulseRecommendationInput,
  RankedRecommendation,
  RecommendationCandidate,
} from "@/lib/recommendations/types";
import type {
  CampaignApplication,
  Interest,
  Mode,
  RealmCampaign,
} from "@/types/database";
import type { CampaignCardItem } from "./campaign-card";

export type CampaignInterestLink = {
  campaign_id: string;
  interest_id: string;
};

export function assembleCampaignCards(
  campaigns: RealmCampaign[],
  modes: Array<Pick<Mode, "id" | "name">>,
  interests: Array<Pick<Interest, "id" | "name">>,
  links: CampaignInterestLink[],
  recommendations: RankedRecommendation[] = [],
  applications: Array<Pick<CampaignApplication, "campaign_id" | "status">> = [],
  memberIds: string[] = [],
): CampaignCardItem[] {
  const modeNames = new Map(modes.map((mode) => [mode.id, mode.name]));
  const interestNames = new Map(
    interests.map((interest) => [interest.id, interest.name]),
  );
  const interestsByCampaign = new Map<string, string[]>();
  for (const link of links) {
    const current = interestsByCampaign.get(link.campaign_id) ?? [];
    current.push(link.interest_id);
    interestsByCampaign.set(link.campaign_id, current);
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
  const applicationStatus = new Map(
    applications.map((application) => [
      application.campaign_id,
      application.status,
    ]),
  );
  const memberships = new Set(memberIds);

  return campaigns.map((campaign) => ({
    ...campaign,
    modeName: modeNames.get(campaign.mode_id) ?? "Immerse",
    interestNames: (interestsByCampaign.get(campaign.id) ?? [])
      .map((id) => interestNames.get(id))
      .filter((name): name is string => Boolean(name)),
    reasons: reasons.get(campaign.id),
    fit: fits.get(campaign.id),
    applicationStatus: applicationStatus.get(campaign.id),
    isMember: memberships.has(campaign.id),
  }));
}

export function rankCampaigns(
  pulse: PulseRecommendationInput,
  campaigns: RealmCampaign[],
  modes: Array<Pick<Mode, "id" | "slug">>,
  links: CampaignInterestLink[],
) {
  return rankRecommendationCandidates(
    pulse,
    toCampaignRecommendationCandidates(campaigns, modes, links),
  );
}

export function toCampaignRecommendationCandidates(
  campaigns: RealmCampaign[],
  modes: Array<Pick<Mode, "id" | "slug">>,
  links: CampaignInterestLink[],
) {
  const modeSlugs = new Map(modes.map((mode) => [mode.id, mode.slug]));
  const interestsByCampaign = new Map<string, string[]>();
  for (const link of links) {
    const current = interestsByCampaign.get(link.campaign_id) ?? [];
    current.push(link.interest_id);
    interestsByCampaign.set(link.campaign_id, current);
  }
  const candidates: RecommendationCandidate[] = campaigns.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    module: "realm",
    startsAt: campaign.application_deadline,
    modeSlugs: modeSlugs.has(campaign.mode_id)
      ? [modeSlugs.get(campaign.mode_id)!]
      : [],
    energyRange: {
      minimum: campaign.minimum_energy,
      maximum: campaign.maximum_energy,
    },
    stimulationLevels: [campaign.stimulation_level],
    socialIntensities: [campaign.social_intensity],
    format: campaign.format,
    durationMinutes: campaign.estimated_session_minutes,
    interestIds: interestsByCampaign.get(campaign.id) ?? [],
  }));
  return candidates;
}
