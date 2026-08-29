"use client";

import Link from "next/link";
import {
  House,
  Images,
  LampDesk,
  LinkIcon,
  Monitor,
  Moon,
  Music2,
  Radio,
  Sparkles,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export type ProfileRoomSettings = {
  enabled: boolean;
  wallColor: string;
  lightingTheme: "cosmic" | "warm" | "daylight" | "midnight";
  currentVibe: "chill" | "focused" | "gaming" | "creative" | "social";
  characterColor: string;
  headAccessory:
    | "none"
    | "headphones"
    | "beanie"
    | "bow"
    | "hat"
    | "crown"
    | "flower"
    | "headband";
  faceAccessory: "none" | "glasses" | "sunglasses";
  neckAccessory: "none" | "scarf" | "bandana";
  motionEnabled: boolean;

// Layer colors for the new illustrated room.
floorColor?: string | null;
couchColor?: string | null;
bookshelfColor?: string | null;
tvColor?: string | null;
doorColor?: string | null;
accessoryColor?: string | null;
};

export type RoomConnection = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

type HouseTheme = "day" | "night";
type ThemePreference = "auto" | HouseTheme;
type RoomFeatureKey =
  | "signal"
  | "focus"
  | "latest"
  | "friends"
  | "music"
  | "featured"
  | "socials";

const roomFeatureLabels: Record<RoomFeatureKey, string> = {
  signal: "Current Signal",
  focus: "Current Focus",
  latest: "Latest Pick",
  friends: "Friend Spotlight",
  music: "Music",
  featured: "Featured Profile Image",
  socials: "Social Links",
};

const ROOM_ASSETS = {
  base: "/images/modules/base.png",

masks: {
  walls: "/images/modules/wall.png",
  floor: "/images/modules/floor.png",
  couches: "/images/modules/couches.png",
  bookshelves: "/images/modules/bookshelves.png",
  tv: "/images/modules/tv.png",
  doors: "/images/modules/doors.png",
  accessories: "/images/modules/accessories.png",
},
} as const;

function safeHex(value: string | null | undefined, fallback: string) {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function MaskTint({
  color,
  maskUrl,
  opacity = 0.72,
}: {
  color: string;
  maskUrl: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundColor: color,
        maskImage: `url(${maskUrl})`,
        WebkitMaskImage: `url(${maskUrl})`,
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        mixBlendMode: "color",
        opacity,
      }}
    />
  );
}

function Hotspot({
  label,
  style,
  accentColor,
  children,
  onClick,
}: {
  label: string;
  style: CSSProperties;
  accentColor: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
className="group absolute z-20 inline-flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/75 shadow-md backdrop-blur-xl transition duration-200 hover:scale-110 hover:border-white/60 hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transform-none"
      onClick={onClick}
      style={{ ...style, boxShadow: `0 0 0 2px ${accentColor}55` }}
      title={label}
      type="button"
    >
      {children}
      <span className="pointer-events-none absolute top-full mt-2 hidden rounded-full bg-black/90 px-3 py-1 text-[.65rem] font-bold whitespace-nowrap group-hover:block group-focus-visible:block">
        {label}
      </span>
    </button>
  );
}

function Frame({ connection }: { connection: RoomConnection }) {
  return (
    <Link
      aria-label={`Visit ${connection.displayName}'s room`}
      className="group block min-w-0 rounded-xl border border-white/15 bg-black/30 p-2 text-center transition outline-none hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white motion-reduce:transform-none"
      href={`/home/profiles/${connection.username}`}
    >
      <span
        className="mx-auto block size-11 rounded-full bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center"
        style={
          connection.avatarUrl
            ? {
                backgroundImage: `url(${JSON.stringify(connection.avatarUrl).slice(1, -1)})`,
              }
            : undefined
        }
      />
      <span className="mt-1 block truncate text-[0.65rem] font-bold text-white/75">
        {connection.displayName}
      </span>
    </Link>
  );
}

function DetailBlock({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="min-h-[160px] rounded-[1.5rem] border bg-black/70 p-6 text-center backdrop-blur-md"
      style={{ borderColor: "var(--room-accent)" }}
    >
      <h4 className="flex items-center justify-center gap-2 font-bold text-white">
        {icon}
        {title}
      </h4>
      <div className="mt-3 text-sm leading-6 text-white/65">{children}</div>
    </section>
  );
}

