"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Circle, Interest, Mode } from "@/types/database";
import { createCampaignAction } from "./actions";
import { campaignTimezones } from "./schemas";

const control =
  "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white hover:border-neutral-500 focus:border-indigo-400 focus:outline-none";

function SelectField({
  label,
  name,
  defaultValue,
  error,
  required = true,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-neutral-100"
        htmlFor={name}
      >
        {label}
      </label>
      <select
        aria-invalid={error ? true : undefined}
        className={cn(control, error && "border-red-500")}
        defaultValue={defaultValue}
        id={name}
        name={name}
        required={required}
      >
        {children}
      </select>
      {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  hint,
  error,
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  maxLength: number;
  placeholder: string;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-neutral-100"
        htmlFor={name}
      >
        {label}
      </label>
      <textarea
        aria-describedby={`${name}-description`}
        aria-invalid={error ? true : undefined}
        className={cn(control, "min-h-32", error && "border-red-500")}
        id={name}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required
      />
      <p
        className={cn(
          "mt-2 text-xs leading-5 text-neutral-500",
          error && "text-red-300",
        )}
        id={`${name}-description`}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

export function CreateCampaignForm({
  circles,
  interests,
  modes,
}: {
  circles: Array<Pick<Circle, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  modes: Array<Pick<Mode, "id" | "name">>;
}) {
  const [state, action] = useActionState(
    createCampaignAction,
    initialActionState,
  );
  return (
    <form
      action={action}
      aria-label="Create a Fifth Realm campaign"
      className="space-y-9"
    >
      <ActionStatus state={state} />
      <fieldset>
        <legend className="text-xl font-bold text-white">
          Campaign profile
        </legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Describe an original, system-neutral experience. Do not copy
          rulebooks, settings, characters, or proprietary game text.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <TextField
            error={firstFieldError(state, "title")}
            label="Campaign title"
            maxLength={120}
            name="title"
            placeholder="The Lantern Archive"
            required
          />
          <TextField
            error={firstFieldError(state, "genre")}
            label="Genre"
            maxLength={80}
            name="genre"
            placeholder="Collaborative mystery"
            required
          />
        </div>
        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "summary")}
            hint="10–280 characters for discovery cards."
            label="Short summary"
            maxLength={280}
            name="summary"
            placeholder="A concise invitation into the campaign."
          />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            error={firstFieldError(state, "premise")}
            hint="Use only original, system-neutral story context."
            label="Original premise"
            maxLength={5000}
            name="premise"
            placeholder="Describe the world, player role, and shared objective."
          />
          <TextAreaField
            error={firstFieldError(state, "safetyExpectations")}
            hint="Explain boundaries, check-ins, consent tools, and conduct expectations without collecting diagnoses."
            label="Safety expectations"
            maxLength={2000}
            name="safetyExpectations"
            placeholder="State how boundaries and participant wellbeing will be respected."
          />
        </div>
        <div className="mt-5">
          <TextField
            error={firstFieldError(state, "tone")}
            hint="For example: hopeful, curious, low-conflict."
            label="Tone"
            maxLength={160}
            name="tone"
            required
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">
          Access and cadence
        </legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Use broad access labels. Private links and precise addresses are not
          stored in Phase 7.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            error={firstFieldError(state, "circleId")}
            label="Circle association"
            name="circleId"
            required={false}
          >
            <option value="">Independent campaign</option>
            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name}
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
            error={firstFieldError(state, "locationLabel")}
            hint="Optional broad area or access label."
            label="Area or access label"
            maxLength={120}
            name="locationLabel"
          />
          <TextField
            error={firstFieldError(state, "applicationDeadlineLocal")}
            label="Application deadline"
            name="applicationDeadlineLocal"
            required
            type="datetime-local"
          />
          <SelectField
            defaultValue="America/New_York"
            error={firstFieldError(state, "timezone")}
            label="Campaign timezone"
            name="timezone"
          >
            {campaignTimezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone.replaceAll("_", " ")}
              </option>
            ))}
          </SelectField>
          <TextField
            error={firstFieldError(state, "estimatedSessionMinutes")}
            hint="30–480 minutes for matching."
            label="Typical session minutes"
            max={480}
            min={30}
            name="estimatedSessionMinutes"
            required
            type="number"
          />
          <TextField
            error={firstFieldError(state, "playerCapacity")}
            label="Player seats"
            max={12}
            min={1}
            name="playerCapacity"
            required
            type="number"
          />
          <SelectField
            defaultValue="new"
            error={firstFieldError(state, "experienceLevel")}
            label="Experience welcome"
            name="experienceLevel"
          >
            <option value="new">New participants welcome</option>
            <option value="comfortable">Some familiarity</option>
            <option value="experienced">Experienced participants</option>
          </SelectField>
        </div>
        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "scheduleSummary")}
            hint="Broad cadence only; shared Sessions hold individual meetings."
            label="Schedule summary"
            maxLength={500}
            name="scheduleSummary"
            placeholder="For example: two Saturday afternoons each month for eight weeks."
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">Pulse fit</legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          These bounded signals explain recommendations. They are not medical
          classifications.
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
          <TextField
            error={firstFieldError(state, "minimumEnergy")}
            label="Minimum energy"
            max={5}
            min={1}
            name="minimumEnergy"
            required
            type="number"
          />
          <TextField
            error={firstFieldError(state, "maximumEnergy")}
            label="Maximum energy"
            max={5}
            min={1}
            name="maximumEnergy"
            required
            type="number"
          />
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
            <option value="solo">Independent</option>
            <option value="light">Light collaboration</option>
            <option value="social">Social</option>
          </SelectField>
        </div>
        <fieldset className="mt-7" aria-describedby="interestIds-description">
          <legend className="text-base font-bold text-white">
            Campaign interests
          </legend>
          <p
            className={cn(
              "mt-2 text-sm text-neutral-400",
              firstFieldError(state, "interestIds") && "text-red-300",
            )}
            id="interestIds-description"
          >
            {firstFieldError(state, "interestIds") ??
              "Choose one to eight original, broad interests."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest) => (
              <label
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 has-checked:border-indigo-600 has-checked:bg-indigo-950/30"
                key={interest.id}
              >
                <input
                  className="size-5 accent-indigo-500"
                  name="interestIds"
                  type="checkbox"
                  value={interest.id}
                />
                {interest.name}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <SubmitButton pendingLabel="Creating private draft…">
        Create draft campaign
      </SubmitButton>
      <p className="text-xs leading-5 text-neutral-500">
        Creating a campaign does not publish it. Review its safety and access
        boundaries in the GM workspace first.
      </p>
    </form>
  );
}
