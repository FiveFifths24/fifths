"use client";

import { useActionState, useEffect, useRef } from "react";

import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { initialActionState } from "@/features/auth/state";

import { sendCircleMessageAction } from "./actions";

export function CircleChatForm({
  circleId,
  disabled = false,
}: {
  circleId: string;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action] = useActionState(
    sendCircleMessageAction.bind(null, circleId),
    initialActionState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const bodyError = state.fieldErrors?.body?.[0];

  return (
    <form
      action={action}
      className="space-y-3"
      ref={formRef}
    >
      <ActionStatus state={state} />

      <div>
        <label
          className="sr-only"
          htmlFor="circle-chat-body"
        >
          Message
        </label>

        <textarea
          aria-describedby={
            bodyError ? "circle-chat-body-error" : "circle-chat-body-hint"
          }
          aria-invalid={bodyError ? true : undefined}
          className={[
            "min-h-24 w-full resize-none rounded-2xl border bg-black/35 px-4 py-3 text-sm leading-6 text-white placeholder:text-white/30",
            "border-[#ee54a7]/20 transition",
            "hover:border-[#ee54a7]/35",
            "focus:border-[#ee54a7]/60 focus:outline-none focus:ring-2 focus:ring-[#ee54a7]/15",
            bodyError ? "border-red-500/70" : "",
          ].join(" ")}
          disabled={disabled}
          id="circle-chat-body"
          maxLength={2000}
          name="body"
          placeholder={
            disabled
              ? "Chat is read-only for this Circle."
              : "Message the Circle..."
          }
          required
        />

        {bodyError ? (
          <p
            className="mt-2 text-xs text-red-300"
            id="circle-chat-body-error"
          >
            {bodyError}
          </p>
        ) : (
          <p
            className="mt-2 text-xs text-white/35"
            id="circle-chat-body-hint"
          >
            Up to 2,000 characters.
          </p>
        )}
      </div>

      <fieldset disabled={disabled}>
        <div className="flex justify-center sm:justify-end">
          <SubmitButton pendingLabel="Sending...">
            Send Message
          </SubmitButton>
        </div>
      </fieldset>
    </form>
  );
}