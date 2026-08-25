"use client";

import Link from "next/link";
import {
  BedDouble,
  BookOpen,
  BriefcaseBusiness,
  Gamepad2,
  House,
  Images,
  LampDesk,
  Moon,
  Music2,
  Radio,
  Refrigerator,
  Sofa,
  Sparkles,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

type HeadAccessory =
  | "none"
  | "headphones"
  | "beanie"
  | "bow"
  | "hat"
  | "crown"
  | "flower"
  | "headband";

export type ProfileRoomSettings = {
  enabled: boolean;
  wallColor: string;
  lightingTheme: "cosmic" | "warm" | "daylight" | "midnight";
  currentVibe: "chill" | "focused" | "gaming" | "creative" | "social";
  characterColor: string;
  headAccessory: HeadAccessory;
  faceAccessory: "none" | "glasses" | "sunglasses";
  neckAccessory: "none" | "scarf" | "bandana";
  motionEnabled: boolean;
};

export type RoomConnection = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

type RoomKey = "bedroom" | "living" | "study" | "friends";
type HouseTheme = "day" | "night";
type ThemePreference = "auto" | HouseTheme;

const roomLabels: Record<RoomKey, string> = {
  bedroom: "Bedroom",
  living: "Living Room",
  study: "Study",
  friends: "Entryway & Photo Wall",
};

const characterPositions: Record<
  ProfileRoomSettings["currentVibe"],
  { left: string; top: string }
> = {
  chill: { left: "20%", top: "66%" },
  focused: { left: "48%", top: "27%" },
  gaming: { left: "51%", top: "66%" },
  creative: { left: "55%", top: "28%" },
  social: { left: "79%", top: "28%" },
};

function faceColorFor(hex: string) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return "#101018";
  const value = match[1]!;
  const channels = [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
  return luminance < 0.38 ? "#ffffff" : "#101018";
}

function RoomCharacter({ settings }: { settings: ProfileRoomSettings }) {
  const faceColor = faceColorFor(settings.characterColor);
  const head = settings.headAccessory;

  return (
    <svg
      aria-hidden="true"
      className={`h-full w-full drop-shadow-[0_10px_12px_rgba(0,0,0,.35)] ${
        settings.motionEnabled
          ? "animate-[bounce_3.8s_ease-in-out_infinite] motion-reduce:animate-none"
          : ""
      }`}
      viewBox="0 0 80 105"
    >
      <path
        d="M12 88V49c0-21 12-34 28-34s28 13 28 34v39l-9-8-9 8-10-8-10 8-9-8-9 8Z"
        fill={settings.characterColor}
      />
      <circle cx="30" cy="49" fill={faceColor} r="3" />
      <circle cx="50" cy="49" fill={faceColor} r="3" />
      <path
        d="M33 60c4 5 10 5 14 0"
        fill="none"
        stroke={faceColor}
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      {head === "headphones" ? (
        <>
          <path
            d="M20 49c0-25 40-25 40 0"
            fill="none"
            stroke="#11111a"
            strokeWidth="5"
          />
          <rect x="17" y="45" width="8" height="17" rx="4" fill="#11111a" />
          <rect x="55" y="45" width="8" height="17" rx="4" fill="#11111a" />
        </>
      ) : null}
      {head === "beanie" ? (
        <>
          <path d="M17 33c1-19 45-19 46 0H17Z" fill="#171721" />
          <rect x="16" y="29" width="48" height="9" rx="4" fill="#272735" />
        </>
      ) : null}
      {head === "bow" ? (
        <>
          <path d="M35 24 21 16v18l14-7Z" fill="#ffecf9" />
          <path d="m43 24 14-8v18l-14-7Z" fill="#ffecf9" />
          <circle cx="39" cy="25" r="5" fill="#f359d2" />
        </>
      ) : null}
      {head === "hat" ? (
        <>
          <path d="M22 31 27 12h26l5 19Z" fill="#171721" />
          <rect x="14" y="29" width="52" height="7" rx="3.5" fill="#272735" />
        </>
      ) : null}
      {head === "crown" ? (
        <path d="m20 31 3-20 12 11 6-15 7 15 11-11 2 20Z" fill="#ffd166" />
      ) : null}
      {head === "flower" ? (
        <g transform="translate(54 22)">
          <circle cx="0" cy="-7" r="6" fill="#ff8bd8" />
          <circle cx="7" cy="0" r="6" fill="#ff8bd8" />
          <circle cx="0" cy="7" r="6" fill="#ff8bd8" />
          <circle cx="-7" cy="0" r="6" fill="#ff8bd8" />
          <circle r="5" fill="#ffd166" />
        </g>
      ) : null}
      {head === "headband" ? (
        <path
          d="M18 33c5-17 39-17 44 0"
          fill="none"
          stroke="#ffecf9"
          strokeWidth="6"
        />
      ) : null}
      {settings.faceAccessory !== "none" ? (
        <>
          <rect
            x="22"
            y="42"
            width="16"
            height="13"
            rx="4"
            fill={settings.faceAccessory === "sunglasses" ? "#11111a" : "none"}
            stroke="#11111a"
            strokeWidth="3"
          />
          <rect
            x="42"
            y="42"
            width="16"
            height="13"
            rx="4"
            fill={settings.faceAccessory === "sunglasses" ? "#11111a" : "none"}
            stroke="#11111a"
            strokeWidth="3"
          />
          <path d="M38 48h4" stroke="#11111a" strokeWidth="3" />
        </>
      ) : null}
      {settings.neckAccessory === "scarf" ? (
        <>
          <path d="M19 69c13 8 29 8 42 0v10c-14 7-29 7-42 0Z" fill="#f5efe5" />
          <path d="m49 76 9 20-10-3-6-16Z" fill="#f5efe5" />
        </>
      ) : null}
      {settings.neckAccessory === "bandana" ? (
        <path d="M18 69c14 9 30 9 44 0L40 94Z" fill="#ef4444" />
      ) : null}
    </svg>
  );
}

function HouseWindow({
  x,
  y,
  theme,
}: {
  x: number;
  y: number;
  theme: HouseTheme;
}) {
  const day = theme === "day";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="116" height="82" rx="7" fill={day ? "#8fd8ff" : "#08142f"} />
      {!day ? (
        <>
          <circle cx="18" cy="17" r="2" fill="#fff8ca" />
          <circle cx="47" cy="28" r="1.5" fill="#fff8ca" />
          <circle cx="88" cy="14" r="2" fill="#fff8ca" />
          <circle cx="102" cy="38" r="1.5" fill="#fff8ca" />
          <path d="M5 76 28 57l21 19ZM70 76l18-15 23 15Z" fill="#17284b" />
          <circle cx="13" cy="69" r="8" fill="#ffd977" opacity=".45" />
        </>
      ) : (
        <>
          <circle cx="92" cy="21" r="12" fill="#fff2a8" />
          <path d="M0 66 24 46l22 20 19-13 51 13v16H0Z" fill="#69ad78" />
          <path d="M0 72h116v10H0Z" fill="#4f8e62" />
        </>
      )}
      <path d="M58 0v82M0 41h116" stroke="#f7f0e8" strokeWidth="7" />
      <rect
        width="116"
        height="82"
        rx="7"
        fill="none"
        stroke="#3b2d35"
        strokeWidth="8"
      />
    </g>
  );
}

