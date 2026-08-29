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
  const [floorColor, setFloorColor] = useState(settings.floorColor ?? "#4a403c");
const [couchColor, setCouchColor] = useState(settings.couchColor ?? "#4a4048");
const [bookshelfColor, setBookshelfColor] = useState(
  settings.bookshelfColor ?? "#594139",
);
const [tvColor, setTvColor] = useState(settings.tvColor ?? "#262329");
const [doorColor, setDoorColor] = useState(settings.doorColor ?? "#4a3935");
const [accessoryColor, setAccessoryColor] = useState(
  settings.accessoryColor ?? "#5a5059",
);

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
            Make Room View My Default
          </span>
          <span className="mt-1 block text-xs leading-5 text-white/45">
            Visitors can always switch to the accessible Quick View.
          </span>
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <ColorField
          label="Room Wall Color"
          name="wallColor"
          onChange={setWallColor}
          value={wallColor}
        />
<ColorField
  label="Floor Color"
  name="floorColor"
  onChange={setFloorColor}
  value={floorColor}
/>

<ColorField
  label="Couch & Chair Color"
  name="couchColor"
  onChange={setCouchColor}
  value={couchColor}
/>

<ColorField
  label="Bookshelf Color"
  name="bookshelfColor"
  onChange={setBookshelfColor}
  value={bookshelfColor}
/>

<ColorField
  label="TV & Console Color"
  name="tvColor"
  onChange={setTvColor}
  value={tvColor}
/>

<ColorField
  label="Door & Window Trim Color"
  name="doorColor"
  onChange={setDoorColor}
  value={doorColor}
/>

<ColorField
  label="Accessory & Decor Color"
  name="accessoryColor"
  onChange={setAccessoryColor}
  value={accessoryColor}
/>

        <ColorField
          label="Character Color"
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
            <option value="cosmic">Cosmic Glow</option>
            <option value="warm">Warm Evening</option>
            <option value="daylight">Soft Daylight</option>
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
          Room Character
        </legend>
        <p className="mb-5 text-xs leading-5 text-white/45">
          The blob stays one friendly shape for now. Combine one head, face, and
          neck accessory when the choices are compatible.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="headAccessory"
            >
              Head
            </label>
            <select
              className={inputClass}
              defaultValue={settings.headAccessory}
              id="headAccessory"
              name="headAccessory"
            >
              <option value="none">None</option>
              <option value="headphones">Headphones</option>
              <option value="beanie">Beanie</option>
              <option value="bow">Hair bow</option>
              <option value="hat">Hat</option>
              <option value="crown">Crown</option>
              <option value="flower">Flower</option>
              <option value="headband">Headband</option>
            </select>
          </div>
          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="faceAccessory"
            >
              Face
            </label>
            <select
              className={inputClass}
              defaultValue={settings.faceAccessory}
              id="faceAccessory"
              name="faceAccessory"
            >
              <option value="none">None</option>
              <option value="glasses">Glasses</option>
              <option value="sunglasses">Sunglasses</option>
            </select>
          </div>
          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="neckAccessory"
            >
              Neck
            </label>
            <select
              className={inputClass}
              defaultValue={settings.neckAccessory}
              id="neckAccessory"
              name="neckAccessory"
            >
              <option value="none">None</option>
              <option value="scarf">Scarf</option>
              <option value="bandana">Bandana</option>
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
            Allow Subtle Room Animation
          </span>
          <span className="mt-1 block text-xs leading-5 text-white/45">
            System reduced-motion settings always take priority.
          </span>
        </span>
      </label>

      <SubmitButton pendingLabel="Saving Room…">Save My Room</SubmitButton>
    </form>
  );
}