function RoomScene({
  settings,
  accentColor,
  theme,
  displayName,
  onOpen,
}: {
  settings: ProfileRoomSettings;
  accentColor: string;
  theme: HouseTheme;
  displayName: string;
  onOpen: (feature: RoomFeatureKey) => void;
}) {
  const wallColor = safeHex(settings.wallColor, "#262128");
const floorColor = safeHex(settings.floorColor, "#4a403c");
const couchColor = safeHex(settings.couchColor, "#4a4048");
const bookshelfColor = safeHex(settings.bookshelfColor, "#594139");
const tvColor = safeHex(settings.tvColor, "#262329");
const doorColor = safeHex(settings.doorColor, "#4a3935");
const accessoryColor = safeHex(settings.accessoryColor, "#5a5059");

  return (
    <div
      aria-label={`${displayName}'s interactive profile room`}
className="relative aspect-[16/9] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.025] shadow-[0_35px_100px_rgba(0,0,0,.28)] backdrop-blur-xl"
      role="img"
    >
{/* 1. FLOOR */}
<img
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-contain"
  src="/images/modules/floor.png"
/>

<MaskTint
  color={floorColor}
  maskUrl={ROOM_ASSETS.masks.floor}
  opacity={0.55}
/>

{/* 2. WALL */}
<img
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-contain"
  src="/images/modules/wall.png"
/>

<MaskTint
  color={wallColor}
  maskUrl={ROOM_ASSETS.masks.walls}
  opacity={0.65}
/>

{/* 3. DOORS / WINDOWS */}
<img
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-contain"
  src="/images/modules/doors.png"
/>

<MaskTint
  color={doorColor}
  maskUrl={ROOM_ASSETS.masks.doors}
  opacity={0.5}
/>

{/* 4. BOOKSHELVES */}
<img
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-contain"
  src="/images/modules/bookshelves.png"
/>

<MaskTint
  color={bookshelfColor}
  maskUrl={ROOM_ASSETS.masks.bookshelves}
  opacity={0.55}
/>

{/* 5. TV / CONSOLE */}
<img
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-contain"
  src="/images/modules/tv.png"
/>

<MaskTint
  color={tvColor}
  maskUrl={ROOM_ASSETS.masks.tv}
  opacity={0.5}
/>

{/* 6. COUCHES / CHAIRS / TABLE */}
<img
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-contain"
  src="/images/modules/couches.png"
/>

<MaskTint
  color={couchColor}
  maskUrl={ROOM_ASSETS.masks.couches}
  opacity={0.6}
/>

{/* 7. ACCESSORIES / DECOR */}
<img
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-contain"
  src="/images/modules/accessories.png"
/>

<MaskTint
  color={accessoryColor}
  maskUrl={ROOM_ASSETS.masks.accessories}
  opacity={0.45}
/>

      {/* Viewer-local day/night atmosphere. The candles remain warm and untouched. */}
      {theme === "day" ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(189,225,255,.12),rgba(255,235,188,.05)_46%,rgba(255,255,255,0)_78%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[8%] left-[30%] z-[4] h-[53%] w-[26%] rounded-[12%] bg-[#bfe4ff]/14 blur-[18px]"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[3] bg-[linear-gradient(180deg,rgba(3,7,18,.08),rgba(8,5,18,.16))]"
        />
      )}


{/* TV — Music */}
<Hotspot
  accentColor={accentColor}
  label="Open Featured Music"
  onClick={() => onOpen("music")}
  style={{ left: "34%", top: "34%" }}
>
  <Music2 aria-hidden="true" className="size-4" />
</Hotspot>

{/* Bookshelves — Latest Pick */}
<Hotspot
  accentColor={accentColor}
  label="Open Latest Pick"
  onClick={() => onOpen("latest")}
  style={{ left: "35%", top: "16%" }}
>
  <Sparkles aria-hidden="true" className="size-4" />
</Hotspot>

{/* Coffee table — Current Signal */}
<Hotspot
  accentColor={accentColor}
  label="Open Current Signal"
  onClick={() => onOpen("signal")}
  style={{ left: "53%", top: "52%" }}
>
  <Radio aria-hidden="true" className="size-4" />
</Hotspot>

{/* Lounge chair — Current Focus */}
<Hotspot
  accentColor={accentColor}
  label="Open Current Focus"
  onClick={() => onOpen("focus")}
  style={{ left: "48%", top: "39%" }}
>
  <LampDesk aria-hidden="true" className="size-4" />
</Hotspot>

{/* Wall display — Featured image */}
<Hotspot
  accentColor={accentColor}
  label="Open Featured Profile Image"
  onClick={() => onOpen("featured")}
  style={{ left: "27%", top: "29%" }}
>
  <Images aria-hidden="true" className="size-4" />
</Hotspot>

<Hotspot
  accentColor={accentColor}
  label="Open Social Links"
  onClick={() => onOpen("socials")}
  style={{ left: "60%", top: "69%" }}
>
  <LinkIcon aria-hidden="true" className="size-4" />
</Hotspot>

{/* Right chair — Friends */}
<Hotspot
  accentColor={accentColor}
  label="Open Friend Spotlight"
  onClick={() => onOpen("friends")}
  style={{ left: "69%", top: "55%" }}
>
  <UsersRound aria-hidden="true" className="size-4" />
</Hotspot>
    </div>
  );
}