function HouseIllustration({
  settings,
  accentColor,
  theme,
}: {
  settings: ProfileRoomSettings;
  accentColor: string;
  theme: HouseTheme;
}) {
  const day = theme === "day";
  const interiorLight = {
    cosmic: accentColor,
    warm: "#ffd577",
    daylight: "#fff1b8",
    midnight: "#8aa0ff",
  }[settings.lightingTheme];
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 size-full"
      viewBox="0 0 1200 760"
    >
      <defs>
        <linearGradient id="day-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#9bdcff" />
          <stop offset="1" stopColor="#eaf7ff" />
        </linearGradient>
        <linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#07112a" />
          <stop offset="1" stopColor="#151b3d" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b9825a" />
          <stop offset="1" stopColor="#775039" />
        </linearGradient>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect
        width="1200"
        height="760"
        fill={day ? "url(#day-sky)" : "url(#night-sky)"}
      />
      {!day ? (
        <g fill="#fff8ca" opacity=".8">
          {[
            [92, 75],
            [185, 112],
            [310, 62],
            [448, 105],
            [589, 54],
            [748, 91],
            [895, 50],
            [1070, 106],
          ].map(([cx, cy]) => (
            <circle cx={cx} cy={cy} key={`${cx}-${cy}`} r="2" />
          ))}
        </g>
      ) : null}
      <path d="M70 190 600 25l530 165H70Z" fill={day ? "#503642" : "#2b263a"} />
      <path
        d="M93 185 600 48l507 137"
        fill="none"
        stroke={accentColor}
        strokeOpacity=".4"
        strokeWidth="6"
      />
      <rect
        x="70"
        y="178"
        width="1060"
        height="514"
        rx="18"
        fill={settings.wallColor}
      />
      <path d="M70 405h1060" stroke="#33252c" strokeWidth="18" />
      <path d="M408 178v514M758 178v514" stroke="#33252c" strokeWidth="13" />
      <path d="m70 372 1060 0-78 61H148Z" fill="url(#floor)" />
      <path d="m70 638 1060 0-78 54H148Z" fill="url(#floor)" />

      <HouseWindow theme={theme} x={115} y={218} />
      <HouseWindow theme={theme} x={456} y={218} />
      <HouseWindow theme={theme} x={944} y={218} />
      <HouseWindow theme={theme} x={115} y={465} />
      <HouseWindow theme={theme} x={792} y={465} />
      {!day ? (
        <>
          <ellipse
            cx="560"
            cy="345"
            rx="105"
            ry="65"
            fill={interiorLight}
            opacity=".18"
            filter="url(#soft-glow)"
          />
          <ellipse
            cx="940"
            cy="589"
            rx="120"
            ry="70"
            fill="#ffbf69"
            opacity=".16"
            filter="url(#soft-glow)"
          />
          <ellipse
            cx="260"
            cy="579"
            rx="95"
            ry="58"
            fill={accentColor}
            opacity=".14"
            filter="url(#soft-glow)"
          />
        </>
      ) : (
        <>
          <path d="m190 300 180 72-70 0-160-54Z" fill="#fff7c7" opacity=".2" />
          <path d="m510 302 190 70-76 0-170-52Z" fill="#fff7c7" opacity=".18" />
          <path d="m170 548 190 90-86 0-150-66Z" fill="#fff7c7" opacity=".2" />
        </>
      )}

      {/* Bedroom */}
      <rect x="230" y="310" width="145" height="52" rx="12" fill="#6f4961" />
      <rect x="216" y="288" width="52" height="34" rx="17" fill="#f0e8df" />
      <rect x="235" y="326" width="140" height="35" rx="7" fill="#9a6685" />
      <rect x="87" y="319" width="55" height="44" rx="5" fill="#654333" />
      <path d="M111 319v-26" stroke="#d9b36c" strokeWidth="5" />
      <path d="m92 294 19-23 19 23Z" fill={day ? "#ead8ad" : "#ffd577"} />
      <ellipse
        cx="111"
        cy="300"
        rx="38"
        ry="28"
        fill="#ffd577"
        opacity={day ? ".08" : ".25"}
      />
      <rect
        x="325"
        y="205"
        width="56"
        height="76"
        rx="28"
        fill="#b7d5dc"
        stroke="#dceef2"
        strokeWidth="6"
      />

      {/* Study */}
      <rect x="451" y="320" width="178" height="20" rx="4" fill="#694734" />
      <path d="M470 340v32M610 340v32" stroke="#4b3026" strokeWidth="8" />
      <rect x="516" y="286" width="62" height="37" rx="5" fill="#202535" />
      <rect
        x="530"
        y="296"
        width="34"
        height="18"
        rx="2"
        fill={accentColor}
        opacity=".7"
      />
      <rect x="648" y="205" width="82" height="155" rx="4" fill="#55382d" />
      {[222, 255, 288, 321].map((y, index) => (
        <g key={y}>
          <path d={`M655 ${y}h68`} stroke="#a97450" strokeWidth="5" />
          <rect
            x={660 + index * 3}
            y={y - 18}
            width="11"
            height="18"
            fill={index % 2 ? "#8fd8ff" : accentColor}
          />
          <rect
            x={675 + index * 2}
            y={y - 22}
            width="13"
            height="22"
            fill="#e4b86e"
          />
          <rect
            x={691 - index}
            y={y - 15}
            width="10"
            height="15"
            fill="#7cbf8b"
          />
        </g>
      ))}
      <path d="M616 319v-38" stroke="#cfaa65" strokeWidth="5" />
      <path d="m598 284 18-23 18 23Z" fill={day ? "#e3d0a6" : "#ffd577"} />

      {/* Entryway / photo wall */}
      {[806, 866, 926].map((x, index) => (
        <g key={x}>
          <rect
            x={x}
            y={222 + (index % 2) * 20}
            width="44"
            height="55"
            rx="3"
            fill="#31242b"
          />
          <rect
            x={x + 6}
            y={228 + (index % 2) * 20}
            width="32"
            height="35"
            rx="3"
            fill={index === 1 ? accentColor : "#b8a4bd"}
            opacity=".75"
          />
        </g>
      ))}
      <rect x="806" y="320" width="184" height="18" rx="4" fill="#654333" />
      <circle cx="840" cy="309" r="18" fill="#74a275" />
      <rect x="832" y="320" width="16" height="19" fill="#9d6d4a" />

      {/* Living room */}
      <rect x="193" y="567" width="176" height="61" rx="18" fill="#6a526e" />
      <rect x="210" y="535" width="142" height="54" rx="24" fill="#806487" />
      <rect x="94" y="554" width="68" height="78" rx="6" fill="#4f352c" />
      <circle
        cx="128"
        cy="582"
        r="23"
        fill="#15151d"
        stroke={accentColor}
        strokeWidth="4"
      />
      <circle cx="128" cy="582" r="7" fill="#d6d0ca" />
      <path d="M101 552h54" stroke="#b17b52" strokeWidth="7" />

      {/* Gaming area */}
      <rect x="463" y="478" width="236" height="94" rx="8" fill="#202535" />
      <rect x="477" y="491" width="208" height="65" rx="4" fill="#0b1020" />
      <path
        d="M510 525h142"
        stroke={accentColor}
        strokeWidth="5"
        opacity=".65"
      />
      <rect x="493" y="584" width="174" height="41" rx="6" fill="#3b2d35" />
      <circle cx="534" cy="604" r="8" fill={accentColor} />
      <rect x="577" y="595" width="61" height="18" rx="9" fill="#11111a" />

      {/* Kitchen */}
      <rect x="803" y="483" width="91" height="151" rx="7" fill="#d5d9dd" />
      <path d="M803 537h91" stroke="#8b929a" strokeWidth="4" />
      <circle cx="877" cy="520" r="4" fill="#59616a" />
      <circle cx="877" cy="558" r="4" fill="#59616a" />
      <rect x="913" y="548" width="178" height="86" rx="5" fill="#9b7256" />
      <rect x="903" y="534" width="198" height="20" rx="6" fill="#e3ddd4" />
      <path
        d="M969 534v-31c0-18 34-18 34 0v31"
        fill="none"
        stroke="#8a9298"
        strokeWidth="7"
      />
    </svg>
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
      className="group absolute z-20 inline-flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/65 text-white shadow-[0_8px_22px_rgba(0,0,0,.4)] backdrop-blur-sm transition hover:scale-110 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none motion-reduce:transform-none"
      onClick={onClick}
      style={{ ...style, boxShadow: `0 0 0 2px ${accentColor}55` }}
      title={label}
      type="button"
    >
      {children}
      <span className="pointer-events-none absolute top-full mt-2 hidden rounded-full bg-black/85 px-3 py-1 text-[.65rem] font-bold whitespace-nowrap group-hover:block group-focus-visible:block">
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
    <section className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <h4 className="flex items-center gap-2 font-bold text-white">
        {icon}
        {title}
      </h4>
      <div className="mt-3 text-sm leading-6 text-white/65">{children}</div>
    </section>
  );
}

