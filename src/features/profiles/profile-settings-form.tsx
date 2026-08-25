"use client";

import { useActionState, useEffect, useState } from "react";
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

const NAME_CHANGE_WAIT_MS = 7 * 24 * 60 * 60 * 1000;

function useNameChangeWindow(changedAt: string | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!changedAt) return { locked: false, message: "Available to change now." };
  const nextChangeAt = new Date(changedAt).getTime() + NAME_CHANGE_WAIT_MS;
  if (nextChangeAt <= now) {
    return { locked: false, message: "Available to change now." };
  }

  const remainingMinutes = Math.max(
    1,
    Math.ceil((nextChangeAt - now) / (60 * 1000)),
  );
  const days = Math.floor(remainingMinutes / (24 * 60));
  const hours = Math.floor((remainingMinutes % (24 * 60)) / 60);
  const minutes = remainingMinutes % 60;
  const remaining = days
    ? `${days}d ${hours}h`
    : hours
      ? `${hours}h ${minutes}m`
      : `${minutes}m`;

  return {
    locked: true,
    message: `Available again in ${remaining}.`,
  };
}

export function ProfileSettingsForm({
  profile,
}: {
  profile: {
    username: string;
    usernameChangedAt: string | null;
    displayName: string;
    displayNameChangedAt: string | null;
    bio: string;
    visibility: "private" | "members" | "public";
    discoverable: boolean;
  };
}) {
  const [state, action] = useActionState(
    updateProfileSettingsAction,
    initialActionState,
  );
  const usernameWindow = useNameChangeWindow(profile.usernameChangedAt);
  const displayNameWindow = useNameChangeWindow(profile.displayNameChangedAt);

  return (
    <form action={action} className="space-y-6" encType="multipart/form-data">
      <ActionStatus state={state} />
      <div
        className="grid scroll-mt-28 gap-5 sm:grid-cols-2"
        id="profile-media"
      >
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="profile-username"
          >
            Username
          </label>
          <input
            className={`${inputClass} read-only:cursor-not-allowed read-only:opacity-55`}
            defaultValue={profile.username}
            id="profile-username"
            maxLength={30}
            minLength={3}
            name="username"
            pattern="[a-z0-9](?:[a-z0-9_]*[a-z0-9])?"
            readOnly={usernameWindow.locked}
            required
          />
          <FieldMessage
            error={firstFieldError(state, "username")}
            hint={`${usernameWindow.message} Usernames are unique and checked when you save.`}
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="profile-display-name"
          >
            Display name
          </label>
          <input
            className={`${inputClass} read-only:cursor-not-allowed read-only:opacity-55`}
            defaultValue={profile.displayName}
            id="profile-display-name"
            maxLength={80}
            name="displayName"
            readOnly={displayNameWindow.locked}
            required
          />
          <FieldMessage
            error={firstFieldError(state, "displayName")}
            hint={`${displayNameWindow.message} Display names do not need to be unique.`}
          />
        </div>
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
