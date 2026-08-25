"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import { submitReportAction } from "./actions";

const targets = [
  ["member", "Member behavior"],
  ["session", "Session"],
  ["circle", "Circle"],
  ["opportunity", "Creator Commons opportunity"],
  ["campaign", "Fifth Realm campaign"],
  ["platform", "Platform or safety concern"],
] as const;
const categories = [
  ["harassment", "Harassment"],
  ["hate_or_discrimination", "Hate or discrimination"],
  ["threat_or_violence", "Threat or violence"],
  ["sexual_content", "Sexual content or conduct"],
  ["spam_or_fraud", "Spam or fraud"],
  ["privacy", "Privacy concern"],
  ["copyright_or_proprietary_content", "Copyright or proprietary content"],
  ["other", "Other safety concern"],
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
  defaultContextUrl = "",
  lockTarget = false,
}: {
  defaultTarget?: (typeof targets)[number][0];
  defaultContextUrl?: string;
  lockTarget?: boolean;
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
        Submit private report
      </SubmitButton>
    </form>
  );
}
