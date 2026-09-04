"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import {
  DraftRestoredNotice,
  useFormDraft,
} from "@/components/forms/form-draft";
import {
  formDraftStorageKey,
  sessionDraftFields,
} from "@/components/forms/form-draft-config";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Interest, Mode } from "@/types/database";
import { createSessionAction } from "./actions";
import { sessionTimezones } from "./schemas";

const selectClassName =
  "min-h-12 w-full rounded-xl border border-[#992bff]/25 bg-black/40 px-4 py-3 text-base text-white transition hover:border-[#992bff]/45 focus:border-[#992bff] focus:outline-none focus:ring-1 focus:ring-[#992bff]/30";

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
  draftOwnerId,
}: {
  modes: Array<Pick<Mode, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  defaultTimezone: string;
  draftOwnerId: string;
}) {
  const [state, action] = useActionState(
    createSessionAction,
    initialActionState,
  );
  const { formRef, restored } = useFormDraft({
    storageKey: formDraftStorageKey("session-create", draftOwnerId),
    fields: sessionDraftFields,
    actionState: state,
  });

  return (
    <form
      action={action}
      aria-label="Create a Session"
      className="space-y-9"
      ref={formRef}
    >
      <ActionStatus state={state} />
      <DraftRestoredNotice restored={restored} />

      <fieldset>
        <legend className="text-xl font-bold text-white">
          Session Details
        </legend>

        <p className="mt-2 text-sm leading-6 text-white/45">
          Give people a clear sense of what you&apos;re inviting them into.
        </p>

        <div className="mt-5 space-y-5">
          <TextField
            error={firstFieldError(state, "title")}
            label="Session Title"
            maxLength={40}
            name="title"
            placeholder="Community design studio"
            required
          />

          <div>
            <label
              className="mb-2 block text-sm font-bold text-neutral-100"
              htmlFor="description"
            >
              Description
            </label>

            <textarea
              aria-describedby="description-description"
              aria-invalid={
                firstFieldError(state, "description") ? true : undefined
              }
              className="min-h-40 w-full rounded-xl border border-[#992bff]/25 bg-black/40 px-4 py-3 text-base text-white transition placeholder:text-white/25 hover:border-[#992bff]/45 focus:border-[#992bff] focus:ring-1 focus:ring-[#992bff]/30 focus:outline-none"
              id="description"
              maxLength={4000}
              name="description"
              placeholder="What are you doing together? What should people expect, and is there anything they should bring or know before joining?"
              required
            />

            <FieldMessage
              error={firstFieldError(state, "description")}
              hint="This description also creates the short preview shown on Session cards."
              id="description-description"
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">When & Where</legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Set when the Session happens and how people will participate.
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
            <option value="">Choose A Format</option>
            <option value="in_person">In Person</option>
            <option value="online">Online</option>
            <option value="either">Hybrid</option>
          </SelectField>
          <TextField
            error={firstFieldError(state, "capacity")}
            label="Session Member Capacity"
            max={100}
            min={1}
            name="capacity"
            required
            type="number"
          />
          <TextField
            error={firstFieldError(state, "locationLabel")}
            hint="Examples: Downtown studio; Online—details from host."
            label="Location Or Access"
            maxLength={120}
            name="locationLabel"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">Signal Sync</legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Help SIGNAL understand when this Session is most likely to feel right
          for someone.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            error={firstFieldError(state, "modeId")}
            label="Mode"
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
            defaultValue="1"
            error={firstFieldError(state, "minimumEnergy")}
            label="Energy From"
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
            label="Energy To"
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
            <option value="solo">One-On-One</option>
            <option value="light">Light Interaction</option>
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
            "Choose the interests that best describe this Session."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((interest) => (
            <label
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#992bff]/20 bg-black/40 px-4 py-3 text-sm text-neutral-200 transition hover:border-[#992bff]/45 has-checked:border-[#992bff]/60 has-checked:bg-[#992bff]/10"
              key={interest.id}
            >
              <input
                className="size-5 accent-[#992bff]"
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
        Your Session will start as a draft. You can review everything before
        making it visible to members.
      </div>

      <SubmitButton
        className="border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
        pendingLabel="Creating Session…"
      >
        Create Session Draft
      </SubmitButton>
    </form>
  );
}
