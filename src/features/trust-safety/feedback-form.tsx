"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import { submitFeedbackAction } from "./actions";

const areas = [
  ["platform", "Overall platform"],
  ["pulse", "Pulse"],
  ["sessions", "Sessions"],
  ["circles", "Circles"],
  ["commons", "Creator Commons"],
  ["realm", "Fifth Realm"],
  ["passport", "Passport"],
  ["accessibility", "Accessibility"],
  ["safety", "Community safety"],
] as const;

export function FeedbackForm() {
  const [state, action] = useActionState(
    submitFeedbackAction,
    initialActionState,
  );
  const areaError = firstFieldError(state, "area");
  const messageError = firstFieldError(state, "message");
  return (
    <form
      action={action}
      aria-label="Send private feedback"
      className="space-y-5"
    >
      <ActionStatus state={state} />
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="feedback-area"
        >
          Area
        </label>
        <select
          aria-describedby="feedback-area-description"
          aria-invalid={areaError ? true : undefined}
          className={cn(
            "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 text-white focus:border-red-500 focus:outline-none",
            areaError && "border-red-500",
          )}
          defaultValue="platform"
          id="feedback-area"
          name="area"
        >
          {areas.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p
          className={cn(
            "mt-2 text-xs text-neutral-500",
            areaError && "text-red-300",
          )}
          id="feedback-area-description"
        >
          {areaError ??
            "Choose the product or experience this feedback concerns."}
        </p>
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="feedback-message"
        >
          Feedback
        </label>
        <textarea
          aria-describedby="feedback-message-description"
          aria-invalid={messageError ? true : undefined}
          className={cn(
            "min-h-40 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-red-500 focus:outline-none",
            messageError && "border-red-500",
          )}
          id="feedback-message"
          maxLength={2000}
          name="message"
          required
        />
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-neutral-500",
            messageError && "text-red-300",
          )}
          id="feedback-message-description"
        >
          {messageError ??
            "20–2,000 characters. Do not include medical diagnoses, passwords, or private contact details."}
        </p>
      </div>
      <label className="flex min-h-12 items-start gap-3 rounded-xl border border-neutral-800 p-4 text-sm leading-6 text-neutral-300">
        <input
          className="mt-1 size-5 accent-red-600"
          name="consentToContact"
          type="checkbox"
        />
        <span>
          Five Fifths may contact me through a future approved support channel
          about this feedback. Phase 10 does not send email.
        </span>
      </label>
      <SubmitButton pendingLabel="Sending feedback…">
        Send private feedback
      </SubmitButton>
    </form>
  );
}
