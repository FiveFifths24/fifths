import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, Plus, Sparkles, TicketCheck } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { rankCircles } from "@/features/circles/circle-data";
import { rankOpportunities } from "@/features/creator-commons/opportunity-data";
import { rankCampaigns } from "@/features/fifth-realm/campaign-data";
import { AroundEcosystem } from "@/features/sessions/around-ecosystem";
import {
  assembleSessionCards,
  rankSessions,
} from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import {
  isEligibleCampaign,
  isEligibleCircle,
  isEligibleOpportunity,
  isEligibleSession,
  selectEcosystemPreview,
  type SubSignalSource,
} from "@/features/sessions/sub-signal-data";
import {
  filterMemberContent,
  loadContentPreferences,
} from "@/features/profiles/content-filters";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Discover Sessions",
};

export const dynamic = "force-dynamic";

const SESSION_LIMIT = 60;
const RELATED_SOURCE_LIMIT = 24;

export default async function SessionsPage() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  // These request-time cutoffs preserve the existing Session grace period while
  // keeping deadline-driven Sub-Signals current.
  const now = new Date();
  const nowIso = now.toISOString();
  const publicCutoff = new Date(
    now.getTime() - 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data: userData } = await supabase.auth.getUser();

  const [
    sessionResult,
    campaignResult,
    circleResult,
    opportunityResult,
    modeResult,
    interestResult,
    pulseResult,
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*")
      .eq("status", "published")
      .gt("ends_at", publicCutoff)
      .order("starts_at")
      .limit(SESSION_LIMIT),
    supabase
      .from("realm_campaigns")
      .select("*")
      .in("status", ["recruiting", "active"])
      .order("application_deadline")
      .limit(RELATED_SOURCE_LIMIT),
    supabase
      .from("circles")
      .select("*")
      .eq("status", "published")
      .neq("format", "online")
      .order("published_at", { ascending: false })
      .limit(RELATED_SOURCE_LIMIT),
    supabase
      .from("creator_opportunities")
      .select("*")
      .eq("status", "published")
      .gt("response_deadline", nowIso)
      .order("response_deadline")
      .limit(RELATED_SOURCE_LIMIT),
    supabase.from("modes").select("id, slug, name").order("sort_order"),
    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),
    supabase
      .from("pulse_check_ins")
      .select("*")
      .gt("expires_at", "now")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const unavailableSources: SubSignalSource[] = [];
  if (sessionResult.error) unavailableSources.push("sessions");
  if (campaignResult.error) unavailableSources.push("campaigns");
  if (circleResult.error) unavailableSources.push("circles");
  if (opportunityResult.error) unavailableSources.push("commons");

  const contentPreferences = userData.user
    ? await loadContentPreferences(supabase, userData.user.id)
    : { hiddenUserIds: new Set<string>(), blockedWords: [] };
  const sessions = filterMemberContent(
    (sessionResult.data ?? []).filter((session) =>
      isEligibleSession(session, publicCutoff),
    ),
    contentPreferences,
    (session) => session.host_user_id,
    (session) =>
      [
        session.title,
        session.summary,
        session.description,
        session.host_display_name,
      ].join(" "),
  );
  const campaigns = filterMemberContent(
    (campaignResult.data ?? []).filter(isEligibleCampaign),
    contentPreferences,
    (campaign) => campaign.created_by,
    (campaign) =>
      [
        campaign.title,
        campaign.summary,
        campaign.premise,
        campaign.game_master_display_name,
      ].join(" "),
  );
  const circles = filterMemberContent(
    (circleResult.data ?? []).filter(isEligibleCircle),
    contentPreferences,
    (circle) => circle.created_by,
    (circle) =>
      [circle.name, circle.summary, circle.description, circle.rules].join(" "),
  );
  const opportunities = filterMemberContent(
    (opportunityResult.data ?? []).filter((opportunity) =>
      isEligibleOpportunity(opportunity, nowIso),
    ),
    contentPreferences,
    (opportunity) => opportunity.created_by,
    (opportunity) =>
      [
        opportunity.title,
        opportunity.summary,
        opportunity.description,
        opportunity.deliverables,
        opportunity.creator_display_name,
      ].join(" "),
  );

  const sessionIds = sessions.map((session) => session.id);
  const campaignIds = campaigns.map((campaign) => campaign.id);
  const circleIds = circles.map((circle) => circle.id);
  const opportunityIds = opportunities.map((opportunity) => opportunity.id);
  const pulse = pulseResult.error ? null : pulseResult.data;

  const [
    sessionInterestResult,
    campaignInterestResult,
    circleInterestResult,
    opportunityInterestResult,
    pulseInterestResult,
  ] = await Promise.all([
    sessionIds.length
      ? supabase
          .from("session_interests")
          .select("session_id, interest_id")
          .in("session_id", sessionIds)
      : Promise.resolve({ data: [], error: null }),
    campaignIds.length
      ? supabase
          .from("campaign_interests")
          .select("campaign_id, interest_id")
          .in("campaign_id", campaignIds)
      : Promise.resolve({ data: [], error: null }),
    circleIds.length
      ? supabase
          .from("circle_interests")
          .select("circle_id, interest_id")
          .in("circle_id", circleIds)
      : Promise.resolve({ data: [], error: null }),
    opportunityIds.length
      ? supabase
          .from("opportunity_interests")
          .select("opportunity_id, interest_id")
          .in("opportunity_id", opportunityIds)
      : Promise.resolve({ data: [], error: null }),
    pulse
      ? supabase
          .from("pulse_check_in_interests")
          .select("interest_id")
          .eq("check_in_id", pulse.id)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const modes = modeResult.data ?? [];
  const interests = interestResult.data ?? [];
  const sessionLinks = sessionInterestResult.data ?? [];
  const currentMode = pulse
    ? modes.find((mode) => mode.id === pulse.mode_id)
    : null;

  const pulseInput: PulseRecommendationInput | null =
    pulse && currentMode
      ? {
          modeSlug: currentMode.slug,

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
    ? rankSessions(pulseInput, sessions, modes, sessionLinks)
    : [];

  const pulseOrder = new Map(
    recommendations.map((recommendation, index) => [
      recommendation.candidate.id,
      index,
    ]),
  );

  const orderedSessions = [...sessions].sort(
    (left, right) =>
      (pulseOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (pulseOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER) ||
      Date.parse(left.starts_at) - Date.parse(right.starts_at),
  );

  const sessionCards = assembleSessionCards(
    orderedSessions,
    modes,
    interests,
    sessionLinks,
    recommendations,
  );
  const campaignPreview = selectEcosystemPreview(
    campaigns,
    pulseInput
      ? rankCampaigns(
          pulseInput,
          campaigns,
          modes,
          campaignInterestResult.data ?? [],
        )
      : [],
  );
  const circlePreview = selectEcosystemPreview(
    circles,
    pulseInput
      ? rankCircles(pulseInput, circles, modes, circleInterestResult.data ?? [])
      : [],
  );
  const commonsPreview = selectEcosystemPreview(
    opportunities,
    pulseInput
      ? rankOpportunities(
          pulseInput,
          opportunities,
          modes,
          opportunityInterestResult.data ?? [],
        )
      : [],
  );
  const ecosystemUnavailable = unavailableSources.filter(
    (source) => source !== "sessions",
  );

  return (
    <div className="min-w-0 text-center sm:text-left">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#992bff] uppercase sm:justify-start">
            <CalendarRange aria-hidden="true" className="size-4" />
            Community Sessions
          </p>

          <h1 className="display-type mx-auto mt-8 max-w-4xl text-5xl leading-[0.95] break-words text-white sm:mx-0 sm:text-7xl">
            Find Something Worth Showing Up For.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 break-words text-neutral-300 sm:mx-0">
            Sessions are specific things SIGNAL members are doing together—from
            game nights, shopping trips, and dinners to coworking, workshops,
            museum visits, and local meetups.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
          <ButtonLink
            className="mx-auto min-h-12 min-w-[12.5rem] border-[#992bff]/35 bg-black/40 px-7 text-sm whitespace-nowrap text-white/85 shadow-none hover:border-[#992bff]/65 hover:bg-[#992bff]/10 hover:text-white sm:mx-0"
            href="/home/registrations"
            variant="secondary"
          >
            <TicketCheck aria-hidden="true" className="size-4 text-[#992bff]" />
            My Registrations
          </ButtonLink>

          <ButtonLink
            className="mx-auto min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 sm:mx-0"
            href="/home/sessions/host"
          >
            <Plus aria-hidden="true" className="size-4" />
            Host a Session
          </ButtonLink>
        </div>
      </div>

      {pulseInput ? (
        <StatusMessage
          className="mt-8 justify-center text-center sm:justify-start sm:text-left"
          tone="success"
        >
          <span>
            <strong>Matched to your current Pulse.</strong> Sessions keep their
            transparent Pulse order, and each ecosystem preview uses the same
            fit signals when available.
          </span>
        </StatusMessage>
      ) : (
        <StatusMessage className="mt-8 justify-center text-center sm:justify-start sm:text-left">
          <span>
            <strong>Browsing by current schedule and deadline.</strong> Check
            your Pulse for transparent Session ordering.{" "}
            <Link className="font-bold underline" href="/home/pulse">
              Check Pulse
            </Link>
          </span>
        </StatusMessage>
      )}
            <AroundEcosystem
        campaign={
          campaignPreview
            ? {
                activePlayers: campaignPreview.active_player_count,
                capacity: campaignPreview.player_capacity,
                deadline: campaignPreview.application_deadline,
                experienceLevel: campaignPreview.experience_level,
                format: campaignPreview.format,
                genre: campaignPreview.genre,
                href: `/home/realm/${campaignPreview.id}`,
                location: campaignPreview.location_label,
                schedule: campaignPreview.schedule_summary,
                summary: campaignPreview.summary,
                title: campaignPreview.title,
              }
            : undefined
        }
        circle={
          circlePreview
            ? {
                format: circlePreview.format,
                href: `/home/circles/${circlePreview.id}`,
                joinPolicy: circlePreview.join_policy,
                location: circlePreview.location_label,
                name: circlePreview.name,
                summary: circlePreview.summary,
              }
            : undefined
        }
        commons={
          commonsPreview
            ? {
                acceptedCount: commonsPreview.accepted_count,
                creatorName: commonsPreview.creator_display_name,
                deadline: commonsPreview.response_deadline,
                format: commonsPreview.format,
                href: `/home/commons/${commonsPreview.id}`,
                isPaid: commonsPreview.is_paid,
                kind: commonsPreview.kind,
                location: commonsPreview.location_label,
                positions: commonsPreview.positions,
                summary: commonsPreview.summary,
                title: commonsPreview.title,
              }
            : undefined
        }
        unavailableSources={ecosystemUnavailable}
      />


      <SubSignalSection
        description="Standalone plans and activities created by SIGNAL members."
        eyebrow="Community Activity"
        heading={pulseInput ? "Sessions In Sync" : "Upcoming Sessions"}
        icon={<Sparkles aria-hidden="true" className="size-5 text-[#992bff]" />}
        id="standard-session-results"
      >
        {sessionResult.error ? (
          <StatusMessage
            className="col-span-full justify-center text-center"
            tone="error"
          >
            Sessions are temporarily unavailable. Please try again shortly.
          </StatusMessage>
        ) : sessionCards.length ? (
          sessionCards.map((card) => <SessionCard item={card} key={card.id} />)
        ) : (
          <div className="col-span-full rounded-[1.75rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] px-6 py-10 text-center">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <Sparkles aria-hidden="true" className="size-6 text-[#992bff]" />
              <h3 className="mt-4 text-xl font-bold text-white">
                No Published Sessions Yet
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
                Member-created plans and activities will appear here as soon as
                someone publishes a Session.
              </p>
            </div>
          </div>
        )}
      </SubSignalSection>

    </div>
  );
}

function SubSignalSection({
  id,
  heading,
  description,
  eyebrow,
  icon,
  children,
}: {
  id: string;
  heading: string;
  description: string;
  eyebrow?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12 min-w-0">
      <div className="flex min-w-0 flex-col items-center sm:items-start">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#992bff]/25 bg-[#992bff]/[0.06]">
            {icon}
          </div>

          <div className="text-left">
            {eyebrow ? (
              <p className="text-[0.65rem] font-black tracking-[0.18em] text-[#992bff]/70 uppercase">
                {eyebrow}
              </p>
            ) : null}

            <h2
              className="min-w-0 text-2xl font-bold break-words text-white"
              id={id}
            >
              {heading}
            </h2>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-center text-sm leading-6 break-words text-white/45 sm:text-left">
          {description}
        </p>
      </div>

      <div className="mt-6 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        {children}
      </div>
    </section>
  );
}