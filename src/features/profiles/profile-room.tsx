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
  chill: { left: "34%", top: "71%" },
  focused: { left: "48%", top: "49%" },
  gaming: { left: "61%", top: "70%" },
  creative: { left: "48%", top: "49%" },
  social: { left: "79%", top: "49%" },
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

function IsoBlock({
  x,
  y,
  width,
  depth,
  height,
  top,
  left,
  right,
  stroke = "#3c3037",
}: {
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
  top: string;
  left: string;
  right: string;
  stroke?: string;
}) {
  const slope = 0.44;
  const a: [number, number] = [x, y];
  const b: [number, number] = [x + width, y + width * slope];
  const c: [number, number] = [x + width - depth, y + (width + depth) * slope];
  const d: [number, number] = [x - depth, y + depth * slope];
  const lowered = (point: [number, number]): [number, number] => [
    point[0],
    point[1] + height,
  ];
  const points = (items: [number, number][]) =>
    items.map((point) => point.join(",")).join(" ");

  return (
    <g stroke={stroke} strokeLinejoin="round" strokeWidth="2">
      <polygon points={points([d, c, lowered(c), lowered(d)])} fill={left} />
      <polygon points={points([b, c, lowered(c), lowered(b)])} fill={right} />
      <polygon points={points([a, b, c, d])} fill={top} />
    </g>
  );
}

