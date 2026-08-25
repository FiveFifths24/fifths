"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { updateProfileStatusAction } from "./actions";
import { ProfileStatusCountdown } from "./profile-status-countdown";

export function ProfileStatusForm({
  statusText,
  expiresAt,
}: {
  statusText: string;
  expiresAt: string | null;
}) {
  const [state, action] = useActionState(
    updateProfileStatusAction,
    initialActionState,
  );

  return (
    <form action={action} className="space-y-4">
      <ActionStatus state={state} />
      <div>
        <label className="sr-only" htmlFor="profile-current-signal">
          Current Signal
        </label>
        <textarea
          className="min-h-24 w-full rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none focus:border-[#f359d2]/70 focus:ring-2 focus:ring-[#992bff]/20"
          defaultValue={statusText}
          id="profile-current-signal"
          maxLength={180}
          name="statusText"
          placeholder="What’s your signal right now?"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-white/40">
          <span>One or two sentences, up to 180 characters.</span>
          {expiresAt ? <ProfileStatusCountdown expiresAt={expiresAt} /> : null}
        </div>
        {firstFieldError(state, "statusText") ? (
          <p className="mt-2 text-xs text-red-300">
            {firstFieldError(state, "statusText")}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Broadcasting…">
          Broadcast for 24 hours
        </SubmitButton>
        <span className="text-xs text-white/35">
          Submit an empty box to clear it.
        </span>
      </div>
    </form>
  );
}
