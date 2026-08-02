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

export const metadata: Metadata = { title: "Fifth Realm campaign" };
export const dynamic = "force-dynamic";

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
  if (!userData.user) return <AccountUnavailable />;
  const [campaignResult, managerResult, applicationResult, membershipResult] =
    await Promise.all([
      supabase
        .from("realm_campaigns")
        .select("*")
        .eq("id", campaignId)
        .maybeSingle(),
      supabase.rpc("can_manage_realm_campaign", { p_campaign_id: campaignId }),
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
  if (campaignResult.error || !campaignResult.data) notFound();
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
    <div>
      <ButtonLink href="/home/realm" variant="quiet">
        ← Back to Fifth Realm
      </ButtonLink>
      <div className="mt-8 rounded-[2rem] border border-indigo-950 bg-neutral-900 p-6 sm:p-9">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-indigo-900 bg-indigo-950/50 text-indigo-100">
            {modeResult.data?.name ?? "Immerse"}
          </Badge>
          <Badge>{campaign.genre}</Badge>
          <Badge className="capitalize">{campaign.status}</Badge>
          <Badge className="capitalize">
            {campaign.experience_level} experience
          </Badge>
        </div>
        <h1 className="display-type mt-5 text-5xl leading-none text-white sm:text-7xl">
          {campaign.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
          {campaign.summary}
        </p>
        <p className="mt-4 text-xs font-bold tracking-wide text-neutral-500 uppercase">
          Game master {campaign.game_master_display_name}
        </p>
        <dl className="mt-7 grid gap-5 border-y border-neutral-800 py-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-neutral-500">Format</dt>
            <dd className="mt-1 font-bold text-white">
              {formatCampaignFormat(campaign.format)}
              {campaign.location_label ? ` · ${campaign.location_label}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Cadence</dt>
            <dd className="mt-1 font-bold text-white">
              {campaign.schedule_summary}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Typical session</dt>
            <dd className="mt-1 font-bold text-white">
              {campaign.estimated_session_minutes} minutes
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Roster</dt>
            <dd className="mt-1 font-bold text-white">
              {campaign.active_player_count}/{campaign.player_capacity} players
            </dd>
          </div>
        </dl>
        {campaign.status === "recruiting" ? (
          <p className="mt-6 text-sm text-neutral-400">
            Applications close{" "}
            {formatCampaignDeadline(
              campaign.application_deadline,
              campaign.timezone,
            )}
            .
          </p>
        ) : null}
        {isManager ? (
          <ButtonLink
            className="mt-6"
            href={`/home/realm/manage/${campaign.id}`}
          >
            Manage campaign
          </ButtonLink>
        ) : null}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Compass aria-hidden="true" className="size-5 text-indigo-300" />
            <h2 className="text-2xl font-bold text-white">Original premise</h2>
          </div>
          <p className="mt-5 text-base leading-7 whitespace-pre-line text-neutral-300">
            {campaign.premise}
          </p>
          <h3 className="mt-7 text-sm font-bold tracking-wide text-indigo-200 uppercase">
            Tone
          </h3>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            {campaign.tone}
          </p>
          <h3 className="mt-7 text-sm font-bold tracking-wide text-indigo-200 uppercase">
            Interests
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(interestsResult.data ?? []).map((interest) => (
              <li key={interest.id}>
                <Badge>{interest.name}</Badge>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[2rem] border border-indigo-950 bg-indigo-950/20 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-indigo-300"
            />
            <h2 className="text-2xl font-bold text-white">
              Safety expectations
            </h2>
          </div>
          <p className="mt-5 text-sm leading-7 whitespace-pre-line text-neutral-300">
            {campaign.safety_expectations}
          </p>
          <ButtonLink className="mt-6" href="/realm/safety" variant="secondary">
            Read draft Realm safety guidelines
          </ButtonLink>
        </section>
      </div>
      <section className="mt-8 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Users aria-hidden="true" className="size-5 text-indigo-300" />
          <h2 className="text-2xl font-bold text-white">Your participation</h2>
        </div>
        {isManager ? (
          <p className="mt-4 text-sm text-neutral-400">
            Game masters do not apply to their own campaign. Use the management
            workspace for private applications and roster tools.
          </p>
        ) : membership ? (
          <div className="mt-5">
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
                  className="min-h-12 rounded-full border border-red-800 bg-red-950 px-5 py-3 text-sm font-bold text-white"
                  type="submit"
                >
                  Leave campaign
                </button>
              </form>
            ) : null}
          </div>
        ) : application ? (
          <div className="mt-5">
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
                  className="min-h-12 rounded-full border border-neutral-600 bg-neutral-950 px-5 py-3 text-sm font-bold text-white"
                  type="submit"
                >
                  Withdraw application
                </button>
              </form>
            ) : null}
          </div>
        ) : accepting ? (
          <div className="mt-5">
            <CampaignApplicationForm campaignId={campaign.id} />
          </div>
        ) : (
          <div className="mt-5">
            <PreviewState title="Applications are closed">
              This campaign is not accepting new applications. FIFTHS does not
              create placeholder participation.
            </PreviewState>
          </div>
        )}
      </section>
      <section className="mt-10" aria-labelledby="realm-sessions-heading">
        <div className="flex items-center gap-3">
          <CalendarRange
            aria-hidden="true"
            className="size-5 text-indigo-300"
          />
          <h2
            className="text-2xl font-bold text-white"
            id="realm-sessions-heading"
          >
            Campaign Sessions
          </h2>
        </div>
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
            <PreviewState title="No scheduled Sessions">
              The game master can associate compatible private draft Sessions.
              Meeting access is limited to active campaign members after
              publication.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
