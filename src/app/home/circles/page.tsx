import type { Metadata } from "next";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  assembleCircleCards,
  rankCircles,
} from "@/features/circles/circle-data";
import { CircleCard } from "@/features/circles/circle-card";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Discover Circles" };
export const dynamic = "force-dynamic";

export default async function CirclesDiscoveryPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

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
      .order("created_at", { ascending: false })
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
        Circle discovery is unavailable. Confirm that the Phase 5 migration has
        been applied.
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
    : { data: [], error: null };
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
    <div>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-rose-300 uppercase">
            <HeartHandshake aria-hidden="true" className="size-4" /> Circles
          </p>
          <h1 className="display-type mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Find community with context.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Discover real published communities with visible purpose, access
            boundaries, rules, and explainable Pulse-fit signals.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/home/circles/memberships" variant="secondary">
            Your memberships
          </ButtonLink>
          <ButtonLink href="/home/circles/manage">Manage Circles</ButtonLink>
        </div>
      </div>

      <StatusMessage className="mt-8">
        {pulseInput
          ? "Your current Pulse orders eligible Circles with plain-language reasons. Membership remains your choice."
          : "Check your Pulse to order Circles by today’s capacity. Discovery remains available without it."}
      </StatusMessage>

      {cards.length ? (
        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {cards.map((card) => (
            <li key={card.id}>
              <CircleCard item={card} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10">
          <PreviewState title="No published Circles yet">
            FIFTHS does not seed or invent communities. A trusted host must
            create and explicitly publish a real Circle.
          </PreviewState>
        </div>
      )}

      <aside className="mt-10 flex gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm leading-6 text-neutral-400">
        <ShieldCheck
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-emerald-400"
        />
        Private Circles and their associated Sessions are restricted to invited
        or active members. Phase 5 adds no chat, feed, public member directory,
        or Passport credit.
      </aside>
    </div>
  );
}
