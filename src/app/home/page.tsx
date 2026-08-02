import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  assembleCircleCards,
  rankCircles,
} from "@/features/circles/circle-data";
import { CircleCard } from "@/features/circles/circle-card";
import { OpportunityCard } from "@/features/creator-commons/opportunity-card";
import {
  assembleOpportunityCards,
  rankOpportunities,
} from "@/features/creator-commons/opportunity-data";
import {
  assembleSessionCards,
  rankSessions,
} from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your Home" };
export const dynamic = "force-dynamic";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

export default async function PersonalHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ onboarding?: string; pulse?: string }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [
    pulseResult,
    sessionResult,
    circleResult,
    opportunityResult,
    modeResult,
    interestResult,
    skillResult,
    parameters,
  ] = await Promise.all([
    supabase
      .from("pulse_check_ins")
      .select("*")
      .gt("expires_at", "now")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("sessions")
      .select("*")
      .eq("status", "published")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(20),
    supabase
      .from("circles")
      .select("*")
      .eq("status", "published")
      .order("name")
      .limit(20),
    supabase
      .from("creator_opportunities")
      .select("*")
      .eq("status", "published")
      .gt("response_deadline", new Date().toISOString())
      .order("response_deadline")
      .limit(20),
    supabase.from("modes").select("id, slug, name").order("sort_order"),
    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),
    supabase.from("skills").select("id, name").eq("active", true).order("name"),
    searchParams,
  ]);

  if (pulseResult.error) {
    return (
      <StatusMessage tone="error">
        Your personal Home could not load Pulse data. Confirm that the Phase 3
        migration has been applied to the connected Supabase project.
      </StatusMessage>
    );
  }

  const pulse = pulseResult.data;
  const modes = modeResult.data ?? [];
  const mode = pulse ? modes.find((item) => item.id === pulse.mode_id) : null;
  const sessions = sessionResult.data ?? [];
  const circles = circleResult.data ?? [];
  const opportunities = opportunityResult.data ?? [];
  const [
    sessionLinkResult,
    circleLinkResult,
    opportunitySkillLinkResult,
    opportunityInterestLinkResult,
    pulseInterestResult,
  ] = await Promise.all([
    sessions.length
      ? supabase
          .from("session_interests")
          .select("session_id, interest_id")
          .in(
            "session_id",
            sessions.map((session) => session.id),
          )
      : Promise.resolve({ data: [], error: null }),
    circles.length
      ? supabase
          .from("circle_interests")
          .select("circle_id, interest_id")
          .in(
            "circle_id",
            circles.map((circle) => circle.id),
          )
      : Promise.resolve({ data: [], error: null }),
    opportunities.length
      ? supabase
          .from("opportunity_skills")
          .select("opportunity_id, skill_id")
          .in(
            "opportunity_id",
            opportunities.map((opportunity) => opportunity.id),
          )
      : Promise.resolve({ data: [], error: null }),
    opportunities.length
      ? supabase
          .from("opportunity_interests")
          .select("opportunity_id, interest_id")
          .in(
            "opportunity_id",
            opportunities.map((opportunity) => opportunity.id),
          )
      : Promise.resolve({ data: [], error: null }),
    pulse
      ? supabase
          .from("pulse_check_in_interests")
          .select("interest_id")
          .eq("check_in_id", pulse.id)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const links = sessionLinkResult.data ?? [];
  const circleLinks = circleLinkResult.data ?? [];
  const opportunityInterestLinks = opportunityInterestLinkResult.data ?? [];
  const pulseInput: PulseRecommendationInput | null =
    pulse && mode
      ? {
          modeSlug: mode.slug,
          energyLevel: pulse.energy_level,
          stimulationLevel: pulse.stimulation_level,
          socialIntensity: pulse.social_intensity,
          preferredFormat: pulse.preferred_format,
          availableMinutes: pulse.available_minutes,
          maximumTravelMiles: pulse.maximum_travel_miles,
          interestIds: (pulseInterestResult.data ?? []).map(
            (item) => item.interest_id,
          ),
        }
      : null;
  const recommendations = pulseInput
    ? rankSessions(pulseInput, sessions, modes, links).slice(0, 3)
    : [];
  const recommendedSessionIds = new Set(
    recommendations.map((item) => item.candidate.id),
  );
  const recommendedSessions = sessions.filter((session) =>
    recommendedSessionIds.has(session.id),
  );
  const recommendationOrder = new Map(
    recommendations.map((item, index) => [item.candidate.id, index]),
  );
  recommendedSessions.sort(
    (left, right) =>
      (recommendationOrder.get(left.id) ?? 0) -
      (recommendationOrder.get(right.id) ?? 0),
  );
  const recommendationCards = assembleSessionCards(
    recommendedSessions,
    modes,
    interestResult.data ?? [],
    links,
    recommendations,
  );
  const circleRecommendations = pulseInput
    ? rankCircles(pulseInput, circles, modes, circleLinks).slice(0, 3)
    : [];
  const recommendedCircleIds = new Set(
    circleRecommendations.map((item) => item.candidate.id),
  );
  const recommendedCircles = circles.filter((circle) =>
    recommendedCircleIds.has(circle.id),
  );
  const circleOrder = new Map(
    circleRecommendations.map((item, index) => [item.candidate.id, index]),
  );
  recommendedCircles.sort(
    (left, right) =>
      (circleOrder.get(left.id) ?? 0) - (circleOrder.get(right.id) ?? 0),
  );
  const circleCards = assembleCircleCards(
    recommendedCircles,
    modes,
    interestResult.data ?? [],
    circleLinks,
    circleRecommendations,
  );
  const opportunityRecommendations = pulseInput
    ? rankOpportunities(
        pulseInput,
        opportunities,
        modes,
        opportunityInterestLinks,
      ).slice(0, 3)
    : [];
  const recommendedOpportunityIds = new Set(
    opportunityRecommendations.map((item) => item.candidate.id),
  );
  const recommendedOpportunities = opportunities.filter((opportunity) =>
    recommendedOpportunityIds.has(opportunity.id),
  );
  const opportunityOrder = new Map(
    opportunityRecommendations.map((item, index) => [item.candidate.id, index]),
  );
  recommendedOpportunities.sort(
    (left, right) =>
      (opportunityOrder.get(left.id) ?? 0) -
      (opportunityOrder.get(right.id) ?? 0),
  );
  const opportunityCards = assembleOpportunityCards(
    recommendedOpportunities,
    modes,
    skillResult.data ?? [],
    interestResult.data ?? [],
    opportunitySkillLinkResult.data ?? [],
    opportunityInterestLinks,
    opportunityRecommendations,
  );

  return (
    <div>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            Personal Home
          </p>
          <h1 className="display-type mt-4 max-w-3xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Start with what you have today.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
            Your Home turns a private Pulse into clear, explainable paths across
            the FIFTHS ecosystem as each product becomes available.
          </p>
        </div>
        <ButtonLink href="/home/pulse">
          {pulse ? "Refresh your Pulse" : "Check your Pulse"}
        </ButtonLink>
      </div>

      {parameters?.pulse === "recorded" ? (
        <StatusMessage className="mt-8" tone="success">
          Your Pulse was saved privately and is active for matching for 24
          hours.
        </StatusMessage>
      ) : null}
      {parameters?.onboarding === "complete" ? (
        <StatusMessage className="mt-8" tone="success">
          Your profile foundation is complete. Your personal Home is ready.
        </StatusMessage>
      ) : null}

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Activity aria-hidden="true" className="size-5 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Current Pulse</h2>
          </div>
          {pulse ? (
            <>
              <div className="mt-7 flex flex-col gap-5 border-b border-neutral-800 pb-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="display-type text-4xl text-white">
                    {mode?.name ?? "Your mode"}
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    Energy {pulse.energy_level}/5 ·{" "}
                    {readable(pulse.stimulation_level)} stimulation
                  </p>
                </div>
                <span className="w-fit rounded-full border border-neutral-700 px-4 py-2 text-xs font-bold text-neutral-200">
                  24-hour matching window
                </span>
              </div>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-neutral-500">Social pace</dt>
                  <dd className="mt-1 font-bold text-white capitalize">
                    {readable(pulse.social_intensity)}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Format</dt>
                  <dd className="mt-1 font-bold text-white capitalize">
                    {readable(pulse.preferred_format)}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Time</dt>
                  <dd className="mt-1 font-bold text-white">
                    {pulse.available_minutes >= 60
                      ? `${pulse.available_minutes / 60} hr`
                      : `${pulse.available_minutes} min`}
                  </dd>
                </div>
              </dl>
              <ButtonLink
                className="mt-7"
                href="/home/pulse/history"
                variant="secondary"
              >
                View private history
              </ButtonLink>
            </>
          ) : (
            <div className="mt-6">
              <PreviewState title="No Pulse recorded">
                Check in when you are ready. FIFTHS does not infer your energy
                or show demonstration activity in your private Home.
              </PreviewState>
            </div>
          )}
        </section>

        <aside className="rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-emerald-400"
            />
            <h2 className="text-xl font-bold text-white">Private by design</h2>
          </div>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-neutral-400">
            <li className="flex gap-3">
              <ArrowRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-red-400"
              />
              Only you can read your Pulse history under Row Level Security.
            </li>
            <li className="flex gap-3">
              <Clock3
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-red-400"
              />
              A check-in stops influencing matches after 24 hours.
            </li>
            <li className="flex gap-3">
              <Sparkles
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-red-400"
              />
              Matching uses documented rules and reason labels—not AI or health
              profiling.
            </li>
          </ul>
        </aside>
      </div>

      <section className="mt-10 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase">
          Recommendation foundation
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          Explainable matches from real Sessions.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
          FIFTHS ranks eligible published Sessions by mode, energy, stimulation,
          social pace, format, time, interests, and broad travel range. Matching
          returns plain-language reasons and never exposes a raw score.
        </p>
        {sessionResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            Session matches need the Phase 4 migration. Your existing Pulse
            remains private and available.
          </StatusMessage>
        ) : recommendationCards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {recommendationCards.map((card) => (
              <SessionCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState
              title={
                pulse
                  ? "No published Session matches yet"
                  : "Check your Pulse first"
              }
            >
              {pulse
                ? "No eligible live Sessions are available. FIFTHS does not invent events or other product activity."
                : "A current Pulse lets FIFTHS order eligible Sessions with transparent reasons."}
            </PreviewState>
          </div>
        )}
        <ButtonLink className="mt-6" href="/home/sessions" variant="secondary">
          Explore all Sessions
        </ButtonLink>
      </section>

      <section className="mt-10 rounded-[2rem] border border-rose-950/70 bg-neutral-900 p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-rose-300 uppercase">
          Circles
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          Community matches with visible boundaries.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
          Eligible published Circles can now match the same private Pulse by
          mode, energy, stimulation, social pace, format, and current interests.
          Joining remains a separate, intentional choice.
        </p>
        {circleResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            Circle matches need the Phase 5 migration. Your Pulse and Session
            matches remain available.
          </StatusMessage>
        ) : circleCards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {circleCards.map((card) => (
              <CircleCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState
              title={
                pulse
                  ? "No published Circle matches yet"
                  : "Check your Pulse first"
              }
            >
              {pulse
                ? "No eligible live Circles are available. FIFTHS does not invent communities."
                : "A current Pulse lets FIFTHS order eligible Circles with transparent reasons."}
            </PreviewState>
          </div>
        )}
        <ButtonLink className="mt-6" href="/home/circles" variant="secondary">
          Explore all Circles
        </ButtonLink>
      </section>

      <section className="mt-10 rounded-[2rem] border border-amber-950/80 bg-neutral-900 p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-amber-300 uppercase">
          Creator Commons
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          Opportunities matched to today—not promises.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
          Eligible published opportunities can match your mode, energy,
          stimulation, social pace, format, available time, and current
          interests. Saving and responding remain private, intentional actions.
        </p>
        {opportunityResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            Creator Commons matches need the Phase 6 migration. Existing Pulse,
            Session, and Circle experiences remain available.
          </StatusMessage>
        ) : opportunityCards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {opportunityCards.map((card) => (
              <OpportunityCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState
              title={
                pulse
                  ? "No published opportunity matches yet"
                  : "Check your Pulse first"
              }
            >
              {pulse
                ? "No eligible live Creator Commons opportunities are available. FIFTHS does not invent projects."
                : "A current Pulse lets FIFTHS order eligible opportunities with transparent reasons."}
            </PreviewState>
          </div>
        )}
        <ButtonLink className="mt-6" href="/home/commons" variant="secondary">
          Explore Creator Commons
        </ButtonLink>
      </section>
    </div>
  );
}
