import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarRange, Compass, ShieldCheck, Users } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  leaveCampaignAction,
  withdrawCampaignApplicationAction,
} from "@/features/fifth-realm/actions";
import { CampaignApplicationForm } from "@/features/fifth-realm/campaign-application-form";
import {
  formatCampaignDeadline,
  formatCampaignFormat,
} from "@/features/fifth-realm/campaign-card";
import { SessionCard } from "@/features/sessions/session-card";
import { assembleSessionCards } from "@/features/sessions/session-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Fifth Realm campaign",
};

export const dynamic = "force-dynamic";

const realmBadge =
  "border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#a5f3fc] shadow-[0_0_16px_rgba(34,211,238,0.06)]";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

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

  const [campaignResult, managerResult, applicationResult, membershipResult] =
    await Promise.all([
      supabase
        .from("realm_campaigns")
        .select("*")
        .eq("id", campaignId)
        .maybeSingle(),

      supabase.rpc("can_manage_realm_campaign", {
        p_campaign_id: campaignId,
      }),

      supabase
        .from("campaign_applications")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("user_id", userData.user.id)
        .maybeSingle(),

      supabase
        .from("campaign_members")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .maybeSingle(),
    ]);

  if (campaignResult.error || !campaignResult.data) {
    notFound();
  }

  const campaign = campaignResult.data;

  const [modeResult, interestLinkResult, sessionsResult] = await Promise.all([
    supabase
      .from("modes")
      .select("id, name")
      .eq("id", campaign.mode_id)
      .maybeSingle(),

    supabase
      .from("campaign_interests")
      .select("interest_id")
      .eq("campaign_id", campaign.id),

    supabase
      .from("sessions")
      .select("*")
      .eq("campaign_id", campaign.id)
      .in("status", ["published", "completed"])
      .order("starts_at"),
  ]);

  const interestIds = (interestLinkResult.data ?? []).map(
    (item) => item.interest_id,
  );

  const interestsResult = interestIds.length
    ? await supabase
        .from("interests")
        .select("id, name")
        .in("id", interestIds)
        .order("name")
    : { data: [], error: null };

  const sessions = sessionsResult.data ?? [];
  const sessionIds = sessions.map((session) => session.id);

  const sessionLinks = sessionIds.length
    ? await supabase
        .from("session_interests")
        .select("session_id, interest_id")
        .in("session_id", sessionIds)
    : { data: [], error: null };

  const sessionCards = assembleSessionCards(
    sessions,
    modeResult.data ? [modeResult.data] : [],
    interestsResult.data ?? [],
    sessionLinks.data ?? [],
  );

  const application = applicationResult.data;
  const membership = membershipResult.data;
  const isManager = managerResult.data === true;

  const accepting =
    campaign.status === "recruiting" &&
    campaign.active_player_count < campaign.player_capacity;

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          BACK
      ====================================================== */}

      <ButtonLink
        className="mx-auto flex w-fit text-[#22d3ee]/75 hover:text-[#a5f3fc] lg:mx-0"
        href="/home/realm"
        variant="quiet"
      >
        ← Back to Fifth Realm
      </ButtonLink>

      {/* =====================================================
          CAMPAIGN HERO
      ====================================================== */}

      <header className="relative mt-8 overflow-hidden rounded-[2.25rem] border border-[#22d3ee]/25 bg-[linear-gradient(145deg,rgba(34,211,238,0.07),rgba(10,10,12,0.97)_42%,rgba(34,211,238,0.025))] p-6 shadow-[0_0_60px_rgba(34,211,238,0.035)] sm:p-9 lg:p-10 lg:text-left">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[#22d3ee]/[0.055] blur-3xl"
        />

        <div className="relative">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="mx-auto max-w-4xl lg:mx-0">
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                <Badge className={realmBadge}>
                  {modeResult.data?.name ?? "Immerse"}
                </Badge>

                <Badge className={`${realmBadge} capitalize`}>
                  {campaign.genre.replaceAll("_", " ")}
                </Badge>

                <Badge className={`${realmBadge} capitalize`}>
                  {campaign.status}
                </Badge>

                <Badge className={`${realmBadge} capitalize`}>
                  {campaign.experience_level} experience
                </Badge>
              </div>

              <h1 className="display-type mx-auto mt-6 max-w-5xl text-5xl leading-[0.92] text-white sm:text-7xl lg:mx-0">
                {campaign.title}
              </h1>

              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/60 lg:mx-0">
                {campaign.summary}
              </p>

              <p className="mt-5 font-mono text-[0.65rem] font-bold tracking-[0.18em] text-[#22d3ee]/55 uppercase">
                Game master {campaign.game_master_display_name}
              </p>
            </div>

            {isManager ? (
              <div className="shrink-0">
<ButtonLink
  className="mx-auto mt-5 flex w-fit border-[#22d3ee]/35 bg-[#22d3ee]/[0.06] text-[#cffafe] shadow-[0_0_22px_rgba(34,211,238,0.05)] hover:border-[#22d3ee]/70 hover:bg-[#22d3ee]/10 hover:text-white lg:mx-0"
  href={`/home/realm/manage/${campaign.id}`}
  variant="secondary"
>
                    Manage Campaign
                </ButtonLink>
              </div>
            ) : null}
          </div>

          {/* SNAPSHOT */}

          <dl className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-[#22d3ee]/15 bg-[#22d3ee]/10 text-center sm:grid-cols-2 lg:grid-cols-4 lg:text-left">
            <div className="bg-black/55 p-5">
              <dt className="text-xs font-medium tracking-wide text-[#a5f3fc]/40 uppercase">
                Format
              </dt>

              <dd className="mt-2 font-bold text-white">
                {formatCampaignFormat(campaign.format)}
                {campaign.location_label ? ` · ${campaign.location_label}` : ""}
              </dd>
            </div>

            <div className="bg-black/55 p-5">
              <dt className="text-xs font-medium tracking-wide text-[#a5f3fc]/40 uppercase">
                Cadence
              </dt>

              <dd className="mt-2 font-bold text-white">
                {campaign.schedule_summary}
              </dd>
            </div>

            <div className="bg-black/55 p-5">
              <dt className="text-xs font-medium tracking-wide text-[#a5f3fc]/40 uppercase">
                Typical Session
              </dt>

              <dd className="mt-2 font-bold text-white">
                {campaign.estimated_session_minutes} minutes
              </dd>
            </div>

            <div className="bg-black/55 p-5">
              <dt className="text-xs font-medium tracking-wide text-[#a5f3fc]/40 uppercase">
                Roster
              </dt>

              <dd className="mt-2 font-bold text-white">
                {campaign.active_player_count}/{campaign.player_capacity}{" "}
                players
              </dd>
            </div>
          </dl>

          {campaign.status === "recruiting" ? (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/45 lg:justify-start">
              <CalendarRange
                aria-hidden="true"
                className="size-4 text-[#22d3ee]/70"
              />

              <p>
                Applications close{" "}
                <strong className="font-semibold text-white/70">
                  {formatCampaignDeadline(
                    campaign.application_deadline,
                    campaign.timezone,
                  )}
                </strong>
                .
              </p>
            </div>
          ) : null}
        </div>
      </header>

      {/* =====================================================
          CAMPAIGN STORY + SAFETY
      ====================================================== */}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* PREMISE */}

        <section className="rounded-[2rem] border border-[#22d3ee]/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.025),rgba(0,0,0,0.28))] p-6 text-center sm:p-8 lg:text-left">
          <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
            <div className="flex size-10 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.07]">
              <Compass aria-hidden="true" className="size-5 text-[#22d3ee]" />
            </div>

            <div>
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                The World
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                Original Premise
              </h2>
            </div>
          </div>

          <p className="mt-6 text-base leading-7 whitespace-pre-line text-white/60">
            {campaign.premise}
          </p>

          <div className="mt-8 border-t border-[#22d3ee]/10 pt-7">
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
              Tone
            </p>

            <p className="mt-3 text-sm leading-6 text-white/50">
              {campaign.tone}
            </p>
          </div>

          <div className="mt-7">
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
              Interests
            </p>

            <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {(interestsResult.data ?? []).map((interest) => (
                <li key={interest.id}>
                  <Badge className={realmBadge}>{interest.name}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SAFETY */}

        <section className="rounded-[2rem] border border-[#22d3ee]/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.045),rgba(0,0,0,0.3))] p-6 text-center shadow-[0_0_45px_rgba(34,211,238,0.02)] sm:p-8 lg:text-left">
          <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
            <div className="flex size-10 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.07]">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-[#22d3ee]"
              />
            </div>

            <div>
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                Player Expectations
              </p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                Safety Expectations
              </h2>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 whitespace-pre-line text-white/60">
            {campaign.safety_expectations}
          </p>

          <ButtonLink
            className="mx-auto mt-7 flex w-fit border-[#22d3ee]/35 bg-[#22d3ee]/[0.06] text-[#cffafe] hover:border-[#22d3ee]/70 hover:bg-[#22d3ee]/10 hover:text-white lg:mx-0"
            href="/realm/safety"
            variant="secondary"
          >
            Read Realm Safety Guidelines
          </ButtonLink>
        </section>
      </div>

      {/* =====================================================
          PARTICIPATION
      ====================================================== */}

      <section className="mt-8 rounded-[2rem] border border-[#22d3ee]/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.025),rgba(0,0,0,0.28))] p-6 text-center sm:p-8 lg:text-left">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
          <div className="flex size-10 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.07]">
            <Users aria-hidden="true" className="size-5 text-[#22d3ee]" />
          </div>

          <div>
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
              Your Place In The World
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Your Participation
            </h2>
          </div>
        </div>

        {isManager ? (
          <div className="mt-6 rounded-2xl border border-[#22d3ee]/15 bg-[#22d3ee]/[0.035] p-5">
            <p className="text-sm leading-6 text-white/50">
              You manage this campaign. Applications and roster tools are
              available in the Realm campaign workspace.
            </p>

            <ButtonLink
              className="mt-5"
              href={`/home/realm/manage/${campaign.id}`}
              variant="secondary"
            >
              Open Campaign Workspace
            </ButtonLink>
          </div>
        ) : membership ? (
          <div className="mt-6">
            <StatusMessage tone="success">
              You are an active{" "}
              <strong className="capitalize">
                {membership.role.replaceAll("_", " ")}
              </strong>{" "}
              in this campaign.
            </StatusMessage>

            {membership.role === "player" && campaign.status !== "completed" ? (
              <form action={leaveCampaignAction} className="mt-5">
                <input name="campaignId" type="hidden" value={campaign.id} />

                <button
                  className="min-h-11 rounded-full border border-red-700/70 bg-red-950/40 px-5 py-2.5 text-sm font-bold text-red-100 transition hover:border-red-500 hover:bg-red-950/70"
                  type="submit"
                >
                  Leave Campaign
                </button>
              </form>
            ) : null}
          </div>
        ) : application ? (
          <div className="mt-6">
            <StatusMessage
              tone={application.status === "accepted" ? "success" : "info"}
            >
              Your application status is{" "}
              <strong className="capitalize">{application.status}</strong>.
            </StatusMessage>

            {application.status === "submitted" ? (
              <form action={withdrawCampaignApplicationAction} className="mt-5">
                <input name="campaignId" type="hidden" value={campaign.id} />

                <button
                  className="min-h-11 rounded-full border border-[#22d3ee]/35 bg-[#22d3ee]/[0.06] px-5 py-2.5 text-sm font-bold text-[#cffafe] transition hover:border-[#22d3ee]/70 hover:bg-[#22d3ee]/10"
                  type="submit"
                >
                  Withdraw Application
                </button>
              </form>
            ) : null}
          </div>
        ) : accepting ? (
          <div className="mt-6">
            <CampaignApplicationForm campaignId={campaign.id} />
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="Applications are closed">
              This campaign is not accepting new applications.
            </PreviewState>
          </div>
        )}
      </section>

      {/* =====================================================
          CAMPAIGN SESSIONS
      ====================================================== */}

      <section className="mt-10" aria-labelledby="realm-sessions-heading">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
          <div className="flex size-10 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.07]">
            <CalendarRange
              aria-hidden="true"
              className="size-5 text-[#22d3ee]"
            />
          </div>

          <div>
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
              Shared Meetings
            </p>

            <h2
              className="mt-1 text-2xl font-bold text-white"
              id="realm-sessions-heading"
            >
              Campaign Sessions
            </h2>
          </div>
        </div>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/40">
          Sessions connected to this campaign will appear here for active
          campaign members.
        </p>

        {sessionsResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            Campaign Sessions could not load.
          </StatusMessage>
        ) : sessionCards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {sessionCards.map((card) => (
              <SessionCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No Scheduled Sessions">
              The game master can connect compatible Session drafts to this
              campaign.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
