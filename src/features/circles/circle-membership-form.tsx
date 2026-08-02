"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { initialActionState } from "@/features/auth/state";
import type { Circle, CircleMember } from "@/types/database";
import { joinCircleAction, leaveCircleAction } from "./actions";

export function CircleMembershipForm({
  circleId,
  joinPolicy,
  membership,
}: {
  circleId: string;
  joinPolicy: Circle["join_policy"];
  membership?: Pick<CircleMember, "role" | "status"> | null;
}) {
  const [joinState, joinAction] = useActionState(
    joinCircleAction.bind(null, circleId),
    initialActionState,
  );
  const [leaveState, leaveAction] = useActionState(
    leaveCircleAction.bind(null, circleId),
    initialActionState,
  );

  if (membership?.status === "active") {
    if (membership.role === "owner") {
      return (
        <p className="text-sm leading-6 text-neutral-300" role="status">
          You own this Circle. Ownership transfer and owner departure are
          intentionally unavailable in Phase 5.
        </p>
      );
    }
    return (
      <form
        action={leaveAction}
        aria-label="Leave this Circle"
        className="space-y-4"
      >
        <ActionStatus state={leaveState} />
        <p className="text-sm leading-6 text-emerald-100">
          You are an active {membership.role} in this Circle.
        </p>
        <SubmitButton pendingLabel="Leaving…" variant="secondary">
          Leave Circle
        </SubmitButton>
      </form>
    );
  }

  if (membership?.status === "requested") {
    return (
      <p className="text-sm leading-6 text-neutral-300" role="status">
        Your request is waiting for a Circle owner or moderator. Phase 5 does
        not send notifications.
      </p>
    );
  }

  if (membership?.status === "invited") {
    return (
      <p className="text-sm leading-6 text-neutral-300" role="status">
        You have an invitation. Review it from your Circle memberships page.
      </p>
    );
  }

  if (joinPolicy === "invite_only") {
    return (
      <p className="text-sm leading-6 text-neutral-400" role="status">
        This Circle is invite only. There is no public request action.
      </p>
    );
  }

  return (
    <form
      action={joinAction}
      aria-label="Join this Circle"
      className="space-y-4"
    >
      <ActionStatus state={joinState} />
      <p className="text-sm leading-6 text-neutral-400">
        {joinPolicy === "open"
          ? "Joining creates an active membership tied to your signed-in account."
          : "Your request will be visible only to authorized Circle moderators."}
      </p>
      <SubmitButton
        pendingLabel={joinPolicy === "open" ? "Joining…" : "Sending request…"}
      >
        {joinPolicy === "open" ? "Join Circle" : "Request to join"}
      </SubmitButton>
    </form>
  );
}
