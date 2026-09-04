"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { initialActionState } from "@/features/auth/state";
import type { ActivitySharingPreferences } from "@/types/database";
import { updateActivitySharingAction } from "./actions";

type ActivityPrivacyDefaults = Pick<
  ActivitySharingPreferences,
  | "share_with_friends"
  | "share_session_activity"
  | "share_circle_activity"
  | "share_profile_activity"
  | "share_commons_activity"
>;

const options = [
  {
    name: "shareSessionActivity",
    key: "share_session_activity",
    label: "Sessions",
    description:
      "Sessions you create or join when the Session is visible to that friend.",
  },
  {
    name: "shareCircleActivity",
    key: "share_circle_activity",
    label: "Circles",
    description:
      "Circles you create or join when the Circle is visible to that friend.",
  },
  {
    name: "shareProfileActivity",
    key: "share_profile_activity",
    label: "Profile updates",
    description:
      "Current Signal, music, and recommendations. Approved media can be added after moderation integration.",
  },
  {
    name: "shareCommonsActivity",
    key: "share_commons_activity",
    label: "Creator Commons",
    description: "Public opportunities you publish. This is off by default.",
  },
] as const;

export function ActivityPrivacyForm({
  defaults,
}: {
  defaults: ActivityPrivacyDefaults;
}) {
  const [state, action] = useActionState(
    updateActivitySharingAction,
    initialActionState,
  );

  return (
    <form action={action} className="mt-6 space-y-4">
      <ActionStatus state={state} />
      <label className="flex min-h-14 items-start gap-3 rounded-2xl border border-[#f359d2]/25 bg-[#f359d2]/[0.05] p-4">
        <input
          className="mt-1 size-5 accent-[#f359d2]"
          defaultChecked={defaults.share_with_friends}
          name="shareWithFriends"
          type="checkbox"
        />
        <span>
          <span className="block font-bold text-white">
            Share my activity with friends
          </span>
          <span className="mt-1 block text-sm leading-6 text-white/45">
            Only accepted friends can see allowed activity. Blocks, mutes, and
            source privacy always take precedence.
          </span>
        </span>
      </label>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="sr-only">Activity categories</legend>
        {options.map((option) => (
          <label
            className="flex min-h-24 items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
            key={option.name}
          >
            <input
              className="mt-1 size-5 accent-[#ca9aff]"
              defaultChecked={defaults[option.key]}
              name={option.name}
              type="checkbox"
            />
            <span>
              <span className="block font-bold text-white">{option.label}</span>
              <span className="mt-1 block text-xs leading-5 text-white/40">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <SubmitButton pendingLabel="Saving privacy…">
        Save Activity Privacy
      </SubmitButton>
    </form>
  );
}
