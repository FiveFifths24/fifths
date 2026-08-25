"use client";

import { useActionState, useState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { initialActionState } from "@/features/auth/state";
import { updateProfileRoomAction } from "./actions";
import type { ProfileRoomSettings } from "./profile-room";

const inputClass =
  "min-h-12 w-full rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-white outline-none transition focus:border-[#f359d2]/70 focus:ring-2 focus:ring-[#992bff]/20";

function ColorField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeColor = /^#[0-9a-f]{6}$/i.test(value) ? value : "#f359d2";
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-white" htmlFor={name}>
        {label}
      </label>
      <div className="flex gap-3">
        <input
          aria-label={`Choose ${label.toLowerCase()}`}
          className="size-12 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-black/45 p-1"
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={safeColor}
        />
        <input
          className={inputClass}
          id={name}
          maxLength={7}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          pattern="#[0-9a-fA-F]{6}"
          required
          value={value}
        />
      </div>
    </div>
  );
}

export function ProfileRoomSettingsForm({
  settings,
}: {
  settings: ProfileRoomSettings;
}) {
  const [state, action] = useActionState(
    updateProfileRoomAction,
    initialActionState,
  );
  const [wallColor, setWallColor] = useState(settings.wallColor);
  const [characterColor, setCharacterColor] = useState(settings.characterColor);

  return (
    <form action={action} className="space-y-6">
      <ActionStatus state={state} />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-5 has-checked:border-[#ca9aff]/70">
        <input
          className="mt-0.5 size-5 accent-[#a855f7]"
          defaultChecked={settings.enabled}
          name="enabled"
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-bold text-white">
            Make Room View my default
          </span>
          <span className="mt-1 block text-xs leading-5 text-white/45">
            Visitors can always switch to the accessible Quick View.
          </span>
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <ColorField
          label="Room wall color"
          name="wallColor"
          onChange={setWallColor}
          value={wallColor}
        />
        <ColorField
          label="Character color"
          name="characterColor"
          onChange={setCharacterColor}
          value={characterColor}
        />
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="lightingTheme"
          >
            Lighting
          </label>
          <select
            className={inputClass}
            defaultValue={settings.lightingTheme}
            id="lightingTheme"
            name="lightingTheme"
          >
            <option value="cosmic">Cosmic glow</option>
            <option value="warm">Warm evening</option>
            <option value="daylight">Soft daylight</option>
            <option value="midnight">Midnight</option>
          </select>
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="currentVibe"
          >
            Current Vibe
          </label>
          <select
            className={inputClass}
            defaultValue={settings.currentVibe}
            id="currentVibe"
            name="currentVibe"
          >
            <option value="chill">Chill</option>
            <option value="focused">Focused</option>
            <option value="gaming">Gaming</option>
            <option value="creative">Creative</option>
            <option value="social">Social</option>
          </select>
        </div>
      </div>

      <fieldset className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <legend className="px-2 text-sm font-bold text-white">
          Room character
        </legend>
        <p className="mb-5 text-xs leading-5 text-white/45">
          Keep it simple for now: choose a shape, face, and one accessory.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="sr-only" htmlFor="characterShape">
              Character shape
            </label>
            <select
              className={inputClass}
              defaultValue={settings.characterShape}
              id="characterShape"
              name="characterShape"
            >
              <option value="ghost">Ghost</option>
              <option value="blob">Blob</option>
              <option value="orbit">Orbit</option>
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="characterExpression">
              Character expression
            </label>
            <select
              className={inputClass}
              defaultValue={settings.characterExpression}
              id="characterExpression"
              name="characterExpression"
            >
              <option value="smile">Smile</option>
              <option value="calm">Calm</option>
              <option value="wink">Wink</option>
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="characterAccessory">
              Character accessory
            </label>
            <select
              className={inputClass}
              defaultValue={settings.characterAccessory}
              id="characterAccessory"
              name="characterAccessory"
            >
              <option value="none">No accessory</option>
              <option value="headphones">Headphones</option>
              <option value="glasses">Glasses</option>
              <option value="beanie">Beanie</option>
            </select>
          </div>
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-5 has-checked:border-[#ca9aff]/70">
        <input
          className="mt-0.5 size-5 accent-[#a855f7]"
          defaultChecked={settings.motionEnabled}
          name="motionEnabled"
          type="checkbox"
        />
        <span>
          <span className="block text-sm font-bold text-white">
            Allow subtle room animation
          </span>
          <span className="mt-1 block text-xs leading-5 text-white/45">
            System reduced-motion settings always take priority.
          </span>
        </span>
      </label>

      <SubmitButton pendingLabel="Saving room…">Save My Room</SubmitButton>
    </form>
  );
}
