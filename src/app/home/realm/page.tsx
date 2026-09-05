import type { Metadata } from "next";
import {
  BookOpenCheck,
  ClipboardList,
  Compass,
  Gamepad2,
  Settings2,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { SwipeCardGrid } from "@/components/ui/swipe-card-grid";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { CampaignCard } from "@/features/fifth-realm/campaign-card";
import {
  assembleCampaignCards,
  rankCampaigns,
} from "@/features/fifth-realm/campaign-data";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Fifth Realm",
};

export const dynamic = "force-dynamic";

export default async function FifthRealmPage() {
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

  const [campaignResult, modeResult, interestResult, pulseResult] =
    await Promise.all([
      supabase
        .from("realm_campaigns")
        .select("*")
        .in("status", ["recruiting", "active"])
        .order("application_deadline")
        .limit(50),

      supabase.from("modes").select("id, slug, name").order("sort_order"),

      supabase
        .from("interests")
        .select("id, name")
        .eq("active", true)
        .eq("realm_enabled", true)
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

  if (campaignResult.error) {
    return (
      <StatusMessage tone="error">
        Fifth Realm is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }

  const campaigns = campaignResult.data ?? [];

  const ids = campaigns.map((campaign) => campaign.id);

  const [linkResult, applicationResult, memberResult, pulseInterestResult] =
    await Promise.all([
      ids.length
        ? supabase
            .from("campaign_interests")
            .select("campaign_id, interest_id")
            .in("campaign_id", ids)
        : Promise.resolve({
            data: [],
            error: null,
          }),

      ids.length
        ? supabase
            .from("campaign_applications")
            .select("campaign_id, status")
            .eq("user_id", userData.user.id)
            .in("campaign_id", ids)
        : Promise.resolve({
            data: [],
            error: null,
          }),

      ids.length
        ? supabase
            .from("campaign_members")
            .select("campaign_id")
            .eq("user_id", userData.user.id)
            .eq("status", "active")
            .in("campaign_id", ids)
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
    ? rankCampaigns(pulseInput, campaigns, modes, linkResult.data ?? [])
    : [];

  const order = new Map(
    recommendations.map((item, index) => [item.candidate.id, index]),
  );

  campaigns.sort(
    (left, right) =>
      (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(right.id) ?? Number.MAX_SAFE_INTEGER),
  );

  const cards = assembleCampaignCards(
    campaigns,
    modes,
    interestResult.data ?? [],
    linkResult.data ?? [],
    recommendations,
    applicationResult.data ?? [],
    (memberResult.data ?? []).map((item) => item.campaign_id),
  );

  return (
    <div className="mx-auto text-center sm:text-left">
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="max-w-4xl">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#22d3ee] uppercase lg:justify-start">
            <Compass aria-hidden="true" className="size-4" />
            Fifth Realm
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Find A World Worth Entering.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 sm:mx-0">
            Fifth Realm is where players, storytellers, game masters, and anime
            fans find campaigns and shared worlds built around clear
            expectations. Discover experiences shaped by gaming, anime, fantasy,
            fandom, collaborative storytelling, and the way you actually like to
            play.
          </p>
        </div>

        <ButtonLink
          className="min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#0891b2] via-[#22d3ee] to-[#6c14ce] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#22d3ee]/15 hover:brightness-110"
          href="/home/realm/manage?create=1"
        >
          <Gamepad2 aria-hidden="true" className="size-4" />
          Create A Campaign
        </ButtonLink>
      </div>

      {/* =====================================================
          REALM TOOLS
      ====================================================== */}
      <nav
        aria-label="Fifth Realm workspace"
        className="mt-8 grid gap-3 sm:grid-cols-2"
      >
        <ButtonLink
          className="min-h-12 border-[#22d3ee]/20 bg-black/35 text-white/75 hover:border-[#22d3ee]/45 hover:bg-[#22d3ee]/[0.06] hover:text-white"
          href="/home/realm/applications"
          variant="secondary"
        >
          <ClipboardList aria-hidden="true" className="size-4 text-[#22d3ee]" />
          Applications & Campaigns
        </ButtonLink>

        <ButtonLink
          className="min-h-12 border-[#22d3ee]/20 bg-black/35 text-white/75 hover:border-[#22d3ee]/45 hover:bg-[#22d3ee]/[0.06] hover:text-white"
          href="/home/realm/manage"
          variant="secondary"
        >
          <Settings2 aria-hidden="true" className="size-4 text-[#22d3ee]" />
          GM Tools
        </ButtonLink>
      </nav>

      {/* =====================================================
          REALM BOUNDARY
      ====================================================== */}
      <StatusMessage className="mt-8">
        <span>
          <strong>Fifth Realm Boundary:</strong> Campaigns organize
          participation, applications, and verified completion. Fifth Realm does
          not host copyrighted rules, virtual tabletop tools, private chat, or
          payments.
        </span>
      </StatusMessage>

      {/* =====================================================
          CAMPAIGN DISCOVERY
      ====================================================== */}
      <section aria-labelledby="campaign-discovery-heading" className="mt-10">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/[0.05]">
            <BookOpenCheck
              aria-hidden="true"
              className="size-5 text-[#22d3ee]"
            />
          </div>

          <div className="w-full text-center sm:text-left">
            <h2
              className="text-center text-2xl font-bold text-white sm:text-left"
              id="campaign-discovery-heading"
            >
              {pulseInput
                ? "Campaigns that fit right now"
                : "Explore Campaigns"}
            </h2>

            <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-6 text-white/45 sm:mx-0 sm:text-left">
              {pulseInput
                ? "Your current Pulse helps bring campaigns that fit your capacity and preferences closer to the top."
                : "Check your Pulse to help order campaigns around your current energy, availability, and preferred way of playing."}
            </p>
          </div>
        </div>

        {cards.length ? (
          <SwipeCardGrid as="ul" className="mt-6 gap-6 lg:grid-cols-2">
            {cards.map((card) => (
              <li key={card.id}>
                <CampaignCard item={card} />
              </li>
            ))}
          </SwipeCardGrid>
        ) : (
          <div className="mt-7">
            <PreviewState title="No Live Campaigns Yet">
              When an authorized game master publishes a recruiting or active
              campaign, it will appear here for eligible players to discover.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
