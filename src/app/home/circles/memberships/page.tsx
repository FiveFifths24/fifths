import type { Metadata } from "next";
import {
  ArrowRight,
  MessagesSquare,
  MailCheck,
  UsersRound,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { respondToCircleInvitationAction } from "@/features/circles/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Circles",
};

export const dynamic = "force-dynamic";

const buttonClass =
  "min-h-12 rounded-full border px-6 py-3 text-sm font-bold transition";

function getMembershipStatusClass(status: string) {
  switch (status) {
    case "active":
      return "border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ff8bc9]";
    case "invited":
      return "border-[#a855f7]/35 bg-[#a855f7]/10 text-[#d8b4fe]";
    case "requested":
      return "border-white/20 bg-white/[0.06] text-white/75";
    default:
      return "border-white/15 bg-white/[0.04] text-white/65";
  }
}

export default async function CircleMembershipsPage({
  searchParams,
}: {
  searchParams?: Promise<{ invitation?: string }>;
}) {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [{ data: userData }, messages] = await Promise.all([
    supabase.auth.getUser(),
    searchParams,
  ]);

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const membershipResult = await supabase
    .from("circle_members")
    .select("circle_id, role, status, requested_at, joined_at, updated_at")
    .eq("user_id", userData.user.id)
    .in("status", ["active", "requested", "invited"])
    .order("updated_at", { ascending: false });

  if (membershipResult.error) {
    return (
      <StatusMessage tone="error">
        Circle memberships could not load. Confirm the Phase 5 migration.
      </StatusMessage>
    );
  }

  const memberships = membershipResult.data ?? [];

  const circles = memberships.length
    ? ((
        await supabase
          .from("circles")
          .select("id, name, summary, visibility, join_policy")
          .in(
            "id",
            memberships.map((membership) => membership.circle_id),
          )
      ).data ?? [])
    : [];

  const circleById = new Map(circles.map((circle) => [circle.id, circle]));

  return (
    <div className="text-center sm:text-left">
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="mx-auto max-w-4xl text-center sm:mx-0 sm:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#ee54a7] uppercase sm:justify-start">
            <MessagesSquare aria-hidden="true" className="size-4" />
            Your Circles
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            The Communities You Belong To.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 sm:mx-0">
            Keep track of the Circles you&apos;ve joined, invitations waiting
            for you, and communities where your membership is still being
            reviewed.
          </p>
        </div>

        <ButtonLink
          className="mx-auto min-h-12 min-w-[11.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] px-7 text-sm text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 sm:mx-0"
          href="/home/circles"
          variant="secondary"
        >
          <UsersRound aria-hidden="true" className="size-4 text-[#ee54a7]" />
          Discover Circles
        </ButtonLink>
      </div>

      {/* =====================================================
          INVITATION STATUS
      ====================================================== */}
      {messages?.invitation === "accepted" ? (
        <StatusMessage className="mt-8" tone="success">
          Circle invitation accepted.
        </StatusMessage>
      ) : null}

      {messages?.invitation === "declined" ? (
        <StatusMessage className="mt-8" tone="success">
          Circle invitation declined.
        </StatusMessage>
      ) : null}

      {messages?.invitation === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          The invitation response could not be saved.
        </StatusMessage>
      ) : null}

      {/* =====================================================
          MEMBERSHIPS
      ====================================================== */}
      {memberships.length ? (
        <section aria-labelledby="membership-heading" className="mt-12">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <UsersRound aria-hidden="true" className="size-5 text-[#ee54a7]" />

            <h2
              className="text-2xl font-bold text-white"
              id="membership-heading"
            >
              My Circles
            </h2>
          </div>

          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {memberships.map((membership) => {
              const circle = circleById.get(membership.circle_id);

              if (!circle) {
                return null;
              }

              return (
                <li
                  className="group relative overflow-hidden rounded-[1.75rem] border border-[#ee54a7]/20 bg-[#ee54a7]/[0.035] p-6 transition hover:border-[#ee54a7]/35 sm:p-7"
                  key={membership.circle_id}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-[#ee54a7]/[0.06] blur-[80px]"
                  />

                  <div className="relative flex h-full flex-col">
                    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                      <Badge
                        className={`capitalize ${getMembershipStatusClass(
                          membership.status,
                        )}`}
                      >
                        {membership.status}
                      </Badge>

                      <Badge className="border-white/15 bg-white/[0.04] text-white/70 capitalize">
                        {membership.role}
                      </Badge>

                      <Badge className="border-white/15 bg-white/[0.04] text-white/70 capitalize">
                        {circle.visibility}
                      </Badge>
                    </div>

                    <h3 className="mt-5 text-2xl font-bold text-white">
                      {circle.name}
                    </h3>

                    <p className="mx-auto mt-3 flex-1 text-sm leading-7 text-white/60 sm:mx-0">
                      {circle.summary}
                    </p>

                    {membership.status === "invited" ? (
                      <div className="mt-7 border-t border-[#ee54a7]/15 pt-6">
                        <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#ee54a7]/25 bg-[#ee54a7]/10">
                            <MailCheck
                              aria-hidden="true"
                              className="size-4 text-[#ee54a7]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-white">
                              You&apos;re invited.
                            </p>

                            <p className="mt-1 text-sm leading-6 text-white/55">
                              Accept to join this Circle, or decline if it
                              doesn&apos;t feel like the right fit.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <form
                            action={respondToCircleInvitationAction}
                            className="flex-1"
                          >
                            <input
                              name="circleId"
                              type="hidden"
                              value={membership.circle_id}
                            />

                            <input
                              name="response"
                              type="hidden"
                              value="accept"
                            />

                            <button
                              className={`${buttonClass} w-full border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110`}
                              type="submit"
                            >
                              Accept invitation
                            </button>
                          </form>

                          <form
                            action={respondToCircleInvitationAction}
                            className="flex-1"
                          >
                            <input
                              name="circleId"
                              type="hidden"
                              value={membership.circle_id}
                            />

                            <input
                              name="response"
                              type="hidden"
                              value="decline"
                            />

                            <button
                              className={`${buttonClass} w-full border-white/20 bg-black/40 text-white/75 hover:border-white/35 hover:bg-white/[0.06] hover:text-white`}
                              type="submit"
                            >
                              Decline
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : membership.status === "requested" ? (
                      <div className="mt-7 border-t border-[#ee54a7]/15 pt-6">
                        <p className="text-sm font-bold text-white/80">
                          Membership requested
                        </p>

                        <p className="mt-1 text-sm leading-6 text-white/55">
                          Your request is waiting for the Circle&apos;s hosts to
                          review it.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-7 border-t border-[#ee54a7]/15 pt-6">
                        <ButtonLink
                          className="w-full border-[#ee54a7]/30 bg-black/40 text-white/85 hover:border-[#ee54a7]/60 hover:bg-[#ee54a7]/10 hover:text-white"
                          href={`/home/circles/${membership.circle_id}`}
                          variant="secondary"
                        >
                          View Circle
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 text-[#ee54a7]"
                          />
                        </ButtonLink>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        /* ===================================================
            EMPTY STATE
        ==================================================== */
        <section
          aria-labelledby="empty-circles-heading"
          className="relative mt-12 overflow-hidden rounded-[2rem] border border-[#ee54a7]/20 bg-[#ee54a7]/[0.035] px-6 py-12 text-center sm:px-10 sm:py-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ee54a7]/[0.07] blur-[120px]"
          />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[#ee54a7]/30 bg-[#ee54a7]/10">
              <UsersRound
                aria-hidden="true"
                className="size-6 text-[#ee54a7]"
              />
            </div>

            <h2
              className="display-type mt-6 text-3xl text-white sm:text-4xl"
              id="empty-circles-heading"
            >
              Your Circles Will Live Here.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Join a Circle, request access, or accept an invitation. When
              you&apos;re part of a community, it&apos;ll appear here along with
              your role and membership status.
            </p>

            <div className="mt-8 flex justify-center">
              <ButtonLink
                className="min-h-12 border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] px-8 text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
                href="/home/circles"
              >
                Explore Circles
                <ArrowRight aria-hidden="true" className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          MEMBERSHIP NOTE
      ====================================================== */}
      <aside className="mt-10 flex justify-center gap-4 rounded-[1.5rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-5 text-center text-sm leading-7 text-white/55 sm:justify-start sm:p-6 sm:text-left">
        <div className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-[#ee54a7]/25 bg-black/30 sm:flex">
          <MessagesSquare
            aria-hidden="true"
            className="size-5 text-[#ee54a7]"
          />
        </div>

        <div>
          <p className="font-bold text-white/80">
            Community membership stays intentional.
          </p>

          <p className="mt-1">
            Invitations, requests, and active memberships remain separate so you
            always know where you stand with each Circle.
          </p>
        </div>
      </aside>
    </div>
  );
}
