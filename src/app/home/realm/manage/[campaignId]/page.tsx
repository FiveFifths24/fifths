import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarRange,
  ClipboardCheck,
  Compass,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  removeCampaignMemberAction,
  reviewCampaignApplicationAction,
  setCampaignSessionAction,
  setCampaignStatusAction,
} from "@/features/fifth-realm/actions";
import { formatCampaignDeadline } from "@/features/fifth-realm/campaign-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage Fifth Realm campaign",
};

export const dynamic = "force-dynamic";

const realmBadgeClass =
  "border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#a5f3fc] shadow-[0_0_18px_rgba(34,211,238,0.08)]";

function buttonClass(tone: "default" | "danger" = "default") {
  return `min-h-11 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
    tone === "danger"
      ? "border-red-700/70 bg-red-950/40 text-red-100 hover:border-red-500 hover:bg-red-950/70"
      : "border-[#22d3ee]/45 bg-[#22d3ee]/10 text-[#cffafe] shadow-[0_0_22px_rgba(34,211,238,0.08)] hover:border-[#22d3ee]/80 hover:bg-[#22d3ee]/15"
  }`;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.08] text-[#22d3ee] shadow-[0_0_24px_rgba(34,211,238,0.06)]">
        {icon}
      </div>

      <div>
        <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#22d3ee]/70">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function ManageCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams?: Promise<{
    created?: string;
    status?: string;
    application?: string;
    member?: string;
    session?: string;
  }>;
}) {
  const [{ campaignId }, parameters] = await Promise.all([
    params,
    searchParams,
  ]);

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

  const [campaignResult, managerResult] = await Promise.all([
    supabase
      .from("realm_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle(),

    supabase.rpc("can_manage_realm_campaign", {
      p_campaign_id: campaignId,
    }),
  ]);

  if (
    campaignResult.error ||
    !campaignResult.data ||
    managerResult.data !== true
  ) {
    notFound();
  }

  const campaign = campaignResult.data;

  const [
    applicationResult,
    rosterResult,
    linkedSessionsResult,
    draftSessionsResult,
  ] = await Promise.all([
    supabase.rpc("get_realm_campaign_applications", {
      p_campaign_id: campaign.id,
    }),

    supabase.rpc("get_realm_campaign_roster", {
      p_campaign_id: campaign.id,
    }),

    supabase
      .from("sessions")
      .select(
        "id, title, status, starts_at, timezone, campaign_id, circle_id",
      )
      .eq("campaign_id", campaign.id)
      .order("starts_at"),

    supabase
      .from("sessions")
      .select(
        "id, title, status, starts_at, timezone, campaign_id, circle_id",
      )
      .eq("status", "draft")
      .is("campaign_id", null)
      .order("starts_at"),
  ]);

  const compatibleDrafts = (draftSessionsResult.data ?? []).filter(
    (session) => session.circle_id === campaign.circle_id,
  );

  const applications = applicationResult.data ?? [];
  const roster = rosterResult.data ?? [];
  const linkedSessions = linkedSessionsResult.data ?? [];

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          BACK
      ====================================================== */}

      <ButtonLink href="/home/realm/manage" variant="quiet">
        ← Back to Realm Workspace
      </ButtonLink>

      {/* =====================================================
          STATUS MESSAGES
      ====================================================== */}

      <div className="mt-6 space-y-3">
        {parameters?.created === "1" ? (
          <StatusMessage tone="success">
            Campaign draft created. Review the details before opening
            recruitment.
          </StatusMessage>
        ) : null}

        {parameters?.status === "updated" ? (
          <StatusMessage tone="success">
            Campaign status updated.
          </StatusMessage>
        ) : null}

        {parameters?.status === "error" ? (
          <StatusMessage tone="error">
            That campaign status change could not be completed. Check the
            campaign lifecycle, deadline, and player capacity.
          </StatusMessage>
        ) : null}

        {parameters?.application === "accepted" ? (
          <StatusMessage tone="success">
            Application accepted. The player has been added to the active
            roster.
          </StatusMessage>
        ) : null}

        {parameters?.application === "declined" ? (
          <StatusMessage>
            Application declined.
          </StatusMessage>
        ) : null}

        {parameters?.application === "error" ? (
          <StatusMessage tone="error">
            That application decision could not be completed. Campaign capacity
            or status may have changed.
          </StatusMessage>
        ) : null}

        {parameters?.member === "removed" ? (
          <StatusMessage tone="success">
            Player removed from the active roster.
          </StatusMessage>
        ) : null}

        {parameters?.member === "error" ? (
          <StatusMessage tone="error">
            That roster change could not be completed.
          </StatusMessage>
        ) : null}

        {parameters?.session === "associated" ? (
          <StatusMessage tone="success">
            Session linked to this Realm campaign.
          </StatusMessage>
        ) : null}

        {parameters?.session === "removed" ? (
          <StatusMessage tone="success">
            Session removed from this campaign.
          </StatusMessage>
        ) : null}

        {parameters?.session === "error" ? (
          <StatusMessage tone="error">
            That Session association could not be completed.
          </StatusMessage>
        ) : null}
      </div>

      {/* =====================================================
          CAMPAIGN HEADER
      ====================================================== */}

      <header className="relative mt-8 overflow-hidden rounded-[2.25rem] border border-[#22d3ee]/25 bg-[linear-gradient(145deg,rgba(34,211,238,0.08),rgba(9,9,11,0.96)_45%,rgba(34,211,238,0.025))] p-6 shadow-[0_0_60px_rgba(34,211,238,0.04)] sm:p-9 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#22d3ee]/[0.06] blur-3xl"
        />

        <div className="relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3">
                <Compass
                  aria-hidden="true"
                  className="size-5 text-[#22d3ee]"
                />

                <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#22d3ee]/80">
                  Realm Campaign Control
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className={realmBadgeClass}>
                  {campaign.genre.replaceAll("_", " ")}
                </Badge>

                <Badge className={`${realmBadgeClass} capitalize`}>
                  {campaign.status}
                </Badge>

                <Badge className={realmBadgeClass}>
                  {campaign.active_player_count}/{campaign.player_capacity}{" "}
                  players
                </Badge>
              </div>

              <h1 className="display-type mt-5 max-w-5xl text-5xl leading-[0.92] text-white sm:text-7xl">
                {campaign.title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
                {campaign.summary}
              </p>
            </div>

            <div className="shrink-0">
              <ButtonLink
                href={`/home/realm/${campaign.id}`}
                variant="secondary"
              >
                View Public Campaign
              </ButtonLink>
            </div>
          </div>

          {/* SNAPSHOT */}

          <dl className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-[#22d3ee]/15 bg-[#22d3ee]/10 sm:grid-cols-3">
            <div className="bg-black/55 p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-[#a5f3fc]/45">
                Application deadline
              </dt>

              <dd className="mt-2 font-bold text-white">
                {formatCampaignDeadline(
                  campaign.application_deadline,
                  campaign.timezone,
                )}
              </dd>
            </div>

            <div className="bg-black/55 p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-[#a5f3fc]/45">
                Campaign status
              </dt>

              <dd className="mt-2 font-bold capitalize text-white">
                {campaign.status}
              </dd>
            </div>

            <div className="bg-black/55 p-5">
              <dt className="text-xs font-medium uppercase tracking-wide text-[#a5f3fc]/45">
                Realm Sessions
              </dt>

              <dd className="mt-2 font-bold text-white">
                {linkedSessions.length} linked
              </dd>
            </div>
          </dl>

          {/* LIFECYCLE ACTIONS */}

          <div className="mt-7 flex flex-wrap gap-3">
            {campaign.status === "draft" ? (
              <form action={setCampaignStatusAction}>
                <input
                  name="campaignId"
                  type="hidden"
                  value={campaign.id}
                />

                <input
                  name="status"
                  type="hidden"
                  value="recruiting"
                />

                <button className={buttonClass()} type="submit">
                  Open Recruitment
                </button>
              </form>
            ) : null}

            {campaign.status === "recruiting" ? (
              <form action={setCampaignStatusAction}>
                <input
                  name="campaignId"
                  type="hidden"
                  value={campaign.id}
                />

                <input
                  name="status"
                  type="hidden"
                  value="active"
                />

                <button className={buttonClass()} type="submit">
                  Start Campaign
                </button>
              </form>
            ) : null}

            {campaign.status === "active" ? (
              <form action={setCampaignStatusAction}>
                <input
                  name="campaignId"
                  type="hidden"
                  value={campaign.id}
                />

                <input
                  name="status"
                  type="hidden"
                  value="completed"
                />

                <button className={buttonClass()} type="submit">
                  Complete Campaign
                </button>
              </form>
            ) : null}

            {(["draft", "recruiting", "active"] as const).includes(
              campaign.status as "draft" | "recruiting" | "active",
            ) ? (
              <form action={setCampaignStatusAction}>
                <input
                  name="campaignId"
                  type="hidden"
                  value={campaign.id}
                />

                <input
                  name="status"
                  type="hidden"
                  value="cancelled"
                />

                <button
                  className={buttonClass("danger")}
                  type="submit"
                >
                  Cancel Campaign
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </header>

      {/* =====================================================
          APPLICATIONS + ROSTER
      ====================================================== */}

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        {/* APPLICATIONS */}

        <section
          className="rounded-[2rem] border border-[#22d3ee]/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.025),rgba(0,0,0,0.28))] p-5 sm:p-7"
          aria-labelledby="application-queue-heading"
        >
          <SectionHeading
            description="Review the people who want to enter this campaign. Application details remain private between campaign managers and the applicant."
            eyebrow="Recruitment"
            icon={
              <ClipboardCheck
                aria-hidden="true"
                className="size-5"
              />
            }
            title="Applications"
          />

          <div className="mt-7">
            {applicationResult.error ? (
              <StatusMessage tone="error">
                The private application queue could not load.
              </StatusMessage>
            ) : applications.length ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <article
                    className="rounded-[1.5rem] border border-[#22d3ee]/12 bg-black/30 p-5 transition hover:border-[#22d3ee]/25 sm:p-6"
                    key={application.user_id}
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            className={`${realmBadgeClass} capitalize`}
                          >
                            {application.application_status}
                          </Badge>

                          <Badge
                            className={`${realmBadgeClass} capitalize`}
                          >
                            {application.experience_level}
                          </Badge>
                        </div>

                        <h3 className="mt-4 text-xl font-bold text-white">
                          {application.display_name}
                        </h3>

                        {application.username ? (
                          <p className="mt-1 text-sm text-[#a5f3fc]/35">
                            @{application.username}
                          </p>
                        ) : null}

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                          <div className="rounded-xl border border-[#22d3ee]/10 bg-[#22d3ee]/[0.025] p-4">
                            <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#22d3ee]/70">
                              Why they want in
                            </p>

                            <p className="mt-3 text-sm leading-6 whitespace-pre-line text-white/60">
                              {application.motivation}
                            </p>
                          </div>

                          <div className="rounded-xl border border-[#22d3ee]/10 bg-[#22d3ee]/[0.025] p-4">
                            <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#22d3ee]/70">
                              Availability
                            </p>

                            <p className="mt-3 text-sm leading-6 whitespace-pre-line text-white/60">
                              {application.availability}
                            </p>
                          </div>
                        </div>
                      </div>

                      {application.application_status === "submitted" &&
                      campaign.status === "recruiting" ? (
                        <div className="flex shrink-0 flex-wrap gap-3">
                          <form action={reviewCampaignApplicationAction}>
                            <input
                              name="campaignId"
                              type="hidden"
                              value={campaign.id}
                            />

                            <input
                              name="userId"
                              type="hidden"
                              value={application.user_id}
                            />

                            <input
                              name="decision"
                              type="hidden"
                              value="accept"
                            />

                            <button
                              className={buttonClass()}
                              type="submit"
                            >
                              Accept
                            </button>
                          </form>

                          <form action={reviewCampaignApplicationAction}>
                            <input
                              name="campaignId"
                              type="hidden"
                              value={campaign.id}
                            />

                            <input
                              name="userId"
                              type="hidden"
                              value={application.user_id}
                            />

                            <input
                              name="decision"
                              type="hidden"
                              value="decline"
                            />

                            <button
                              className={buttonClass("danger")}
                              type="submit"
                            >
                              Decline
                            </button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <PreviewState title="No Applications Yet">
                Once recruitment opens, applications will appear here for
                review.
              </PreviewState>
            )}
          </div>
        </section>

        {/* ROSTER */}

        <section
          className="rounded-[2rem] border border-[#22d3ee]/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.025),rgba(0,0,0,0.28))] p-5 sm:p-7"
          aria-labelledby="campaign-roster-heading"
        >
          <SectionHeading
            description={`${campaign.active_player_count} of ${campaign.player_capacity} player seats currently filled.`}
            eyebrow="Party"
            icon={<Users aria-hidden="true" className="size-5" />}
            title="Roster"
          />

          <div className="mt-7">
            {rosterResult.error ? (
              <StatusMessage tone="error">
                The campaign roster could not load.
              </StatusMessage>
            ) : roster.length ? (
              <div className="space-y-3">
                {roster.map((member) => (
                  <article
                    className="rounded-2xl border border-[#22d3ee]/12 bg-black/30 p-5 transition hover:border-[#22d3ee]/25"
                    key={member.user_id}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge
                          className={`${realmBadgeClass} capitalize`}
                        >
                          {member.member_role.replaceAll("_", " ")}
                        </Badge>

                        <h3 className="mt-3 font-bold text-white">
                          {member.display_name}
                        </h3>

                        {member.username ? (
                          <p className="mt-1 text-sm text-[#a5f3fc]/35">
                            @{member.username}
                          </p>
                        ) : null}
                      </div>

                      {member.member_role === "player" &&
                      campaign.status !== "completed" ? (
                        <form action={removeCampaignMemberAction}>
                          <input
                            name="campaignId"
                            type="hidden"
                            value={campaign.id}
                          />

                          <input
                            name="userId"
                            type="hidden"
                            value={member.user_id}
                          />

                          <button
                            className={buttonClass("danger")}
                            type="submit"
                          >
                            Remove
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <PreviewState title="No roster yet">
                Accepted applicants will appear here.
              </PreviewState>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          SHARED SESSIONS
      ====================================================== */}

      <section
        className="mt-10 rounded-[2rem] border border-[#22d3ee]/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.05),rgba(0,0,0,0.28))] p-5 shadow-[0_0_50px_rgba(34,211,238,0.025)] sm:p-7"
        aria-labelledby="campaign-sessions-heading"
      >
        <SectionHeading
          description="Connect private Session drafts to this campaign so meetings can use SIGNAL's existing Session lifecycle."
          eyebrow="Campaign Schedule"
          icon={
            <CalendarRange
              aria-hidden="true"
              className="size-5"
            />
          }
          title="Shared Sessions"
        />

        <div className="mt-7">
          {linkedSessions.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {linkedSessions.map((session) => (
                <article
                  className="flex flex-col gap-5 rounded-[1.5rem] border border-[#22d3ee]/15 bg-black/35 p-5 transition hover:border-[#22d3ee]/30 sm:flex-row sm:items-center sm:justify-between"
                  key={session.id}
                >
                  <div>
                    <Badge
                      className={`${realmBadgeClass} capitalize`}
                    >
                      {session.status}
                    </Badge>

                    <h3 className="mt-3 font-bold text-white">
                      {session.title}
                    </h3>
                  </div>

                  {session.status === "draft" ? (
                    <form action={setCampaignSessionAction}>
                      <input
                        name="campaignId"
                        type="hidden"
                        value={campaign.id}
                      />

                      <input
                        name="sessionId"
                        type="hidden"
                        value={session.id}
                      />

                      <input
                        name="associate"
                        type="hidden"
                        value="false"
                      />

                      <button
                        className={buttonClass()}
                        type="submit"
                      >
                        Unlink
                      </button>
                    </form>
                  ) : (
                    <ButtonLink
                      href={`/home/sessions/${session.id}`}
                      variant="secondary"
                    >
                      View Session
                    </ButtonLink>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <PreviewState title="No Linked Sessions">
              Campaign meetings you connect will appear here.
            </PreviewState>
          )}
        </div>

        {compatibleDrafts.length ? (
          <div className="mt-8 border-t border-[#22d3ee]/12 pt-7">
            <h3 className="text-lg font-bold text-white">
              Available Session drafts
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/45">
              These private drafts share the same Circle boundary and can be
              connected to this campaign.
            </p>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {compatibleDrafts.map((session) => (
                <article
                  className="flex flex-col gap-4 rounded-2xl border border-[#22d3ee]/12 bg-black/30 p-5 transition hover:border-[#22d3ee]/30 sm:flex-row sm:items-center sm:justify-between"
                  key={session.id}
                >
                  <p className="font-bold text-white">
                    {session.title}
                  </p>

                  <form action={setCampaignSessionAction}>
                    <input
                      name="campaignId"
                      type="hidden"
                      value={campaign.id}
                    />

                    <input
                      name="sessionId"
                      type="hidden"
                      value={session.id}
                    />

                    <input
                      name="associate"
                      type="hidden"
                      value="true"
                    />

                    <button
                      className={buttonClass()}
                      type="submit"
                    >
                      Link Session
                    </button>
                  </form>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* =====================================================
          SYSTEM BOUNDARIES
      ====================================================== */}

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#22d3ee]/12 bg-[#22d3ee]/[0.025] p-5">
          <LockKeyhole
            aria-hidden="true"
            className="size-5 text-[#22d3ee]/80"
          />

          <h2 className="mt-4 font-bold text-white">
            Private Applications
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/40">
            Motivation and availability remain private between applicants and
            campaign managers.
          </p>
        </div>

        <div className="rounded-2xl border border-[#22d3ee]/12 bg-[#22d3ee]/[0.025] p-5">
          <ShieldCheck
            aria-hidden="true"
            className="size-5 text-[#22d3ee]/80"
          />

          <h2 className="mt-4 font-bold text-white">
            Capacity Protected
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/40">
            Accepted players count toward the campaign&apos;s authoritative
            seat capacity.
          </p>
        </div>

        <div className="rounded-2xl border border-[#22d3ee]/12 bg-[#22d3ee]/[0.025] p-5">
          <CalendarRange
            aria-hidden="true"
            className="size-5 text-[#22d3ee]/80"
          />

          <h2 className="mt-4 font-bold text-white">
            Session Connected
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/40">
            Campaign meetings reuse SIGNAL Sessions rather than duplicating a
            second scheduling system.
          </p>
        </div>
      </section>
    </div>
  );
}