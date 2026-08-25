"use client";

import { useActionState, useEffect, useState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { firstFieldError, initialActionState } from "@/features/auth/state";
import { updateProfileSettingsAction } from "./actions";
import { ProfileMediaEditor } from "./profile-media-editor";

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
    accentColor: string;
    landscapeUrl: string | null;
    landscapeImageFit: "cover" | "contain";
    landscapeImagePositionX: number;
    landscapeImagePositionY: number;
    landscapeImageZoom: number;
    backgroundUrl: string | null;
    backgroundImageFit: "cover" | "contain";
    backgroundImagePositionX: number;
    backgroundImagePositionY: number;
    backgroundImageZoom: number;
    spotlightTitle: string;
    spotlightDescription: string;
    spotlightUrl: string;
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
  const [accentColor, setAccentColor] = useState(profile.accentColor);

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
      <ProfileMediaEditor
        background={{
          currentUrl: profile.backgroundUrl,
          fit: profile.backgroundImageFit,
          positionX: profile.backgroundImagePositionX,
          positionY: profile.backgroundImagePositionY,
          zoom: profile.backgroundImageZoom,
        }}
        landscape={{
          currentUrl: profile.landscapeUrl,
          fit: profile.landscapeImageFit,
          positionX: profile.landscapeImagePositionX,
          positionY: profile.landscapeImagePositionY,
          zoom: profile.landscapeImageZoom,
        }}
      />
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="profile-accent-color"
        >
          Profile accent color
        </label>
        <div className="flex gap-3">
          <input
            aria-label="Choose profile accent color"
            className="size-12 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-black/45 p-1"
            onChange={(event) => setAccentColor(event.target.value)}
            type="color"
            value={
              /^#[0-9a-f]{6}$/i.test(accentColor) ? accentColor : "#a855f7"
            }
          />
          <input
            className={inputClass}
            id="profile-accent-color"
            maxLength={7}
            name="accentColor"
            onChange={(event) => setAccentColor(event.target.value)}
            pattern="#[0-9a-fA-F]{6}"
            placeholder="#ff3cac"
            required
            value={accentColor}
          />
        </div>
        <FieldMessage
          error={firstFieldError(state, "accentColor")}
          hint="Sets the card borders and profile-photo ring. Enter any six-digit hex color to match your wallpaper."
        />
      </div>
      <fieldset className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <legend className="px-2 text-sm font-bold text-white">
          Pinned spotlight
        </legend>
        <p className="mb-5 text-xs leading-5 text-white/45">
          Optionally feature one project, session, Circle, opportunity, or link.
        </p>
        <div className="space-y-4">
          <div>
            <label className="sr-only" htmlFor="spotlight-title">
              Spotlight title
            </label>
            <input
              className={inputClass}
              defaultValue={profile.spotlightTitle}
              id="spotlight-title"
              maxLength={80}
              name="spotlightTitle"
              placeholder="Spotlight title"
            />
            <FieldMessage
              error={firstFieldError(state, "spotlightTitle")}
              hint="Up to 80 characters."
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="spotlight-description">
              Spotlight description
            </label>
            <textarea
              className={`${inputClass} min-h-24`}
              defaultValue={profile.spotlightDescription}
              id="spotlight-description"
              maxLength={240}
              name="spotlightDescription"
              placeholder="A short description"
            />
            <FieldMessage
              error={firstFieldError(state, "spotlightDescription")}
              hint="Up to 240 characters."
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="spotlight-url">
              Spotlight link
            </label>
            <input
              className={inputClass}
              defaultValue={profile.spotlightUrl}
              id="spotlight-url"
              maxLength={500}
              name="spotlightUrl"
              placeholder="https://…"
              type="url"
            />
            <FieldMessage
              error={firstFieldError(state, "spotlightUrl")}
              hint="Optional complete link beginning with http:// or https://."
            />
          </div>
        </div>
      </fieldset>
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
      <SubmitButton pendingLabel="Saving profile…">
        Save profile & background
      </SubmitButton>
    </form>
  );
}
