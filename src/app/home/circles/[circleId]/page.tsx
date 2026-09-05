import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LockKeyhole, MessagesSquare, ShieldCheck } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { CircleMembershipForm } from "@/features/circles/circle-membership-form";
import {
  formatCircleFormat,
  formatJoinPolicy,
} from "@/features/circles/circle-card";
import { assembleSessionCards } from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import { ReportForm } from "@/features/trust-safety/report-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Circle Details",
};

export const dynamic = "force-dynamic";

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ circleId: string }>;
}) {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [{ circleId }, userResult] = await Promise.all([
    params,
    supabase.auth.getUser(),
  ]);

  if (!userResult.data.user) {
    return <AccountUnavailable />;
  }

  const [circleResult, membershipResult] = await Promise.all([
    supabase.from("circles").select("*").eq("id", circleId).maybeSingle(),

    supabase
      .from("circle_members")
      .select("circle_id, role, status")
      .eq("circle_id", circleId)
      .eq("user_id", userResult.data.user.id)
      .maybeSingle(),
  ]);

  if (circleResult.error) {
    return (
      <StatusMessage tone="error">
        This Circle is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }

  if (!circleResult.data) {
    notFound();
  }

  const circle = circleResult.data;

  const [modeResult, interestLinkResult, interestResult, sessionResult] =
    await Promise.all([
      supabase
        .from("modes")
        .select("id, name")
        .eq("id", circle.mode_id)
        .maybeSingle(),

      supabase
        .from("circle_interests")
        .select("interest_id")
        .eq("circle_id", circle.id),

      supabase
        .from("interests")
        .select("id, name")
        .eq("active", true)
        .order("name"),

      supabase
        .from("sessions")
        .select("*")
        .eq("circle_id", circle.id)
        .eq("status", "published")
        .gt("starts_at", new Date().toISOString())
        .order("starts_at")
        .limit(12),
    ]);

  const circleInterestIds = new Set(
    (interestLinkResult.data ?? []).map((item) => item.interest_id),
  );

  const circleInterests = (interestResult.data ?? []).filter((item) =>
    circleInterestIds.has(item.id),
  );

  const sessions = sessionResult.data ?? [];

  const sessionLinks = sessions.length
    ? ((
        await supabase
          .from("session_interests")
          .select("session_id, interest_id")
          .in(
            "session_id",
            sessions.map((session) => session.id),
          )
      ).data ?? [])
    : [];

  const sessionCards = assembleSessionCards(
    sessions,
    modeResult.data ? [modeResult.data] : [],
    interestResult.data ?? [],
    sessionLinks,
  );

  const membership = membershipResult.data;

  const canManage =
    membership?.status === "active" &&
    ["owner", "host", "moderator"].includes(membership.role);

  return (
    <div className="text-center sm:text-left">
      {/* =====================================================
          CIRCLE HERO
      ====================================================== */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="mx-auto max-w-4xl sm:mx-0">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#ee54a7] uppercase sm:justify-start">
            {circle.visibility === "private" ? (
              <LockKeyhole aria-hidden="true" className="size-4" />
            ) : (
              <MessagesSquare aria-hidden="true" className="size-4" />
            )}
            {circle.visibility} Circle
          </p>

          <h1 className="display-type mt-4 text-center text-5xl leading-[0.95] text-white sm:text-left sm:text-7xl">
            {circle.name}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-neutral-300 sm:mx-0 sm:text-left">
            {circle.summary}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc]">
              {modeResult.data?.name ?? "Circle"}
            </Badge>

            <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc]">
              {formatCircleFormat(circle.format)}
            </Badge>

            <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc]">
              {formatJoinPolicy(circle.join_policy)}
            </Badge>

            {membership ? (
              <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc] capitalize">
                {membership.status === "active"
                  ? membership.role
                  : membership.status}
              </Badge>
            ) : null}
          </div>
        </div>

        {canManage ? (
          <ButtonLink
            className="mx-auto min-h-12 min-w-[11.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] px-7 text-sm text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 sm:mx-0"
            href={`/home/circles/manage/${circle.id}`}
          >
            Manage Circle
          </ButtonLink>
        ) : null}
      </div>

      {/* =====================================================
          CIRCLE INFORMATION
      ====================================================== */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* ABOUT */}
          <section className="rounded-[2rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-6 sm:p-8">
            <h2 className="text-center text-2xl font-bold text-white sm:text-left">
              About This Circle
            </h2>

            <p className="mt-4 text-center text-sm leading-7 whitespace-pre-line text-white/60 sm:text-left">
              {circle.description}
            </p>

            {circleInterests.length ? (
              <ul
                aria-label="Circle interests"
                className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start"
              >
                {circleInterests.map((interest) => (
                  <li key={interest.id}>
                    <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc]">
                      {interest.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {/* RULES */}
          <section className="rounded-[2rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-6 sm:p-8">
            <h2 className="text-center text-2xl font-bold text-white sm:text-left">
              Community Rules
            </h2>

            <p className="mt-4 text-center text-sm leading-7 whitespace-pre-line text-white/60 sm:text-left">
              {circle.rules}
            </p>
          </section>
        </div>

        {/* ===================================================
            MEMBERSHIP
        ==================================================== */}
        <aside className="h-fit rounded-[2rem] border border-[#ee54a7]/20 bg-[#ee54a7]/[0.045] p-6 sm:p-8">
          <h2 className="text-center text-2xl font-bold text-white sm:text-left">
            Your Membership
          </h2>

          <p className="mt-3 text-center text-sm leading-7 text-white/55 sm:text-left">
            Review this Circle&apos;s purpose, rules, and participation
            expectations before joining.
          </p>

          <div className="mt-6">
            <CircleMembershipForm
              circleId={circle.id}
              joinPolicy={circle.join_policy}
              membership={membership}
            />
          </div>

          <p className="mt-6 border-t border-[#ee54a7]/15 pt-5 text-center text-xs leading-6 text-white/40 sm:text-left">
            Your membership and participation remain connected to this community
            and its membership settings.
          </p>
        </aside>
      </div>

      {/* =====================================================
          ASSOCIATED SESSIONS
      ====================================================== */}
      <section className="mt-10" aria-labelledby="circle-sessions-heading">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          <ShieldCheck aria-hidden="true" className="size-5 text-[#ee54a7]" />

          <h2
            className="text-center text-3xl font-bold text-white sm:text-left"
            id="circle-sessions-heading"
          >
            Associated Sessions
          </h2>
        </div>

        {sessionCards.length ? (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {sessionCards.map((card) => (
              <li key={card.id}>
                <SessionCard item={card} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-[#ee54a7]/25 bg-black/25 p-6 text-center sm:p-8">
            <div className="flex items-center justify-center gap-2">
              <MessagesSquare
                aria-hidden="true"
                className="size-4 text-[#ee54a7]"
              />

              <p className="font-bold text-white">
                No Upcoming Associated Sessions
              </p>
            </div>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/55">
              This Circle doesn&apos;t have any upcoming Sessions yet.
            </p>
          </div>
        )}
      </section>
      <details className="mt-10 rounded-[1.5rem] border border-red-300/15 bg-red-300/[0.03] p-5">
        <summary className="cursor-pointer font-bold text-red-100/70">
          Report This Circle
        </summary>
        <div className="mt-6">
          <ReportForm
            defaultContextUrl={`/home/circles/${circle.id}`}
            defaultTarget="circle"
            defaultTargetId={circle.id}
            lockTarget
          />
        </div>
      </details>
    </div>
  );
}
