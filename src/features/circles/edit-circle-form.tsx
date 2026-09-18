"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/forms/action-status";
import { FormErrorFocus } from "@/components/forms/form-error-focus";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Circle, Interest, Mode } from "@/types/database";

import { updateCircleAction } from "./actions";

const controlClassName =
  "min-h-12 w-full rounded-xl border border-[#ee54a7]/20 bg-black/35 px-4 py-3 text-base text-white transition hover:border-[#ee54a7]/40 focus:border-[#ee54a7]/70 focus:outline-none focus:ring-2 focus:ring-[#ee54a7]/15";

function FieldMessage({
  error,
  hint,
  id,
}: {
  error?: string;
  hint?: string;
  id?: string;
}) {
  if (!error && !hint) {
    return null;
  }

  return (
    <p
      className={cn(
        "mt-2 text-xs leading-5 text-white/45",
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
      <label className="mb-2 block text-sm font-bold text-white" htmlFor={name}>
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
  defaultValue,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  placeholder: string;
  defaultValue?: string;
}) {
  const descriptionId = error || hint ? `${name}-description` : undefined;

  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-white" htmlFor={name}>
        {label}
      </label>

      <textarea
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlClassName,
          "min-h-36 resize-y",
          error && "border-red-500",
        )}
        defaultValue={defaultValue}
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

export function EditCircleForm({
  circle,
  modes,
  interests,
  selectedInterestId,
}: {
  circle: Circle;
  modes: Array<Pick<Mode, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  selectedInterestId: string;
}) {
  const updateAction = updateCircleAction.bind(null, circle.id);

  const [state, action] = useActionState(updateAction, initialActionState);

  function previousValue(name: string, fallback: string) {
    const value = state.values?.[name];

    return typeof value === "string" ? value : fallback;
  }

  function previousInterestId() {
    const value = state.values?.interestIds;

    if (Array.isArray(value)) {
      return value[0] ?? selectedInterestId;
    }

    if (typeof value === "string") {
      return value;
    }

    return selectedInterestId;
  }

  const topicError = firstFieldError(state, "interestIds");

  return (
    <form action={action} aria-label="Edit Circle" className="space-y-10">
      {/* =====================================================
          COMMUNITY IDENTITY
      ====================================================== */}

      <fieldset className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-black/20 p-5 sm:p-6">
        <legend className="px-2 text-xl font-bold text-white">
          Community Identity
        </legend>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/55">
          Update the Circle&apos;s identity, purpose, and community
          expectations.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextField
            defaultValue={previousValue("name", circle.name)}
            error={firstFieldError(state, "name")}
            label="Circle Name"
            maxLength={40}
            name="name"
            placeholder="North Jersey Horror Fans"
            required
          />

          <TextField
            defaultValue={previousValue("slug", circle.slug)}
            error={firstFieldError(state, "slug")}
            hint="Lowercase letters, numbers, and hyphens. This must remain unique."
            label="URL Name"
            maxLength={60}
            name="slug"
            placeholder="north-jersey-horror-fans"
            required
          />
        </div>

        <div className="mt-5">
          <TextAreaField
            defaultValue={previousValue("summary", circle.summary)}
            error={firstFieldError(state, "summary")}
            hint="10–240 characters. This appears on discovery cards."
            label="Short Summary"
            name="summary"
            placeholder="Describe what this Circle is about and who will feel at home here."
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            defaultValue={previousValue("description", circle.description)}
            error={firstFieldError(state, "description")}
            label="Full Description"
            name="description"
            placeholder="Explain what members gather around, what people can talk about, and what makes this Circle distinct."
          />

          <TextAreaField
            defaultValue={previousValue("rules", circle.rules)}
            error={firstFieldError(state, "rules")}
            hint="Members review these expectations before joining."
            label="Community Rules"
            name="rules"
            placeholder="Set expectations for participation, respect, privacy, safety, and staying on topic."
          />
        </div>
      </fieldset>

      {/* =====================================================
          SINGLE CIRCLE TOPIC
      ====================================================== */}

      <fieldset
        aria-describedby="interestIds-description"
        className="rounded-[1.5rem] border border-[#ee54a7]/20 bg-[#ee54a7]/[0.035] p-5 sm:p-6"
      >
        <legend className="px-2 text-xl font-bold text-white">
          Circle Topic
        </legend>

        <p
          className={cn(
            "mt-2 max-w-3xl text-sm leading-7 text-white/55",
            topicError && "text-red-300",
          )}
          id="interestIds-description"
        >
          {topicError ?? "Choose the one topic this Circle is centered around."}
        </p>

        <div className="mt-6 max-w-xl">
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="interestIds"
          >
            Topic
          </label>

          <select
            aria-describedby="interestIds-description"
            aria-invalid={topicError ? true : undefined}
            className={cn(controlClassName, topicError && "border-red-500")}
            defaultValue={previousInterestId()}
            id="interestIds"
            name="interestIds"
            required
          >
            <option value="">Choose One Topic</option>

            {interests.map((interest) => (
              <option key={interest.id} value={interest.id}>
                {interest.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 rounded-2xl border border-[#ee54a7]/15 bg-black/25 p-4 text-sm leading-6 text-white/50">
          Changing the topic changes how this Circle is categorized and
          discovered.
        </div>
      </fieldset>

      {/* =====================================================
          ACCESS
      ====================================================== */}

      <fieldset className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-black/20 p-5 sm:p-6">
        <legend className="px-2 text-xl font-bold text-white">
          Access and Participation
        </legend>

        <p className="mt-1 max-w-3xl text-sm leading-7 text-white/55">
          Update who can discover the Circle, how members enter, and where the
          community primarily gathers.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            defaultValue={previousValue("visibility", circle.visibility)}
            error={firstFieldError(state, "visibility")}
            label="Visibility"
            name="visibility"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </SelectField>

          <SelectField
            defaultValue={previousValue("joinPolicy", circle.join_policy)}
            error={firstFieldError(state, "joinPolicy")}
            label="Membership"
            name="joinPolicy"
          >
            <option value="open">Open Membership</option>
            <option value="request">Request and Review</option>
            <option value="invite_only">Invite Only</option>
          </SelectField>

          <SelectField
            defaultValue={previousValue("format", circle.format)}
            error={firstFieldError(state, "format")}
            label="Format"
            name="format"
          >
            <option value="in_person">In Person</option>
            <option value="online">Online</option>
            <option value="either">Hybrid</option>
          </SelectField>

          <TextField
            defaultValue={previousValue(
              "locationLabel",
              circle.location_label ?? "",
            )}
            error={firstFieldError(state, "locationLabel")}
            hint="Optional broad area or access label—never a precise address or private link."
            label="Area or Access Label"
            maxLength={120}
            name="locationLabel"
          />
        </div>
      </fieldset>

      {/* =====================================================
          PULSE FIT
      ====================================================== */}

      <fieldset className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-black/20 p-5 sm:p-6">
        <legend className="px-2 text-xl font-bold text-white">Pulse Fit</legend>

        <p className="mt-1 max-w-3xl text-sm leading-7 text-white/55">
          Update the participation signals that describe the typical rhythm of
          this Circle.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            defaultValue={previousValue("modeId", circle.mode_id)}
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

          <SelectField
            defaultValue={previousValue(
              "minimumEnergy",
              String(circle.minimum_energy),
            )}
            error={firstFieldError(state, "minimumEnergy")}
            label="Minimum Energy"
            name="minimumEnergy"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>

          <SelectField
            defaultValue={previousValue(
              "maximumEnergy",
              String(circle.maximum_energy),
            )}
            error={firstFieldError(state, "maximumEnergy")}
            label="Maximum Energy"
            name="maximumEnergy"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </SelectField>

          <SelectField
            defaultValue={previousValue(
              "stimulationLevel",
              circle.stimulation_level,
            )}
            error={firstFieldError(state, "stimulationLevel")}
            label="Stimulation"
            name="stimulationLevel"
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </SelectField>

          <SelectField
            defaultValue={previousValue(
              "socialIntensity",
              circle.social_intensity,
            )}
            error={firstFieldError(state, "socialIntensity")}
            label="Participation Style"
            name="socialIntensity"
          >
            <option value="solo">Browse</option>
            <option value="light">Conversational</option>
            <option value="social">Active Discussions</option>
          </SelectField>
        </div>
      </fieldset>

      {/* =====================================================
          SAVE
      ====================================================== */}

      <div className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-5 text-sm leading-7 text-white/55">
        Saving updates this Circle without creating a new community or changing
        its current lifecycle status.
      </div>

      <div className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-black/20 p-5">
        <FormErrorFocus state={state} />

        {state.status === "error" ? (
          <div className="mb-5">
            <ActionStatus state={state} />
          </div>
        ) : null}

        <SubmitButton
          className="shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
          pendingLabel="Saving Circle…"
        >
          Save Circle Changes
        </SubmitButton>
      </div>
    </form>
  );
}
