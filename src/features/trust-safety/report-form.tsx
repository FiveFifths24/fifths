"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { blockProfileAction } from "@/features/profiles/actions";
import { cn } from "@/lib/cn";
import { submitReportAction } from "./actions";

const targets = [
  ["member", "Member Behavior"],
  ["session", "Session"],
  ["circle", "Circle"],
  ["circle_message", "Circle Chat Message"],
  ["opportunity", "Creator Commons Opportunity"],
  ["campaign", "Fifth Realm Campaign"],
  ["platform", "Platform or Safety Concern"],
] as const;
const categories = [
  ["harassment", "Harassment"],
  ["hate_or_discrimination", "Hate or Discrimination"],
  ["threat_or_violence", "Threat or Violence"],
  ["sexual_content", "Sexual Content or Conduct"],
  ["spam_or_fraud", "Spam or Fraud"],
  ["privacy", "Privacy Concern"],
  ["copyright_or_proprietary_content", "Copyright or Proprietary Content"],
  ["other", "Other Safety Concern"],
] as const;

function TextField({
  name,
  label,
  hint,
  error,
  multiline = false,
  maxLength,
  defaultValue,
}: {
  name: "summary" | "details" | "contextUrl";
  label: string;
  hint: string;
  error?: string;
  multiline?: boolean;
  maxLength: number;
  defaultValue?: string;
}) {
  const errorId = `report-${name}-description`;
  const common =
    "w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white focus:border-red-500 focus:outline-none";
  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-white"
        htmlFor={`report-${name}`}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          className={cn(common, "min-h-40", error && "border-red-500")}
          id={`report-${name}`}
          maxLength={maxLength}
          name={name}
          defaultValue={defaultValue}
          required
        />
      ) : (
        <input
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          className={cn(common, error && "border-red-500")}
          id={`report-${name}`}
          maxLength={maxLength}
          name={name}
          defaultValue={defaultValue}
          required={name === "summary"}
        />
      )}
      <p
        className={cn(
          "mt-2 text-xs leading-5 text-neutral-500",
          error && "text-red-300",
        )}
        id={errorId}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

export function ReportForm({
  defaultTarget = "platform",
  defaultTargetId = "",
  defaultContextUrl = "",
  lockTarget = false,
  offerBlockAfterReport = false,
  blockTargetUserId = "",
  returnTo = "/home",
}: {
  defaultTarget?: (typeof targets)[number][0];
  defaultTargetId?: string;
  defaultContextUrl?: string;
  lockTarget?: boolean;
  offerBlockAfterReport?: boolean;
  blockTargetUserId?: string;
  returnTo?: string;
} = {}) {
  const [state, action] = useActionState(
    submitReportAction,
    initialActionState,
  );
  const selectClass =
    "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 text-white focus:border-red-500 focus:outline-none";
  return (
    <form
      action={action}
      aria-label="Submit a private safety report"
      className="space-y-5"
    >
      <ActionStatus state={state} />
      {state.status === "success" &&
offerBlockAfterReport &&
blockTargetUserId ? (
  <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4">
    <p className="text-sm font-semibold text-white">
      Report submitted.
    </p>

    <p className="mt-1 text-sm leading-6 text-white/55">
      Would you also like to block this member?
    </p>

    <div className="mt-4 flex flex-wrap gap-3">
      <form action={blockProfileAction}>
        <input
          name="targetUserId"
          type="hidden"
          value={blockTargetUserId}
        />
        <input
          name="returnTo"
          type="hidden"
          value={returnTo}
        />

        <button
          className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
          type="submit"
        >
          Block Member
        </button>
      </form>

      <span className="inline-flex items-center px-2 text-sm text-white/40">
        Not now
      </span>
    </div>
  </div>
) : null}
      <input name="targetEntityId" type="hidden" value={defaultTargetId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="report-target"
          >
            Concern about
          </label>
          <select
            className={selectClass}
            defaultValue={defaultTarget}
            disabled={lockTarget}
            id="report-target"
            name="targetType"
          >
            {targets.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {lockTarget ? (
            <input name="targetType" type="hidden" value={defaultTarget} />
          ) : null}
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="report-category"
          >
            Category
          </label>
          <select
            className={selectClass}
            defaultValue="harassment"
            id="report-category"
            name="category"
          >
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <TextField
        error={firstFieldError(state, "summary")}
        label="Short summary"
        hint="10–160 characters."
        maxLength={160}
        name="summary"
      />
      <TextField
        error={firstFieldError(state, "details")}
        label="What happened?"
        hint="30–2,000 characters. Include useful facts, but do not include medical diagnoses, passwords, precise addresses, or unnecessary personal data."
        maxLength={2000}
        multiline
        name="details"
      />
      <TextField
        defaultValue={defaultContextUrl}
        error={firstFieldError(state, "contextUrl")}
        label="Related FIFTHS path (optional)"
        hint="Example: /home/circles. External links and uploads are not accepted in Phase 10."
        maxLength={300}
        name="contextUrl"
      />
      <SubmitButton pendingLabel="Submitting report…" variant="danger">
        Submit Private Report
      </SubmitButton>
    </form>
  );
}
