import type { Metadata } from "next";
import { MessagesSquare, ShieldCheck, UsersRound } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { SwipeCardGrid } from "@/components/ui/swipe-card-grid";
import {
  assembleCircleCards,
  rankCircles,
} from "@/features/circles/circle-data";
import { CircleCard } from "@/features/circles/circle-card";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Discover Circles",
};

export const dynamic = "force-dynamic";

export default async function CirclesDiscoveryPage() {
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
    circleResult,
    membershipResult,
    pulseResult,
    modeResult,
    interestResult,
  ] = await Promise.all([
    supabase
      .from("circles")
      .select("*")
      .eq("status", "published")
      .order("name"),

    supabase
      .from("circle_members")
      .select("circle_id, role, status")
      .eq("user_id", userData.user.id),

    supabase
      .from("pulse_check_ins")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("modes")
      .select("id, slug, name")
      .eq("active", true)
      .order("sort_order"),

    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  if (circleResult.error) {
    return (
      <StatusMessage tone="error">
        Circle discovery is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }

  const circles = circleResult.data ?? [];

  const links = circles.length
    ? ((
        await supabase
          .from("circle_interests")
          .select("circle_id, interest_id")
          .in(
            "circle_id",
            circles.map((circle) => circle.id),
          )
      ).data ?? [])
    : [];

  const pulse = pulseResult.data;

  const modes = modeResult.data ?? [];

  const pulseMode = pulse
    ? modes.find((mode) => mode.id === pulse.mode_id)
    : null;

  const pulseInterestResult = pulse
    ? await supabase
        .from("pulse_check_in_interests")
        .select("interest_id")
        .eq("check_in_id", pulse.id)
    : {
        data: [],
        error: null,
      };

  const pulseInput: PulseRecommendationInput | null =
    pulse && pulseMode
      ? {
          modeSlug: pulseMode.slug,

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
    ? rankCircles(pulseInput, circles, modes, links)
    : [];

  const order = new Map(
    recommendations.map((recommendation, index) => [
      recommendation.candidate.id,
      index,
    ]),
  );

  const orderedCircles = pulseInput
    ? [...circles].sort(
        (left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0),
      )
    : circles;

  const cards = assembleCircleCards(
    orderedCircles,
    modes,
    interestResult.data ?? [],
    links,
    recommendations,
    membershipResult.data ?? [],
  );

  return (
    <div className="text-center sm:text-left">
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="mx-auto max-w-4xl sm:mx-0">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#ee54a7] uppercase sm:justify-start">
            <MessagesSquare aria-hidden="true" className="size-4" />
            Circles
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Where Shared Interests Become Community
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 sm:mx-0">
            Circles are communities built around shared interests, identities,
            goals, experiences, and ways of participating. Find the groups that
            fit who you are, how you want to connect, and what you have room for
            right now.
          </p>
        </div>

        {/* =================================================
            PAGE ACTIONS
        ================================================== */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-stretch lg:flex-col xl:flex-row">
          <ButtonLink
            className="min-h-12 min-w-[12.5rem] border-[#ee54a7]/35 bg-black/40 px-7 text-sm whitespace-nowrap text-white/85 shadow-none hover:border-[#ee54a7]/65 hover:bg-[#ee54a7]/10 hover:text-white"
            href="/home/circles/memberships"
            variant="secondary"
          >
            <UsersRound aria-hidden="true" className="size-4 text-[#ee54a7]" />
            My Circles
          </ButtonLink>

          <ButtonLink
            className="min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
            href="/home/circles/manage"
          >
            <MessagesSquare aria-hidden="true" className="size-4" />
            Create A Circle
          </ButtonLink>
        </div>
      </div>

      {/* =====================================================
          PULSE STATUS
      ====================================================== */}
      <StatusMessage className="mt-8">
        {pulseInput
          ? "Your current Pulse helps order eligible Circles based on what fits today. Membership is always your choice."
          : "Check your Pulse to bring Circles that fit today’s capacity closer to the top. You can still browse everything without it."}
      </StatusMessage>

      {/* =====================================================
          CIRCLE RESULTS
      ====================================================== */}
      <section aria-labelledby="circle-results-heading" className="mt-10">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <MessagesSquare
            aria-hidden="true"
            className="size-5 text-[#ee54a7]"
          />
          <h2
            className="text-2xl font-bold text-white"
            id="circle-results-heading"
          >
            {pulseInput ? "Circles That Fit Right Now" : "Explore Circles"}
          </h2>
        </div>

        {cards.length ? (
          <SwipeCardGrid as="ul" className="mt-6 gap-6 lg:grid-cols-2">
            {cards.map((card) => (
              <li key={card.id}>
                <CircleCard item={card} />
              </li>
            ))}
          </SwipeCardGrid>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[#ee54a7]/30 bg-[#ee54a7]/[0.035] p-6 text-center">
            <div className="flex justify-center">
              <MessagesSquare
                aria-hidden="true"
                className="size-5 text-[#ee54a7]"
              />
            </div>

            <h3 className="mt-3 text-sm font-bold text-white">
              No Published Circles Yet
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/60">
              New Circles will appear here once people create and publish real
              communities.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          PRIVACY / TRUST NOTE
      ====================================================== */}
      <aside className="mt-10 flex gap-4 rounded-[1.5rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-5 text-sm leading-7 text-white/50 sm:p-6">
        <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-[#ee54a7]/25 bg-black/30">
          <ShieldCheck aria-hidden="true" className="size-5 text-[#ee54a7]" />
        </div>

        <div>
          <p className="font-bold text-white/80">
            Your Membership Stays Intentional.
          </p>

          <p className="mt-1">
            Private Circles and their associated Sessions are limited to invited
            or active members. Joining a Circle alone does not create Passport
            activity; verified participation through an eligible Session can.
          </p>
        </div>
      </aside>
    </div>
  );
}
