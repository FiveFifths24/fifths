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
  toCircleRecommendationCandidates,
} from "@/features/circles/circle-data";
import { CircleCard } from "@/features/circles/circle-card";
import { OpportunityCard } from "@/features/creator-commons/opportunity-card";
import {
  assembleOpportunityCards,
  toOpportunityRecommendationCandidates,
} from "@/features/creator-commons/opportunity-data";
import { CampaignCard } from "@/features/fifth-realm/campaign-card";
import {
  assembleCampaignCards,
  toCampaignRecommendationCandidates,
} from "@/features/fifth-realm/campaign-data";
import {
  assembleSessionCards,
  toSessionRecommendationCandidates,
} from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import {
  rankUnifiedRecommendations,
  recommendationKey,
} from "@/lib/recommendations/unified-recommendations";
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
    campaignResult,
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
    supabase
      .from("realm_campaigns")
      .select("*")
      .eq("status", "recruiting")
      .gt("application_deadline", new Date().toISOString())
      .order("application_deadline")
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
  const campaigns = campaignResult.data ?? [];
  const [
    sessionLinkResult,
    circleLinkResult,
    opportunitySkillLinkResult,
    opportunityInterestLinkResult,
    campaignInterestLinkResult,
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
    campaigns.length
      ? supabase
          .from("campaign_interests")
          .select("campaign_id, interest_id")
          .in(
            "campaign_id",
            campaigns.map((campaign) => campaign.id),
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
  const unifiedRecommendations = pulseInput
    ? rankUnifiedRecommendations(pulseInput, [
        ...toSessionRecommendationCandidates(sessions, modes, links),
        ...toCircleRecommendationCandidates(circles, modes, circleLinks),
        ...toOpportunityRecommendationCandidates(
          opportunities,
          modes,
          opportunityInterestLinks,
        ),
        ...toCampaignRecommendationCandidates(
          campaigns,
          modes,
          campaignInterestLinkResult.data ?? [],
        ),
      ])
    : [];
  const recommendationsFor = (
    module: "sessions" | "circles" | "commons" | "realm",
  ) =>
    unifiedRecommendations.filter(
      (recommendation) => recommendation.candidate.module === module,
    );
  const idsFor = (module: "sessions" | "circles" | "commons" | "realm") =>
    new Set(
      recommendationsFor(module).map(
        (recommendation) => recommendation.candidate.id,
      ),
    );
  const sessionRecommendationIds = idsFor("sessions");
  const circleRecommendationIds = idsFor("circles");
  const opportunityRecommendationIds = idsFor("commons");
  const campaignRecommendationIds = idsFor("realm");
  const sessionCards = assembleSessionCards(
    sessions.filter((session) => sessionRecommendationIds.has(session.id)),
    modes,
    interestResult.data ?? [],
    links,
    recommendationsFor("sessions"),
  );
  const circleCards = assembleCircleCards(
    circles.filter((circle) => circleRecommendationIds.has(circle.id)),
    modes,
    interestResult.data ?? [],
    circleLinks,
    recommendationsFor("circles"),
  );
  const opportunityCards = assembleOpportunityCards(
    opportunities.filter((opportunity) =>
      opportunityRecommendationIds.has(opportunity.id),
    ),
    modes,
    skillResult.data ?? [],
    interestResult.data ?? [],
    opportunitySkillLinkResult.data ?? [],
    opportunityInterestLinks,
    recommendationsFor("commons"),
  );
  const campaignCards = assembleCampaignCards(
    campaigns.filter((campaign) => campaignRecommendationIds.has(campaign.id)),
    modes,
    interestResult.data ?? [],
    campaignInterestLinkResult.data ?? [],
    recommendationsFor("realm"),
  );
  const sessionCardsById = new Map(sessionCards.map((card) => [card.id, card]));
  const circleCardsById = new Map(circleCards.map((card) => [card.id, card]));
  const opportunityCardsById = new Map(
    opportunityCards.map((card) => [card.id, card]),
  );
  const campaignCardsById = new Map(
    campaignCards.map((card) => [card.id, card]),
  );
  const unavailableModules = [
    sessionResult.error ? "Sessions" : null,
    circleResult.error ? "Circles" : null,
    opportunityResult.error ? "Creator Commons" : null,
    campaignResult.error ? "Fifth Realm" : null,
  ].filter((name): name is string => Boolean(name));
  const matchingDataIncomplete = Boolean(
    modeResult.error ||
    interestResult.error ||
    skillResult.error ||
    sessionLinkResult.error ||
    circleLinkResult.error ||
    opportunitySkillLinkResult.error ||
    opportunityInterestLinkResult.error ||
    campaignInterestLinkResult.error ||
    pulseInterestResult.error,
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
          Across FIFTHS
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          One feed. Clear reasons. Your choice.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
          FIFTHS orders eligible Sessions, Circles, Creator Commons
          opportunities, and Fifth Realm campaigns together. Each result shows a
          nonnumeric fit level and plain-language reasons based on the Pulse you
          chose to share for this 24-hour window.
        </p>

        {unavailableModules.length ? (
          <StatusMessage className="mt-6" tone="error">
            Some recommendation sources are unavailable:{" "}
            {unavailableModules.join(", ")}. Available sources are still shown;
            confirm that the ordered Phase 4–7 migrations are applied.
          </StatusMessage>
        ) : null}
        {matchingDataIncomplete ? (
          <StatusMessage className="mt-6">
            Some matching labels could not load, so this feed may use fewer
            reasons than normal. Your Pulse remains private; confirm the six
            ordered migrations and taxonomy data in Supabase.
          </StatusMessage>
        ) : null}

        {unifiedRecommendations.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {unifiedRecommendations.map((recommendation) => {
              const { candidate } = recommendation;
              if (candidate.module === "sessions") {
                const card = sessionCardsById.get(candidate.id);
                return card ? (
                  <SessionCard item={card} key={recommendationKey(candidate)} />
                ) : null;
              }
              if (candidate.module === "circles") {
                const card = circleCardsById.get(candidate.id);
                return card ? (
                  <CircleCard item={card} key={recommendationKey(candidate)} />
                ) : null;
              }
              if (candidate.module === "commons") {
                const card = opportunityCardsById.get(candidate.id);
                return card ? (
                  <OpportunityCard
                    item={card}
                    key={recommendationKey(candidate)}
                  />
                ) : null;
              }
              const card = campaignCardsById.get(candidate.id);
              return card ? (
                <CampaignCard item={card} key={recommendationKey(candidate)} />
              ) : null;
            })}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState
              title={
                pulse ? "No relevant matches yet" : "Check your Pulse first"
              }
            >
              {pulse
                ? "No eligible live result shares a documented signal with your current Pulse. FIFTHS does not add irrelevant filler or demonstration activity."
                : "A current Pulse lets FIFTHS order eligible experiences across the ecosystem with transparent reasons."}
            </PreviewState>
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/home/sessions" variant="secondary">
            All Sessions
          </ButtonLink>
          <ButtonLink href="/home/circles" variant="secondary">
            All Circles
          </ButtonLink>
          <ButtonLink href="/home/commons" variant="secondary">
            Creator Commons
          </ButtonLink>
          <ButtonLink href="/home/realm" variant="secondary">
            Fifth Realm
          </ButtonLink>
        </div>
      </section>

      <section
        aria-labelledby="recommendation-method"
        className="mt-10 rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6 sm:p-8"
      >
        <h2
          id="recommendation-method"
          className="text-2xl font-bold text-white"
        >
          How this feed is ordered
        </h2>
        <ul className="mt-5 grid gap-4 text-sm leading-6 text-neutral-400 md:grid-cols-2">
          <li>
            Only records you are already eligible to read under database access
            rules enter the feed.
          </li>
          <li>
            Matches are normalized to the signals each product actually has, so
            a module is not penalized for a field it does not collect.
          </li>
          <li>
            The first results are softly balanced across available products,
            then remaining spaces return to overall fit order.
          </li>
          <li>
            No AI, diagnosis, hidden activity inference, or raw public score is
            used. You decide whether to open or join any result.
          </li>
        </ul>
      </section>
    </div>
  );
}
