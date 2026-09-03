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
    mood: string;
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
    spotlightCategory: string;
    spotlightTitle: string;
    spotlightDescription: string;
    spotlightUrl: string;

    currentGame: string;
    currentGameDescription: string;
    currentGameUrl: string;

    currentReading: string;
    currentReadingDescription: string;
    currentReadingUrl: string;

    currentFood: string;
    currentFoodDescription: string;
    currentFoodUrl: string;

    profileSongTitle: string;
    profileSongArtist: string;
    profileSongUrl: string;
    viewMyLabel: string;
    viewMyUrl: string;
    latestPickCategory: string;
    latestPickTitle: string;
    latestPickNote: string;
    latestPickUrl: string;
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
    <form action={action} className="space-y-6">
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
            maxLength={20}
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
            Display Name
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
          htmlFor="profile-mood"
        >
          Mood
        </label>
        <input
          className={inputClass}
          defaultValue={profile.mood}
          id="profile-mood"
          maxLength={40}
          name="mood"
          placeholder="Inspired, cozy, chaotic…"
        />
        <FieldMessage
          error={firstFieldError(state, "mood")}
          hint="Optional. This stays visible until you change or clear it."
        />
      </div>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="profile-avatar"
        >
          Profile Photo
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="featured-profile-image"
          >
            Featured Photo 1
          </label>

          <input
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
            id="featured-profile-image"
            name="featuredProfileImage"
            type="file"
          />

          <FieldMessage hint="JPG, PNG, or WebP, up to 5 MB." />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-bold text-white"
            htmlFor="featured-profile-image-2"
          >
            Featured Photo 2
          </label>

          <input
            accept="image/jpeg,image/png,image/webp"
            className={inputClass}
            id="featured-profile-image-2"
            name="featuredProfileImage2"
            type="file"
          />

          <FieldMessage hint="JPG, PNG, or WebP, up to 5 MB." />
        </div>
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
          Profile Accent Color
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
          Featured Music
        </legend>

        <p className="mb-5 text-xs leading-5 text-white/45">
          Share the song you&apos;re listening to right now, a favorite track,
          or a link to a playlist.
        </p>

        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="profile-song-title"
            >
              Song Title
            </label>

            <input
              className={inputClass}
              defaultValue={profile.profileSongTitle}
              id="profile-song-title"
              maxLength={100}
              name="profileSongTitle"
              placeholder="What song are you playing?"
            />

            <FieldMessage
              error={firstFieldError(state, "profileSongTitle")}
              hint="Up to 100 characters."
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="profile-song-artist"
            >
              Artist
            </label>

            <input
              className={inputClass}
              defaultValue={profile.profileSongArtist}
              id="profile-song-artist"
              maxLength={100}
              name="profileSongArtist"
              placeholder="Artist name"
            />

            <FieldMessage
              error={firstFieldError(state, "profileSongArtist")}
              hint="Up to 100 characters."
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="profile-song-url"
            >
              Song or Playlist Link
            </label>

            <input
              className={inputClass}
              defaultValue={profile.profileSongUrl}
              id="profile-song-url"
              maxLength={500}
              name="profileSongUrl"
              placeholder="https://open.spotify.com/..."
              type="url"
            />

            <FieldMessage
              error={firstFieldError(state, "profileSongUrl")}
              hint="Optional Spotify, Apple Music, YouTube, or other complete link."
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <legend className="px-2 text-sm font-bold text-white">
          Latest Indulgence
        </legend>

        <p className="mb-5 text-xs leading-5 text-white/45">
          Share something you&apos;re currently into — a game, book, movie,
          food, show, place, product, or anything else you&apos;d recommend.
        </p>

        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="latest-pick-category"
            >
              Category
            </label>

            <input
              className={inputClass}
              defaultValue={profile.latestPickCategory}
              id="latest-pick-category"
              maxLength={40}
              name="latestPickCategory"
              placeholder="Game, Book, Movie, Food..."
            />

            <FieldMessage
              error={firstFieldError(state, "latestPickCategory")}
              hint="Up to 40 characters."
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="latest-pick-title"
            >
              Pick
            </label>

            <input
              className={inputClass}
              defaultValue={profile.latestPickTitle}
              id="latest-pick-title"
              maxLength={100}
              name="latestPickTitle"
              placeholder="What are you recommending?"
            />

            <FieldMessage
              error={firstFieldError(state, "latestPickTitle")}
              hint="Up to 100 characters."
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="latest-pick-note"
            >
              Short Note
            </label>

            <textarea
              className={`${inputClass} min-h-24`}
              defaultValue={profile.latestPickNote}
              id="latest-pick-note"
              maxLength={240}
              name="latestPickNote"
              placeholder="Why is this your latest pick?"
            />

            <FieldMessage
              error={firstFieldError(state, "latestPickNote")}
              hint="Optional. Up to 240 characters."
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="latest-pick-url"
            >
              Link
            </label>

            <input
              className={inputClass}
              defaultValue={profile.latestPickUrl}
              id="latest-pick-url"
              maxLength={500}
              name="latestPickUrl"
              placeholder="https://..."
              type="url"
            />

            <FieldMessage
              error={firstFieldError(state, "latestPickUrl")}
              hint="Optional complete link."
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <legend className="px-2 text-sm font-bold text-white">Currently</legend>

        <p className="mb-5 text-xs leading-5 text-white/45">
          Share a few things that are part of your world right now.
        </p>

        <div className="space-y-4">
          <div>
            <label
              className="mb-2 block text-xs font-bold text-white/55"
              htmlFor="spotlight-category"
            >
              Focus Category
            </label>

            <input
              className={inputClass}
              defaultValue={profile.spotlightCategory}
              id="spotlight-category"
              maxLength={40}
              name="spotlightCategory"
              placeholder="Lifestyle, Work, Fitness, Creative..."
            />

            <FieldMessage
              error={firstFieldError(state, "spotlightCategory")}
              hint="Optional. Up to 40 characters."
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="spotlight-description">
              Spotlight Description
            </label>
            <textarea
              className={`${inputClass} min-h-24`}
              defaultValue={profile.spotlightDescription}
              id="spotlight-description"
              maxLength={240}
              name="spotlightDescription"
              placeholder="Give us a short description for why you're selecting this spotlight!"
            />
            <FieldMessage
              error={firstFieldError(state, "spotlightDescription")}
              hint="Up to 240 characters."
            />
          </div>

          <div>
            <label className="sr-only" htmlFor="spotlight-url">
              Spotlight Link
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

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="space-y-4">
            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-game"
              >
                Current Game
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentGame}
                id="current-game"
                maxLength={100}
                name="currentGame"
                placeholder="Cyberpunk 2077"
              />

              <FieldMessage
                error={firstFieldError(state, "currentGame")}
                hint="What are you playing right now?"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-game-description"
              >
                Game Subtitle
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentGameDescription}
                id="current-game-description"
                maxLength={240}
                name="currentGameDescription"
                placeholder="Night City has me in a chokehold."
              />

              <FieldMessage
                error={firstFieldError(state, "currentGameDescription")}
                hint="Optional short note."
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-game-url"
              >
                Game Link
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentGameUrl}
                id="current-game-url"
                name="currentGameUrl"
                placeholder="https://..."
                type="url"
              />

              <FieldMessage
                error={firstFieldError(state, "currentGameUrl")}
                hint="Optional link."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-reading"
              >
                Current Book / Blog
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentReading}
                id="current-reading"
                maxLength={100}
                name="currentReading"
                placeholder="What are you reading?"
              />

              <FieldMessage
                error={firstFieldError(state, "currentReading")}
                hint="Book, article, blog, newsletter, etc."
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-reading-description"
              >
                Reading Subtitle
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentReadingDescription}
                id="current-reading-description"
                maxLength={240}
                name="currentReadingDescription"
                placeholder="I cannot put this down."
              />

              <FieldMessage
                error={firstFieldError(state, "currentReadingDescription")}
                hint="Optional short note."
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-reading-url"
              >
                Reading Link
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentReadingUrl}
                id="current-reading-url"
                name="currentReadingUrl"
                placeholder="https://..."
                type="url"
              />

              <FieldMessage
                error={firstFieldError(state, "currentReadingUrl")}
                hint="Optional link."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-food"
              >
                Current Food
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentFood}
                id="current-food"
                maxLength={100}
                name="currentFood"
                placeholder="Sushi, tacos, ramen..."
              />

              <FieldMessage
                error={firstFieldError(state, "currentFood")}
                hint="What are you eating or craving lately?"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-food-description"
              >
                Food Subtitle
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentFoodDescription}
                id="current-food-description"
                maxLength={240}
                name="currentFoodDescription"
                placeholder="Extra parmesan. Always."
              />

              <FieldMessage
                error={firstFieldError(state, "currentFoodDescription")}
                hint="Optional short note."
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-bold text-white/55"
                htmlFor="current-food-url"
              >
                Food Link
              </label>

              <input
                className={inputClass}
                defaultValue={profile.currentFoodUrl}
                id="current-food-url"
                name="currentFoodUrl"
                placeholder="https://..."
                type="url"
              />

              <FieldMessage
                error={firstFieldError(state, "currentFoodUrl")}
                hint="Optional link."
              />
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <legend className="px-2 text-sm font-bold text-white">View My</legend>
        <p className="mb-5 text-xs leading-5 text-white/45">
          Feature one outside link you want visitors to click right now.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="view-my-label">
              View My label
            </label>
            <input
              className={inputClass}
              defaultValue={profile.viewMyLabel}
              id="view-my-label"
              maxLength={50}
              name="viewMyLabel"
              placeholder="Latest Video"
            />
            <FieldMessage
              error={firstFieldError(state, "viewMyLabel")}
              hint="Examples: Twitch, Portfolio, Substack, Shop."
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="view-my-url">
              View My URL
            </label>
            <input
              className={inputClass}
              defaultValue={profile.viewMyUrl}
              id="view-my-url"
              maxLength={500}
              name="viewMyUrl"
              placeholder="https://example.com"
              type="url"
            />
            <FieldMessage
              error={firstFieldError(state, "viewMyUrl")}
              hint="Add both fields, or leave both blank."
            />
          </div>
        </div>
      </fieldset>
      <div>
        <label
          className="mb-2 block text-sm font-bold text-white"
          htmlFor="profile-visibility"
        >
          Profile Visibility
        </label>
        <select
          className={inputClass}
          defaultValue={profile.visibility}
          id="profile-visibility"
          name="visibility"
        >
          <option value="public">Public</option>
          <option value="members">SIGNAL Members</option>
          <option value="private">Friends Only</option>
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
            Help People Find Me
          </span>
          <span className="mt-1 block text-xs leading-5 text-white/45">
            Include your profile in people search and relevant community
            recommendations.
          </span>
        </span>
      </label>
      <SubmitButton pendingLabel="Saving To Profile…">
        Save Profile & Background
      </SubmitButton>
    </form>
  );
}
