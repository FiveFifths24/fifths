import { rankRecommendationCandidates } from "@/lib/recommendations/score-candidates";
import type {
  PulseRecommendationInput,
  RankedRecommendation,
  RecommendationCandidate,
} from "@/lib/recommendations/types";
import type { Interest, Mode, Session } from "@/types/database";
import type { SessionCardItem } from "./session-card";

export type SessionInterestLink = {
  session_id: string;
  interest_id: string;
};

export function assembleSessionCards(
  sessions: Session[],
  modes: Array<Pick<Mode, "id" | "name">>,
  interests: Array<Pick<Interest, "id" | "name">>,
  links: SessionInterestLink[],
  recommendations: RankedRecommendation[] = [],
): SessionCardItem[] {
  const modeNames = new Map(modes.map((mode) => [mode.id, mode.name]));
  const interestNames = new Map(
    interests.map((interest) => [interest.id, interest.name]),
  );
  const linksBySession = new Map<string, string[]>();
  for (const link of links) {
    const current = linksBySession.get(link.session_id) ?? [];
    current.push(link.interest_id);
    linksBySession.set(link.session_id, current);
  }
  const reasons = new Map(
    recommendations.map((recommendation) => [
      recommendation.candidate.id,
      recommendation.reasons,
    ]),
  );

  return sessions.map((session) => ({
    ...session,
    modeName: modeNames.get(session.mode_id) ?? "Session",
    interestNames: (linksBySession.get(session.id) ?? [])
      .map((id) => interestNames.get(id))
      .filter((name): name is string => Boolean(name)),
    reasons: reasons.get(session.id),
  }));
}

export function rankSessions(
  pulse: PulseRecommendationInput,
  sessions: Session[],
  modes: Array<Pick<Mode, "id" | "slug">>,
  links: SessionInterestLink[],
) {
  const modeSlugs = new Map(modes.map((mode) => [mode.id, mode.slug]));
  const linksBySession = new Map<string, string[]>();
  for (const link of links) {
    const current = linksBySession.get(link.session_id) ?? [];
    current.push(link.interest_id);
    linksBySession.set(link.session_id, current);
  }

  const candidates: RecommendationCandidate[] = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    module: "sessions",
    startsAt: session.starts_at,
    modeSlugs: modeSlugs.has(session.mode_id)
      ? [modeSlugs.get(session.mode_id)!]
      : [],
    energyRange: {
      minimum: session.minimum_energy,
      maximum: session.maximum_energy,
    },
    stimulationLevels: [session.stimulation_level],
    socialIntensities: [session.social_intensity],
    format: session.format,
    durationMinutes: Math.round(
      (Date.parse(session.ends_at) - Date.parse(session.starts_at)) / 60_000,
    ),
    interestIds: linksBySession.get(session.id) ?? [],
  }));

  return rankRecommendationCandidates(pulse, candidates);
}
