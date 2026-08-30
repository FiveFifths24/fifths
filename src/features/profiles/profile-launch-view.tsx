import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Eye,
  HeartHandshake,
  Radio,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { ProfileImageLayer, type ProfileImageFit } from "./profile-image-layer";
import { ProfileSoundtrack } from "./profile-soundtrack";
import { ProfileStatusCountdown } from "./profile-status-countdown";
import { ProfileViewTracker } from "./profile-view-tracker";
import { formatPresence } from "./presence";

export type FeaturedProfileConnection = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type ProfileLaunchExperience = {
  accentColor: string;
  mood: string | null;
  lastSeenAt: string | null;
  statusText: string | null;
  statusExpiresAt: string | null;
  friendCount: number;
  followerCount: number;
  followingCount: number;
  profileViewCount: number;
spotlightTitle: string | null;
spotlightDescription: string | null;
spotlightUrl: string | null;

currentGame: string | null;
currentGameDescription: string | null;
currentGameUrl: string | null;

currentReading: string | null;
currentReadingDescription: string | null;
currentReadingUrl: string | null;

currentFood: string | null;
currentFoodDescription: string | null;
currentFoodUrl: string | null;

viewMyLabel: string | null;
  viewMyUrl: string | null;
  songTitle: string | null;
  songArtist: string | null;
  songUrl: string | null;
  latestPickCategory: string | null;
  latestPickTitle: string | null;
  latestPickNote: string | null;
  latestPickUrl: string | null;
  landscapeFit: ProfileImageFit;
  landscapePositionX: number;
  landscapePositionY: number;
  landscapeZoom: number;
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 1_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function Module({
  title,
  children,
  className = "",
  accentColor,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  accentColor: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border bg-black/65 p-6 shadow-[0_22px_70px_rgba(0,0,0,.34)] backdrop-blur-md sm:p-8 ${className}`}
      style={{ borderColor: `${accentColor}99` }}
    >
<h2
  className="text-center text-xs font-black tracking-[0.22em] uppercase"
  style={{ color: accentColor }}
>
  {title}
</h2>
      {children}
    </section>
  );
}

export function ProfileLaunchView({
  profile,
  experience,
  featuredConnections,
  isOwner,
  headerAction,
  contactActions,
  safetySection,
featuredProfileImageUrl,
featuredProfileImageUrl2,
trackView = false,
}: {
  profile: {
    id: string;
    username: string;
    displayName: string;
    bio: string | null;
    createdAt: string;
    avatarUrl: string | null;
    landscapeUrl: string | null;
  };
  experience: ProfileLaunchExperience;
  featuredConnections: FeaturedProfileConnection[];
  isOwner: boolean;
  headerAction?: ReactNode;
  contactActions?: ReactNode;
  safetySection?: ReactNode;
featuredProfileImageUrl?: string | null;
featuredProfileImageUrl2?: string | null;
trackView?: boolean;
}) {
  const accentStyle = {
    borderColor: experience.accentColor,
  } satisfies CSSProperties;
  const presence = formatPresence(experience.lastSeenAt);
  const aboutVisible = Boolean(profile.bio) || isOwner;
const currentlyVisible = Boolean(
  experience.spotlightTitle ||
    experience.spotlightDescription ||
    experience.currentGame ||
    experience.currentGameDescription ||
    experience.currentReading ||
    experience.currentReadingDescription ||
    experience.currentFood ||
    experience.currentFoodDescription,
);
  const musicVisible = Boolean(
    experience.songTitle || experience.songArtist || experience.songUrl,
  );
  const viewMyVisible = Boolean(experience.viewMyLabel && experience.viewMyUrl);
  const latestVisible = Boolean(
    experience.latestPickTitle ||
    experience.latestPickNote ||
    experience.latestPickUrl,
  );
  const stats = [
    { label: "Friends", count: experience.friendCount, icon: UsersRound },
    {
      label: "Followers",
      count: experience.followerCount,
      icon: HeartHandshake,
    },
    { label: "Following", count: experience.followingCount, icon: UserRound },
    {
      label: "Profile Views",
      count: experience.profileViewCount,
      icon: Eye,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl pb-8">
      {trackView ? <ProfileViewTracker profileId={profile.id} /> : null}

      <article
        className="overflow-hidden rounded-[2rem] border bg-black/45 shadow-[0_28px_90px_rgba(0,0,0,.48)] backdrop-blur-[2px]"
        style={accentStyle}
      >
        <div className="relative min-h-[23rem] overflow-hidden bg-[radial-gradient(circle_at_75%_20%,rgba(243,89,210,.22),transparent_30%),linear-gradient(135deg,#160626,#070711_58%,#071b20)]">
          <ProfileImageLayer
            fit={experience.landscapeFit}
            imageUrl={profile.landscapeUrl}
            overlayClassName="bg-gradient-to-b from-black/10 via-black/15 to-black/80"
            positionX={experience.landscapePositionX}
            positionY={experience.landscapePositionY}
            zoom={experience.landscapeZoom}
          />
          <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-9">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
              <div
                aria-label={`${profile.displayName}'s profile photo`}
                className="size-28 shrink-0 rounded-full border-4 bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center shadow-2xl sm:size-32"
                role="img"
                style={{
                  borderColor: experience.accentColor,
                  ...(profile.avatarUrl
                    ? {
                        backgroundImage: `url(${JSON.stringify(profile.avatarUrl).slice(1, -1)})`,
                      }
                    : {}),
                }}
              />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h1 className="display-type text-5xl text-white capitalize sm:text-7xl">
                  {profile.displayName}
                </h1>
                <p className="mt-2 font-bold text-white/60">
                  @{profile.username}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:justify-start">
                  <span
                    className="inline-flex items-center gap-2 font-black tracking-[0.08em] uppercase"
                    style={{ color: experience.accentColor }}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2.5 rounded-full shadow-[0_0_14px_currentColor]"
                      style={{ backgroundColor: experience.accentColor }}
                    />
                    {presence}
                  </span>
                  {experience.mood ? (
                    <span className="text-white/75">
                      <span className="text-white/40">Mood:</span>{" "}
                      {experience.mood}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0">{headerAction}</div>
            </div>
          </div>
        </div>
      </article>

      <div
        className="mt-8 grid gap-4 rounded-[1.75rem] border bg-black/70 p-4 shadow-[0_18px_55px_rgba(0,0,0,.34)] backdrop-blur-md sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
        style={accentStyle}
      >
        {stats.map(({ label, count, icon: Icon }) => (
          <div
            className="flex items-center justify-center gap-3 rounded-2xl bg-white/[0.035] px-4 py-4"
            key={label}
          >
            <Icon
              aria-hidden="true"
              className="size-5"
              style={{ color: experience.accentColor }}
            />
            <div>
              <p className="text-xl font-black text-white">
                {compactNumber(count)}
              </p>
              <p className="text-xs text-white/45">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {experience.statusText ? (
<Module
  accentColor={experience.accentColor}
  className="mx-auto mt-12 max-w-4xl text-center"
  title="Current Signal"
>
            <div className="mt-4 flex items-center justify-center gap-3">
            <Radio
              aria-hidden="true"
              className="mt-1 size-5 shrink-0"
              style={{ color: experience.accentColor }}
            />
            <p className="text-lg leading-8 text-white/85">
              {experience.statusText}
            </p>
          </div>
          {isOwner && experience.statusExpiresAt ? (
            <p className="mt-3 text-center text-xs text-white/40">
              <ProfileStatusCountdown expiresAt={experience.statusExpiresAt} />
            </p>
          ) : null}
        </Module>
      ) : null}

{aboutVisible || musicVisible ? (
  <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[7fr_3fr]">
    {aboutVisible ? (
      <Module
        accentColor={experience.accentColor}
        className="h-full text-center"
        title="About Me"
      >
        {profile.bio ? (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/80">
            {profile.bio}
          </p>
        ) : (
          <p className="mt-5 text-white/50">
            Add an About Me so visitors can get to know you.
          </p>
        )}
      </Module>
    ) : null}

    {musicVisible ? (
      <Module
        accentColor={experience.accentColor}
        className="h-full"
        title="Soundtrack"
      >
        <ProfileSoundtrack
          accentColor={experience.accentColor}
          song={{
            title: experience.songTitle,
            artist: experience.songArtist,
            url: experience.songUrl,
          }}
        />
      </Module>
    ) : null}
  </div>
) : null}

      {featuredProfileImageUrl || featuredProfileImageUrl2 ? (
  <div className="mt-14 grid items-start gap-8 lg:grid-cols-2">
    {featuredProfileImageUrl ? (
      <Module
        accentColor={experience.accentColor}
        title="Featured Photo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${profile.displayName}'s first featured profile image`}
          className="mt-5 h-[34rem] w-full rounded-2xl object-cover"
          src={featuredProfileImageUrl}
        />
      </Module>
    ) : null}

    {featuredProfileImageUrl2 ? (
      <Module
        accentColor={experience.accentColor}
        title="Featured Photo"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${profile.displayName}'s second featured profile image`}
          className="mt-5 h-[34rem] w-full rounded-2xl object-cover"
          src={featuredProfileImageUrl2}
        />
      </Module>
    ) : null}
  </div>
) : null}

{currentlyVisible ? (
  <Module
    accentColor={experience.accentColor}
    className="mt-14 text-center"
    title="Currently"
  >
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <p
          className="text-[0.68rem] font-black tracking-[0.2em] uppercase"
          style={{ color: experience.accentColor }}
        >
          Focus
        </p>

        <h3 className="mt-3 text-lg font-black text-white">
          {experience.spotlightTitle ?? "Nothing shared yet"}
        </h3>

        {experience.spotlightDescription ? (
          <p className="mt-2 text-sm leading-6 text-white/50">
            {experience.spotlightDescription}
          </p>
        ) : null}

        {experience.spotlightUrl ? (
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
            href={experience.spotlightUrl}
            rel="noopener noreferrer"
            style={{ color: experience.accentColor }}
            target="_blank"
          >
            See What I'm On
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <p
          className="text-[0.68rem] font-black tracking-[0.2em] uppercase"
          style={{ color: experience.accentColor }}
        >
          Game
        </p>

        <h3 className="mt-3 text-lg font-black text-white">
          {experience.currentGame ?? "Nothing shared yet"}
        </h3>

        {experience.currentGameDescription ? (
          <p className="mt-2 text-sm leading-6 text-white/50">
            {experience.currentGameDescription}
          </p>
        ) : null}

        {experience.currentGameUrl ? (
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
            href={experience.currentGameUrl}
            rel="noopener noreferrer"
            style={{ color: experience.accentColor }}
            target="_blank"
          >
            Check It Out
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <p
          className="text-[0.68rem] font-black tracking-[0.2em] uppercase"
          style={{ color: experience.accentColor }}
        >
          Reading
        </p>

        <h3 className="mt-3 text-lg font-black text-white">
          {experience.currentReading ?? "Nothing shared yet"}
        </h3>

        {experience.currentReadingDescription ? (
          <p className="mt-2 text-sm leading-6 text-white/50">
            {experience.currentReadingDescription}
          </p>
        ) : null}

        {experience.currentReadingUrl ? (
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
            href={experience.currentReadingUrl}
            rel="noopener noreferrer"
            style={{ color: experience.accentColor }}
            target="_blank"
          >
            Read With Me
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <p
          className="text-[0.68rem] font-black tracking-[0.2em] uppercase"
          style={{ color: experience.accentColor }}
        >
          Food
        </p>

        <h3 className="mt-3 text-lg font-black text-white">
          {experience.currentFood ?? "Nothing shared yet"}
        </h3>

        {experience.currentFoodDescription ? (
          <p className="mt-2 text-sm leading-6 text-white/50">
            {experience.currentFoodDescription}
          </p>
        ) : null}

        {experience.currentFoodUrl ? (
          <a
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold"
            href={experience.currentFoodUrl}
            rel="noopener noreferrer"
            style={{ color: experience.accentColor }}
            target="_blank"
          >
            See The Details
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </div>
    </div>
  </Module>
) : null}

{featuredConnections.length || isOwner ? (
  <Module
    accentColor={experience.accentColor}
    className="mt-14 text-center"
    title="Top Friends"
  >
{featuredConnections.length ? (
  <>
    <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 justify-items-center gap-5 lg:hidden">
      {featuredConnections.slice(0, 3).map((connection) => (
        <Link
          className="group min-w-0 text-center"
          href={`/home/profiles/${connection.username}`}
          key={connection.id}
        >
          <span
            className="mx-auto block size-16 rounded-full border-2 bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center transition group-hover:-translate-y-1"
            style={{
              borderColor: experience.accentColor,
              ...(connection.avatarUrl
                ? {
                    backgroundImage: `url(${JSON.stringify(
                      connection.avatarUrl,
                    ).slice(1, -1)})`,
                  }
                : {}),
            }}
          />

          <span className="mt-2 block truncate text-sm font-bold text-white">
            {connection.displayName}
          </span>
        </Link>
      ))}
    </div>

    <div className="mx-auto mt-6 hidden max-w-5xl grid-cols-8 justify-items-center gap-5 lg:grid">
      {featuredConnections.slice(0, 8).map((connection) => (
        <Link
          className="group min-w-0 text-center"
          href={`/home/profiles/${connection.username}`}
          key={connection.id}
        >
          <span
            className="mx-auto block size-16 rounded-full border-2 bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center transition group-hover:-translate-y-1"
            style={{
              borderColor: experience.accentColor,
              ...(connection.avatarUrl
                ? {
                    backgroundImage: `url(${JSON.stringify(
                      connection.avatarUrl,
                    ).slice(1, -1)})`,
                  }
                : {}),
            }}
          />

          <span className="mt-2 block truncate text-sm font-bold text-white">
            {connection.displayName}
          </span>
        </Link>
      ))}
    </div>
  </>
) : (
        <p className="mt-5 text-white/50">
        Choose the friends you want to feature here.
      </p>
    )}
  </Module>
) : null}

<div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[3fr_7fr]">
  <section
    className="flex h-full flex-col rounded-[1.75rem] border bg-black/70 p-6 shadow-[0_22px_70px_rgba(0,0,0,.38)] backdrop-blur-md sm:p-7"
    style={{ borderColor: `${experience.accentColor}99` }}
  >
<div className="flex h-full flex-col items-center justify-center text-center">
  <p className="text-xs font-black tracking-[0.32em] text-[#54b7ff] uppercase">
    Contact Me
  </p>

  <div className="mt-6 w-full max-w-md">
    {contactActions ? (
      contactActions
    ) : (
      <p className="text-sm leading-6 text-white/50">
        Visitors will see your connection options here.
      </p>
    )}
  </div>
</div>
  </section>

  <section
    className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border bg-black/70 p-6 shadow-[0_22px_70px_rgba(0,0,0,.38)] backdrop-blur-md sm:p-7"
    style={{ borderColor: `${experience.accentColor}99` }}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-24 right-0 size-72 rounded-full opacity-10 blur-3xl"
      style={{ backgroundColor: experience.accentColor }}
    />

    <div className="relative flex h-full flex-col">
      <h2
        className="text-center text-xs font-black tracking-[0.22em] uppercase"
        style={{ color: experience.accentColor }}
      >
        Around the Web
      </h2>

      <p className="mt-3 text-center text-sm text-white/45">
        More places to find {profile.displayName}.
      </p>

      <div className="mt-6 flex-1">
        {viewMyVisible ? (
          <a
            className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-5 transition hover:border-white/20 hover:bg-white/[0.07]"
            href={experience.viewMyUrl!}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-white/35 uppercase">
                Featured Link
              </p>

              <p className="mt-1 text-lg font-black text-white">
                {experience.viewMyLabel}
              </p>
            </div>

            <ArrowUpRight
              aria-hidden="true"
              className="size-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              style={{ color: experience.accentColor }}
            />
          </a>
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-5 text-center">
            <p className="text-sm text-white/40">
              {isOwner
                ? "Your preferred links will appear here."
                : "No external links shared yet."}
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 flex items-center justify-end gap-2 text-xs text-white/35">
        <CalendarDays aria-hidden="true" className="size-4" />
        Joined SIGNAL{" "}
        {new Intl.DateTimeFormat("en", {
          month: "long",
          year: "numeric",
        }).format(new Date(profile.createdAt))}
      </p>
    </div>
  </section>
</div>

      {safetySection}

      {isOwner ? (
        <div className="mt-14 flex justify-center">
          <ButtonLink href="/account">Customize Profile</ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
