"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import type { Interest, Skill } from "@/types/database";
import { completeOnboardingAction } from "./actions";

function ChoiceGrid({
  legend,
  hint,
  name,
  choices,
}: {
  legend: string;
  hint: string;
  name: "interestIds" | "skillIds";
  choices: Array<Pick<Interest | Skill, "id" | "name">>;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-bold text-white">{legend}</legend>
      <p className="mt-1 text-sm leading-6 text-neutral-400">{hint}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {choices.map((choice) => (
          <label
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 has-checked:border-red-600 has-checked:bg-red-950/30"
            key={choice.id}
          >
            <input
              className="size-5 accent-red-600"
              name={name}
              type="checkbox"
              value={choice.id}
            />
            {choice.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function OnboardingForm({
  interests,
  skills,
}: {
  interests: Array<Pick<Interest, "id" | "name">>;
  skills: Array<Pick<Skill, "id" | "name">>;
}) {
  const [state, action] = useActionState(
    completeOnboardingAction,
    initialActionState,
  );
  const ageError = firstFieldError(state, "ageConfirmation");
  return (
    <form
      action={action}
      aria-label="Complete your FIFTHS profile"
      className="space-y-8"
    >
      <ActionStatus state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          autoComplete="nickname"
          error={firstFieldError(state, "displayName")}
          label="Display name"
          name="displayName"
          placeholder="How people will know you"
          required
        />
        <TextField
          autoCapitalize="none"
          autoComplete="username"
          error={firstFieldError(state, "username")}
          hint="Lowercase letters, numbers, and underscores."
          label="Username"
          name="username"
          placeholder="your_name"
          required
        />
        <TextField
          error={firstFieldError(state, "pronouns")}
          hint="Optional. You control what you share."
          label="Pronouns"
          name="pronouns"
          placeholder="Optional"
        />
        <div>
          <label
            className="mb-2 block text-sm font-bold text-neutral-100"
            htmlFor="timezone"
          >
            Time zone
          </label>
          <select
            className="min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white hover:border-neutral-500 focus:border-red-500 focus:outline-none"
            defaultValue="America/New_York"
            id="timezone"
            name="timezone"
            required
          >
            <option value="America/New_York">Eastern time</option>
            <option value="America/Chicago">Central time</option>
            <option value="America/Denver">Mountain time</option>
            <option value="America/Phoenix">Arizona time</option>
            <option value="America/Los_Angeles">Pacific time</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      <ChoiceGrid
        choices={interests}
        hint="Choose up to 12. These prepare future recommendations; Phase 3 will activate Pulse matching."
        legend="What draws you in?"
        name="interestIds"
      />
      <ChoiceGrid
        choices={skills}
        hint="Choose up to 12 skills you practice or want to contribute."
        legend="What do you bring?"
        name="skillIds"
      />

      <div>
        <label className="flex items-start gap-3 rounded-xl border border-neutral-700 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300">
          <input
            aria-describedby={ageError ? "age-confirmation-error" : undefined}
            aria-invalid={ageError ? true : undefined}
            className="mt-1 size-5 shrink-0 accent-red-600"
            name="ageConfirmation"
            required
            type="checkbox"
          />
          <span>
            I confirm again that I am 18 or older and eligible for the initial
            FIFTHS beta.
          </span>
        </label>
        {ageError ? (
          <p className="mt-2 text-xs text-red-300" id="age-confirmation-error">
            {ageError}
          </p>
        ) : null}
      </div>
      <SubmitButton pendingLabel="Saving your foundation…">
        Complete onboarding
      </SubmitButton>
    </form>
  );
}
