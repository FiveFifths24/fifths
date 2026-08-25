"use client";

import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  Gamepad2,
  House,
  LampDesk,
  Music2,
  Radio,
  Refrigerator,
  Sofa,
  Sparkles,
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
  characterShape: "ghost" | "blob" | "orbit";
  characterExpression: "smile" | "calm" | "wink";
  characterAccessory: "none" | "headphones" | "glasses" | "beanie";
  motionEnabled: boolean;
};

export type RoomConnection = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

type RoomKey = "bedroom" | "living" | "study" | "friends";

const roomLabels: Record<RoomKey, string> = {
  bedroom: "Bedroom",
  living: "Living room",
  study: "Study",
  friends: "Entryway",
};

const lighting: Record<ProfileRoomSettings["lightingTheme"], string> = {
  cosmic:
    "radial-gradient(circle at 18% 10%, rgba(168,85,247,.3), transparent 34%), radial-gradient(circle at 86% 82%, rgba(243,89,210,.2), transparent 36%)",
  warm: "radial-gradient(circle at 25% 15%, rgba(251,191,36,.28), transparent 40%), linear-gradient(rgba(120,53,15,.1),rgba(0,0,0,.2))",
  daylight:
    "radial-gradient(circle at 78% 8%, rgba(186,230,253,.34), transparent 38%), linear-gradient(rgba(255,255,255,.08),rgba(0,0,0,.12))",
  midnight:
    "radial-gradient(circle at 52% 12%, rgba(30,64,175,.28), transparent 38%), linear-gradient(rgba(2,6,23,.32),rgba(0,0,0,.38))",
};

function RoomCharacter({ settings }: { settings: ProfileRoomSettings }) {
  const accessory = settings.characterAccessory;

  return (
    <svg
      aria-hidden="true"
      className={`h-24 w-20 drop-shadow-[0_10px_12px_rgba(0,0,0,.4)] ${
        settings.motionEnabled
          ? "animate-[bounce_3.6s_ease-in-out_infinite] motion-reduce:animate-none"
          : ""
      }`}
      viewBox="0 0 80 100"
    >
      {accessory === "beanie" ? (
        <path d="M17 31c1-18 45-18 46 0H17Z" fill="#171721" />
      ) : null}
      <path
        d={
          settings.characterShape === "blob"
            ? "M10 71c0-28 9-52 30-52s30 24 30 52c0 12-8 18-18 14l-12-5-12 5C18 89 10 83 10 71Z"
            : settings.characterShape === "orbit"
              ? "M40 16c19 0 32 17 28 37-3 18-13 35-28 35S15 71 12 53c-4-20 9-37 28-37Z"
              : "M12 84V49c0-20 12-33 28-33s28 13 28 33v35l-9-8-9 8-10-8-10 8-9-8-9 8Z"
        }
        fill={settings.characterColor}
      />
      <circle cx="30" cy="49" fill="#08080d" r="3" />
      {settings.characterExpression === "wink" ? (
        <path
          d="M47 49h6"
          stroke="#08080d"
          strokeLinecap="round"
          strokeWidth="3"
        />
      ) : (
        <circle cx="50" cy="49" fill="#08080d" r="3" />
      )}
      {settings.characterExpression === "smile" ? (
        <path
          d="M33 59c4 5 10 5 14 0"
          fill="none"
          stroke="#08080d"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      ) : (
        <path
          d="M35 61h10"
          stroke="#08080d"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      )}
      {accessory === "headphones" ? (
        <>
          <path
            d="M20 49c0-25 40-25 40 0"
            fill="none"
            stroke="#101018"
            strokeWidth="5"
          />
          <rect x="17" y="45" width="8" height="17" rx="4" fill="#101018" />
          <rect x="55" y="45" width="8" height="17" rx="4" fill="#101018" />
        </>
      ) : null}
      {accessory === "glasses" ? (
        <>
          <rect
            x="23"
            y="43"
            width="14"
            height="11"
            rx="4"
            fill="none"
            stroke="#101018"
            strokeWidth="3"
          />
          <rect
            x="43"
            y="43"
            width="14"
            height="11"
            rx="4"
            fill="none"
            stroke="#101018"
            strokeWidth="3"
          />
          <path d="M37 48h6" stroke="#101018" strokeWidth="3" />
        </>
      ) : null}
    </svg>
  );
}