function IsoWindow({
  x,
  y,
  width,
  height,
  direction,
  theme,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: "left" | "right";
  theme: HouseTheme;
}) {
  const day = theme === "day";
  const rise = width * 0.44 * (direction === "left" ? -1 : 1);
  const outer = `${x},${y} ${x + width},${y + rise} ${x + width},${
    y + rise + height
  } ${x},${y + height}`;
  const inset = 7;
  const innerWidth = width - inset * 2;
  const innerRise = innerWidth * 0.44 * (direction === "left" ? -1 : 1);
  const innerX = x + inset;
  const innerY =
    y + (direction === "left" ? -inset * 0.44 : inset * 0.44) + inset;
  const inner = `${innerX},${innerY} ${innerX + innerWidth},${
    innerY + innerRise
  } ${innerX + innerWidth},${innerY + innerRise + height - inset * 2} ${
    innerX
  },${innerY + height - inset * 2}`;
  const midX = x + width / 2;
  const midY = y + rise / 2;

  return (
    <g>
      <polygon points={outer} fill="#463942" opacity=".95" />
      <polygon points={inner} fill={day ? "#8ed7f5" : "#07142e"} />
      {day ? (
        <circle
          cx={x + width * 0.72}
          cy={y + rise * 0.72 + 20}
          fill="#fff2a8"
          r="8"
        />
      ) : (
        <g fill="#fff7c8">
          <circle cx={x + width * 0.28} cy={y + rise * 0.28 + 20} r="1.8" />
          <circle cx={x + width * 0.67} cy={y + rise * 0.67 + 34} r="1.4" />
          <circle cx={x + width * 0.82} cy={y + rise * 0.82 + 16} r="1.2" />
        </g>
      )}
      <path
        d={`M${midX} ${midY + 4}v${height - 8}`}
        stroke="#f5ede7"
        strokeWidth="5"
      />
      <polygon points={outer} fill="none" stroke="#312830" strokeWidth="3" />
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
        <linearGradient id="iso-floor" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d7aa7e" />
          <stop offset="1" stopColor="#9b6f52" />
        </linearGradient>
        <linearGradient id="iso-wall-left" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={settings.wallColor} />
          <stop offset="1" stopColor="#c6aeb8" />
        </linearGradient>
        <linearGradient id="iso-wall-right" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={settings.wallColor} />
          <stop offset="1" stopColor="#a58b98" />
        </linearGradient>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="house-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow
            dx="0"
            dy="18"
            floodColor="#09070d"
            floodOpacity=".45"
            stdDeviation="16"
          />
        </filter>
        <filter
          id="furniture-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="7"
            floodColor="#201820"
            floodOpacity=".3"
            stdDeviation="5"
          />
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
      <g filter="url(#house-shadow)">
        {/* One continuous apartment shell. */}
        <polygon
          points="105,342 550,146 1122,398 676,655"
          fill="url(#iso-floor)"
          stroke="#40333d"
          strokeLinejoin="round"
          strokeWidth="10"
        />
        <polygon
          points="105,342 550,146 550,49 105,245"
          fill="url(#iso-wall-left)"
        />
        <polygon
          points="550,146 1122,398 1122,301 550,49"
          fill="url(#iso-wall-right)"
        />
        <path
          d="M105 245 550 49 1122 301"
          fill="none"
          stroke="#4a3945"
          strokeWidth="9"
        />
        <path
          d="M105 342 550 146 1122 398"
          fill="none"
          stroke="#55414e"
          strokeWidth="7"
        />
        <path d="M550 49v97" stroke="#4a3945" strokeWidth="9" />

        <IsoWindow
          direction="left"
          height={68}
          theme={theme}
          width={102}
          x={162}
          y={245}
        />
        <IsoWindow
          direction="left"
          height={62}
          theme={theme}
          width={88}
          x={356}
          y={159}
        />
        <IsoWindow
          direction="right"
          height={64}
          theme={theme}
          width={94}
          x={632}
          y={93}
        />
        <IsoWindow
          direction="right"
          height={64}
          theme={theme}
          width={94}
          x={891}
          y={207}
        />

        {/* Subtle flooring zones flow together instead of forming room cards. */}
        <polygon
          points="128,350 334,260 517,341 308,439"
          fill="#d9b18c"
          opacity=".65"
        />
        <polygon
          points="338,455 534,369 736,458 535,550"
          fill="#b8796d"
          opacity=".32"
        />
        <polygon
          points="708,463 905,376 1084,455 883,570"
          fill="#d9c6a8"
          opacity=".5"
        />
        <path
          d="M122 350 675 650M296 266 850 566M470 181 1024 481"
          stroke="#7f5d49"
          strokeOpacity=".18"
          strokeWidth="2"
        />
        <path
          d="M550 150 1110 398M406 213 965 460M261 278 819 525"
          stroke="#fff8ec"
          strokeOpacity=".14"
          strokeWidth="2"
        />

        {/* Low interior walls create depth without dividing the home into boxes. */}
        <polygon
          points="481,330 644,402 644,337 481,265"
          fill={settings.wallColor}
          stroke="#4a3945"
          strokeWidth="4"
        />
        <polygon
          points="644,402 680,386 680,321 644,337"
          fill="#967b87"
          stroke="#4a3945"
          strokeWidth="4"
        />
        <polygon
          points="731,374 842,325 842,260 731,309"
          fill={settings.wallColor}
          stroke="#4a3945"
          strokeWidth="4"
        />
        <polygon
          points="842,325 875,340 875,275 842,260"
          fill="#967b87"
          stroke="#4a3945"
          strokeWidth="4"
        />
      </g>

      {!day ? (
        <>
          <ellipse
            cx="552"
            cy="300"
            rx="105"
            ry="65"
            fill={interiorLight}
            opacity=".18"
            filter="url(#soft-glow)"
          />
          <ellipse
            cx="937"
            cy="474"
            rx="120"
            ry="70"
            fill="#ffbf69"
            opacity=".16"
            filter="url(#soft-glow)"
          />
          <ellipse
            cx="333"
            cy="514"
            rx="95"
            ry="58"
            fill={accentColor}
            opacity=".14"
            filter="url(#soft-glow)"
          />
        </>
      ) : (
        <>
          <path
            d="m175 300 212 50-115 54-151-55Z"
            fill="#fff7c7"
            opacity=".2"
          />
          <path
            d="m650 173 204 108-98 45-157-112Z"
            fill="#fff7c7"
            opacity=".17"
          />
          <path
            d="m910 289 180 116-91 52-136-126Z"
            fill="#fff7c7"
            opacity=".16"
          />
        </>
      )}
      <g filter="url(#furniture-shadow)">
        {/* Bedroom: a real bed, side table, lamp and standing mirror. */}
        <IsoBlock
          depth={106}
          height={24}
          left="#735166"
          right="#5c4053"
          top="#a87891"
          width={150}
          x={288}
          y={274}
        />
        <IsoBlock
          depth={96}
          height={14}
          left="#e3d7d2"
          right="#c9bbb7"
          top="#f8f1ed"
          width={132}
          x={280}
          y={257}
        />
        <polygon
          points="185,306 225,288 225,333 185,351"
          fill="#b6d3d8"
          stroke="#eef8f8"
          strokeWidth="5"
        />
        <path d="M205 300v-15" stroke="#5a454d" strokeWidth="4" />
        <IsoBlock
          depth={35}
          height={27}
          left="#6c4936"
          right="#513527"
          top="#8b6045"
          width={38}
          x={149}
          y={337}
        />
        <path d="M164 332v-40" stroke="#c49757" strokeWidth="5" />
        <path
          d="m148 296 17-24 18 24Z"
          fill={day ? "#e7d5af" : "#ffd77a"}
          stroke="#6f583d"
          strokeWidth="3"
        />

        {/* Study and reading nook. */}
        <IsoBlock
          depth={63}
          height={15}
          left="#67432f"
          right="#503222"
          top="#8f603f"
          width={132}
          x={472}
          y={284}
        />
        <path
          d="M437 331v55M562 386v55M604 357v54"
          stroke="#4b3026"
          strokeWidth="8"
        />
        <polygon
          points="486,281 536,303 536,341 486,319"
          fill="#252836"
          stroke="#12141d"
          strokeWidth="4"
        />
        <polygon
          points="492,288 530,305 530,330 492,313"
          fill={accentColor}
          opacity=".7"
        />
        <polygon
          points="586,220 660,252 660,365 586,333"
          fill="#56392d"
          stroke="#3c2822"
          strokeWidth="5"
        />
        {[246, 277, 308, 339].map((y, index) => (
          <g key={y}>
            <path d={`m591 ${y} 64 28`} stroke="#a87551" strokeWidth="5" />
            <path
              d={`m598 ${y - 16} 9 4v18l-9-4Z`}
              fill={index % 2 ? accentColor : "#78b69a"}
            />
            <path d={`m614 ${y - 10} 11 5v18l-11-5Z`} fill="#efc376" />
            <path d={`m632 ${y - 7} 8 4v14l-8-4Z`} fill="#83a8d6" />
          </g>
        ))}
        <path d="M609 378v-46" stroke="#c99b57" strokeWidth="5" />
        <path
          d="m592 337 17-24 18 24Z"
          fill={day ? "#e7d5af" : "#ffd77a"}
          stroke="#6f583d"
          strokeWidth="3"
        />

        {/* Photo and travel wall built into the right side of the apartment. */}
        {[760, 820, 880].map((x, index) => (
          <g key={x}>
            <polygon
              points={`${x},231 ${x + 41},249 ${x + 41},296 ${x},278`}
              fill="#31272f"
            />
            <polygon
              points={`${x + 6},240 ${x + 35},253 ${x + 35},285 ${x + 6},272`}
              fill={index === 1 ? accentColor : "#cab7c5"}
              opacity=".85"
            />
          </g>
        ))}
        <path
          d="M951 306c20 11 38 14 54 11"
          fill="none"
          stroke="#e6c482"
          strokeWidth="4"
        />
        <circle cx="956" cy="308" r="5" fill="#f359d2" />
        <circle cx="981" cy="316" r="5" fill="#8ed7f5" />
        <circle cx="1004" cy="317" r="5" fill="#ffd166" />
        <IsoBlock
          depth={42}
          height={18}
          left="#5c3d2f"
          right="#493025"
          top="#825b45"
          width={108}
          x={846}
          y={354}
        />

        {/* Living and music area. */}
        <IsoBlock
          depth={76}
          height={40}
          left="#69516d"
          right="#55415a"
          top="#846889"
          width={148}
          x={318}
          y={474}
        />
        <IsoBlock
          depth={42}
          height={42}
          left="#806286"
          right="#624c69"
          top="#96769c"
          width={128}
          x={317}
          y={451}
        />
        <IsoBlock
          depth={45}
          height={54}
          left="#493128"
          right="#38241f"
          top="#694637"
          width={50}
          x={204}
          y={492}
        />
        <ellipse
          cx="227"
          cy="536"
          rx="21"
          ry="14"
          fill="#15151d"
          stroke={accentColor}
          strokeWidth="4"
        />
        <ellipse cx="227" cy="536" rx="7" ry="5" fill="#d6d0ca" />
        <IsoBlock
          depth={54}
          height={15}
          left="#75513c"
          right="#5b3d2e"
          top="#9a7054"
          width={76}
          x={390}
          y={558}
        />

        {/* Gaming area with an angled screen and console cabinet. */}
        <polygon
          points="574,456 716,518 716,600 574,538"
          fill="#242735"
          stroke="#11131c"
          strokeWidth="6"
        />
        <polygon points="587,468 704,519 704,580 587,529" fill="#0a1020" />
        <path
          d="m610 505 69 30"
          stroke={accentColor}
          strokeOpacity=".75"
          strokeWidth="5"
        />
        <IsoBlock
          depth={49}
          height={31}
          left="#3b2e35"
          right="#2d2329"
          top="#59434d"
          width={148}
          x={579}
          y={589}
        />
        <ellipse cx="632" cy="631" rx="11" ry="7" fill={accentColor} />
        <path
          d="m672 622 33 15"
          stroke="#15151d"
          strokeLinecap="round"
          strokeWidth="12"
        />

        {/* Kitchen wraps naturally around the far-right edge. */}
        <IsoBlock
          depth={70}
          height={38}
          left="#946c51"
          right="#72513d"
          top="#e3ddd4"
          width={177}
          x={869}
          y={438}
        />
        <IsoBlock
          depth={62}
          height={116}
          left="#b9c0c4"
          right="#8f999f"
          top="#e2e6e8"
          width={74}
          x={1011}
          y={398}
        />
        <path
          d="m967 471 39 17M961 491l39 17"
          stroke="#7e858a"
          strokeWidth="4"
        />
        <circle cx="1027" cy="493" r="4" fill="#59616a" />
        <path
          d="M905 456v-28c0-18 34-18 34 0v43"
          fill="none"
          stroke="#81898e"
          strokeWidth="7"
        />
        <ellipse cx="923" cy="471" rx="22" ry="10" fill="#aeb8bd" />
      </g>
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
              style={{ left: "25%", top: "43%" }}
            >
              <BedDouble aria-hidden="true" className="size-5" />
            </Hotspot>
            <Hotspot
              accentColor={accentColor}
              label="Open study notes and spotlight"
              onClick={() => setSelectedRoom("study")}
              style={{ left: "52%", top: "43%" }}
            >
              <BriefcaseBusiness aria-hidden="true" className="size-5" />
            </Hotspot>
            <Hotspot
              accentColor={accentColor}
              label="Open Friend Spotlight"
              onClick={() => setSelectedRoom("friends")}
              style={{ left: "77%", top: "39%" }}
            >
              <Images aria-hidden="true" className="size-5" />
            </Hotspot>
            <Hotspot
              accentColor={accentColor}
              label="Open featured song"
              onClick={() => setSelectedRoom("living")}
              style={{ left: "19%", top: "70%" }}
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
