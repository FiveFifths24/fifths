"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/forms/action-status";
import {
  DraftRestoredNotice,
  useFormDraft,
} from "@/components/forms/form-draft";
import {
  formDraftStorageKey,
  opportunityDraftFields,
} from "@/components/forms/form-draft-config";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Circle, Interest, Mode, Skill } from "@/types/database";

import { createOpportunityAction } from "./actions";
import { opportunityTimezones } from "./schemas";

const controlClassName =
  "min-h-12 w-full rounded-xl border border-[#992bff]/30 bg-black/70 px-4 py-3 text-base text-white transition-colors hover:border-[#992bff]/60 focus:border-[#f359d2] focus:ring-2 focus:ring-[#992bff]/30 focus:outline-none";

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
  const descriptionId = error ? `${name}-description` : undefined;

  return (
    <div className="text-left">
      <label
        className="mb-2 block text-sm font-bold text-white/90"
        htmlFor={name}
      >
        {label}
      </label>

      <select
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlClassName,
          error &&
            "border-[#ff6b9e] focus:border-[#ff6b9e] focus:ring-[#ff6b9e]/25",
        )}
        defaultValue={defaultValue}
        id={name}
        name={name}
        required={required}
      >
        {children}
      </select>

      {error ? (
        <p className="mt-2 text-xs text-[#ff9ab9]" id={descriptionId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  error,
  hint,
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  maxLength: number;
  placeholder: string;
}) {
  const descriptionId = error || hint ? `${name}-description` : undefined;

  return (
    <div className="text-left">
      <label
        className="mb-2 block text-sm font-bold text-white/90"
        htmlFor={name}
      >
        {label}
      </label>

      <textarea
        aria-describedby={descriptionId}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlClassName,
          "min-h-32 resize-y sm:min-h-36",
          error &&
            "border-[#ff6b9e] focus:border-[#ff6b9e] focus:ring-[#ff6b9e]/25",
        )}
        id={name}
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required
      />

      {error || hint ? (
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-white/45",
            error && "text-[#ff9ab9]",
          )}
          id={descriptionId}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

function TaxonomyChoices({
  label,
  name,
  items,
  error,
  hint,
}: {
  label: string;
  name: "skillIds" | "interestIds";
  items: Array<{ id: string; name: string }>;
  error?: string;
  hint: string;
}) {
  return (
    <fieldset aria-describedby={`${name}-description`}>
      <legend className="w-full text-center text-xl font-bold text-white lg:text-left">
        {label}
      </legend>

      <p
        className={cn(
          "mx-auto mt-2 max-w-3xl text-center text-sm leading-6 text-white/50 lg:mx-0 lg:text-left",
          error && "text-[#ff9ab9]",
        )}
        id={`${name}-description`}
      >
        {error ?? hint}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <label
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#992bff]/25 bg-black/60 px-4 py-3 text-left text-sm text-white/75 transition-colors hover:border-[#992bff]/55 has-checked:border-[#f359d2]/70 has-checked:bg-[#992bff]/15 has-checked:text-white"
            key={item.id}
          >
            <input
              className="size-5 shrink-0 accent-[#f359d2]"
              name={name}
              type="checkbox"
              value={item.id}
            />

            <span>{item.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CreateOpportunityForm({
  modes,
  skills,
  interests,
  circles,
  draftOwnerId,
}: {
  modes: Array<Pick<Mode, "id" | "name">>;
  skills: Array<Pick<Skill, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  circles: Array<Pick<Circle, "id" | "name">>;
  draftOwnerId: string;
}) {
  const [state, action] = useActionState(
    createOpportunityAction,
    initialActionState,
  );
  const { formRef, restored } = useFormDraft({
    storageKey: formDraftStorageKey("commons-opportunity-create", draftOwnerId),
    fields: opportunityDraftFields,
    actionState: state,
  });

  return (
    <form
      action={action}
      aria-label="Create a Creator Commons opportunity"
      className="space-y-10 text-left"
      ref={formRef}
    >
      <ActionStatus state={state} />
      <DraftRestoredNotice restored={restored} />

      <fieldset>
        <legend className="w-full text-center text-xl font-bold text-white lg:text-left">
          Opportunity Brief
        </legend>

        <p className="mx-auto mt-2 max-w-3xl text-center text-sm leading-6 text-white/50 lg:mx-0 lg:text-left">
          Explain what you want to create, who you want to work with, and what a
          successful collaboration will produce.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            error={firstFieldError(state, "title")}
            label="Title"
            maxLength={40}
            name="title"
            placeholder="Produce a launch interview series"
            required
          />

          <SelectField
            defaultValue="collaboration"
            error={firstFieldError(state, "kind")}
            label="Opportunity Type"
            name="kind"
          >
            <option value="collaboration">Collaboration</option>
            <option value="project">Project</option>
            <option value="volunteer">Volunteer</option>
            <option value="mentorship">Mentorship</option>
          </SelectField>

          <SelectField
            error={firstFieldError(state, "compensation")}
            label="Compensation"
            name="compensation"
          >
            <option value="">Choose Paid or Unpaid</option>
            <option value="paid">Paid opportunity</option>
            <option value="unpaid">Unpaid / community collaboration</option>
          </SelectField>
        </div>

        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "summary")}
            hint="10–280 characters. This will appear on discovery cards."
            label="Short Summary"
            maxLength={280}
            name="summary"
            placeholder="Explain the opportunity, who it serves, and why it matters."
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            error={firstFieldError(state, "description")}
            label="Full Description"
            maxLength={5000}
            name="description"
            placeholder="Describe the scope, workflow, intended audience, and working expectations."
          />

          <TextAreaField
            error={firstFieldError(state, "deliverables")}
            hint="Describe the expected results without presenting a contract or payment promise."
            label="Expected Deliverables"
            maxLength={3000}
            name="deliverables"
            placeholder="List the expected outputs and explain what completion means."
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="w-full text-center text-xl font-bold text-white lg:text-left">
          Access And Commitment
        </legend>

        <p className="mx-auto mt-2 max-w-3xl text-center text-sm leading-6 text-white/50 lg:mx-0 lg:text-left">
          Tell people how they will participate, how much time they should
          expect to contribute, and when responses close.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            error={firstFieldError(state, "circleId")}
            label="Circle Association"
            name="circleId"
            required={false}
          >
            <option value="">No Circle Association</option>

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
            <option value="">Choose A Format</option>
            <option value="in_person">In Person</option>
            <option value="online">Online</option>
            <option value="either">Hybrid</option>
          </SelectField>

          <TextField
            error={firstFieldError(state, "locationLabel")}
            hint="Optional broad area or access label."
            label="Area Or Access Label"
            maxLength={120}
            name="locationLabel"
          />

          <TextField
            error={firstFieldError(state, "responseDeadlineLocal")}
            label="Response Deadline"
            name="responseDeadlineLocal"
            required
            type="datetime-local"
          />

          <SelectField
            defaultValue="America/New_York"
            error={firstFieldError(state, "timezone")}
            label="Deadline Timezone"
            name="timezone"
          >
            {opportunityTimezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone.replaceAll("_", " ")}
              </option>
            ))}
          </SelectField>

          <TextField
            error={firstFieldError(state, "estimatedMinutes")}
            hint="Enter between 15 and 1,440 minutes."
            label="Estimated Commitment In Minutes"
            max={1440}
            min={15}
            name="estimatedMinutes"
            required
            type="number"
          />

          <TextField
            error={firstFieldError(state, "positions")}
            label="Available Positions"
            max={25}
            min={1}
            name="positions"
            required
            type="number"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="w-full text-center text-xl font-bold text-white lg:text-left">
          Pulse Fit
        </legend>

        <p className="mx-auto mt-2 max-w-3xl text-center text-sm leading-6 text-white/50 lg:mx-0 lg:text-left">
          Help Signal connect your opportunity with people whose current energy,
          interests, and preferred way of participating align with the work.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

          <SelectField
            defaultValue="1"
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
            defaultValue="5"
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
            <option value="solo">Solo-Friendly</option>
            <option value="light">Light Interaction</option>
            <option value="social">Social</option>
          </SelectField>
        </div>
      </fieldset>

      <TaxonomyChoices
        error={firstFieldError(state, "skillIds")}
        hint="Required. Choose one to eight active skills relevant to the work."
        items={skills}
        label="Relevant Skills"
        name="skillIds"
      />

      <TaxonomyChoices
        error={firstFieldError(state, "interestIds")}
        hint="Optional. Choose up to eight interests for discovery and Pulse matching."
        items={interests}
        label="Interests"
        name="interestIds"
      />

      <div className="rounded-2xl border border-[#992bff]/25 bg-[#992bff]/[0.06] p-5 text-center text-sm leading-6 text-white/55 lg:text-left">
        Creating a draft does not publish the opportunity automatically. You
        will be able to review everything before making it visible to the
        community.
      </div>

      <SubmitButton pendingLabel="Creating draft…">
        Create Draft Opportunity
      </SubmitButton>
    </form>
  );
}
