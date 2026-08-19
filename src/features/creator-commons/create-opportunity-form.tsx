"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type { Circle, Interest, Mode, Skill } from "@/types/database";
import { createOpportunityAction } from "./actions";
import { opportunityTimezones } from "./schemas";

const controlClassName =
  "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white hover:border-neutral-500 focus:border-amber-400 focus:outline-none";

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
        required={required}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-2 text-xs text-red-300" id={descriptionId}>
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
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        required
      />
      {error || hint ? (
        <p
          className={cn(
            "mt-2 text-xs leading-5 text-neutral-500",
            error && "text-red-300",
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
      <legend className="text-xl font-bold text-white">{label}</legend>
      <p
        className={cn(
          "mt-2 text-sm leading-6 text-neutral-400",
          error && "text-red-300",
        )}
        id={`${name}-description`}
      >
        {error ?? hint}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <label
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-200 hover:border-neutral-500 has-checked:border-amber-600 has-checked:bg-amber-950/30"
            key={item.id}
          >
            <input
              className="size-5 accent-amber-600"
              name={name}
              type="checkbox"
              value={item.id}
            />
            {item.name}
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
}: {
  modes: Array<Pick<Mode, "id" | "name">>;
  skills: Array<Pick<Skill, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  circles: Array<Pick<Circle, "id" | "name">>;
}) {
  const [state, action] = useActionState(
    createOpportunityAction,
    initialActionState,
  );

  return (
    <form
      action={action}
      aria-label="Create a Creator Commons opportunity"
      className="space-y-9"
    >
      <ActionStatus state={state} />

      <fieldset>
        <legend className="text-xl font-bold text-white">
          Opportunity brief
        </legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          State the work, boundaries, expected outcome, and creator clearly.
          Every new opportunity remains a private draft.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
            label="Opportunity type"
            name="kind"
          >
            <option value="collaboration">Collaboration</option>
            <option value="project">Project</option>
            <option value="volunteer">Volunteer</option>
            <option value="mentorship">Mentorship</option>
          </SelectField>
        </div>
        <div className="mt-5">
          <TextAreaField
            error={firstFieldError(state, "summary")}
            hint="10–280 characters. This appears on discovery cards."
            label="Short summary"
            maxLength={280}
            name="summary"
            placeholder="Explain the opportunity, who it serves, and why it matters."
          />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            error={firstFieldError(state, "description")}
            label="Full description"
            maxLength={5000}
            name="description"
            placeholder="Describe the scope, workflow, intended audience, and working expectations."
          />
          <TextAreaField
            error={firstFieldError(state, "deliverables")}
            hint="Describe outputs without presenting a contract or payment promise."
            label="Expected deliverables"
            maxLength={3000}
            name="deliverables"
            placeholder="List the bounded outputs and what completion means."
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">
          Access and commitment
        </legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          Use only a broad access label. Private links, precise addresses,
          compensation, and contract terms are not stored in Phase 6.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            error={firstFieldError(state, "circleId")}
            label="Circle association"
            name="circleId"
            required={false}
          >
            <option value="">No Circle association</option>
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
            error={firstFieldError(state, "responseDeadlineLocal")}
            label="Response deadline"
            name="responseDeadlineLocal"
            required
            type="datetime-local"
          />
          <SelectField
            defaultValue="America/New_York"
            error={firstFieldError(state, "timezone")}
            label="Deadline timezone"
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
            hint="15–1,440 minutes used only for explainable Pulse matching."
            label="Estimated commitment (minutes)"
            max={1440}
            min={15}
            name="estimatedMinutes"
            required
            type="number"
          />
          <TextField
            error={firstFieldError(state, "positions")}
            label="Available positions"
            max={25}
            min={1}
            name="positions"
            required
            type="number"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xl font-bold text-white">Pulse fit</legend>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          These bounded signals explain fit; they do not profile health or
          guarantee selection.
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

      <TaxonomyChoices
        error={firstFieldError(state, "skillIds")}
        hint="Required. Choose one to eight active skills relevant to the work."
        items={skills}
        label="Relevant skills"
        name="skillIds"
      />
      <TaxonomyChoices
        error={firstFieldError(state, "interestIds")}
        hint="Optional. Choose up to eight interests for discovery and Pulse matching."
        items={interests}
        label="Interests"
        name="interestIds"
      />

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-sm leading-6 text-neutral-400">
        Creating a draft does not publish it, accept a response, create a
        contract, promise payment, or issue Passport activity.
      </div>
      <SubmitButton pendingLabel="Creating draft…">
        Create draft opportunity
      </SubmitButton>
    </form>
  );
}
