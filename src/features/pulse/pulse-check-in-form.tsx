"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Interest, Mode } from "@/types/database";
import { recordPulseCheckInAction } from "./actions";

type Choice = { value: string; label: string; description?: string };

function ChoiceField({
  legend,
  hint,
  name,
  choices,
  error,
  columns = "sm:grid-cols-3",
}: {
  legend: string;
  hint: string;
  name: string;
  choices: Choice[];
  error?: string;
  columns?: string;
}) {
  const descriptionId = `${name}-description`;
  return (
    <fieldset aria-describedby={descriptionId} aria-invalid={Boolean(error)}>
      <legend className="text-lg font-bold text-white">{legend}</legend>
      <p
        className={cn(
          "mt-1 text-sm leading-6 text-neutral-400",
          error && "text-red-300",
        )}
        id={descriptionId}
      >
        {error ?? hint}
      </p>
      <div className={cn("mt-4 grid gap-3", columns)}>
        {choices.map((choice) => (
          <label
            className="flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 transition-colors hover:border-neutral-500 has-checked:border-red-600 has-checked:bg-red-950/30"
            key={choice.value}
          >
            <input
              className="mt-0.5 size-5 shrink-0 accent-red-600"
              name={name}
              required
              type="radio"
              value={choice.value}
            />
            <span>
              <span className="block font-bold text-white">{choice.label}</span>
              {choice.description ? (
                <span className="mt-1 block leading-5 text-neutral-500">
                  {choice.description}
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PulseCheckInForm({
  modes,
  interests,
}: {
  modes: Array<Pick<Mode, "id" | "name" | "description">>;
  interests: Array<Pick<Interest, "id" | "name">>;
}) {
  const [state, action] = useActionState(
    recordPulseCheckInAction,
    initialActionState,
  );
  const travelError = firstFieldError(state, "maximumTravelMiles");
  const interestError = firstFieldError(state, "interestIds");

  return (
    <form action={action} aria-label="Check your Pulse" className="space-y-9">
      <ActionStatus state={state} />

      <ChoiceField
        choices={modes.map((mode) => ({
          value: mode.id,
          label: mode.name,
          description: mode.description,
        }))}
        columns="sm:grid-cols-2 lg:grid-cols-3"
        error={firstFieldError(state, "modeId")}
        hint="Choose the direction that feels useful—not the mood you think you should have."
        legend="What mode fits right now?"
        name="modeId"
      />

      <ChoiceField
        choices={[
          { value: "1", label: "1", description: "Very limited" },
          { value: "2", label: "2", description: "Low" },
          { value: "3", label: "3", description: "Steady" },
          { value: "4", label: "4", description: "Ready" },
          { value: "5", label: "5", description: "Full" },
        ]}
        columns="grid-cols-2 sm:grid-cols-5"
        error={firstFieldError(state, "energyLevel")}
        hint="A simple capacity signal from 1 to 5. This is not a health assessment."
        legend="How much energy is available?"
        name="energyLevel"
      />

      <ChoiceField
        choices={[
          { value: "low", label: "Low", description: "Calm and contained" },
          {
            value: "moderate",
            label: "Moderate",
            description: "Some movement and variety",
          },
          { value: "high", label: "High", description: "Lively and immersive" },
        ]}
        error={firstFieldError(state, "stimulationLevel")}
        hint="Choose the sensory pace that feels manageable."
        legend="Preferred stimulation"
        name="stimulationLevel"
      />

      <ChoiceField
        choices={[
          { value: "solo", label: "Solo", description: "Independent is best" },
          {
            value: "light",
            label: "Light",
            description: "A little connection",
          },
          { value: "social", label: "Social", description: "Ready to engage" },
        ]}
        error={firstFieldError(state, "socialIntensity")}
        hint="Set the amount of interaction you want—not a permanent preference."
        legend="Social intensity"
        name="socialIntensity"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ChoiceField
          choices={[
            { value: "in_person", label: "In person" },
            { value: "online", label: "Online" },
            { value: "either", label: "Either works" },
          ]}
          columns="grid-cols-1"
          error={firstFieldError(state, "preferredFormat")}
          hint="Choose where participation feels possible today."
          legend="Format"
          name="preferredFormat"
        />

        <ChoiceField
          choices={[
            { value: "30", label: "30 minutes" },
            { value: "60", label: "1 hour" },
            { value: "120", label: "2 hours" },
            { value: "240", label: "Up to 4 hours" },
          ]}
          columns="grid-cols-2"
          error={firstFieldError(state, "availableMinutes")}
          hint="Recommendations will respect this time window."
          legend="Time available"
          name="availableMinutes"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-lg font-bold text-white"
          htmlFor="maximumTravelMiles"
        >
          Optional travel range
        </label>
        <p
          className={cn(
            "mb-4 text-sm leading-6 text-neutral-400",
            travelError && "text-red-300",
          )}
          id="maximumTravelMiles-description"
        >
          {travelError ??
            "Choose a broad limit. FIFTHS does not ask for your precise location."}
        </p>
        <select
          aria-describedby="maximumTravelMiles-description"
          aria-invalid={Boolean(travelError)}
          className="min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white hover:border-neutral-500 focus:border-red-500 focus:outline-none"
          defaultValue=""
          id="maximumTravelMiles"
          name="maximumTravelMiles"
        >
          <option value="">No distance preference</option>
          <option value="5">Up to 5 miles</option>
          <option value="15">Up to 15 miles</option>
          <option value="30">Up to 30 miles</option>
          <option value="50">Up to 50 miles</option>
        </select>
      </div>

      <fieldset
        aria-describedby="interestIds-description"
        aria-invalid={Boolean(interestError)}
      >
        <legend className="text-lg font-bold text-white">
          What sounds interesting today?
        </legend>
        <p
          className={cn(
            "mt-1 text-sm leading-6 text-neutral-400",
            interestError && "text-red-300",
          )}
          id="interestIds-description"
        >
          {interestError ??
            "Optional. Choose up to five; your broader profile interests stay unchanged."}
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

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
        <p className="text-sm leading-6 text-neutral-400">
          Your check-in is private, expires for matching after 24 hours, and
          stays in your private history. FIFTHS does not use Pulse to diagnose
          or assess health conditions.
        </p>
      </div>

      <SubmitButton pendingLabel="Saving your Pulse…">
        Save this Pulse
      </SubmitButton>
    </form>
  );
}
