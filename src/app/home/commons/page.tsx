import type { Metadata } from "next";
import {
  Bookmark,
  BriefcaseBusiness,
  ClipboardList,
  Settings2,
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

export const metadata: Metadata = { title: "Creator Commons" };
export const dynamic = "force-dynamic";

export default async function CreatorCommonsPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

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
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (opportunityResult.error) {
    return (
      <StatusMessage tone="error">
        Creator Commons needs the Phase 6 migration before live opportunities
        can load.
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
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? supabase
          .from("opportunity_interests")
          .select("opportunity_id, interest_id")
          .in("opportunity_id", ids)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? supabase
          .from("saved_opportunities")
          .select("opportunity_id")
          .eq("user_id", userData.user.id)
          .in("opportunity_id", ids)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? supabase
          .from("opportunity_responses")
          .select("opportunity_id, status")
          .eq("user_id", userData.user.id)
          .in("opportunity_id", ids)
      : Promise.resolve({ data: [], error: null }),
    pulseResult.data
      ? supabase
          .from("pulse_check_in_interests")
          .select("interest_id")
          .eq("check_in_id", pulseResult.data.id)
      : Promise.resolve({ data: [], error: null }),
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
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            Creator Commons
          </p>
          <h1 className="display-type mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Find clear ways to contribute and create.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Explore real published opportunities with visible scope, required
            skills, openings, deadlines, and explainable Pulse fit.
          </p>
        </div>
        <ButtonLink href="/home/commons/manage">Create or manage</ButtonLink>
      </div>

      <nav
        aria-label="Creator Commons tools"
        className="mt-8 grid gap-3 sm:grid-cols-3"
      >
        <ButtonLink href="/home/commons/saved" variant="secondary">
          <Bookmark aria-hidden="true" className="size-4" /> Saved
        </ButtonLink>
        <ButtonLink href="/home/commons/responses" variant="secondary">
          <ClipboardList aria-hidden="true" className="size-4" /> My responses
        </ButtonLink>
        <ButtonLink href="/home/commons/manage" variant="secondary">
          <Settings2 aria-hidden="true" className="size-4" /> Manage
        </ButtonLink>
      </nav>

      <StatusMessage className="mt-8">
        Responses are private to you and authorized opportunity managers.
        Creator Commons does not handle payment, contracts, files, or direct
        messaging in Phase 6.
      </StatusMessage>

      <section aria-labelledby="opportunity-discovery" className="mt-10">
        <div className="flex items-center gap-3">
          <BriefcaseBusiness
            aria-hidden="true"
            className="size-5 text-amber-300"
          />
          <h2
            className="text-2xl font-bold text-white"
            id="opportunity-discovery"
          >
            {pulseInput
              ? "Ordered for your current Pulse"
              : "Published opportunities"}
          </h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
          {pulseInput
            ? "Matching uses bounded work context and reason labels. Selection always remains a separate creator decision."
            : "Record a current Pulse to order eligible opportunities with transparent reasons."}
        </p>
        {cards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <OpportunityCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No published Creator Commons opportunities yet">
              FIFTHS does not invent projects or imply that a draft is live.
              Check back after an authorized creator publishes an opportunity.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
