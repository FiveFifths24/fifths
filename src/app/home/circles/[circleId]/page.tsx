import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { CircleMembershipForm } from "@/features/circles/circle-membership-form";
import {
  formatCircleFormat,
  formatJoinPolicy,
} from "@/features/circles/circle-card";
import { assembleSessionCards } from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Circle details" };
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
  if (!userResult.data.user) return <AccountUnavailable />;

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
        This Circle could not load. Confirm the Phase 5 migration and your
        access.
      </StatusMessage>
    );
  }
  if (!circleResult.data) notFound();
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
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-rose-300 uppercase">
            {circle.visibility === "private" ? (
              <LockKeyhole aria-hidden="true" className="size-4" />
            ) : (
              <HeartHandshake aria-hidden="true" className="size-4" />
            )}
            {circle.visibility} Circle
          </p>
          <h1 className="display-type mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
            {circle.name}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            {circle.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="border-rose-900 bg-rose-950/40 text-rose-100">
              {modeResult.data?.name ?? "Circle"}
            </Badge>
            <Badge>{formatCircleFormat(circle.format)}</Badge>
            <Badge>{formatJoinPolicy(circle.join_policy)}</Badge>
            {membership ? (
              <Badge className="capitalize">
                {membership.status === "active"
                  ? membership.role
                  : membership.status}
              </Badge>
            ) : null}
          </div>
        </div>
        {canManage ? (
          <ButtonLink
            href={`/home/circles/manage/${circle.id}`}
            variant="secondary"
          >
            Manage Circle
          </ButtonLink>
        ) : null}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">About this Circle</h2>
            <p className="mt-4 text-sm leading-7 whitespace-pre-line text-neutral-300">
              {circle.description}
            </p>
            {circleInterests.length ? (
              <ul
                aria-label="Circle interests"
                className="mt-6 flex flex-wrap gap-2"
              >
                {circleInterests.map((interest) => (
                  <li key={interest.id}>
                    <Badge>{interest.name}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Community rules</h2>
            <p className="mt-4 text-sm leading-7 whitespace-pre-line text-neutral-300">
              {circle.rules}
            </p>
          </section>
        </div>

        <aside className="h-fit rounded-[2rem] border border-rose-950/70 bg-neutral-900 p-6">
          <h2 className="text-xl font-bold text-white">Your membership</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Review the purpose and rules before choosing how to participate.
          </p>
          <div className="mt-5">
            <CircleMembershipForm
              circleId={circle.id}
              joinPolicy={circle.join_policy}
              membership={membership}
            />
          </div>
          <p className="mt-5 border-t border-neutral-800 pt-5 text-xs leading-5 text-neutral-500">
            Membership does not create Passport credit. Reports and platform
            moderation queues begin in Phase 10.
          </p>
        </aside>
      </div>

      <section className="mt-10" aria-labelledby="circle-sessions-heading">
        <div className="flex items-center gap-3">
          <ShieldCheck aria-hidden="true" className="size-5 text-emerald-400" />
          <h2
            className="text-3xl font-bold text-white"
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
          <div className="mt-6">
            <PreviewState title="No upcoming associated Sessions">
              Circle membership can exist without scheduled activity. FIFTHS
              does not create placeholder events.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