export function ProfileRoom({
  settings,
  accentColor,
  featuredProfileImageUrl,
  displayName,
  bio,
  statusText,
  statusCountdown,
  song,
  spotlight,
  latestPick,
  featuredConnections,
  isOwner = false,
}: {
  settings: ProfileRoomSettings;
  accentColor: string;
  featuredProfileImageUrl: string | null;
  displayName: string;
  bio: string | null;
  statusText: string | null;
  statusCountdown?: ReactNode;
  song: { title: string | null; artist: string | null; url: string | null };
  spotlight: {
    title: string | null;
    description: string | null;
    url: string | null;
  };
  latestPick: {
    category: string | null;
    title: string | null;
    note: string | null;
    url: string | null;
  };
  featuredConnections: RoomConnection[];
  isOwner?: boolean;
}) {
  const [musicArtworkUrl, setMusicArtworkUrl] = useState<string | null>(null);
  const [view, setView] = useState<"room" | "quick">("quick");
  const [selectedFeature, setSelectedFeature] = useState<RoomFeatureKey | null>(null);
  const [localTheme, setLocalTheme] = useState<HouseTheme>("day");
  const [themePreference, setThemePreference] = useState<ThemePreference>("auto");

  const validSongUrl =
    song.url && /^https?:\/\//i.test(song.url) ? song.url : null;

  const musicService = validSongUrl?.includes("music.apple.com")
    ? "apple"
    : validSongUrl?.includes("open.spotify.com")
      ? "spotify"
      : validSongUrl?.includes("youtube.com") || validSongUrl?.includes("youtu.be")
        ? "youtube"
        : "other";

  const musicLinkLabel =
    musicService === "apple"
      ? "Listen on Apple Music"
      : musicService === "spotify"
        ? "Listen on Spotify"
        : musicService === "youtube"
          ? "Watch on YouTube"
          : "Open music link";

  useEffect(() => {
    if (!validSongUrl) {
      setMusicArtworkUrl(null);
      return;
    }

    const controller = new AbortController();

    async function loadMusicMetadata() {
      try {
        const response = await fetch(
          `/api/music-metadata?url=${encodeURIComponent(validSongUrl!)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setMusicArtworkUrl(null);
          return;
        }

        const metadata = (await response.json()) as {
          artworkUrl?: string | null;
        };

        setMusicArtworkUrl(metadata.artworkUrl ?? null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMusicArtworkUrl(null);
      }
    }

    void loadMusicMetadata();
    return () => controller.abort();
  }, [validSongUrl]);

  const theme = themePreference === "auto" ? localTheme : themePreference;

  useEffect(() => {
    let preferenceTimer: number | undefined;

    try {
      const stored = window.localStorage.getItem("signal-room-theme");
      if (stored === "auto" || stored === "day" || stored === "night") {
        preferenceTimer = window.setTimeout(() => setThemePreference(stored), 0);
      }
    } catch {
      // Automatic still works when localStorage is unavailable.
    }

    function refreshLocalTheme() {
      const hour = new Date().getHours();
      setLocalTheme(hour >= 6 && hour < 18 ? "day" : "night");
    }

    refreshLocalTheme();
    const clockTimer = window.setInterval(refreshLocalTheme, 60_000);
    document.addEventListener("visibilitychange", refreshLocalTheme);

    return () => {
      if (preferenceTimer !== undefined) window.clearTimeout(preferenceTimer);
      window.clearInterval(clockTimer);
      document.removeEventListener("visibilitychange", refreshLocalTheme);
    };
  }, []);

  useEffect(() => {
    if (!selectedFeature) return;

    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedFeature(null);
    }

    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [selectedFeature]);

  function chooseTheme(value: ThemePreference) {
    setThemePreference(value);
    try {
      window.localStorage.setItem("signal-room-theme", value);
    } catch {
      // Keep the selection for this page visit.
    }
  }

  const featureDetails: Record<RoomFeatureKey, ReactNode> = {
    signal: (
      <DetailBlock
        icon={<Radio aria-hidden="true" className="size-4" />}
        title="Current Signal"
      >
        {statusText ? <p>{statusText}</p> : <p>{displayName} is between signals right now.</p>}
        {statusCountdown ? (
          <div className="mt-2 text-xs text-white/40">{statusCountdown}</div>
        ) : null}
      </DetailBlock>
    ),

    focus: (
      <DetailBlock
        icon={<LampDesk aria-hidden="true" className="size-4" />}
        title="Current Focus"
      >
        {spotlight.title ? (
          <>
            <p className="font-bold text-white">{spotlight.title}</p>
            {spotlight.description ? <p className="mt-1">{spotlight.description}</p> : null}
            {spotlight.url ? (
              <a
                className="mt-3 inline-flex font-bold hover:underline"
                href={spotlight.url}
                rel="noreferrer"
                style={{ color: accentColor }}
                target="_blank"
              >
                Open Spotlight
              </a>
            ) : null}
          </>
        ) : (
          <p>{displayName} has not added a current focus yet.</p>
        )}
      </DetailBlock>
    ),

    latest: (
      <DetailBlock
        icon={<Sparkles aria-hidden="true" className="size-4" />}
        title="Latest Pick"
      >
        {latestPick.title ? (
          <>
            {latestPick.category ? (
              <p className="text-xs font-bold tracking-[0.14em] text-white/45 uppercase">
                {latestPick.category}
              </p>
            ) : null}
            <p className="mt-2 font-bold text-white">{latestPick.title}</p>
            {latestPick.note ? <p className="mt-2">{latestPick.note}</p> : null}
            {latestPick.url ? (
              <a
                className="mt-3 inline-flex font-bold hover:underline"
                href={latestPick.url}
                rel="noreferrer"
                style={{ color: accentColor }}
                target="_blank"
              >
                View Pick
              </a>
            ) : null}
          </>
        ) : (
          <p>No Latest Pick Yet.</p>
        )}
      </DetailBlock>
    ),

    friends: (
      <DetailBlock
        icon={<UsersRound aria-hidden="true" className="size-4" />}
        title="Friend Spotlight"
      >
        {featuredConnections.length ? (
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
            {featuredConnections.slice(0, 3).map((connection) => (
              <Frame connection={connection} key={connection.id} />
            ))}
          </div>
        ) : (
          <p>No Friends Featured Yet.</p>
        )}
      </DetailBlock>
    ),

    music: (
      <DetailBlock
        icon={<Music2 aria-hidden="true" className="size-4" />}
        title="Music"
      >
        {song.title || song.artist ? (
          <>
            <p className="font-bold text-white">{song.title || "Featured song"}</p>
            {song.artist ? <p className="text-white/50">{song.artist}</p> : null}
            {validSongUrl ? (
              <a
                className="mt-3 inline-flex font-bold hover:underline"
                href={validSongUrl}
                rel="noreferrer"
                style={{ color: accentColor }}
                target="_blank"
              >
                {musicLinkLabel}
              </a>
            ) : null}
          </>
        ) : (
          <p>No Featured Music Yet.</p>
        )}
      </DetailBlock>
    ),

    featured: (
      <DetailBlock
        icon={<Images aria-hidden="true" className="size-4" />}
        title="Featured Profile Image"
      >
        {featuredProfileImageUrl ? (
          <img
            alt={`${displayName}'s featured profile`}
            className="mx-auto mt-2 max-h-[55vh] w-auto max-w-full rounded-[1.25rem] border border-white/10 object-contain"
            src={featuredProfileImageUrl} />
        ) : (
          <p>No Featured Profile Image Yet.</p>
        )}
      </DetailBlock>


    ),
    socials: undefined
  };

  const sceneStyle = {
    "--room-accent": accentColor,
    "--room-wall": settings.wallColor,
  } as CSSProperties;

  return (
    <section className="mt-8" id="my-room" style={sceneStyle}>
      <div
        className="mb-5 flex flex-col gap-5 rounded-[1.75rem] border bg-black/50 p-5 backdrop-blur-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between"
        style={{ borderColor: accentColor }}
      >
        <div className="flex items-center justify-center gap-3 text-center lg:justify-start lg:text-left">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-white/40 uppercase">
              Profile Space
            </p>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {isOwner ? "My Room" : `${displayName}'s Room`}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          <label className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 text-sm font-bold text-white/65">
            {theme === "day" ? (
              <Sun aria-hidden="true" className="size-4 text-[#ffd166]" />
            ) : (
              <Moon aria-hidden="true" className="size-4 text-[#b8c8ff]" />
            )}
            <span className="sr-only">Room light</span>
            <select
              aria-label="Room light"
              className="bg-transparent text-white outline-none"
              onChange={(event) => chooseTheme(event.target.value as ThemePreference)}
              value={themePreference}
            >
              <option className="bg-[#111118]" value="auto">
                Automatic
              </option>
              <option className="bg-[#111118]" value="day">
                Always Day
              </option>
              <option className="bg-[#111118]" value="night">
                Always Night
              </option>
            </select>
          </label>

          <div
            aria-label="Choose profile view"
            className="flex rounded-full border border-white/10 bg-black/45 p-1"
            role="group"
          >
            {(["room", "quick"] as const).map((option) => (
              <button
                aria-pressed={view === option}
                className="min-h-10 rounded-full px-4 text-sm font-bold text-white/55 transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none aria-pressed:bg-white/10 aria-pressed:text-white"
                key={option}
                onClick={() => setView(option)}
                type="button"
              >
                {option === "room" ? "Room View" : "Quick View"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "quick" ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(360px,1.05fr)_minmax(0,1.45fr)]">
          <div className="space-y-4">
            <DetailBlock
              icon={<Radio aria-hidden="true" className="size-4" />}
              title="Current Signal"
            >
              {statusText ? <p>{statusText}</p> : <p>{displayName} is between signals right now.</p>}
              {statusCountdown ? (
                <div className="mt-2 text-xs text-white/40">{statusCountdown}</div>
              ) : null}
            </DetailBlock>

            {spotlight.title ? (
              <DetailBlock
                icon={<LampDesk aria-hidden="true" className="size-4" />}
                title="Current Focus"
              >
                <p className="font-bold text-white">{spotlight.title}</p>
                {spotlight.description ? <p className="mt-1">{spotlight.description}</p> : null}
                {spotlight.url ? (
                  <a
                    className="mt-3 inline-flex font-bold hover:underline"
                    href={spotlight.url}
                    rel="noreferrer"
                    style={{ color: accentColor }}
                    target="_blank"
                  >
                    Open Spotlight
                  </a>
                ) : null}
              </DetailBlock>
            ) : null}

            <DetailBlock
              icon={<Sparkles aria-hidden="true" className="size-4" />}
              title="Latest Pick"
            >
              {latestPick.title ? (
                <>
                  {latestPick.category ? (
                    <p className="text-xs font-bold tracking-[0.14em] text-white/45 uppercase">
                      {latestPick.category}
                    </p>
                  ) : null}
                  <p className="mt-2 font-bold text-white">{latestPick.title}</p>
                  {latestPick.note ? <p className="mt-2 text-white/65">{latestPick.note}</p> : null}
                  {latestPick.url ? (
                    <a
                      className="mt-3 inline-flex font-bold hover:underline"
                      href={latestPick.url}
                      rel="noreferrer"
                      style={{ color: accentColor }}
                      target="_blank"
                    >
                      View Pick
                    </a>
                  ) : null}
                </>
              ) : (
                <p className="text-white/50">
                  Add a book, game, movie, food, or other current favorite.
                </p>
              )}
            </DetailBlock>

            <DetailBlock
              icon={<UsersRound aria-hidden="true" className="size-4" />}
              title="Friend Spotlight"
            >
              {featuredConnections.length ? (
                <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
                  {featuredConnections.slice(0, 3).map((connection) => (
                    <Frame connection={connection} key={connection.id} />
                  ))}
                </div>
              ) : (
                <p>No Friends Featured Yet.</p>
              )}
            </DetailBlock>
          </div>

          <div className="space-y-5 self-start">
            <div
              className="relative overflow-hidden rounded-[1.5rem] border bg-black/35 backdrop-blur-sm"
              style={{ borderColor: accentColor }}
            >
              {featuredProfileImageUrl ? (
                <>
                  <div
                    className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-2xl"
                    style={{ backgroundImage: `url(${featuredProfileImageUrl})` }}
                  />
                  <img
                    alt={`${displayName}'s featured profile`}
                    className="relative z-10 block h-auto w-full object-contain"
                    src={featuredProfileImageUrl}
                  />
                </>
              ) : (
                <div className="flex min-h-[320px] items-center justify-center p-8 text-center">
                  <div>
                    <Images aria-hidden="true" className="mx-auto size-10 text-white/35" />
                    <p className="mt-4 text-sm font-bold text-white/70">
                      Featured Profile Image
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Add a separate image to feature in your Quick View.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DetailBlock
              icon={<Music2 aria-hidden="true" className="size-4" />}
              title="Music"
            >
              {song.title ? (
                <div className="relative overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/[0.03]">
                  <div className="flex flex-col items-center gap-4 p-4 text-center lg:flex-row lg:text-left">
                    <div
                      className="relative flex aspect-square w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/40"
                      style={{ borderColor: "var(--room-accent)" }}
                    >
                      {musicArtworkUrl ? (
                        <img
                          alt={`${song.title ?? "Featured track"} artwork`}
                          className="size-full object-cover"
                          src={musicArtworkUrl}
                        />
                      ) : (
                        <Music2 aria-hidden="true" className="size-10 text-white/25" />
                      )}
                    </div>

<div className="flex flex-wrap justify-center gap-2">
  <a
    href="https://instagram.com/username"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    Instagram
  </a>

  <a
    href="https://tiktok.com/@username"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    TikTok
  </a>

  <a
    href="https://youtube.com/@username"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    YouTube
  </a>

  <a
    href="https://example.com"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    Website
  </a>

  <a
    href="https://linkedin.com/in/username"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    LinkedIn
  </a>

  <a
    href="https://facebook.com/username"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    Facebook
  </a>

  <a
    href="https://twitch.tv/username"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    Twitch
  </a>

  <a
    href="https://linktr.ee/username"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
  >
    One Link
  </a>
</div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold tracking-[0.16em] text-white/40 uppercase">
                        Featured Track
                      </p>
                      <p className="mt-2 truncate text-lg font-bold text-white">{song.title}</p>
                      {song.artist ? (
                        <p className="mt-1 truncate text-sm text-white/55">{song.artist}</p>
                      ) : null}
                      {validSongUrl ? (
                        <a
                          className="relative z-20 mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-bold hover:underline"
                          href={validSongUrl}
                          rel="noopener noreferrer"
                          style={{ color: accentColor }}
                          target="_blank"
                        >
                          {musicLinkLabel}
                        </a>
                      ) : (
                        <p className="mt-4 text-xs text-white/35">
                          Add a valid music link to listen.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-white/50">No featured music yet.</p>
              )}
            </DetailBlock>
          </div>
        </div>
      ) : (
        <RoomScene
          accentColor={accentColor}
          displayName={displayName}
          onOpen={setSelectedFeature}
          settings={settings}
          theme={theme}
        />
      )}

      {isOwner ? (
        <div className="mt-6 flex justify-center">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-black/65 px-7 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,.35)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-[0_16px_35px_rgba(0,0,0,.45)] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none motion-reduce:transform-none"
            href="/account#edit-my-room"
            style={{
              boxShadow: `0 0 0 1px ${accentColor}55, 0 12px 30px rgba(0,0,0,.35)`,
            }}
          >
            <House aria-hidden="true" className="size-4" />
            Edit My Room
          </Link>
        </div>
      ) : null}

      {selectedFeature ? (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedFeature(null);
          }}
          role="presentation"
        >
          <section
            aria-label={`${roomFeatureLabels[selectedFeature]} details`}
            aria-modal="true"
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/15 bg-[#0b0710] p-6 shadow-2xl sm:max-w-xl sm:rounded-[2rem] sm:p-8"
            role="dialog"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="display-type text-3xl text-white">
                {roomFeatureLabels[selectedFeature]}
              </h3>
              <button
                aria-label="Close room detail"
                autoFocus
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                onClick={() => setSelectedFeature(null)}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="mt-6">{featureDetails[selectedFeature]}</div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
