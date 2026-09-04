import type {
  Circle,
  CreatorOpportunity,
  RealmCampaign,
  Session,
} from "@/types/database";
import type { RankedRecommendation } from "@/lib/recommendations/types";

export type SubSignalSource = "sessions" | "campaigns" | "circles" | "commons";

type SessionEligibility = Pick<Session, "status" | "ends_at">;
type CampaignEligibility = Pick<RealmCampaign, "status">;
type CircleEligibility = Pick<Circle, "status" | "format">;
type OpportunityEligibility = Pick<
  CreatorOpportunity,
  "status" | "response_deadline"
>;

export function isEligibleSession(
  session: SessionEligibility,
  visibilityCutoff: string,
) {
  return session.status === "published" && session.ends_at > visibilityCutoff;
}

export function isEligibleCampaign(campaign: CampaignEligibility) {
  return campaign.status === "recruiting" || campaign.status === "active";
}

export function isEligibleCircle(circle: CircleEligibility) {
  return circle.status === "published" && circle.format !== "online";
}

export function isEligibleOpportunity(
  opportunity: OpportunityEligibility,
  now: string,
) {
  return (
    opportunity.status === "published" && opportunity.response_deadline > now
  );
}

export function selectEcosystemPreview<T extends { id: string }>(
  items: T[],
  recommendations: RankedRecommendation[] = [],
): T | undefined {
  const rankedId = recommendations[0]?.candidate.id;
  return (
    (rankedId ? items.find((item) => item.id === rankedId) : undefined) ??
    items[0]
  );
}

export function getSubSignalPageState(
  itemCount: number,
  unavailableSources: SubSignalSource[],
): "results" | "empty" | "unavailable" {
  if (itemCount > 0) return "results";
  if (unavailableSources.length > 0) return "unavailable";
  return "empty";
}

const sourceLabels: Record<SubSignalSource, string> = {
  sessions: "standard Sessions",
  campaigns: "Fifth Realm campaigns",
  circles: "Circles",
  commons: "Creator Commons",
};

export function formatUnavailableSources(sources: SubSignalSource[]) {
  return sources.map((source) => sourceLabels[source]).join(", ");
}
