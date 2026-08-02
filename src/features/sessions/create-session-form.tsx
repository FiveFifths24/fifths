"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Interest, Mode } from "@/types/database";
import { createSessionAction } from "./actions";
import { sessionTimezones } from "./schemas";

const selectClassName =
  "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white hover:border-neutral-500 focus:border-red-500 focus:outline-none";

function FieldMessage({
  error,
  hint,
  id,
}: {
  error?: string;
  hint?: string;
  id?: string;
}) {
  if (!error && !hint) return null;
  return (
    <p
      className={cn(
        "mt-2 text-xs leading-5 text-neutral-500",
        error && "text-red-300",
      )}
      id={id}
    >
      {error ?? hint}
    </p>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  error,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const descriptionId = error ? `${name}-description` : undefined;
  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-neutral-100"
        htmlFor={name}
      >
        {label}
      </label>
      <select
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(selectClassName, error && "border-red-500")}
        defaultValue={defaultValue}
        id={name}
        name={name}
        required
      >
        {children}
      </select>
      <FieldMessage error={error} id={descriptionId} />
    </div>
  );
}

export function CreateSessionForm({
  modes,
  interests,
  defaultTimezone,
}: {
  modes: Array<Pick<Mode, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  defaultTimezone: string;
}) {
  const [state, action] = useActionState(
    createSessionAction,
    initialActionState,
  );

  return (
    <form action={action} aria-label="Create a Session" className="space-y-9">
      <ActionStatus state={state} />

      <fieldset>
        <legend className="text-xl font-bold text-white">Session story</legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Use clear, welcoming language. The Session will remain a private draft
          until you publish it.
        </p>
        <div className="mt-5 space-y-5">
          <TextField
            error={firstFieldError(state, "title")}
            label="Title"
            maxLength={100}
            name="title"
            placeholder="Community design studio"
            required
          />
          <div>
            <label
              className="mb-2 block text-sm font-bold text-neutral-100"
              htmlFor="summary"
            >
              Short summary
            </label>
            <textarea
              aria-describedby="summary-description"
              aria-invalid={
                firstFieldError(state, "summary") ? true : undefined
              }
              className="min-h-28 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-600 hover:border-neutral-500 focus:border-red-500 focus:outline-none"
              id="summary"
              maxLength={240}
              name="summary"
              placeholder="Explain the purpose and who will feel welcome."
              required
            />
            <FieldMessage
              error={firstFieldError(state, "summary")}
              hint="10–240 characters. This appears on discovery cards."
              id="summary-description"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-bold text-neutral-100"
              htmlFor="description"
            >
              Full description
            </label>
            <textarea
              aria-describedby={
                firstFieldError(state, "description")
                  ? "description-description"
                  : undefined
              }
              aria-invalid={
                firstFieldError(state, "description") ? true : undefined
              }
              className="min-h-44 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-600 hover:border-neutral-500 focus:border-red-500 focus:outline-none"
              id="description"
              maxLength={4000}
              name="description"
              placeholder="Describe the flow, expectations, and what participants should bring."
              required
            />
            <FieldMessage
              error={firstFieldError(state, "description")}
              id="description-description"
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">
          Time and access
        </legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Times are interpreted in the selected timezone. Phase 4 stores only a
          broad venue or access label—not a precise address or private meeting
          link.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            error={firstFieldError(state, "startsAtLocal")}
            label="Starts"
            name="startsAtLocal"
            required
            type="datetime-local"
          />
          <TextField
            error={firstFieldError(state, "endsAtLocal")}
            label="Ends"
            name="endsAtLocal"
            required
            type="datetime-local"
          />
          <SelectField
            defaultValue={
              sessionTimezones.includes(
                defaultTimezone as (typeof sessionTimezones)[number],
              )
                ? defaultTimezone
                : "UTC"
            }
            error={firstFieldError(state, "timezone")}
            label="Timezone"
            name="timezone"
          >
            {sessionTimezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone.replaceAll("_", " ")}
              </option>
            ))}
          </SelectField>
          <SelectField
            error={firstFieldError(state, "format")}
            label="Format"
            name="format"
          >
            <option value="">Choose a format</option>
            <option value="in_person">In person</option>
            <option value="online">Online</option>
            <option value="either">Hybrid</option>
          </SelectField>
          <TextField
            error={firstFieldError(state, "capacity")}
            label="Capacity"
            max={100}
            min={1}
            name="capacity"
            required
            type="number"
          />
          <TextField
            error={firstFieldError(state, "locationLabel")}
            hint="Optional. Examples: Downtown studio; Online—details from host."
            label="Venue or access label"
            maxLength={120}
            name="locationLabel"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">Pulse fit</legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          These bounded signals support transparent recommendations. They do not
          describe participant health or diagnose anyone.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            error={firstFieldError(state, "modeId")}
            label="Primary mode"
            name="modeId"
          >
            <option value="">Choose a mode</option>
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            defaultValue="1"
            error={firstFieldError(state, "minimumEnergy")}
            label="Minimum energy"
            name="minimumEnergy"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>
          <SelectField
            defaultValue="5"
            error={firstFieldError(state, "maximumEnergy")}
            label="Maximum energy"
            name="maximumEnergy"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>
          <SelectField
            error={firstFieldError(state, "stimulationLevel")}
            label="Stimulation"
            name="stimulationLevel"
          >
            <option value="">Choose a level</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </SelectField>
          <SelectField
            error={firstFieldError(state, "socialIntensity")}
            label="Social pace"
            name="socialIntensity"
          >
            <option value="">Choose a pace</option>
            <option value="solo">Solo-friendly</option>
            <option value="light">Light interaction</option>
            <option value="social">Social</option>
          </SelectField>
        </div>
      </fieldset>

      <fieldset aria-describedby="interestIds-description">
        <legend className="text-xl font-bold text-white">Interests</legend>
        <p
          className={cn(
            "mt-2 text-sm leading-6 text-neutral-400",
            firstFieldError(state, "interestIds") && "text-red-300",
          )}
          id="interestIds-description"
        >
          {firstFieldError(state, "interestIds") ??
            "Optional. Choose up to eight active interests."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => (
            <label
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 hover:border-neutral-500 has-checked:border-red-600 has-checked:bg-red-950/30"
              key={interest.id}
            >
              <input
                className="size-5 accent-red-600"
                name="interestIds"
                type="checkbox"
                value={interest.id}
              />
              {interest.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-sm leading-6 text-neutral-400">
        Creating this record does not publish it. Review the draft on the next
        screen, then publish only when the details and capacity are ready.
      </div>

      <SubmitButton pendingLabel="Creating draft…">
        Create draft Session
      </SubmitButton>
    </form>
  );
}
