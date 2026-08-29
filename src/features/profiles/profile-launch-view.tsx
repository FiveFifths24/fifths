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
        className="text-xs font-black tracking-[0.22em] uppercase"
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
  trackView?: boolean;
}) {
  const accentStyle = {
    borderColor: experience.accentColor,
  } satisfies CSSProperties;
  const presence = formatPresence(experience.lastSeenAt);
  const aboutVisible = Boolean(profile.bio) || isOwner;
  const focusVisible = Boolean(
    experience.spotlightTitle || experience.spotlightDescription,
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
          className="mt-12 sm:ml-auto sm:max-w-4xl"
          title="Current Signal"
        >
          <div className="mt-4 flex gap-3">
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
            <p className="mt-3 text-right text-xs text-white/40">
              <ProfileStatusCountdown expiresAt={experience.statusExpiresAt} />
            </p>
          ) : null}
        </Module>
      ) : null}

      {aboutVisible ? (
        <Module
          accentColor={experience.accentColor}
          className="mx-auto mt-14 max-w-4xl text-center"
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

      {focusVisible ? (
        <Module
          accentColor={experience.accentColor}
          className="mt-14 max-w-3xl"
          title="Current Focus"
        >
          <h3 className="mt-5 text-2xl font-black text-white">
            {experience.spotlightTitle ?? "What I’m working on"}
          </h3>
          {experience.spotlightDescription ? (
            <p className="mt-3 max-w-2xl leading-7 text-white/65">
              {experience.spotlightDescription}
            </p>
          ) : null}
          {experience.spotlightUrl ? (
            <a
              className="mt-5 inline-flex items-center gap-2 font-bold"
              href={experience.spotlightUrl}
              rel="noopener noreferrer"
              style={{ color: experience.accentColor }}
              target="_blank"
            >
              Take a look <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          ) : null}
        </Module>
      ) : null}

      {featuredProfileImageUrl || latestVisible ? (
        <div className="mt-14 grid items-start gap-8 lg:grid-cols-2">
          {featuredProfileImageUrl ? (
            <Module accentColor={experience.accentColor} title="Featured Photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`${profile.displayName}'s featured profile image`}
                className="mt-5 max-h-[34rem] w-full rounded-2xl object-contain"
                src={featuredProfileImageUrl}
              />
            </Module>
          ) : null}
          {latestVisible ? (
            <Module
              accentColor={experience.accentColor}
              title={experience.latestPickCategory ?? "Latest Pick"}
            >
              <h3 className="mt-5 text-2xl font-black text-white">
                {experience.latestPickTitle ?? "Worth checking out"}
              </h3>
              {experience.latestPickNote ? (
                <p className="mt-3 leading-7 text-white/65">
                  {experience.latestPickNote}
                </p>
              ) : null}
              {experience.latestPickUrl ? (
                <a
                  className="mt-5 inline-flex items-center gap-2 font-bold"
                  href={experience.latestPickUrl}
                  rel="noopener noreferrer"
                  style={{ color: experience.accentColor }}
                  target="_blank"
                >
                  Open pick{" "}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              ) : null}
            </Module>
          ) : null}
        </div>
      ) : null}

      {featuredConnections.length || isOwner ? (
        <Module
          accentColor={experience.accentColor}
          className="mt-14"
          title="Top Friends"
        >
          {featuredConnections.length ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
              {featuredConnections.map((connection) => (
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
                            backgroundImage: `url(${JSON.stringify(connection.avatarUrl).slice(1, -1)})`,
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
          ) : (
            <p className="mt-5 text-white/50">
              Choose the friends you want to feature here.
            </p>
          )}
        </Module>
      ) : null}

      {musicVisible || viewMyVisible ? (
        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.25fr_.75fr]">
          {musicVisible ? (
            <Module
              accentColor={experience.accentColor}
              title="Profile Soundtrack"
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
          {viewMyVisible ? (
            <Module accentColor={experience.accentColor} title="View My">
              <a
                className="mt-5 flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-5 text-xl font-black text-white transition hover:bg-white/[0.07]"
                href={experience.viewMyUrl!}
                rel="noopener noreferrer"
                target="_blank"
              >
                {experience.viewMyLabel}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5"
                  style={{ color: experience.accentColor }}
                />
              </a>
            </Module>
          ) : null}
        </div>
      ) : null}

      <Module
        accentColor={experience.accentColor}
        className="mt-14 sm:ml-auto sm:max-w-4xl"
        title="Contact Me"
      >
        <div className="mt-5">
          {isOwner ? (
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/account">Customize Profile</ButtonLink>
              <span className="text-sm text-white/45">
                This is how visitors can connect with you.
              </span>
            </div>
          ) : (
            contactActions
          )}
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-white/35">
          <CalendarDays aria-hidden="true" className="size-4" />
          Joined SIGNAL{" "}
          {new Intl.DateTimeFormat("en", {
            month: "long",
            year: "numeric",
          }).format(new Date(profile.createdAt))}
        </p>
      </Module>

      {safetySection}
    </div>
  );
}
