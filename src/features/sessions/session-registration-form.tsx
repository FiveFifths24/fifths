"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { initialActionState } from "@/features/auth/state";
import {
  cancelSessionRegistrationAction,
  registerForSessionAction,
} from "./actions";

export function SessionRegistrationForm({
  sessionId,
  isRegistered,
  registrationOpen,
  isFull,
}: {
  sessionId: string;
  isRegistered: boolean;
  registrationOpen: boolean;
  isFull: boolean;
}) {
  const [registerState, registerAction] = useActionState(
    registerForSessionAction.bind(null, sessionId),
    initialActionState,
  );
  const [cancelState, cancelAction] = useActionState(
    cancelSessionRegistrationAction.bind(null, sessionId),
    initialActionState,
  );

  if (isRegistered) {
    return (
      <form
        action={cancelAction}
        aria-label="Cancel Session registration"
        className="space-y-4"
      >
        <ActionStatus state={cancelState} />
        <p className="text-sm leading-6 text-emerald-100">
          You are registered. Your place counts toward capacity.
        </p>
        <SubmitButton pendingLabel="Cancelling…" variant="secondary">
          Cancel registration
        </SubmitButton>
      </form>
    );
  }

  if (!registrationOpen || isFull) {
    return (
      <p className="text-sm leading-6 text-neutral-400" role="status">
        {isFull
          ? "This Session is full. Phase 4 does not include a waitlist."
          : "Registration is not open for this Session."}
      </p>
    );
  }

  return (
    <form
      action={registerAction}
      aria-label="Register for this Session"
      className="space-y-4"
    >
      <ActionStatus state={registerState} />
      <p className="text-sm leading-6 text-neutral-400">
        Registration is capacity-safe and tied only to your signed-in account.
      </p>
      <SubmitButton pendingLabel="Registering…">
        Register For Session
      </SubmitButton>
    </form>
  );
}
