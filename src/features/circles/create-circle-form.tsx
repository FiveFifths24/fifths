"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Interest, Mode } from "@/types/database";
import { createCircleAction } from "./actions";

const controlClassName =
  "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white hover:border-neutral-500 focus:border-rose-400 focus:outline-none";

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
        className={cn(controlClassName, error && "border-red-500")}
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

function TextAreaField({
  label,
  name,
  error,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  placeholder: string;
}) {
  const descriptionId = error || hint ? `${name}-description` : undefined;
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
        className={cn(controlClassName, "min-h-36", error && "border-red-500")}
        id={name}
        maxLength={4000}
        name={name}
        placeholder={placeholder}
        required
      />
      <FieldMessage error={error} hint={hint} id={descriptionId} />
    </div>
  );
}

export function CreateCircleForm({
  modes,
  interests,
}: {
  modes: Array<Pick<Mode, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
}) {
  const [state, action] = useActionState(
    createCircleAction,
    initialActionState,
  );

  return (
    <form action={action} aria-label="Create a Circle" className="space-y-9">
      <ActionStatus state={state} />

      <fieldset>
        <legend className="text-xl font-bold text-white">
          Community identity
        </legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          The Circle stays a private draft until its purpose, expectations, and
          membership boundary are ready.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            error={firstFieldError(state, "name")}
            label="Circle name"
            maxLength={80}
            name="name"
            placeholder="North Jersey Creator Circle"
            required
          />
          <TextField
            error={firstFieldError(state, "slug")}
            hint="Lowercase letters, numbers, and hyphens. This must be unique."
            label="URL name"
            maxLength={60}
            name="slug"
            placeholder="north-jersey-creators"
            required
          />
        </div>
        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "summary")}
            hint="10–240 characters. This appears on discovery cards."
            label="Short summary"
            name="summary"
            placeholder="Explain the shared purpose and who will feel welcome."
          />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            error={firstFieldError(state, "description")}
            label="Full description"
            name="description"
            placeholder="Describe the community, its rhythm, and how members participate."
          />
          <TextAreaField
            error={firstFieldError(state, "rules")}
            hint="Members review these expectations before joining."
            label="Community rules"
            name="rules"
            placeholder="State clear participation, respect, privacy, and safety expectations."
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">
          Access boundary
        </legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Public Circles appear in discovery. Private Circles are visible only
          to invited or active members and must remain invite only.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            defaultValue="public"
            error={firstFieldError(state, "visibility")}
            label="Visibility"
            name="visibility"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </SelectField>
          <SelectField
            defaultValue="request"
            error={firstFieldError(state, "joinPolicy")}
            label="Membership"
            name="joinPolicy"
          >
            <option value="open">Open membership</option>
            <option value="request">Request and review</option>
            <option value="invite_only">Invite only</option>
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
            error={firstFieldError(state, "locationLabel")}
            hint="Optional broad area or access label—never a precise address or private link."
            label="Area or access label"
            maxLength={120}
            name="locationLabel"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">Pulse fit</legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Bounded matching signals help members understand why a Circle may fit
          today. They do not profile health.
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
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 hover:border-neutral-500 has-checked:border-rose-600 has-checked:bg-rose-950/30"
              key={interest.id}
            >
              <input
                className="size-5 accent-rose-600"
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
        Creating a Circle does not publish it or issue Passport activity. Review
        the draft and its membership policy before publishing.
      </div>

      <SubmitButton pendingLabel="Creating draft…">
        Create draft Circle
      </SubmitButton>
    </form>
  );
}
