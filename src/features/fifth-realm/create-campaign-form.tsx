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
  "min-h-12 w-full rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-base text-white transition placeholder:text-white/25 hover:border-[#22d3ee]/35 focus:border-[#22d3ee] focus:outline-none";

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
        className="mb-2 block text-sm font-bold text-white/85"
        htmlFor={name}
      >
        {label}
      </label>

      <select
        aria-invalid={error ? true : undefined}
        className={cn(
          control,
          "appearance-none",
          error && "border-red-500",
        )}
        defaultValue={defaultValue}
        id={name}
        name={name}
        required={required}
      >
        {children}
      </select>

      {error ? (
        <p className="mt-2 text-xs text-red-300">{error}</p>
      ) : null}
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
  defaultValue,
  minHeight = "min-h-32",
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  maxLength: number;
  placeholder: string;
  minHeight?: string;
}) {
  return (
    <div>
      <label
        className="mb-2 block text-sm font-bold text-white/85"
        htmlFor={name}
      >
        {label}
      </label>

      <textarea
        aria-describedby={`${name}-description`}
        aria-invalid={error ? true : undefined}
        className={cn(
          control,
          minHeight,
          "resize-y",
          error && "border-red-500",
        )}
        defaultValue={defaultValue}
        id={name}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required
      />

      <p
        className={cn(
          "mt-2 text-xs leading-5 text-white/35",
          error && "text-red-300",
        )}
        id={`${name}-description`}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

function SectionIntro({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#22d3ee]/70">
        {step}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
        {description}
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
  const value = (name: string, fallback = "") => {
  const stored = state.values?.[name];

  return typeof stored === "string" ? stored : fallback;
};

const selectedInterests = new Set(
  Array.isArray(state.values?.interestIds)
    ? state.values.interestIds
    : [],
);

  return (
    <form
      action={action}
      aria-label="Create a Fifth Realm campaign"
      className="space-y-8"
    >
      <ActionStatus state={state} />

      {/* =====================================================
          STEP 1 — THE CAMPAIGN
      ====================================================== */}
      <fieldset className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 sm:p-7">
        <legend className="sr-only">The Campaign</legend>

        <SectionIntro
          description="Give people a clear sense of the world, premise, and kind of experience you are inviting them into."
          step="Step 01"
          title="The Campaign"
        />

        <div className="grid gap-5 sm:grid-cols-2">
<TextField
  defaultValue={value("title")}
  error={firstFieldError(state, "title")}
  label="Campaign title"
  maxLength={120}
  name="title"
  placeholder="The Lantern Archive"
  required
/>

<SelectField
defaultValue={value("genre")}
  error={firstFieldError(state, "genre")}
  label="Genre"
  name="genre"
>
  <option value="">Choose A Genre</option>
  <option value="fantasy">Fantasy</option>
  <option value="science_fiction">Science Fiction</option>
  <option value="horror">Horror</option>
  <option value="mystery">Mystery</option>
  <option value="adventure">Adventure</option>
  <option value="superhero">Superhero</option>
  <option value="anime_inspired">Anime-Inspired</option>
  <option value="post_apocalyptic">Post-Apocalyptic</option>
  <option value="cyberpunk">Cyberpunk</option>
  <option value="steampunk">Steampunk</option>
  <option value="urban_fantasy">Urban Fantasy</option>
  <option value="dark_fantasy">Dark Fantasy</option>
  <option value="historical">Historical</option>
  <option value="comedy">Comedy</option>
  <option value="romance">Romance</option>
  <option value="thriller">Thriller</option>
  <option value="slice_of_life">Slice of Life</option>
  <option value="space_opera">Space Opera</option>
  <option value="western">Western</option>
  <option value="other">Other</option>
</SelectField>
        </div>

        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "summary")}
            defaultValue={value("summary")}
            hint="10–280 characters. This appears on campaign discovery cards."
            label="Short Summary"
            maxLength={280}
            minHeight="min-h-28"
            name="summary"
            placeholder="Give people the quickest possible reason to want to know more."
          />
        </div>

        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "premise")}
            defaultValue={value("premise")}
            hint="Describe the world, player role, and shared objective using original, system-neutral language."
            label="Campaign Premise"
            maxLength={5000}
            minHeight="min-h-44"
            name="premise"
            placeholder="What world are participants entering, who are they within it, and what brings them together?"
          />
        </div>

        <div className="mt-5">
          <TextField
          defaultValue={value("genre")}
            error={firstFieldError(state, "tone")}
            hint="For example: hopeful, eerie, comedic, low-conflict, intense."
            label="Tone"
            maxLength={160}
            name="tone"
            placeholder="Hopeful, mysterious, collaborative"
            required
          />
        </div>
      </fieldset>

      {/* =====================================================
          STEP 2 — HOW IT WORKS
      ====================================================== */}
      <fieldset className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 sm:p-7">
        <legend className="sr-only">How It Works</legend>

        <SectionIntro
          description="Set the practical expectations so participants know how, when, and where the campaign will happen."
          step="Step 02"
          title="How It Works"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
          defaultValue={value("format")}
            error={firstFieldError(state, "format")}
            label="Format"
            name="format"
          >
            <option value="">Choose A Format</option>
            <option value="in_person">In-Person</option>
            <option value="online">Online</option>
            <option value="either">Hybrid</option>
          </SelectField>

          <TextField
          defaultValue={value("estimatedSessionMinutes")}
            error={firstFieldError(state, "estimatedSessionMinutes")}
            hint="30–480 minutes."
            label="Typical Session Length"
            max={480}
            min={30}
            name="estimatedSessionMinutes"
            required
            type="number"
          />

          <TextField
          defaultValue={value("playerCapacity")}
            error={firstFieldError(state, "playerCapacity")}
            hint="Maximum Players."
            label="Player seats"
            max={12}
            min={1}
            name="playerCapacity"
            required
            type="number"
          />

          <SelectField
          defaultValue={value("experienceLevel", "new")}
            defaultValue="new"
            error={firstFieldError(state, "experienceLevel")}
            label="Player Experience"
            name="experienceLevel"
          >
            <option value="new">Entry Level</option>
            <option value="comfortable">Some Familiarity</option>
            <option value="experienced">Experienced Players</option>
            <option value="experienced">Open To All</option>
          </SelectField>

          <TextField
          defaultValue={value("applicationDeadlineLocal")}
            error={firstFieldError(state, "applicationDeadlineLocal")}
            label="Application Deadline"
            name="applicationDeadlineLocal"
            required
            type="datetime-local"
          />

          <SelectField
          defaultValue={value("timezone", "America/New_York")}
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
        </div>

        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "scheduleSummary")}
            defaultValue={value("scheduleSummary")}
            hint="Let participants know if this is recurring, and for how long."
            label="Schedule"
            maxLength={500}
            minHeight="min-h-28"
            name="scheduleSummary"
            placeholder="For example: two Saturday afternoons each month for eight weeks."
          />
        </div>
      </fieldset>

      {/* =====================================================
          STEP 3 — WHAT PLAYERS SHOULD KNOW
      ====================================================== */}
      <fieldset className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 sm:p-7">
        <legend className="sr-only">What People Should Know</legend>

        <SectionIntro
          description="Set clear expectations around safety, access, and the community context surrounding the campaign."
          step="Step 03"
          title="What Participants Should Know"
        />

        <div>
          <TextAreaField
            error={firstFieldError(state, "safetyExpectations")}
            defaultValue={value("safetyExpectations")}
            hint="Explain boundaries, consent tools, check-ins, conduct expectations, and how participant wellbeing will be respected."
            label="Expectations"
            maxLength={2000}
            minHeight="min-h-40"
            name="safetyExpectations"
            placeholder="Explain how boundaries, consent, and participant wellbeing will be handled."
          />
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <SelectField
            error={firstFieldError(state, "circleId")}
            label="Circle Association"
            name="circleId"
            required={false}
          >
            <option value="">Independent Campaign</option>

            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name}
              </option>
            ))}
          </SelectField>

          <TextField
          defaultValue={value("locationLabel")}
            error={firstFieldError(state, "locationLabel")}
            hint="Example: Meet at insert-name-here cafe downtown."
            label="Area or Access Label"
            maxLength={120}
            name="locationLabel"
            placeholder=""
          />
        </div>
      </fieldset>

      {/* =====================================================
          STEP 4 — WHO IT FITS
      ====================================================== */}
      <fieldset className="rounded-[1.75rem] border border-[#22d3ee]/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.035),rgba(0,0,0,0.2))] p-5 sm:p-7">
        <legend className="sr-only">Who It Fits</legend>

        <SectionIntro
          description="These signals help match the campaign with people whose current capacity and preferences are a better fit."
          step="Step 04"
          title="Energy Levels This Campaign Fits"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            error={firstFieldError(state, "modeId")}
            label="Primary Mode"
            name="modeId"
          >
            <option value="">Choose A Mode</option>

            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </SelectField>

          <TextField
          defaultValue={value("minimumEnergy")}
            error={firstFieldError(state, "minimumEnergy")}
            hint="1 = very low, 5 = very high."
            label="Minimum Energy"
            max={5}
            min={1}
            name="minimumEnergy"
            required
            type="number"
          />

          <TextField
          defaultValue={value("maximumEnergy")}
            error={firstFieldError(state, "maximumEnergy")}
            hint="1 = very low, 5 = very high."
            label="Maximum Energy"
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
            <option value="">Choose A Level</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </SelectField>

          <SelectField
            error={firstFieldError(state, "socialIntensity")}
            label="Social Pace"
            name="socialIntensity"
          >
            <option value="">Choose A Pace</option>
            <option value="solo">Independent</option>
            <option value="light">Light collaboration</option>
            <option value="social">Social</option>
          </SelectField>
        </div>

        <fieldset
          aria-describedby="interestIds-description"
          className="mt-8"
        >
          <legend className="text-base font-bold text-white">
            Campaign interests
          </legend>

          <p
            className={cn(
              "mt-2 text-sm leading-6 text-white/40",
              firstFieldError(state, "interestIds") && "text-red-300",
            )}
            id="interestIds-description"
          >
            {firstFieldError(state, "interestIds") ??
              "Choose one to eight interests that best describe what this campaign is actually about."}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest) => (
              <label
                className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/70 transition hover:border-[#22d3ee]/30 hover:text-white has-checked:border-[#22d3ee]/60 has-checked:bg-[#22d3ee]/[0.08] has-checked:text-white"
                key={interest.id}
              >
<input
  className="size-5 accent-[#22d3ee]"
  defaultChecked={selectedInterests.has(interest.id)}
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

      {/* =====================================================
          SUBMIT
      ====================================================== */}
      <div className="rounded-[1.75rem] border border-[#22d3ee]/15 bg-[#22d3ee]/[0.03] p-5 sm:p-6">
<SubmitButton
  className="border border-white/10 bg-gradient-to-r from-[#0891b2] via-[#22d3ee] to-[#7c3aed] text-white shadow-lg shadow-[#0891b2]/20 hover:brightness-110 hover:shadow-[#22d3ee]/25"
  pendingLabel="Creating campaign draft…"
>
  Create Realm Campaign
</SubmitButton>

        <p className="mt-3 max-w-2xl text-xs leading-5 text-white/35">
          Your campaign starts as a private draft. You can review it before
          opening recruitment or making it visible to other members.
        </p>
      </div>
    </form>
  );
}