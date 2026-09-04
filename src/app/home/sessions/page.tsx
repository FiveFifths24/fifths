import type { Metadata } from "next";
import Link from "next/link";
import {
  BriefcaseBusiness,
  CalendarRange,
  Gamepad2,
  MessagesSquare,
  Plus,
  Sparkles,
  TicketCheck,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { CircleCard } from "@/features/circles/circle-card";
import { assembleCircleCards } from "@/features/circles/circle-data";
import { OpportunityCard } from "@/features/creator-commons/opportunity-card";
import { assembleOpportunityCards } from "@/features/creator-commons/opportunity-data";
import { CampaignCard } from "@/features/fifth-realm/campaign-card";
import { assembleCampaignCards } from "@/features/fifth-realm/campaign-data";
import {
  assembleSessionCards,
  rankSessions,
} from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import {
  formatUnavailableSources,
  getSubSignalPageState,
  isEligibleCampaign,
  isEligibleCircle,
  isEligibleOpportunity,
  isEligibleSession,
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
    skillResult,
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
    supabase.from("skills").select("id, name").eq("active", true).order("name"),
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
  const userId = userData.user?.id;
  const pulse = pulseResult.error ? null : pulseResult.data;

  const [
    sessionInterestResult,
    campaignInterestResult,
    campaignApplicationResult,
    campaignMemberResult,
    circleInterestResult,
    circleMemberResult,
    opportunitySkillResult,
    opportunityInterestResult,
    savedOpportunityResult,
    opportunityResponseResult,
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
    userId && campaignIds.length
      ? supabase
          .from("campaign_applications")
          .select("campaign_id, status")
          .eq("user_id", userId)
          .in("campaign_id", campaignIds)
      : Promise.resolve({ data: [], error: null }),
    userId && campaignIds.length
      ? supabase
          .from("campaign_members")
          .select("campaign_id")
          .eq("user_id", userId)
          .eq("status", "active")
          .in("campaign_id", campaignIds)
      : Promise.resolve({ data: [], error: null }),
    circleIds.length
      ? supabase
          .from("circle_interests")
          .select("circle_id, interest_id")
          .in("circle_id", circleIds)
      : Promise.resolve({ data: [], error: null }),
    userId && circleIds.length
      ? supabase
          .from("circle_members")
          .select("circle_id, role, status")
          .eq("user_id", userId)
          .in("circle_id", circleIds)
      : Promise.resolve({ data: [], error: null }),
    opportunityIds.length
      ? supabase
          .from("opportunity_skills")
          .select("opportunity_id, skill_id")
          .in("opportunity_id", opportunityIds)
      : Promise.resolve({ data: [], error: null }),
    opportunityIds.length
      ? supabase
          .from("opportunity_interests")
          .select("opportunity_id, interest_id")
          .in("opportunity_id", opportunityIds)
      : Promise.resolve({ data: [], error: null }),
    userId && opportunityIds.length
      ? supabase
          .from("saved_opportunities")
          .select("opportunity_id")
          .eq("user_id", userId)
          .in("opportunity_id", opportunityIds)
      : Promise.resolve({ data: [], error: null }),
    userId && opportunityIds.length
      ? supabase
          .from("opportunity_responses")
          .select("opportunity_id, status")
          .eq("user_id", userId)
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
  const campaignCards = assembleCampaignCards(
    campaigns,
    modes,
    interests,
    campaignInterestResult.data ?? [],
    [],
    campaignApplicationResult.data ?? [],
    (campaignMemberResult.data ?? []).map((item) => item.campaign_id),
  );
  const circleCards = assembleCircleCards(
    circles,
    modes,
    interests,
    circleInterestResult.data ?? [],
    [],
    circleMemberResult.data ?? [],
  );
  const opportunityCards = assembleOpportunityCards(
    opportunities,
    modes,
    skillResult.data ?? [],
    interests,
    opportunitySkillResult.data ?? [],
    opportunityInterestResult.data ?? [],
    [],
    (savedOpportunityResult.data ?? []).map((item) => item.opportunity_id),
    opportunityResponseResult.data ?? [],
  );
  const totalItems =
    sessionCards.length +
    campaignCards.length +
    circleCards.length +
    opportunityCards.length;
  const pageState = getSubSignalPageState(totalItems, unavailableSources);

  return (
    <div className="min-w-0 text-center sm:text-left">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#992bff] uppercase sm:justify-start">
            <CalendarRange aria-hidden="true" className="size-4" />
            Community Sessions
          </p>

          <h1 className="display-type mx-auto mt-8 max-w-4xl text-5xl leading-[0.95] break-words text-white sm:mx-0 sm:text-7xl">
            What Can I Participate In Right Now?
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 break-words text-neutral-300 sm:mx-0">
            Find standalone Sessions, live Fifth Realm campaigns, in-person and
            hybrid Circles, and current Creator Commons opportunities—all in one
            intentional place to discover something worth showing up for.
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
            <strong>Matched to your current Pulse.</strong> Standard Sessions
            keep their transparent Pulse order; other opportunities are ordered
            by their current schedule or deadline.
          </span>
        </StatusMessage>
      ) : (
        <StatusMessage className="mt-8 justify-center text-center sm:justify-start sm:text-left">
          <span>
            <strong>Browsing by current schedule and deadline.</strong> Check
            your Pulse for transparent ordering of standard Sessions.{" "}
            <Link className="font-bold underline" href="/home/pulse">
              Check Pulse
            </Link>
          </span>
        </StatusMessage>
      )}

      {pageState === "results" && unavailableSources.length > 0 ? (
        <StatusMessage className="mt-4 justify-center text-center sm:justify-start sm:text-left">
          Some Session sources are temporarily unavailable:{" "}
          {formatUnavailableSources(unavailableSources)}. Available
          participation options are still shown below.
        </StatusMessage>
      ) : null}

      {pageState === "results" ? (
        <div className="mt-12 space-y-14">
          {sessionCards.length ? (
            <SubSignalSection
              description="Standalone plans and activities created by SIGNAL members."
              heading={pulseInput ? "Sessions In Sync" : "Upcoming Sessions"}
              icon={
                <Sparkles
                  aria-hidden="true"
                  className="size-5 text-[#992bff]"
                />
              }
              id="standard-session-results"
            >
              {sessionCards.map((card) => (
                <SessionCard item={card} key={card.id} />
              ))}
            </SubSignalSection>
          ) : null}

          {campaignCards.length ? (
            <SubSignalSection
              description="Recruiting and active shared worlds from Fifth Realm."
              heading="Fifth Realm Campaigns"
              icon={
                <Gamepad2
                  aria-hidden="true"
                  className="size-5 text-[#22d3ee]"
                />
              }
              id="campaign-session-results"
            >
              {campaignCards.map((card) => (
                <CampaignCard item={card} key={card.id} />
              ))}
            </SubSignalSection>
          ) : null}

          {circleCards.length ? (
            <SubSignalSection
              description="Published communities with an in-person or hybrid way to participate."
              heading="Circles You Can Show Up To"
              icon={
                <MessagesSquare
                  aria-hidden="true"
                  className="size-5 text-[#ee54a7]"
                />
              }
              id="circle-session-results"
            >
              {circleCards.map((card) => (
                <CircleCard item={card} key={card.id} />
              ))}
            </SubSignalSection>
          ) : null}

          {opportunityCards.length ? (
            <SubSignalSection
              description="Current creative and professional opportunities accepting responses."
              heading="Creator Commons Opportunities"
              icon={
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="size-5 text-white"
                />
              }
              id="commons-session-results"
            >
              {opportunityCards.map((card) => (
                <OpportunityCard item={card} key={card.id} />
              ))}
            </SubSignalSection>
          ) : null}
        </div>
      ) : pageState === "empty" ? (
        <div className="mt-10 rounded-[1.75rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] px-6 py-10 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <Sparkles aria-hidden="true" className="size-6 text-[#992bff]" />
            <h2 className="mt-4 text-xl font-bold text-white">
              No Published Sessions Yet
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
              New Sessions, campaigns, in-person Circles, and Creator Commons
              opportunities will appear here as they become available.
            </p>
          </div>
        </div>
      ) : (
        <StatusMessage
          className="mt-10 justify-center text-center"
          tone="error"
        >
          Participation options are temporarily unavailable. Please try again
          shortly.
        </StatusMessage>
      )}
    </div>
  );
}

function SubSignalSection({
  id,
  heading,
  description,
  icon,
  children,
}: {
  id: string;
  heading: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="min-w-0">
      <div className="flex min-w-0 flex-col items-center sm:items-start">
        <div className="flex max-w-full flex-col items-center justify-center gap-2 sm:flex-row sm:justify-start sm:gap-3">
          {icon}
          <h2
            className="min-w-0 text-2xl font-bold break-words text-white"
            id={id}
          >
            {heading}
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 break-words text-white/45">
          {description}
        </p>
      </div>
      <div className="mt-6 grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        {children}
      </div>
    </section>
  );
}
