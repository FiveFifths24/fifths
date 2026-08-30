"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { cn } from "@/lib/cn";
import { submitCampaignApplicationAction } from "./actions";

const control =
  "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-base text-white focus:border-indigo-400 focus:outline-none";

export function CampaignApplicationForm({
  campaignId,
}: {
  campaignId: string;
}) {
  const action = submitCampaignApplicationAction.bind(null, campaignId);
  const [state, formAction] = useActionState(action, initialActionState);
  return (
    <form
      action={formAction}
      aria-label="Apply to this Fifth Realm campaign"
      className="space-y-5"
    >
      <ActionStatus state={state} />
      <div>
        <label
          className="mb-2 block text-sm font-bold text-neutral-100"
          htmlFor="motivation"
        >
          Why This Campaign Fits
        </label>
        <textarea
          aria-describedby="motivation-description"
          aria-invalid={firstFieldError(state, "motivation") ? true : undefined}
          className={cn(
            control,
            "min-h-36",
            firstFieldError(state, "motivation") && "border-red-500",
          )}
          id="motivation"
          maxLength={2000}
          name="motivation"
          required
        />
        <p
          className="mt-2 text-xs leading-5 text-neutral-500"
          id="motivation-description"
        >
          {firstFieldError(state, "motivation") ??
            "Share your interest and collaborative expectations. Do not include contact details, diagnoses, or proprietary game content."}
        </p>
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-neutral-100"
          htmlFor="availability"
        >
          Broad Availability
        </label>
        <textarea
          aria-describedby="availability-description"
          aria-invalid={
            firstFieldError(state, "availability") ? true : undefined
          }
          className={cn(
            control,
            "min-h-28",
            firstFieldError(state, "availability") && "border-red-500",
          )}
          id="availability"
          maxLength={500}
          name="availability"
          required
        />
        <p
          className="mt-2 text-xs leading-5 text-neutral-500"
          id="availability-description"
        >
          {firstFieldError(state, "availability") ??
            "Describe scheduling fit without sharing private contact or location details."}
        </p>
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-neutral-100"
          htmlFor="experienceLevel"
        >
          Experience Comfort
        </label>
        <select
          className={control}
          defaultValue="new"
          id="experienceLevel"
          name="experienceLevel"
          required
        >
          <option value="new">New & Learning</option>
          <option value="comfortable">Comfortable</option>
          <option value="experienced">Experienced</option>
        </select>
      </div>
      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-neutral-700 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300 has-checked:border-indigo-600">
        <input
          className="mt-0.5 size-5 accent-indigo-500"
          name="safetyAcknowledged"
          required
          type="checkbox"
        />
        <span>
          I have read this campaign’s safety expectations and understand that
          the Fifth Realm Safety Guidelines also apply.
        </span>
      </label>
      <SubmitButton pendingLabel="Submitting application…">
        Submit Private Application
      </SubmitButton>
    </form>
  );
}
