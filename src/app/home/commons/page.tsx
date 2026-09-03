import type { Metadata } from "next";
import {
  Bookmark,
  BriefcaseBusiness,
  ClipboardList,
  FilePenLine,
  Settings2,
  Sparkles,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { OpportunityCard } from "@/features/creator-commons/opportunity-card";
import {
  assembleOpportunityCards,
  rankOpportunities,
} from "@/features/creator-commons/opportunity-data";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Creator Commons",
};

export const dynamic = "force-dynamic";

export default async function CreatorCommonsPage() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const [
    opportunityResult,
    modeResult,
    skillResult,
    interestResult,
    pulseResult,
  ] = await Promise.all([
    supabase
      .from("creator_opportunities")
      .select("*")
      .eq("status", "published")
      .gt("response_deadline", new Date().toISOString())
      .order("response_deadline")
      .limit(50),

    supabase.from("modes").select("id, slug, name").order("sort_order"),

    supabase.from("skills").select("id, name").eq("active", true).order("name"),

    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),

    supabase
      .from("pulse_check_ins")
      .select("*")
      .gt("expires_at", "now")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),
  ]);

  if (opportunityResult.error) {
    return (
      <StatusMessage tone="error">
        Creator Commons is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }

  const opportunities = opportunityResult.data ?? [];

  const ids = opportunities.map((opportunity) => opportunity.id);

  const [
    skillLinkResult,
    interestLinkResult,
    savedResult,
    responseResult,
    pulseInterestResult,
  ] = await Promise.all([
    ids.length
      ? supabase
          .from("opportunity_skills")
          .select("opportunity_id, skill_id")
          .in("opportunity_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    ids.length
      ? supabase
          .from("opportunity_interests")
          .select("opportunity_id, interest_id")
          .in("opportunity_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    ids.length
      ? supabase
          .from("saved_opportunities")
          .select("opportunity_id")
          .eq("user_id", userData.user.id)
          .in("opportunity_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    ids.length
      ? supabase
          .from("opportunity_responses")
          .select("opportunity_id, status")
          .eq("user_id", userData.user.id)
          .in("opportunity_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    pulseResult.data
      ? supabase
          .from("pulse_check_in_interests")
          .select("interest_id")
          .eq("check_in_id", pulseResult.data.id)
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  const modes = modeResult.data ?? [];

  const pulseMode = pulseResult.data
    ? modes.find((mode) => mode.id === pulseResult.data?.mode_id)
    : null;

  const pulseInput: PulseRecommendationInput | null =
    pulseResult.data && pulseMode
      ? {
          modeSlug: pulseMode.slug,

          energyLevel: pulseResult.data.energy_level,

          stimulationLevel: pulseResult.data.stimulation_level,

          socialIntensity: pulseResult.data.social_intensity,

          preferredFormat: pulseResult.data.preferred_format,

          availableMinutes: pulseResult.data.available_minutes,

          maximumTravelMiles: pulseResult.data.maximum_travel_miles,

          interestIds: (pulseInterestResult.data ?? []).map(
            (item) => item.interest_id,
          ),
        }
      : null;

  const recommendations = pulseInput
    ? rankOpportunities(
        pulseInput,
        opportunities,
        modes,
        interestLinkResult.data ?? [],
      )
    : [];

  const order = new Map(
    recommendations.map((item, index) => [item.candidate.id, index]),
  );

  if (pulseInput) {
    opportunities.sort(
      (left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0),
    );
  }

  const cards = assembleOpportunityCards(
    opportunities,
    modes,
    skillResult.data ?? [],
    interestResult.data ?? [],
    skillLinkResult.data ?? [],
    interestLinkResult.data ?? [],
    recommendations,
    (savedResult.data ?? []).map((item) => item.opportunity_id),
    responseResult.data ?? [],
  );

  return (
    <div>
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="mx-auto max-w-4xl text-center lg:mx-0 lg:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-white uppercase lg:justify-start">
            <FilePenLine aria-hidden="true" className="size-4" />
            Creator Commons
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Make Something With Someone.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 lg:mx-0">
            Creator Commons is where ideas become collaborations. Find projects,
            creative opportunities, professional partnerships, and people
            looking for the skills you bring — or create an opportunity of your
            own.
          </p>
        </div>

        {/* =================================================
            PRIMARY ACTION
        ================================================== */}
        <ButtonLink
          className="min-h-12 min-w-[13rem] border border-white/35 bg-white px-7 text-sm whitespace-nowrap text-black shadow-[0_0_28px_rgba(255,255,255,0.12)] hover:bg-white/90 hover:shadow-[0_0_36px_rgba(255,255,255,0.18)]"
          href="/home/commons/manage"
        >
          <Sparkles aria-hidden="true" className="size-4" />
          Create Opportunity
        </ButtonLink>
      </div>

      {/* =====================================================
          COMMONS TOOLS
      ====================================================== */}
      <nav
        aria-label="Creator Commons tools"
        className="mt-8 grid gap-3 sm:grid-cols-3"
      >
        <ButtonLink
          className="min-h-12 border-white/15 bg-white/[0.035] text-white/75 hover:border-white/35 hover:bg-white/[0.07] hover:text-white"
          href="/home/commons/saved"
          variant="secondary"
        >
          <Bookmark aria-hidden="true" className="size-4 text-white" />
          Saved
        </ButtonLink>

        <ButtonLink
          className="min-h-12 border-white/15 bg-white/[0.035] text-white/75 hover:border-white/35 hover:bg-white/[0.07] hover:text-white"
          href="/home/commons/responses"
          variant="secondary"
        >
          <ClipboardList aria-hidden="true" className="size-4 text-white" />
          My Responses
        </ButtonLink>

        <ButtonLink
          className="min-h-12 border-white/15 bg-white/[0.035] text-white/75 hover:border-white/35 hover:bg-white/[0.07] hover:text-white"
          href="/home/commons/manage"
          variant="secondary"
        >
          <Settings2 aria-hidden="true" className="size-4 text-white" />
          Manage
        </ButtonLink>
      </nav>

      {/* =====================================================
          PRIVACY NOTE
      ====================================================== */}
      <StatusMessage className="mt-8">
        Connect with confidence. Your responses stay private between you and the
        opportunity host. If you decide to work together, you’ll coordinate
        payments, agreements, files, and conversations directly with them.
      </StatusMessage>

      {/* =====================================================
          OPPORTUNITIES
      ====================================================== */}
      <section aria-labelledby="opportunity-discovery" className="mt-10">
        <div className="flex items-center justify-center gap-3 lg:justify-start">
          <BriefcaseBusiness aria-hidden="true" className="size-5 text-white" />

          <h2
            className="text-2xl font-bold text-white"
            id="opportunity-discovery"
          >
            {pulseInput
              ? "Opportunities that fit right now"
              : "Published Opportunities"}
          </h2>
        </div>

        <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-6 text-white/45 lg:mx-0 lg:text-left">
          {pulseInput
            ? "Your current Pulse helps bring relevant opportunities closer to the top. You still decide what is worth pursuing."
            : "Check your Pulse to help order opportunities around your current capacity, interests, and preferred way of working."}
        </p>

        {cards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <OpportunityCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No Published Opportunities Yet">
              New opportunities will appear here when authorized creators,
              professionals, and teams publish something they want others to
              contribute to.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
