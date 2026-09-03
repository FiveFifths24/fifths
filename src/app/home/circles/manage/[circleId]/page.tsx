import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Link2,
  MessagesSquare,
  ShieldCheck,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  inviteCircleMemberAction,
  reviewCircleMembershipAction,
  setCircleMemberRoleAction,
  setCircleStatusAction,
  setSessionCircleAction,
} from "@/features/circles/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Circle" };
export const dynamic = "force-dynamic";

const buttonClass =
  "min-h-12 rounded-full border px-5 py-3 text-sm font-bold transition";

const selectClass =
  "min-h-12 rounded-xl border border-[#ee54a7]/20 bg-black/35 px-4 text-white transition hover:border-[#ee54a7]/40 focus:border-[#ee54a7]/70 focus:outline-none focus:ring-2 focus:ring-[#ee54a7]/15";

export default async function ManageCirclePage({
  params,
  searchParams,
}: {
  params: Promise<{ circleId: string }>;
  searchParams?: Promise<{
    created?: string;
    status?: string;
    invite?: string;
    membership?: string;
    role?: string;
    session?: string;
  }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const [{ circleId }, messages, { data: userData }] = await Promise.all([
    params,
    searchParams,
    supabase.auth.getUser(),
  ]);
  if (!userData.user) return <AccountUnavailable />;

  const [circleResult, membershipResult, platformRoleResult] =
    await Promise.all([
      supabase.from("circles").select("*").eq("id", circleId).maybeSingle(),
      supabase
        .from("circle_members")
        .select("circle_id, role, status")
        .eq("circle_id", circleId)
        .eq("user_id", userData.user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role"),
    ]);
  if (circleResult.error) {
    return (
      <StatusMessage tone="error">
        Circle management is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }
  if (!circleResult.data) notFound();

  const circle = circleResult.data;
  const membership = membershipResult.data;
  const platformRoles = new Set(
    (platformRoleResult.data ?? []).map((item) => item.role),
  );
  const isPlatformAdmin = platformRoles.has("platform_admin");
  const isGlobalModerator = platformRoles.has("moderator");
  const canManage =
    isPlatformAdmin ||
    (membership?.status === "active" && membership.role === "owner");
  const isLocalModerator =
    membership?.status === "active" && membership.role === "moderator";
  const canReviewIntake = canManage || isLocalModerator;
  const canModerate = canManage || isGlobalModerator || isLocalModerator;
  const canHost =
    isPlatformAdmin ||
    (membership?.status === "active" &&
      ["owner", "host"].includes(membership.role));
  if (!canManage && !canModerate && !canHost) notFound();

  const [rosterResult, draftSessionResult, associatedSessionResult] =
    await Promise.all([
      canModerate
        ? supabase.rpc("get_circle_roster", { p_circle_id: circle.id })
        : Promise.resolve({ data: [], error: null }),
      canHost
        ? supabase
            .from("sessions")
            .select("id, title, status, circle_id")
            .eq("host_user_id", userData.user.id)
            .eq("status", "draft")
            .is("circle_id", null)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("sessions")
        .select("id, title, status, circle_id")
        .eq("circle_id", circle.id)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);
  if (rosterResult.error) {
    return (
      <StatusMessage tone="error">
        The private Circle roster could not load for this role.
      </StatusMessage>
    );
  }
  const roster = rosterResult.data ?? [];
  const requests = roster.filter(
    (item) => item.membership_status === "requested",
  );
  const activeMembers = roster.filter(
    (item) => item.membership_status === "active",
  );
  const availableDrafts = draftSessionResult.data ?? [];
  const associatedSessions = associatedSessionResult.data ?? [];

  return (
    <div className="mx-auto max-w-6xl text-center sm:text-left">
      <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
        <div className="mx-auto max-w-4xl sm:mx-0">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#ee54a7] uppercase sm:justify-start">
            <MessagesSquare aria-hidden="true" className="size-4" />
            Circle Management
          </p>

          <div className="mt-4">
            <h1 className="display-type text-5xl leading-[0.95] text-white sm:text-7xl">
              {circle.name}
            </h1>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Badge className="capitalize">{circle.status}</Badge>
              <Badge className="capitalize">{circle.visibility}</Badge>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 sm:mx-0">
            {circle.summary}
          </p>
        </div>

        <ButtonLink
          className="mx-auto min-h-12 min-w-[11.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] px-7 text-sm text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 sm:mx-0"
          href={`/home/circles/${circle.id}`}
          variant="secondary"
        >
          View Circle Details
        </ButtonLink>
      </div>

      {messages?.created === "1" ? (
        <StatusMessage className="mt-8" tone="success">
          Circle draft created. Review every boundary before publishing.
        </StatusMessage>
      ) : null}
      {messages?.status === "updated" ? (
        <StatusMessage className="mt-8" tone="success">
          Circle status updated.
        </StatusMessage>
      ) : null}
      {messages?.status === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          The lifecycle change was rejected.
        </StatusMessage>
      ) : null}
      {messages?.invite === "sent" ? (
        <StatusMessage className="mt-8" tone="success">
          Invitation created. The member can review it from their memberships
          page.
        </StatusMessage>
      ) : null}
      {messages?.invite === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          The invitation could not be created. Confirm the username and access.
        </StatusMessage>
      ) : null}
      {messages?.membership === "updated" ? (
        <StatusMessage className="mt-8" tone="success">
          Membership status updated and audited.
        </StatusMessage>
      ) : null}
      {messages?.membership === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          The membership transition was rejected.
        </StatusMessage>
      ) : null}
      {messages?.role === "updated" ? (
        <StatusMessage className="mt-8" tone="success">
          Circle role updated and audited.
        </StatusMessage>
      ) : null}
      {messages?.role === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          The Circle role change was rejected.
        </StatusMessage>
      ) : null}
      {messages?.session === "updated" ? (
        <StatusMessage className="mt-8" tone="success">
          Session association updated.
        </StatusMessage>
      ) : null}
      {messages?.session === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          The Session association was rejected. Only an authorized host can link
          their draft.
        </StatusMessage>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {canManage ? (
          <section
            className="h-fit rounded-[2rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-6 sm:p-8"
            aria-labelledby="circle-lifecycle-heading"
          >
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-[#ee54a7]"
              />

              <h2
                className="text-2xl font-bold text-white"
                id="circle-lifecycle-heading"
              >
                Lifecycle Controls
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              Keep this Circle private while it&apos;s a draft, publish it when
              the community is ready, or archive it when the space is no longer
              active.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {circle.status === "draft" ? (
                <form action={setCircleStatusAction}>
                  <input name="circleId" type="hidden" value={circle.id} />
                  <input name="status" type="hidden" value="published" />
                  <button
                    className={`${buttonClass} w-full border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#ee54a7] text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110`}
                    type="submit"
                  >
                    Publish Circle
                  </button>
                </form>
              ) : null}
              {circle.status !== "archived" ? (
                <form action={setCircleStatusAction}>
                  <input name="circleId" type="hidden" value={circle.id} />
                  <input name="status" type="hidden" value="archived" />
                  <button
                    className={`${buttonClass} w-full border-red-900/60 bg-red-950/20 text-red-200 hover:border-red-700 hover:bg-red-950/35`}
                    type="submit"
                  >
                    Archive Circle
                  </button>
                </form>
              ) : (
                <StatusMessage>
                  This Circle is archived. Phase 5 does not restore archived
                  communities.
                </StatusMessage>
              )}
            </div>
          </section>
        ) : null}

        {canReviewIntake ? (
          <section
            className="rounded-[2rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-6 sm:p-8"
            aria-labelledby="invite-heading"
          >
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <UserRoundPlus
                aria-hidden="true"
                className="size-5 text-[#ee54a7]"
              />

              <h2 className="text-2xl font-bold text-white" id="invite-heading">
                Invite A Member
              </h2>
            </div>
            <p className="mt-4 text-sm leading-7 text-white/55">
              Invite an onboarded member by username. Invitations stay private
              and appear directly in their Circle memberships.
            </p>
            <form
              action={inviteCircleMemberAction}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input name="circleId" type="hidden" value={circle.id} />
              <div className="flex-1">
                <label className="sr-only" htmlFor="username">
                  Member Username
                </label>
                <input
                  className="min-h-12 w-full rounded-xl border border-[#ee54a7]/20 bg-black/35 px-4 text-white transition placeholder:text-white/30 hover:border-[#ee54a7]/40 focus:border-[#ee54a7]/70 focus:ring-2 focus:ring-[#ee54a7]/15 focus:outline-none"
                  id="username"
                  name="username"
                  placeholder="member_username"
                  required
                />
              </div>
              <button
                className={`${buttonClass} border-[#ee54a7]/35 bg-[#ee54a7]/10 text-white hover:border-[#ee54a7]/60 hover:bg-[#ee54a7]/15`}
                type="submit"
              >
                Send Invitation
              </button>
            </form>
          </section>
        ) : null}
      </div>

      {canHost ? (
        <section
          className="mt-6 rounded-[2rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-6 sm:p-8"
          aria-labelledby="session-association-heading"
        >
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <Link2 aria-hidden="true" className="size-5 text-[#ee54a7]" />

            <h2
              className="text-2xl font-bold text-white"
              id="session-association-heading"
            >
              Associated Sessions
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Link only a draft Session you are authorized to manage.
            Private-Circle Sessions remain restricted to active members after
            publication.
          </p>
          {availableDrafts.length ? (
            <form
              action={setSessionCircleAction}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input name="circleId" type="hidden" value={circle.id} />
              <label className="sr-only" htmlFor="sessionId">
                Draft Session
              </label>
              <select
                className={`${selectClass} flex-1`}
                id="sessionId"
                name="sessionId"
                required
              >
                <option value="">Choose your draft Session</option>
                {availableDrafts.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
              <button
                className={`${buttonClass} border-rose-800 bg-rose-950/50 text-rose-100 hover:border-rose-600`}
                type="submit"
              >
                Associate Session
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#ee54a7]/25 bg-black/25 p-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <Link2 aria-hidden="true" className="size-4 text-[#ee54a7]" />

                <p className="font-bold text-white">
                  No Eligible Draft Sessions
                </p>
              </div>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/55">
                Create a Session draft from the trusted host tools, then return
                here before publishing it.
              </p>
            </div>
          )}
          {associatedSessions.length ? (
            <ul className="mt-6 space-y-3">
              {associatedSessions.map((session) => (
                <li
                  className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={session.id}
                >
                  <div>
                    <p className="font-bold text-white">{session.title}</p>
                    <Badge className="mt-2">{session.status}</Badge>
                  </div>
                  {session.status === "draft" ? (
                    <form action={setSessionCircleAction}>
                      <input name="circleId" type="hidden" value="" />
                      <input
                        name="sessionId"
                        type="hidden"
                        value={session.id}
                      />
                      <button
                        className={`${buttonClass} border-neutral-600 bg-neutral-900 text-white hover:border-neutral-400`}
                        type="submit"
                      >
                        Remove association
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
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {canModerate ? (
        <section
          className="mt-6 rounded-[2rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-6 sm:p-8"
          aria-labelledby="membership-queue-heading"
        >
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <UsersRound aria-hidden="true" className="size-5 text-[#ee54a7]" />

            <h2
              className="text-2xl font-bold text-white"
              id="membership-queue-heading"
            >
              Membership Moderation
            </h2>
          </div>
          <p className="mt-4 text-sm leading-7 text-white/55">
            Review membership requests, manage active members, and assign
            community roles from one place.
          </p>

          <h3 className="mt-7 text-lg font-bold text-white">Requests</h3>
          {requests.length ? (
            <ul className="mt-5 space-y-4">
              {requests.map((member) => (
                <li
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                  key={member.user_id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-white">
                        {member.display_name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {member.username
                          ? `@${member.username}`
                          : "Onboarded member"}
                      </p>
                    </div>
                    {canReviewIntake ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <form action={reviewCircleMembershipAction}>
                          <input
                            name="circleId"
                            type="hidden"
                            value={circle.id}
                          />
                          <input
                            name="userId"
                            type="hidden"
                            value={member.user_id}
                          />
                          <input
                            name="decision"
                            type="hidden"
                            value="approve"
                          />
                          <button
                            className={`${buttonClass} border-emerald-800 bg-emerald-950 text-emerald-100 hover:border-emerald-600`}
                            type="submit"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={reviewCircleMembershipAction}>
                          <input
                            name="circleId"
                            type="hidden"
                            value={circle.id}
                          />
                          <input
                            name="userId"
                            type="hidden"
                            value={member.user_id}
                          />
                          <input
                            name="decision"
                            type="hidden"
                            value="decline"
                          />
                          <button
                            className={`${buttonClass} border-red-900 bg-red-950/40 text-red-100 hover:border-red-700`}
                            type="submit"
                          >
                            Decline
                          </button>
                        </form>
                      </div>
                    ) : (
                      <p className="text-xs leading-5 text-neutral-500">
                        Platform safety moderators can review this request but
                        cannot approve or decline Circle intake.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[#ee54a7]/25 bg-black/25 p-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <UsersRound
                  aria-hidden="true"
                  className="size-4 text-[#ee54a7]"
                />

                <p className="font-bold text-white">No Pending Requests</p>
              </div>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-white/55">
                New requests will appear here without exposing them to other
                members.
              </p>
            </div>
          )}

          <h3 className="mt-8 text-center text-lg font-bold text-white sm:text-left">
            Active Roster
          </h3>
          {activeMembers.length ? (
            <ul className="mt-5 space-y-4">
              {activeMembers.map((member) => (
                <li
                  className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-black/30 p-5 sm:p-6"
                  key={member.user_id}
                >
                  <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-white">
                        {member.display_name}
                      </p>

                      <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                        <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc] capitalize">
                          {member.member_role}
                        </Badge>

                        {member.username ? (
                          <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc]">
                            @{member.username}
                          </Badge>
                        ) : null}
                      </div>

                      {member.member_role === "owner" ? (
                        <p className="mt-4 text-sm leading-6 text-white/45">
                          Circle owner · full management access
                        </p>
                      ) : null}
                    </div>

                    {member.member_role !== "owner" ? (
                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        {canManage ? (
                          <form
                            action={setCircleMemberRoleAction}
                            className="flex flex-col gap-2 sm:flex-row"
                          >
                            <input
                              name="circleId"
                              type="hidden"
                              value={circle.id}
                            />

                            <input
                              name="userId"
                              type="hidden"
                              value={member.user_id}
                            />

                            <label
                              className="sr-only"
                              htmlFor={`role-${member.user_id}`}
                            >
                              Role for {member.display_name}
                            </label>

                            <select
                              className={selectClass}
                              defaultValue={member.member_role}
                              id={`role-${member.user_id}`}
                              name="role"
                            >
                              <option value="member">Member</option>
                              <option value="host">Host</option>
                              <option value="moderator">Moderator</option>
                            </select>

                            <button
                              className={`${buttonClass} border-[#ee54a7]/30 bg-[#ee54a7]/10 text-white hover:border-[#ee54a7]/60 hover:bg-[#ee54a7]/15`}
                              type="submit"
                            >
                              Save Role
                            </button>
                          </form>
                        ) : null}

                        <form action={reviewCircleMembershipAction}>
                          <input
                            name="circleId"
                            type="hidden"
                            value={circle.id}
                          />

                          <input
                            name="userId"
                            type="hidden"
                            value={member.user_id}
                          />

                          <input name="decision" type="hidden" value="remove" />

                          <button
                            className={`${buttonClass} w-full border-red-900/60 bg-red-950/20 text-red-200 hover:border-red-700 hover:bg-red-950/35`}
                            type="submit"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <PreviewState title="No active members">
                The owner remains protected; approved members appear here.
              </PreviewState>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
