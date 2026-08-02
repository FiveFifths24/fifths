import type { Metadata } from "next";
import { HeartHandshake } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { respondToCircleInvitationAction } from "@/features/circles/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Circle memberships" };
export const dynamic = "force-dynamic";

const buttonClass = "min-h-12 rounded-full border px-5 py-3 text-sm font-bold";

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
  if (!userData.user) return <AccountUnavailable />;

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
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-rose-300 uppercase">
            <HeartHandshake aria-hidden="true" className="size-4" /> Your
            Circles
          </p>
          <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
            Memberships and invitations.
          </h1>
        </div>
        <ButtonLink href="/home/circles" variant="secondary">
          Discover Circles
        </ButtonLink>
      </div>

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

      {memberships.length ? (
        <ul className="mt-10 space-y-5">
          {memberships.map((membership) => {
            const circle = circleById.get(membership.circle_id);
            if (!circle) return null;
            return (
              <li
                className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6"
                key={membership.circle_id}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="capitalize">{membership.status}</Badge>
                      <Badge className="capitalize">{membership.role}</Badge>
                      <Badge>{circle.visibility}</Badge>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-white">
                      {circle.name}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                      {circle.summary}
                    </p>
                  </div>
                  {membership.status === "invited" ? (
                    <div className="flex flex-col gap-3 sm:min-w-44">
                      <form action={respondToCircleInvitationAction}>
                        <input
                          name="circleId"
                          type="hidden"
                          value={membership.circle_id}
                        />
                        <input name="response" type="hidden" value="accept" />
                        <button
                          className={`${buttonClass} w-full border-red-700 bg-red-700 text-white hover:bg-red-600`}
                          type="submit"
                        >
                          Accept invitation
                        </button>
                      </form>
                      <form action={respondToCircleInvitationAction}>
                        <input
                          name="circleId"
                          type="hidden"
                          value={membership.circle_id}
                        />
                        <input name="response" type="hidden" value="decline" />
                        <button
                          className={`${buttonClass} w-full border-neutral-600 bg-neutral-950 text-white hover:border-neutral-400`}
                          type="submit"
                        >
                          Decline
                        </button>
                      </form>
                    </div>
                  ) : (
                    <ButtonLink
                      href={`/home/circles/${membership.circle_id}`}
                      variant="secondary"
                    >
                      View Circle
                    </ButtonLink>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-10">
          <PreviewState title="No Circle memberships yet">
            Join an open Circle, request access, or accept an invitation. No
            demonstration memberships are shown.
          </PreviewState>
        </div>
      )}
    </div>
  );
}
