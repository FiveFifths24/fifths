"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { updateProfileSettingsAction } from "./actions";

const inputClass =
  "min-h-12 w-full rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#6c14ce]/20 file:px-4 file:py-2 file:font-bold file:text-[#e9d5ff] hover:file:bg-[#6c14ce]/30 focus:border-[#f359d2]/70 focus:ring-2 focus:ring-[#992bff]/20";

function FieldMessage({ hint, error }: { hint: string; error?: string }) {
  return (
    <p className={`mt-2 text-xs ${error ? "text-red-300" : "text-white/40"}`}>
      {error ?? hint}
    </p>
  );
}

export function ProfileSettingsForm({
  profile,
}: {
  profile: {
    username: string;
    displayName: string;
    bio: string;
    visibility: "private" | "members" | "public";
    discoverable: boolean;
  };
}) {
  const [state, action] = useActionState(
    updateProfileSettingsAction,
    initialActionState,
  );
  return (
    <form action={action} className="space-y-6" encType="multipart/form-data">
      <ActionStatus state={state} />
      <input name="username" type="hidden" value={profile.username} />
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="profile-display-name"
        >
          Display name
        </label>
        <input
          className={inputClass}
          defaultValue={profile.displayName}
          id="profile-display-name"
          maxLength={80}
          name="displayName"
          required
        />
        <FieldMessage
          error={firstFieldError(state, "displayName")}
          hint="The name people see on your profile."
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="profile-bio"
        >
          Bio
        </label>
        <textarea
          className={`${inputClass} min-h-32`}
          defaultValue={profile.bio}
          id="profile-bio"
          maxLength={500}
          name="bio"
        />
        <FieldMessage
          error={firstFieldError(state, "bio")}
          hint="Up to 500 characters."
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="profile-avatar"
          >
            Profile photo
          </label>
          <input
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
            id="profile-avatar"
            name="avatar"
            type="file"
          />
          <FieldMessage hint="One JPG, PNG, or WebP image, up to 5 MB." />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="profile-background"
          >
            Profile background
          </label>
          <input
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
            id="profile-background"
            name="background"
            type="file"
          />
          <FieldMessage hint="A static MySpace-style background, up to 5 MB." />
        </div>
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="profile-visibility"
        >
          Profile visibility
        </label>
        <select
          className={inputClass}
          defaultValue={profile.visibility}
          id="profile-visibility"
          name="visibility"
        >
          <option value="public">Public</option>
          <option value="members">SIGNAL members</option>
          <option value="private">Friends only</option>
        </select>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/30 p-5 has-checked:border-[#ca9aff]/70">
        <input
          className="mt-0.5 size-5 accent-[#a855f7]"
          defaultChecked={profile.discoverable}
          name="discoverable"
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-bold text-white">
            Help people find me
          </span>
          <span className="mt-1 block text-xs leading-5 text-white/45">
            Include your profile in people search and relevant community
            recommendations.
          </span>
        </span>
      </label>
      <SubmitButton pendingLabel="Saving profile…">Save profile</SubmitButton>
    </form>
  );
}
