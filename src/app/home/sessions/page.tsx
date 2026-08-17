import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, Plus, Sparkles, TicketCheck } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  assembleSessionCards,
  rankSessions,
} from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Discover Sessions",
};

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const now = new Date().toISOString();

  const [sessionResult, modeResult, interestResult, pulseResult] =
    await Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .eq("status", "published")
        .gt("starts_at", now)
        .order("starts_at")
        .limit(60),

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
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle(),
    ]);

  if (sessionResult.error) {
    return (
      <StatusMessage tone="error">
        Sessions are unavailable. Confirm that the Phase 4 migration has been
        applied to the connected Supabase project.
      </StatusMessage>
    );
  }

  const sessions = sessionResult.data ?? [];

  const sessionIds = sessions.map((session) => session.id);

  const pulse = pulseResult.data;

  const [linkResult, pulseInterestResult] = await Promise.all([
    sessionIds.length
      ? supabase
          .from("session_interests")
          .select("session_id, interest_id")
          .in("session_id", sessionIds)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    pulse
      ? supabase
          .from("pulse_check_in_interests")
          .select("interest_id")
          .eq("check_in_id", pulse.id)
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  const modes = modeResult.data ?? [];

  const links = linkResult.data ?? [];

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
    ? rankSessions(pulseInput, sessions, modes, links)
    : [];

  const order = new Map(
    recommendations.map((recommendation, index) => [
      recommendation.candidate.id,
      index,
    ]),
  );

  const orderedSessions = [...sessions].sort(
    (left, right) =>
      (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (order.get(right.id) ?? Number.MAX_SAFE_INTEGER) ||
      Date.parse(left.starts_at) - Date.parse(right.starts_at),
  );

  const cards = assembleSessionCards(
    orderedSessions,
    modes,
    interestResult.data ?? [],
    links,
    recommendations,
  );

  return (
    <div>
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#992bff] uppercase">
            <CalendarRange aria-hidden="true" className="size-4" />
            Shared Sessions
          </p>

          <h1 className="display-type mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Find Something Worth Showing Up For.
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Sessions are shared experiences built around doing something
            together — from game nights, workshops, coworking, and networking to
            creator meetups, community events, campaigns, and more. Discover
            what fits your interests, availability, energy, and preferred way of
            participating.
          </p>
        </div>

        {/* =================================================
            PAGE ACTIONS
        ================================================== */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink
            className="min-h-12 min-w-[12.5rem] border-[#992bff]/35 bg-black/40 px-7 text-sm whitespace-nowrap text-white/85 shadow-none hover:border-[#992bff]/65 hover:bg-[#992bff]/10 hover:text-white"
            href="/home/registrations"
            variant="secondary"
          >
            <TicketCheck aria-hidden="true" className="size-4 text-[#992bff]" />
            My Registrations
          </ButtonLink>

          <ButtonLink
            className="min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
            href="/home/sessions/host"
          >
            <Plus aria-hidden="true" className="size-4" />
            Host a Session
          </ButtonLink>
        </div>
      </div>

      {/* =====================================================
          PULSE MATCH STATUS
      ====================================================== */}
      {pulseInput ? (
        <StatusMessage className="mt-8" tone="success">
          <span className="font-bold">Matched to your current Pulse.</span>{" "}
          Sessions are ordered with the documented Phase 3 rules and show
          plain-language reasons, never a raw score.
        </StatusMessage>
      ) : (
        <StatusMessage className="mt-8">
          <span className="font-bold">Browsing by start time.</span> Check your
          Pulse to receive transparent Session ordering based on present
          capacity.{" "}
          <Link className="font-bold underline" href="/home/pulse">
            Check Pulse
          </Link>
        </StatusMessage>
      )}

      {/* =====================================================
          SESSION RESULTS
      ====================================================== */}
      <section aria-labelledby="session-results-heading" className="mt-10">
        <div className="flex items-center gap-3">
          <Sparkles aria-hidden="true" className="size-5 text-[#992bff]" />

          <h2
            className="text-2xl font-bold text-white"
            id="session-results-heading"
          >
            {pulseInput ? "Your Session matches" : "Upcoming Sessions"}
          </h2>
        </div>

        {cards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <SessionCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No published Sessions yet">
              Authorized hosts can create a draft and publish it after review.
              FIFTHS does not seed invented events into member discovery.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
