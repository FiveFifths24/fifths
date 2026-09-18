"use client";

import { useActionState } from "react";

import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormErrorFocus } from "@/components/forms/form-error-focus";
import { TextField } from "@/components/forms/text-field";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import type {
  Circle,
  CreatorOpportunity,
  Interest,
  Mode,
  Skill,
} from "@/types/database";

import { updateOpportunityAction } from "./actions";
import { opportunityTimezones } from "./schemas";

const controlClassName =
  "min-h-12 w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-base text-white transition-colors hover:border-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/10 focus:outline-none";

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
          error && "border-red-500 focus:border-red-400 focus:ring-red-500/20",
        )}
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
  defaultValue,
  error,
  hint,
  maxLength,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
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
          error && "border-red-500 focus:border-red-400 focus:ring-red-500/20",
        )}
        defaultValue={defaultValue}
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
  selectedIds,
  error,
  hint,
}: {
  label: string;
  name: "skillIds" | "interestIds";
  items: Array<{ id: string; name: string }>;
  selectedIds: string[];
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
          error && "text-red-300",
        )}
        id={`${name}-description`}
      >
        {error ?? hint}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <label
            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/25 has-checked:border-white/35 has-checked:bg-white/[0.07] has-checked:text-white"
            key={item.id}
          >
            <input
              className="size-5 shrink-0 accent-white"
              defaultChecked={selectedIds.includes(item.id)}
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

export function EditOpportunityForm({
  opportunity,
  responseDeadlineLocal,
  modes,
  skills,
  interests,
  circles,
  selectedSkillIds,
  selectedInterestIds,
}: {
  opportunity: CreatorOpportunity;
  responseDeadlineLocal: string;
  modes: Array<Pick<Mode, "id" | "name">>;
  skills: Array<Pick<Skill, "id" | "name">>;
  interests: Array<Pick<Interest, "id" | "name">>;
  circles: Array<Pick<Circle, "id" | "name">>;
  selectedSkillIds: string[];
  selectedInterestIds: string[];
}) {
  const updateAction = updateOpportunityAction.bind(null, opportunity.id);

  const [state, action] = useActionState(updateAction, initialActionState);

  function previousValue(name: string, fallback: string) {
    const value = state.values?.[name];

    return typeof value === "string" ? value : fallback;
  }

  function previousIds(name: "skillIds" | "interestIds", fallback: string[]) {
    const value = state.values?.[name];

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return [value];
    }

    return fallback;
  }

  const currentSkillIds = previousIds("skillIds", selectedSkillIds);
  const currentInterestIds = previousIds("interestIds", selectedInterestIds);

  return (
    <form
      action={action}
      aria-label="Edit Creator Commons Opportunity"
      className="space-y-10 text-left"
    >
      <fieldset>
        <legend className="w-full text-center text-xl font-bold text-white lg:text-left">
          Opportunity Brief
        </legend>

        <p className="mx-auto mt-2 max-w-3xl text-center text-sm leading-6 text-white/50 lg:mx-0 lg:text-left">
          Update how this opportunity is presented to members.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            defaultValue={previousValue("title", opportunity.title)}
            error={firstFieldError(state, "title")}
            label="Title"
            maxLength={40}
            name="title"
            required
          />

          <SelectField
            defaultValue={previousValue("kind", opportunity.kind)}
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
            defaultValue={previousValue(
              "compensation",
              opportunity.is_paid ? "paid" : "unpaid",
            )}
            error={firstFieldError(state, "compensation")}
            label="Compensation"
            name="compensation"
          >
            <option value="paid">Paid opportunity</option>
            <option value="unpaid">Unpaid / Community Collaboration</option>
          </SelectField>
        </div>

        <div className="mt-5">
          <TextAreaField
            defaultValue={previousValue("summary", opportunity.summary)}
            error={firstFieldError(state, "summary")}
            hint="10–280 characters. This appears on discovery cards."
            label="Short Summary"
            maxLength={280}
            name="summary"
            placeholder="Explain the opportunity, who it serves, and why it matters."
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <TextAreaField
            defaultValue={previousValue("description", opportunity.description)}
            error={firstFieldError(state, "description")}
            label="Full Description"
            maxLength={5000}
            name="description"
            placeholder="Describe the scope, workflow, intended audience, and working expectations."
          />

          <TextAreaField
            defaultValue={previousValue(
              "deliverables",
              opportunity.deliverables,
            )}
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
          Update where participation happens, capacity, and the response
          deadline.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            defaultValue={previousValue(
              "circleId",
              opportunity.circle_id ?? "",
            )}
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
            defaultValue={previousValue("format", opportunity.format)}
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
              opportunity.location_label ?? "",
            )}
            error={firstFieldError(state, "locationLabel")}
            hint="Optional broad area or access label."
            label="Area Or Access Label"
            maxLength={120}
            name="locationLabel"
          />

          <TextField
            defaultValue={previousValue(
              "responseDeadlineLocal",
              responseDeadlineLocal,
            )}
            error={firstFieldError(state, "responseDeadlineLocal")}
            label="Response Deadline"
            name="responseDeadlineLocal"
            required
            type="datetime-local"
          />

          <SelectField
            defaultValue={previousValue("timezone", opportunity.timezone)}
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
            defaultValue={previousValue(
              "estimatedMinutes",
              String(opportunity.estimated_minutes),
            )}
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
            defaultValue={previousValue(
              "positions",
              String(opportunity.positions),
            )}
            error={firstFieldError(state, "positions")}
            hint={`Cannot be lower than ${opportunity.accepted_count} accepted participant${
              opportunity.accepted_count === 1 ? "" : "s"
            }.`}
            label="Available Positions"
            max={25}
            min={Math.max(1, opportunity.accepted_count)}
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
          Update the participation signals used to help members understand
          whether the opportunity fits their current capacity.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField
            defaultValue={previousValue("modeId", opportunity.mode_id)}
            error={firstFieldError(state, "modeId")}
            label="Primary Mode"
            name="modeId"
          >
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            defaultValue={previousValue(
              "minimumEnergy",
              String(opportunity.minimum_energy),
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
              String(opportunity.maximum_energy),
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
              opportunity.stimulation_level,
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
              opportunity.social_intensity,
            )}
            error={firstFieldError(state, "socialIntensity")}
            label="Social Pace"
            name="socialIntensity"
          >
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
        selectedIds={currentSkillIds}
      />

      <TaxonomyChoices
        error={firstFieldError(state, "interestIds")}
        hint="Optional. Choose up to eight interests for discovery and Pulse matching."
        items={interests}
        label="Interests"
        name="interestIds"
        selectedIds={currentInterestIds}
      />

      <div className="rounded-2xl border border-white/15 bg-white/[0.035] p-5 text-center text-sm leading-6 text-white/55 lg:text-left">
        Saving updates the existing opportunity. It does not create a new
        listing or change its current lifecycle status.
      </div>

      <div className="rounded-2xl border border-white/15 bg-white/[0.025] p-5">
        <FormErrorFocus state={state} />

        {state.status === "error" ? (
          <div className="mb-5">
            <ActionStatus state={state} />
          </div>
        ) : null}

        <SubmitButton pendingLabel="Saving Changes…">
          Save Opportunity Changes
        </SubmitButton>
      </div>
    </form>
  );
}