function MobileWindow({ theme }: { theme: HouseTheme }) {
  const day = theme === "day";
  return (
    <div
      aria-hidden="true"
      className={`absolute top-12 right-6 h-24 w-28 overflow-hidden rounded-lg border-8 border-[#3b2d35] ${day ? "bg-[#8fd8ff]" : "bg-[#08142f]"}`}
    >
      {day ? (
        <>
          <span className="absolute top-2 right-3 size-5 rounded-full bg-[#fff2a8]" />
          <span className="absolute inset-x-0 bottom-0 h-8 bg-[#69ad78]" />
        </>
      ) : (
        <>
          <span className="absolute top-3 left-4 size-1 rounded-full bg-white" />
          <span className="absolute top-6 right-5 size-1 rounded-full bg-white" />
          <span className="absolute right-9 bottom-2 size-6 rounded-full bg-[#ffd977]/35 blur-sm" />
        </>
      )}
      <span className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[#f7f0e8]" />
      <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-[#f7f0e8]" />
    </div>
  );
}

function MobileScene({
  label,
  theme,
  settings,
  accentColor,
  icon,
  action,
  children,
  showCharacter = false,
}: {
  label: string;
  theme: HouseTheme;
  settings: ProfileRoomSettings;
  accentColor: string;
  icon: ReactNode;
  action?: { label: string; onClick: () => void };
  children: ReactNode;
  showCharacter?: boolean;
}) {
  return (
    <section
      aria-label={label}
      className={`relative min-h-72 overflow-hidden px-6 py-6 ${theme === "night" ? "shadow-[inset_0_-70px_90px_rgba(4,8,24,.38)]" : "shadow-[inset_0_-45px_65px_rgba(255,241,181,.09)]"}`}
      style={{ backgroundColor: settings.wallColor }}
    >
      <p className="relative z-10 text-xs font-bold tracking-[.18em] text-white/55 uppercase">
        {label}
      </p>
      <MobileWindow theme={theme} />
      {theme === "day" ? (
        <div
          aria-hidden="true"
          className="absolute top-32 right-0 h-24 w-56 -skew-x-12 bg-[#fff7c7]/10"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute right-10 bottom-9 size-28 rounded-full bg-[#ffd577]/10 blur-2xl"
        />
      )}
      <div
        className="absolute bottom-0 left-0 h-16 w-full bg-[#8b6044]"
        aria-hidden="true"
      />
      <div
        className="absolute right-8 bottom-12 text-white/25"
        aria-hidden="true"
      >
        {children}
      </div>
      {showCharacter ? (
        <div className="absolute bottom-11 left-8 z-10 h-24 w-20">
          <RoomCharacter settings={settings} />
        </div>
      ) : null}
      {action ? (
        <button
          className="absolute bottom-6 left-1/2 z-20 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full border border-white/60 bg-black/70 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-sm focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
          onClick={action.onClick}
          style={{ boxShadow: `0 0 0 2px ${accentColor}55` }}
          type="button"
        >
          {icon}
          {action.label}
        </button>
      ) : null}
    </section>
  );
}

export function ProfileRoom({
  settings,
  accentColor,
  displayName,
  bio,
  statusText,
  statusCountdown,
  song,
  spotlight,
  featuredConnections,
  isOwner = false,
}: {
  settings: ProfileRoomSettings;
  accentColor: string;
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
  featuredConnections: RoomConnection[];
  isOwner?: boolean;
}) {
  const [view, setView] = useState<"room" | "quick">(
    settings.enabled ? "room" : "quick",
  );
  const [selectedRoom, setSelectedRoom] = useState<RoomKey | null>(null);
  const [localTheme, setLocalTheme] = useState<HouseTheme>("day");
  const [themePreference, setThemePreference] =
    useState<ThemePreference>("auto");
  const validSongUrl =
    song.url && /^https?:\/\//i.test(song.url) ? song.url : null;
  const theme = themePreference === "auto" ? localTheme : themePreference;

  useEffect(() => {
    let preferenceTimer: number | undefined;
    try {
      const stored = window.localStorage.getItem("signal-room-theme");
      if (stored === "auto" || stored === "day" || stored === "night") {
        preferenceTimer = window.setTimeout(
          () => setThemePreference(stored),
          0,
        );
      }
    } catch {
      // A private browser can block local storage; Automatic still works.
    }

    function refreshLocalTheme() {
      const hour = new Date().getHours();
      setLocalTheme(hour >= 6 && hour < 18 ? "day" : "night");
    }
    refreshLocalTheme();
    const clockTimer = window.setInterval(refreshLocalTheme, 60_000);
    document.addEventListener("visibilitychange", refreshLocalTheme);
    return () => {
      if (preferenceTimer !== undefined) {
        window.clearTimeout(preferenceTimer);
      }
      window.clearInterval(clockTimer);
      document.removeEventListener("visibilitychange", refreshLocalTheme);
    };
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedRoom(null);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [selectedRoom]);

  function chooseTheme(value: ThemePreference) {
    setThemePreference(value);
    try {
      window.localStorage.setItem("signal-room-theme", value);
    } catch {
      // The preference remains active for this page visit.
    }
  }

  const details: Record<RoomKey, ReactNode> = {
    bedroom: (
      <div className="space-y-4">
        <DetailBlock
          icon={<Sparkles aria-hidden="true" className="size-4" />}
          title="Current Vibe"
        >
          <span className="capitalize">{settings.currentVibe}</span>
        </DetailBlock>
        <DetailBlock
          icon={<Radio aria-hidden="true" className="size-4" />}
          title="Current Signal"
        >
          {statusText ? (
            <p>{statusText}</p>
          ) : (
            <p>{displayName} is between signals right now.</p>
          )}
          {statusCountdown ? (
            <div className="mt-2 text-xs text-white/40">{statusCountdown}</div>
          ) : null}
        </DetailBlock>
      </div>
    ),
    living: (
      <DetailBlock
        icon={<Music2 aria-hidden="true" className="size-4" />}
        title="Stereo"
      >
        {song.title || song.artist ? (
          <>
            <p className="font-bold text-white">
              {song.title || "Featured song"}
            </p>
            {song.artist ? (
              <p className="text-white/50">{song.artist}</p>
            ) : null}
            {validSongUrl ? (
              <a
                className="mt-3 inline-flex font-bold hover:underline"
                href={validSongUrl}
                rel="noreferrer"
                style={{ color: accentColor }}
                target="_blank"
              >
                Listen outside SIGNAL
              </a>
            ) : null}
          </>
        ) : (
          <p>The stereo is quiet for now.</p>
        )}
      </DetailBlock>
    ),
    study: (
      <div className="space-y-4">
        <DetailBlock
          icon={<BookOpen aria-hidden="true" className="size-4" />}
          title="Mirror Note"
        >
          <p>{bio || `${displayName} has not left a note here yet.`}</p>
        </DetailBlock>
        {spotlight.title ? (
          <DetailBlock
            icon={<LampDesk aria-hidden="true" className="size-4" />}
            title="On the Desk"
          >
            <p className="font-bold text-white">{spotlight.title}</p>
            {spotlight.description ? (
              <p className="mt-1">{spotlight.description}</p>
            ) : null}
            {spotlight.url ? (
              <a
                className="mt-3 inline-flex font-bold hover:underline"
                href={spotlight.url}
                rel="noreferrer"
                style={{ color: accentColor }}
                target="_blank"
              >
                Open spotlight
              </a>
            ) : null}
          </DetailBlock>
        ) : null}
      </div>
    ),
    friends: (
      <DetailBlock
        icon={<UsersRound aria-hidden="true" className="size-4" />}
        title="Friend Spotlight"
      >
        {featuredConnections.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {featuredConnections.map((connection) => (
              <Frame connection={connection} key={connection.id} />
            ))}
          </div>
        ) : (
          <p>No friend photos are framed here yet.</p>
        )}
      </DetailBlock>
    ),
  };

  const sceneStyle = {
    "--room-accent": accentColor,
    "--room-wall": settings.wallColor,
  } as CSSProperties;

  return (
    <section className="mt-8" id="my-room">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-white/45 uppercase">
            Come on in
          </p>
          <h2 className="display-type mt-1 text-4xl text-white sm:text-5xl">
            My Room
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Explore the little things that make this space feel like{" "}
            {displayName}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-h-12 items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 text-sm font-bold text-white/65">
            {theme === "day" ? (
              <Sun aria-hidden="true" className="size-4 text-[#ffd166]" />
            ) : (
              <Moon aria-hidden="true" className="size-4 text-[#b8c8ff]" />
            )}
            <span className="sr-only">House light</span>
            <select
              aria-label="House light"
              className="bg-transparent text-white outline-none"
              onChange={(event) =>
                chooseTheme(event.target.value as ThemePreference)
              }
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
            className="flex rounded-full border border-white/10 bg-black/55 p-1"
            role="group"
          >
            {(["room", "quick"] as const).map((option) => (
              <button
                aria-pressed={view === option}
                className="min-h-11 rounded-full px-4 text-sm font-bold text-white/55 transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none aria-pressed:bg-white/10 aria-pressed:text-white"
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
        <div
          className="grid gap-4 rounded-[2rem] border bg-black/60 p-5 backdrop-blur-md sm:grid-cols-2 sm:p-7"
          style={{ borderColor: accentColor }}
        >
          {details.bedroom}
          {details.study}
          {details.living}
          {details.friends}
        </div>
      ) : (
        <>
          <div
            className="relative hidden aspect-[16/10] overflow-hidden rounded-[2.25rem] border border-white/15 shadow-[0_35px_100px_rgba(0,0,0,.55)] md:block"
            data-house-theme={theme}
            style={sceneStyle}
          >
            <HouseIllustration
              accentColor={accentColor}
              settings={settings}
              theme={theme}
            />
            <Hotspot
              accentColor={accentColor}
              label="Open bedroom status and vibe"
              onClick={() => setSelectedRoom("bedroom")}
              style={{ left: "24%", top: "43%" }}
            >
              <BedDouble aria-hidden="true" className="size-5" />
            </Hotspot>
            <Hotspot
              accentColor={accentColor}
              label="Open study notes and spotlight"
              onClick={() => setSelectedRoom("study")}
              style={{ left: "54%", top: "42%" }}
            >
              <BriefcaseBusiness aria-hidden="true" className="size-5" />
            </Hotspot>
            <Hotspot
              accentColor={accentColor}
              label="Open Friend Spotlight"
              onClick={() => setSelectedRoom("friends")}
              style={{ left: "77%", top: "37%" }}
            >
              <Images aria-hidden="true" className="size-5" />
            </Hotspot>
            <Hotspot
              accentColor={accentColor}
              label="Open featured song"
              onClick={() => setSelectedRoom("living")}
              style={{ left: "11%", top: "77%" }}
            >
              <Music2 aria-hidden="true" className="size-5" />
            </Hotspot>
            <div
              aria-label={`${displayName}'s room character`}
              className="absolute z-10 h-[13%] w-[7%] min-w-14 transition-[left,top] duration-700 motion-reduce:transition-none"
              role="img"
              style={{
                ...characterPositions[settings.currentVibe],
                transform: "translate(-50%, -50%)",
              }}
            >
              <RoomCharacter settings={settings} />
            </div>
          </div>

          <div
            className="overflow-hidden rounded-[2rem] border border-white/15 md:hidden"
            data-house-theme={theme}
            style={sceneStyle}
          >
            <MobileScene
              accentColor={accentColor}
              action={{
                label: "Bedside status",
                onClick: () => setSelectedRoom("bedroom"),
              }}
              icon={<BedDouble aria-hidden="true" className="size-5" />}
              label="Bedroom"
              settings={settings}
              showCharacter={settings.currentVibe === "chill"}
              theme={theme}
            >
              <BedDouble className="size-32" />
            </MobileScene>
            <MobileScene
              accentColor={accentColor}
              action={{
                label: "Open stereo",
                onClick: () => setSelectedRoom("living"),
              }}
              icon={<Music2 aria-hidden="true" className="size-5" />}
              label="Living Room"
              settings={settings}
              showCharacter={settings.currentVibe === "social"}
              theme={theme}
            >
              <Sofa className="size-36" />
            </MobileScene>
            <MobileScene
              accentColor={accentColor}
              action={{
                label: "Open desk",
                onClick: () => setSelectedRoom("study"),
              }}
              icon={<LampDesk aria-hidden="true" className="size-5" />}
              label="Study"
              settings={settings}
              showCharacter={
                settings.currentVibe === "focused" ||
                settings.currentVibe === "creative"
              }
              theme={theme}
            >
              <BookOpen className="size-32" />
            </MobileScene>
            <MobileScene
              accentColor={accentColor}
              icon={<Gamepad2 aria-hidden="true" className="size-5" />}
              label="Gaming Area"
              settings={settings}
              showCharacter={settings.currentVibe === "gaming"}
              theme={theme}
            >
              <Gamepad2 className="size-32" />
            </MobileScene>
            <MobileScene
              accentColor={accentColor}
              icon={<Refrigerator aria-hidden="true" className="size-5" />}
              label="Kitchen"
              settings={settings}
              theme={theme}
            >
              <Refrigerator className="size-32" />
            </MobileScene>
            <MobileScene
              accentColor={accentColor}
              action={{
                label: "Open photo wall",
                onClick: () => setSelectedRoom("friends"),
              }}
              icon={<Images aria-hidden="true" className="size-5" />}
              label="Entryway & Travel Wall"
              settings={settings}
              theme={theme}
            >
              <Images className="size-32" />
            </MobileScene>
          </div>
        </>
      )}

      {isOwner ? (
        <Link
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-black/50 px-5 py-3 text-sm font-bold text-white transition hover:bg-black/70"
          href="/account#edit-my-room"
        >
          <House aria-hidden="true" className="size-4" />
          Edit My Room
        </Link>
      ) : null}

      {selectedRoom ? (
        <div
          className="fixed inset-0 z-[70] flex items-end bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedRoom(null);
          }}
          role="presentation"
        >
          <section
            aria-label={`${roomLabels[selectedRoom]} details`}
            aria-modal="true"
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-[2rem] border border-white/15 bg-[#0b0710] p-6 shadow-2xl sm:max-w-xl sm:rounded-[2rem] sm:p-8"
            role="dialog"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="display-type text-3xl text-white">
                {roomLabels[selectedRoom]}
              </h3>
              <button
                aria-label="Close room"
                autoFocus
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                onClick={() => setSelectedRoom(null)}
                type="button"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>
            <div className="mt-6">{details[selectedRoom]}</div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
