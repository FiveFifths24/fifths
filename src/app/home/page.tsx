import type { Metadata } from "next";
import { Activity, Sparkles } from "lucide-react";
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

const dailySignals = [
  {
    type: "Joke",
    text: "Why did the developer go broke? Because they used up all their cache.",
  },
  {
    type: "Fact",
    text: "Octopuses have three hearts.",
  },
  {
    type: "Joke",
    text: "Why was the calendar nervous? Its days were numbered.",
  },
  {
    type: "Fact",
    text: "A day on Venus is longer than a year on Venus.",
  },
  {
    type: "Joke",
    text: "Why don't skeletons start group chats? They don't have the guts.",
  },
  {
    type: "Fact",
    text: "Wombat droppings are cube-shaped.",
  },
  {
    type: "Fact",
    text: "Sharks existed before trees.",
  },
] as const;

function getDailySignal() {
  const now = new Date();

  const dayNumber = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  );

  return dailySignals[dayNumber % dailySignals.length]!;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const displayName = profile?.display_name ?? "You";
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

  const dailySignal = getDailySignal();

  return (
    <div>
      {parameters?.pulse === "recorded" ? (
        <StatusMessage className="mt-8" tone="success">
          Your Pulse was saved privately and is active for matching for 24
          hours.
        </StatusMessage>
      ) : null}
      {parameters?.onboarding === "complete" ? (
        <StatusMessage className="mt-8" tone="success">
          Your Home is ready.
        </StatusMessage>
      ) : null}

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/45 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[#6c14ce]/15 blur-[100px]"
          />

          <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:text-left">
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <Activity aria-hidden="true" className="size-6 text-[#f359d2]" />

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Current Pulse
              </h2>
            </div>

            <div className="flex w-full max-w-sm flex-col items-center gap-2 sm:w-auto sm:max-w-none sm:items-end">
              <ButtonLink className="w-full sm:w-52" href="/home/pulse">
                {pulse ? "Refresh Your Pulse" : "Check Your Pulse"}
              </ButtonLink>

              {pulse ? (
                <ButtonLink
                  className="w-full border-[#6c14ce]/40 bg-[#6c14ce]/5 hover:border-[#ca9aff]/60 hover:bg-[#6c14ce]/10 sm:w-52"
                  href="/home/pulse/history"
                  variant="secondary"
                >
                  View Private History
                </ButtonLink>
              ) : null}
            </div>
          </div>
          {pulse ? (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[#6c14ce]/15 blur-[100px]"
              />
              <div className="mt-10 flex flex-col gap-3 border-b border-white/10 pb-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <div className="w-full">
                  <p className="display-type text-4xl text-white">
                    {mode?.name ?? "Your mode"}
                  </p>

                  <p className="mt-2 text-sm text-neutral-400">
                    Energy {pulse.energy_level}/5 ·{" "}
                    {readable(pulse.stimulation_level)} Stimulation
                  </p>
                </div>
              </div>

              <dl className="mt-6 grid gap-5 text-center text-sm sm:grid-cols-3 sm:text-left">
                <div>
                  <dt className="text-neutral-500">Social Pace</dt>
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

        <aside className="relative overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/45 p-12 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-24 size-64 rounded-full bg-[#f359d2]/10 blur-[110px]"
          />

          <div className="relative flex h-full flex-col items-center text-center sm:items-stretch sm:text-left">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sparkles
                  aria-hidden="true"
                  className="size-5 text-[#f359d2]"
                />

                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Daily Signal
                </h2>
              </div>

              <span className="rounded-full border border-[#ca9aff]/20 bg-[#6c14ce]/10 px-3 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-[#ca9aff] uppercase">
                {dailySignal.type}
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-center py-10">
              <p className="max-w-md text-2xl leading-relaxed font-semibold tracking-tight text-white">
                {dailySignal.text}
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-white/35">
                A New Signal Appears Every 24 hours.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-28 size-80 rounded-full bg-[#6c14ce]/15 blur-[120px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-28 size-72 rounded-full bg-[#f359d2]/10 blur-[120px]"
        />

        <div className="relative flex flex-col items-center text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#ca9aff] uppercase">
            {displayName}&apos;s SIGNAL
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Feed, Shaped By You
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-7 text-white/50 sm:text-lg">
            As new experiences, spaces, and opportunities become available, your
            preferences and current Pulse will help shape what rises into your
            feed.
          </p>

          {unavailableModules.length ? (
            <StatusMessage className="mt-6" tone="error">
              Some recommendation sources are unavailable:{" "}
              {unavailableModules.join(", ")}.
            </StatusMessage>
          ) : null}

          {matchingDataIncomplete ? (
            <StatusMessage className="mt-6">
              Some recommendation details could not load, so fewer matching
              reasons may appear right now.
            </StatusMessage>
          ) : null}

          {!pulse ? (
            <div className="mt-8 flex flex-col gap-5 rounded-[1.5rem] border border-[#6c14ce]/40 bg-[#6c14ce]/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#f359d2]/30 bg-[#f359d2]/10">
                  <Activity
                    aria-hidden="true"
                    className="size-5 text-[#f359d2]"
                  />
                </div>

                <div>
                  <p className="font-bold text-white">Check your Pulse first</p>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-white/45">
                    A current Pulse helps SIGNAL personalize this feed and bring
                    forward the experiences that fit you best right now.
                  </p>
                </div>
              </div>

              <ButtonLink className="shrink-0" href="/home/pulse">
                Check Your Pulse
              </ButtonLink>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <ButtonLink href="/home/sessions">Sessions</ButtonLink>

            <ButtonLink href="/home/circles">Circles</ButtonLink>

            <ButtonLink href="/home/commons">Commons</ButtonLink>

            <ButtonLink href="/home/realm">Realm</ButtonLink>
          </div>

          <div className="mt-7 border-t border-white/10 pt-6">
            <p className="text-sm leading-6 text-white/40">
              Your feed will evolve with you, bringing forward what best fits
              your preferences, energy, and how you want to show up.
            </p>
          </div>

          {unifiedRecommendations.length ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {unifiedRecommendations.map((recommendation) => {
                const { candidate } = recommendation;

                if (candidate.module === "sessions") {
                  const card = sessionCardsById.get(candidate.id);

                  return card ? (
                    <SessionCard
                      item={card}
                      key={recommendationKey(candidate)}
                    />
                  ) : null;
                }

                if (candidate.module === "circles") {
                  const card = circleCardsById.get(candidate.id);

                  return card ? (
                    <CircleCard
                      item={card}
                      key={recommendationKey(candidate)}
                    />
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
                  <CampaignCard
                    item={card}
                    key={recommendationKey(candidate)}
                  />
                ) : null;
              })}
            </div>
          ) : pulse ? (
            <div className="mt-10 flex min-h-56 flex-col items-center justify-center rounded-[1.5rem] border border-[#6c14ce]/25 bg-black/20 px-6 py-12 text-center">
              <Sparkles aria-hidden="true" className="size-7 text-[#f359d2]" />

              <h3 className="mt-4 text-xl font-bold text-white">
                Your Feed Is Taking Shape
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-white/45">
                Your Pulse is active and your feed is evolving. As new Sessions,
                Circles, Commons, and Realm experiences become available, the
                ones that fit you will begin appearing here.
              </p>
            </div>
          ) : (
            <div className="mt-10 flex min-h-56 flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/20 px-6 py-12 text-center">
              <Activity aria-hidden="true" className="size-8 text-[#f359d2]" />

              <h3 className="mt-4 text-xl font-bold text-white">
                Your Pulse shapes your feed.
              </h3>

              <p className="mt-2 max-w-lg text-sm leading-6 text-white/45">
                Check your Pulse to start seeing recommendations here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