function Frame({ connection }: { connection: RoomConnection }) {
  return (
    <Link
      aria-label={`Visit ${connection.displayName}'s room`}
      className="group block min-w-0 rounded-lg border border-white/20 bg-black/35 p-2 text-center transition outline-none hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white motion-reduce:transform-none"
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
  const validSongUrl =
    song.url && /^https?:\/\//i.test(song.url) ? song.url : null;

  useEffect(() => {
    if (!selectedRoom) return;
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedRoom(null);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [selectedRoom]);

  const openRoom = (room: RoomKey) => setSelectedRoom(room);
  const wallStyle = {
    "--room-accent": accentColor,
    "--room-wall": settings.wallColor,
    backgroundColor: settings.wallColor,
    backgroundImage: lighting[settings.lightingTheme],
  } as CSSProperties;

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
        title="Now Playing"
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
          <p>The record player is quiet for now.</p>
        )}
      </DetailBlock>
    ),
    study: (
      <div className="space-y-4">
        <DetailBlock
          icon={<BookOpen aria-hidden="true" className="size-4" />}
          title="About Me"
        >
          <p>
            {bio || `${displayName} has not left a note on the mirror yet.`}
          </p>
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

  return (
    <section className="mt-8" id="my-room">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-white/45 uppercase">
            Come on in
          </p>
          <h2 className="display-type mt-1 text-4xl text-white sm:text-5xl">
            My Room
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            A small tour through what {displayName} is feeling, playing, and
            keeping close.
          </p>
        </div>
        <div
          className="flex rounded-full border border-white/10 bg-black/55 p-1"
          role="group"
          aria-label="Choose profile view"
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
          <div className="hidden md:block">
            <div
              className="mx-auto h-16 w-[76%] border-x-[11rem] border-b-[4rem] border-x-transparent border-b-black/55"
              aria-hidden="true"
            />
            <div
              className="relative overflow-hidden rounded-[2rem] border-[6px] border-black/60 p-3 shadow-[0_35px_100px_rgba(0,0,0,.55)]"
              style={wallStyle}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black/10 backdrop-saturate-125"
              />
              <div className="relative grid min-h-[650px] grid-cols-2 grid-rows-3 gap-3">
                <button
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-5 text-left transition outline-none hover:border-white/45 hover:bg-black/10 focus-visible:ring-4 focus-visible:ring-white/80"
                  onClick={() => openRoom("bedroom")}
                  type="button"
                >
                  <span className="font-bold text-white">Bedroom</span>
                  <span className="mt-2 block text-sm text-white/55 capitalize">
                    Vibe: {settings.currentVibe}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute right-5 bottom-4 h-14 w-32 rounded-t-3xl border border-white/15 bg-black/25"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute right-8 bottom-16 h-8 w-12 rounded-t-full bg-white/10"
                  />
                  <span className="absolute bottom-4 left-5">
                    <RoomCharacter settings={settings} />
                  </span>
                </button>
                <button
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-5 text-left transition outline-none hover:border-white/45 hover:bg-black/10 focus-visible:ring-4 focus-visible:ring-white/80"
                  onClick={() => openRoom("study")}
                  type="button"
                >
                  <span className="font-bold text-white">Study</span>
                  <span className="mt-2 block text-sm text-white/55">
                    Mirror notes & desk spotlight
                  </span>
                  <BookOpen
                    aria-hidden="true"
                    className="absolute right-8 bottom-8 size-20 text-white/15 transition group-hover:text-white/30"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute bottom-5 left-6 h-2 w-40 rounded-full bg-white/20"
                  />
                </button>
                <button
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-5 text-left transition outline-none hover:border-white/45 hover:bg-black/10 focus-visible:ring-4 focus-visible:ring-white/80"
                  onClick={() => openRoom("living")}
                  type="button"
                >
                  <span className="font-bold text-white">Living Room</span>
                  <span className="mt-2 block text-sm text-white/55">
                    Record player
                  </span>
                  <Sofa
                    aria-hidden="true"
                    className="absolute right-8 bottom-7 size-24 text-white/15 transition group-hover:text-white/30"
                  />
                  <Music2
                    aria-hidden="true"
                    className="absolute bottom-8 left-8 size-12"
                    style={{ color: accentColor }}
                  />
                </button>
                <div
                  aria-label="Gaming area, decorative for now"
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5"
                >
                  <span className="font-bold text-white/55">Gaming Area</span>
                  <span className="mt-2 block text-xs text-white/30">
                    Cabinet closed
                  </span>
                  <Gamepad2
                    aria-hidden="true"
                    className="absolute right-8 bottom-8 size-24 text-white/10"
                  />
                </div>
                <div
                  aria-label="Kitchen, decorative for now"
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-5"
                >
                  <span className="font-bold text-white/55">Kitchen</span>
                  <span className="mt-2 block text-xs text-white/30">
                    A little room for later
                  </span>
                  <Refrigerator
                    aria-hidden="true"
                    className="absolute right-8 bottom-5 size-24 text-white/10"
                  />
                </div>
                <button
                  className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 p-5 text-left transition outline-none hover:border-white/45 hover:bg-black/10 focus-visible:ring-4 focus-visible:ring-white/80"
                  onClick={() => openRoom("friends")}
                  type="button"
                >
                  <span className="font-bold text-white">Entryway</span>
                  <span className="mt-2 block text-sm text-white/55">
                    Friend photos
                  </span>
                  <div className="absolute inset-x-6 bottom-6 grid grid-cols-4 gap-2">
                    {featuredConnections.slice(0, 4).map((connection) => (
                      <span
                        className="aspect-square rounded-md border border-white/15 bg-black/25 bg-cover bg-center"
                        key={connection.id}
                        style={
                          connection.avatarUrl
                            ? {
                                backgroundImage: `url(${JSON.stringify(connection.avatarUrl).slice(1, -1)})`,
                              }
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:hidden" style={wallStyle}>
            {(
              [
                [
                  "bedroom",
                  "Bedroom",
                  <Sparkles className="size-6" key="bed" />,
                ],
                [
                  "living",
                  "Living Room",
                  <Sofa className="size-6" key="living" />,
                ],
                [
                  "study",
                  "Study",
                  <BriefcaseBusiness className="size-6" key="study" />,
                ],
                [
                  "friends",
                  "Entryway",
                  <UsersRound className="size-6" key="friends" />,
                ],
              ] as const
            ).map(([key, label, icon]) => (
              <button
                className="flex min-h-28 w-full items-center justify-between rounded-[1.5rem] border border-white/15 bg-black/40 p-5 text-left backdrop-blur-sm transition focus-visible:ring-4 focus-visible:ring-white/80 focus-visible:outline-none active:scale-[.99] motion-reduce:transform-none"
                key={key}
                onClick={() => openRoom(key)}
                type="button"
              >
                <span>
                  <span className="block text-xs font-bold tracking-[.16em] text-white/40 uppercase">
                    Next room
                  </span>
                  <span className="mt-1 block text-xl font-bold text-white">
                    {label}
                  </span>
                </span>
                <span style={{ color: accentColor }}>{icon}</span>
              </button>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div className="min-h-24 rounded-[1.5rem] border border-white/10 bg-black/40 p-5 text-white/40">
                <Gamepad2 className="mb-2 size-5" />
                Gaming Area
              </div>
              <div className="min-h-24 rounded-[1.5rem] border border-white/10 bg-black/40 p-5 text-white/40">
                <Refrigerator className="mb-2 size-5" />
                Kitchen
              </div>
            </div>
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
