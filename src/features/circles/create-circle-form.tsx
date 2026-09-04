"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/forms/action-status";
import {
  DraftRestoredNotice,
  useFormDraft,
} from "@/components/forms/form-draft";
import {
  circleDraftFields,
  formDraftStorageKey,
} from "@/components/forms/form-draft-config";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Interest, Mode } from "@/types/database";

import { createCircleAction } from "./actions";

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

export function CreateCircleForm({
  modes,
  interests,
  draftOwnerId,
}: {
  modes: Array<Pick<Mode, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  draftOwnerId: string;
}) {
  const [state, action] = useActionState(
    createCircleAction,
    initialActionState,
  );
  const { formRef, restored } = useFormDraft({
    storageKey: formDraftStorageKey("circle-create", draftOwnerId),
    fields: circleDraftFields,
    actionState: state,
  });

  function previousValue(name: string) {
    const value = state.values?.[name];

    return typeof value === "string" ? value : undefined;
  }

  const topicError = firstFieldError(state, "interestIds");
  return (
    <form
      action={action}
      aria-label="Create a Circle"
      className="space-y-10"
      ref={formRef}
    >
      <ActionStatus state={state} />
      <DraftRestoredNotice restored={restored} />

      {/* =====================================================
          COMMUNITY IDENTITY
      ====================================================== */}
      <fieldset className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-black/20 p-5 sm:p-6">
        <legend className="px-2 text-xl font-bold text-white">
          Community Identity
        </legend>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/55">
          Every Circle centers on one clear topic. Give the community a distinct
          name, purpose, and set of expectations around that topic.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextField
            defaultValue={previousValue("name")}
            error={firstFieldError(state, "name")}
            label="Circle Name"
            maxLength={40}
            name="name"
            placeholder="North Jersey Horror Fans"
            required
          />

          <TextField
            defaultValue={previousValue("slug")}
            error={firstFieldError(state, "slug")}
            hint="Lowercase letters, numbers, and hyphens. This must be unique."
            label="URL Name"
            maxLength={60}
            name="slug"
            placeholder="north-jersey-horror-fans"
            required
          />
        </div>

        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "summary")}
            hint="10–240 characters. This appears on discovery cards."
            label="Short Summary"
            name="summary"
            placeholder="Describe what this Circle is about and who will feel at home here."
            defaultValue={previousValue("summary")}
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            error={firstFieldError(state, "description")}
            label="Full Description"
            name="description"
            placeholder="Explain what members gather around, what people can talk about,
             and what makes this Circle distinct."
            defaultValue={previousValue("description")}
          />

          <TextAreaField
            error={firstFieldError(state, "rules")}
            hint="Members review these expectations before joining."
            label="Community Rules"
            name="rules"
            placeholder="Set expectations for participation, respect, privacy, safety, and staying on topic."
            defaultValue={previousValue("rules")}
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
          {topicError ??
            "Choose the one topic this Circle is centered around. A focused topic makes Circles easier to search, understand, and discover."}
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
            defaultValue={previousValue("interestIds") ?? ""}
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
          Choose one clear topic so people can easily understand and discover
          this Circle.
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
          Decide who can discover the Circle, how new members enter, and where
          the community primarily gathers.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            defaultValue={previousValue("visibility") ?? "public"}
            error={firstFieldError(state, "visibility")}
            label="Visibility"
            name="visibility"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </SelectField>

          <SelectField
            defaultValue={previousValue("joinPolicy") ?? "request"}
            error={firstFieldError(state, "joinPolicy")}
            label="Membership"
            name="joinPolicy"
          >
            <option value="open">Open Membership</option>
            <option value="request">Request and Review</option>
            <option value="invite_only">Invite Only</option>
          </SelectField>

          <SelectField
            defaultValue={previousValue("format") ?? ""}
            error={firstFieldError(state, "format")}
            label="Format"
            name="format"
          >
            <option value="">Choose A Format</option>
            <option value="in_person">In Person</option>
            <option value="online">Online</option>
            <option value="either">Hybrid</option>
          </SelectField>

          <TextField
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
          These signals describe the typical rhythm of participating in this
          Circle. They help SIGNAL surface communities that fit someone&apos;s
          current capacity without changing what the Circle is about.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            defaultValue={previousValue("joinPolicy") ?? "request"}
            error={firstFieldError(state, "modeId")}
            label="Primary mode"
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
            defaultValue={previousValue("minimumEnergy") ?? "1"}
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
            defaultValue={previousValue("maximumEnergy") ?? "5"}
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
            defaultValue={previousValue("stimulationLevel") ?? ""}
            error={firstFieldError(state, "stimulationLevel")}
            label="Stimulation"
            name="stimulationLevel"
          >
            <option value="">Choose A Level</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </SelectField>
        </div>

        <div className="mt-5"></div>
        <SelectField
          defaultValue={previousValue("socialIntensity") ?? ""}
          error={firstFieldError(state, "socialIntensity")}
          label="Participation Style"
          name="socialIntensity"
        >
          <option value="">Choose A Participation Style</option>
          <option value="solo">Browse</option>
          <option value="light">Conversational</option>
          <option value="social">Active Discussions</option>
        </SelectField>
      </fieldset>

      {/* =====================================================
          CREATION NOTE
      ====================================================== */}
      <div className="rounded-[1.5rem] border border-[#ee54a7]/15 bg-[#ee54a7]/[0.035] p-5 text-sm leading-7 text-white/55">
        Creating a Circle starts a community draft. Review its topic,
        description, rules, membership settings, and participation signals
        before publishing it for discovery.
      </div>

      <SubmitButton
        className="shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
        pendingLabel="Creating Circle…"
      >
        Create Circle
      </SubmitButton>
    </form>
  );
}
