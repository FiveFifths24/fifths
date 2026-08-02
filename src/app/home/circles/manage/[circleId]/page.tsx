import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Link2,
  Settings2,
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
  "min-h-12 rounded-full border px-5 py-3 text-sm font-bold transition-colors";
const selectClass =
  "min-h-12 rounded-xl border border-neutral-700 bg-neutral-950 px-4 text-white focus:border-rose-400 focus:outline-none";

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
        Circle management could not load. Confirm your role and the Phase 5
        migration.
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
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-rose-300 uppercase">
            <Settings2 aria-hidden="true" className="size-4" /> Circle
            management
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="display-type text-5xl text-white sm:text-7xl">
              {circle.name}
            </h1>
            <Badge>{circle.status}</Badge>
            <Badge>{circle.visibility}</Badge>
          </div>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            {circle.summary}
          </p>
        </div>
        <ButtonLink href={`/home/circles/${circle.id}`} variant="secondary">
          View Circle details
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
            className="h-fit rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8"
            aria-labelledby="circle-lifecycle-heading"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-emerald-400"
              />
              <h2
                className="text-2xl font-bold text-white"
                id="circle-lifecycle-heading"
              >
                Lifecycle controls
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              Drafts are manager-only. Publishing opens eligible discovery.
              Archiving is final in Phase 5 and prevents new joins.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {circle.status === "draft" ? (
                <form action={setCircleStatusAction}>
                  <input name="circleId" type="hidden" value={circle.id} />
                  <input name="status" type="hidden" value="published" />
                  <button
                    className={`${buttonClass} w-full border-red-700 bg-red-700 text-white hover:bg-red-600`}
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
                    className={`${buttonClass} w-full border-red-900 bg-red-950/40 text-red-100 hover:border-red-700`}
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
            className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8"
            aria-labelledby="invite-heading"
          >
            <div className="flex items-center gap-3">
              <UserRoundPlus
                aria-hidden="true"
                className="size-5 text-rose-300"
              />
              <h2 className="text-2xl font-bold text-white" id="invite-heading">
                Invite a member
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              Use an exact onboarded username. The invitation reveals no email
              address and creates no message or notification.
            </p>
            <form
              action={inviteCircleMemberAction}
              className="mt-5 flex flex-col gap-3 sm:flex-row"
            >
              <input name="circleId" type="hidden" value={circle.id} />
              <div className="flex-1">
                <label className="sr-only" htmlFor="username">
                  Member username
                </label>
                <input
                  className="min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 text-white placeholder:text-neutral-600 focus:border-rose-400 focus:outline-none"
                  id="username"
                  name="username"
                  placeholder="member_username"
                  required
                />
              </div>
              <button
                className={`${buttonClass} border-rose-800 bg-rose-950/50 text-rose-100 hover:border-rose-600`}
                type="submit"
              >
                Send invitation
              </button>
            </form>
          </section>
        ) : null}
      </div>

      {canHost ? (
        <section
          className="mt-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8"
          aria-labelledby="session-association-heading"
        >
          <div className="flex items-center gap-3">
            <Link2 aria-hidden="true" className="size-5 text-rose-300" />
            <h2
              className="text-2xl font-bold text-white"
              id="session-association-heading"
            >
              Associated Sessions
            </h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
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
            <div className="mt-5">
              <PreviewState title="No eligible draft Sessions">
                Create a Session draft from the trusted host tools, then return
                here before publishing it.
              </PreviewState>
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
          className="mt-6 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8"
          aria-labelledby="membership-queue-heading"
        >
          <div className="flex items-center gap-3">
            <UsersRound aria-hidden="true" className="size-5 text-rose-300" />
            <h2
              className="text-2xl font-bold text-white"
              id="membership-queue-heading"
            >
              Membership moderation
            </h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            Only authorized Circle moderators can view this roster. Role and
            status changes are recorded in a private audit log.
          </p>

          <h3 className="mt-7 text-lg font-bold text-white">Requests</h3>
          {requests.length ? (
            <ul className="mt-4 space-y-3">
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
            <div className="mt-4">
              <PreviewState title="No pending requests">
                New requests will appear here without exposing them to other
                members.
              </PreviewState>
            </div>
          )}

          <h3 className="mt-8 text-lg font-bold text-white">Active roster</h3>
          {activeMembers.length ? (
            <ul className="mt-4 space-y-3">
              {activeMembers.map((member) => (
                <li
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                  key={member.user_id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-bold text-white">
                        {member.display_name}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge className="capitalize">
                          {member.member_role}
                        </Badge>
                        {member.username ? (
                          <Badge>@{member.username}</Badge>
                        ) : null}
                      </div>
                    </div>
                    {member.member_role !== "owner" ? (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        {canManage ? (
                          <form
                            action={setCircleMemberRoleAction}
                            className="flex gap-2"
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
                              className={`${buttonClass} border-neutral-600 bg-neutral-900 text-white hover:border-neutral-400`}
                              type="submit"
                            >
                              Save role
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
                            className={`${buttonClass} w-full border-red-900 bg-red-950/40 text-red-100 hover:border-red-700`}
                            type="submit"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500">
                        Owner role is fixed in Phase 5.
                      </p>
                    )}
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
