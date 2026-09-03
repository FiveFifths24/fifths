"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import { submitOpportunityResponseAction } from "./actions";

function ResponseField({
  label,
  name,
  error,
  hint,
  maxLength,
}: {
  label: string;
  name: "statement" | "availability";
  error?: string;
  hint: string;
  maxLength: number;
}) {
  const descriptionId = `${name}-description`;
  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-neutral-100"
        htmlFor={name}
      >
        {label}
      </label>
      <textarea
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-32 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none",
          error && "border-red-500",
        )}
        id={name}
        maxLength={maxLength}
        name={name}
        required
      />
      <p
        className={cn(
          "mt-2 text-xs leading-5 text-neutral-500",
          error && "text-red-300",
        )}
        id={descriptionId}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

export function OpportunityResponseForm({
  opportunityId,
}: {
  opportunityId: string;
}) {
  const action = submitOpportunityResponseAction.bind(null, opportunityId);
  const [state, formAction] = useActionState(action, initialActionState);
  return (
    <form
      action={formAction}
      aria-label="Respond to this opportunity"
      className="space-y-5"
    >
      <ActionStatus state={state} />
      <ResponseField
        error={firstFieldError(state, "statement")}
        hint="Explain relevant experience, interest, and how you would contribute. Do not include private contact details."
        label="Your response"
        maxLength={2000}
        name="statement"
      />
      <ResponseField
        error={firstFieldError(state, "availability")}
        hint="Describe broad availability and timing—not private contact information."
        label="Availability"
        maxLength={500}
        name="availability"
      />
      <SubmitButton pendingLabel="Submitting response…">
        Submit Private Response
      </SubmitButton>
    </form>
  );
}
