import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Eye,
  Gamepad2,
  HeartHandshake,
  Images,
  Radio,
  Sparkles,
  UserRound,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  ProfileImageLayer,
  type ProfileImageFit,
} from "./profile-image-layer";
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

spotlightCategory: string | null;
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

function formatJoinedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date);
}

function GlassPanel({
  children,
  accentColor,
  className = "",
}: {
  children: ReactNode;
  accentColor: string;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border bg-black/70 shadow-[0_22px_65px_rgba(0,0,0,.38)] backdrop-blur-xl ${className}`}
      style={{
        borderColor: `${accentColor}65`,
        boxShadow: `0 22px 65px rgba(0,0,0,.38), 0 0 35px ${accentColor}0d`,
      }}
    >
      {children}
    </section>
  );
}

function SectionLabel({
  children,
  accentColor,
}: {
  children: ReactNode;
  accentColor: string;
}) {
  return (
    <p
      className="text-center text-[0.68rem] font-black tracking-[0.22em] uppercase"
      style={{ color: accentColor }}
    >
      {children}
    </p>
  );
}

function CurrentCard({
  label,
  title,
  description,
  url,
  linkLabel,
  icon,
  accentColor,
}: {
  label: string;
  title: string | null;
  description: string | null;
  url: string | null;
  linkLabel: string;
  icon: ReactNode;
  accentColor: string;
}) {
  if (!title && !description && !url) {
    return null;
  }

  return (
    <div className="flex h-full flex-col items-center rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-5 text-center">
      <div
        className="flex size-11 items-center justify-center rounded-full border"
        style={{
          borderColor: `${accentColor}55`,
          backgroundColor: `${accentColor}13`,
          color: accentColor,
        }}
      >
        {icon}
      </div>

      <p
        className="mt-4 text-[0.65rem] font-black tracking-[0.2em] uppercase"
        style={{ color: accentColor }}
      >
        {label}
      </p>

      {title ? (
        <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
      ) : null}

      {description ? (
        <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
      ) : null}

      {url ? (
        <a
          className="mt-auto inline-flex items-center justify-center gap-2 pt-5 text-sm font-bold hover:underline"
          href={url}
          rel="noopener noreferrer"
          style={{ color: accentColor }}
          target="_blank"
        >
          {linkLabel}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      ) : null}
    </div>
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
  const accentColor = experience.accentColor;
  const presence = formatPresence(experience.lastSeenAt);
  const joinedDate = formatJoinedDate(profile.createdAt);

  const musicVisible = Boolean(
    experience.songTitle || experience.songArtist || experience.songUrl,
  );

  const currentlyVisible = Boolean(
    experience.spotlightTitle ||
      experience.spotlightDescription ||
      experience.spotlightUrl ||
      experience.currentGame ||
      experience.currentGameDescription ||
      experience.currentGameUrl ||
      experience.currentReading ||
      experience.currentReadingDescription ||
      experience.currentReadingUrl ||
      experience.currentFood ||
      experience.currentFoodDescription ||
      experience.currentFoodUrl,
  );

  const latestVisible = Boolean(
    experience.latestPickTitle ||
      experience.latestPickNote ||
      experience.latestPickUrl,
  );

  const viewMyVisible = Boolean(
    experience.viewMyLabel && experience.viewMyUrl,
  );

  const featuredPhotos = [
    featuredProfileImageUrl,
    featuredProfileImageUrl2,
  ].filter((value): value is string => Boolean(value));

  const stats = [
    {
      label: "Friends",
      count: experience.friendCount,
      icon: UsersRound,
    },
    {
      label: "Followers",
      count: experience.followerCount,
      icon: HeartHandshake,
    },
    {
      label: "Following",
      count: experience.followingCount,
      icon: UserRound,
    },
    {
      label: "Profile Views",
      count: experience.profileViewCount,
      icon: Eye,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl pb-10">
      {trackView ? <ProfileViewTracker profileId={profile.id} /> : null}

      {/* =========================================================
          PROFILE HERO
          This is the ONLY major section intentionally left aligned.
          ========================================================= */}
<GlassPanel
  accentColor={accentColor}
  className="relative overflow-hidden p-0"
>
  <div className="relative min-h-[32rem] overflow-hidden sm:min-h-[34rem] lg:min-h-[30rem]">
    <ProfileImageLayer
      fit={experience.landscapeFit}
      imageUrl={profile.landscapeUrl}
      positionX={experience.landscapePositionX}
      positionY={experience.landscapePositionY}
      zoom={experience.landscapeZoom}
    />



    <div className="relative z-10 flex min-h-[32rem] items-end p-6 sm:min-h-[34rem] sm:p-8 lg:min-h-[30rem] lg:items-center lg:p-10">
      <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
        {/* Avatar */}
        <div
          aria-label={`${profile.displayName}'s profile photo`}
          className="mx-auto size-24 rounded-full border-4 bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center shadow-2xl sm:size-28 lg:mx-0"
          role="img"
          style={{
            borderColor: accentColor,
            ...(profile.avatarUrl
              ? {
                  backgroundImage: `url(${JSON.stringify(
                    profile.avatarUrl,
                  ).slice(1, -1)})`,
                }
              : {}),
          }}
        />

        {/* Name + quick info */}
        <h1 className="display-type mt-5 text-5xl leading-none text-white capitalize sm:text-6xl lg:text-7xl">
          {profile.displayName}
        </h1>

        <p
          className="mt-2 text-base font-black"
          style={{ color: accentColor }}
        >
          @{profile.username}
        </p>

        {profile.bio ? (
          <p className="mt-5 max-w-md text-base leading-7 text-white/75 sm:text-lg">
            {profile.bio}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm lg:justify-start">
          <span
            className="inline-flex items-center gap-2 font-black"
            style={{ color: accentColor }}
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full shadow-[0_0_14px_currentColor]"
              style={{ backgroundColor: accentColor }}
            />
            {presence}
          </span>

          {experience.mood ? (
            <span className="text-white/55">
              Mood:{" "}
              <span className="font-bold text-white/80">
                {experience.mood}
              </span>
            </span>
          ) : null}

          {joinedDate ? (
            <span className="inline-flex items-center gap-1.5 text-white/45">
              <CalendarDays aria-hidden="true" className="size-4" />
              Joined {joinedDate}
            </span>
          ) : null}
        </div>

{viewMyVisible ? (
  <div className="mt-6 flex justify-center lg:justify-start">
    <a
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border bg-black/55 px-5 py-2.5 text-sm font-black backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-black/80"
      href={experience.viewMyUrl!}
      rel="noopener noreferrer"
      style={{
        borderColor: `${accentColor}88`,
        color: accentColor,
      }}
      target="_blank"
    >
      {experience.viewMyLabel}
      <ArrowUpRight aria-hidden="true" className="size-4" />
    </a>
  </div>
) : null}
      </div>
    </div>
  </div>
</GlassPanel>


      {/* ======================
          PROFILE STATS
          ====================== */}
<GlassPanel accentColor={accentColor} className="mt-5 p-2 sm:p-5">
  <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
              {stats.map(({ label, count, icon: Icon }) => (
            <div
              className="flex min-h-[4.75rem] flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-1 py-2 text-center sm:min-h-24 sm:rounded-2xl sm:px-3 sm:py-4"
              key={label}
            >
              <Icon
                aria-hidden="true"
                className="size-4 sm:size-5"
                style={{ color: accentColor }}
              />

              <p className="mt-1 text-base font-black text-white sm:mt-2 sm:text-xl">
                {compactNumber(count)}
              </p>

              <p className="mt-0.5 text-[0.6rem] leading-tight text-white/45 sm:text-xs">
  {label}
</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* ======================
          CONTACT / SOCIAL ACTIONS
          ====================== */}

      {/* ======================
          CURRENT SIGNAL
          ====================== */}
      {experience.statusText ? (
        <GlassPanel
          accentColor={accentColor}
          className="mx-auto mt-10 max-w-4xl p-6 text-center sm:p-8"
        >
          <SectionLabel accentColor={accentColor}>
            Current Signal
          </SectionLabel>

          <div className="mt-5 flex flex-col items-center justify-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-full border"
              style={{
                borderColor: `${accentColor}55`,
                backgroundColor: `${accentColor}12`,
                color: accentColor,
              }}
            >
              <Radio aria-hidden="true" className="size-4 sm:size-5" />
            </div>

            <p className="max-w-2xl text-lg leading-8 text-white/85">
              {experience.statusText}
            </p>

            {isOwner && experience.statusExpiresAt ? (
              <div className="text-xs text-white/40">
                <ProfileStatusCountdown
                  expiresAt={experience.statusExpiresAt}
                />
              </div>
            ) : null}
          </div>
        </GlassPanel>
      ) : null}

      {/* ======================
          SOUNDTRACK
          ====================== */}
      {musicVisible ? (
        <GlassPanel
          accentColor={accentColor}
          className="mx-auto mt-10 max-w-5xl p-6 text-center sm:p-8"
        >
          <SectionLabel accentColor={accentColor}>
            Soundtrack
          </SectionLabel>

          <div className="mx-auto mt-5 max-w-3xl">
            <ProfileSoundtrack
              accentColor={accentColor}
              song={{
                title: experience.songTitle,
                artist: experience.songArtist,
                url: experience.songUrl,
              }}
            />
          </div>
        </GlassPanel>
      ) : null}

{/* ======================
    LATEST PICK + FOCUS
    ====================== */}
{latestVisible ||
experience.spotlightTitle ||
experience.spotlightDescription ? (
  <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
    {latestVisible ? (
      <GlassPanel
        accentColor={accentColor}
        className="flex min-h-[13rem] flex-col items-center justify-center px-6 py-7 text-center"
      >
        <div
          className="flex size-10 items-center justify-center rounded-full border"
          style={{
            borderColor: `${accentColor}55`,
            backgroundColor: `${accentColor}12`,
            color: accentColor,
          }}
        >
          <Sparkles aria-hidden="true" className="size-4" />
        </div>

        <div className="mt-3">
          <SectionLabel accentColor={accentColor}>
            Latest Indulgence
          </SectionLabel>
        </div>

        {experience.latestPickCategory ? (
          <p className="mt-3 text-[0.68rem] font-bold tracking-[0.12em] text-white/35 uppercase">
            {experience.latestPickCategory}
          </p>
        ) : null}

        {experience.latestPickTitle ? (
          <h3 className="mt-2 text-xl font-black text-white">
            {experience.latestPickTitle}
          </h3>
        ) : null}

        {experience.latestPickNote ? (
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
            {experience.latestPickNote}
          </p>
        ) : null}

        {experience.latestPickUrl ? (
          <a
            className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-bold hover:underline"
            href={experience.latestPickUrl}
            rel="noopener noreferrer"
            style={{ color: accentColor }}
            target="_blank"
          >
            View Pick
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </GlassPanel>
    ) : null}

    {experience.spotlightTitle ||
    experience.spotlightDescription ||
    experience.spotlightUrl ? (
      <GlassPanel
        accentColor={accentColor}
        className="flex min-h-[13rem] flex-col items-center justify-center px-6 py-7 text-center"
      >
        <div
          className="flex size-10 items-center justify-center rounded-full border"
          style={{
            borderColor: `${accentColor}55`,
            backgroundColor: `${accentColor}12`,
            color: accentColor,
          }}
        >
          <Radio aria-hidden="true" className="size-4" />
        </div>

        <div className="mt-3">
          <SectionLabel accentColor={accentColor}>
            Current Focus
          </SectionLabel>
        </div>

        {experience.spotlightCategory ? (
  <p className="mt-3 text-[0.68rem] font-bold tracking-[0.12em] text-white/35 uppercase">
    {experience.spotlightCategory}
  </p>
) : null}

        {experience.spotlightTitle ? (
          <h3 className="mt-3 text-xl font-black text-white">
            {experience.spotlightTitle}
          </h3>
        ) : null}

        {experience.spotlightDescription ? (
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">
            {experience.spotlightDescription}
          </p>
        ) : null}

        {experience.spotlightUrl ? (
          <a
            className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-bold hover:underline"
            href={experience.spotlightUrl}
            rel="noopener noreferrer"
            style={{ color: accentColor }}
            target="_blank"
          >
            See What I&apos;m On
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        ) : null}
      </GlassPanel>
    ) : null}
  </div>
) : null}

      {/* ======================
          FEATURED PHOTOS
          BOTH PHOTOS ARE KEPT.
          ====================== */}
      {featuredPhotos.length ? (
        <GlassPanel
          accentColor={accentColor}
          className="mt-10 p-5 text-center sm:p-7"
        >
          <SectionLabel accentColor={accentColor}>
            Featured Photos
          </SectionLabel>

          <div
            className={`mx-auto mt-6 grid max-w-5xl gap-4 ${
              featuredPhotos.length > 1 ? "md:grid-cols-2" : ""
            }`}
          >
            {featuredPhotos.map((imageUrl, index) => (
              <div
                className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35"
                key={imageUrl}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-2xl transition duration-500 group-hover:scale-125"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                  }}
                />

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${profile.displayName}'s featured photo ${index + 1}`}
                  className="relative z-10 block max-h-[42rem] min-h-[20rem] w-full object-contain"
                  src={imageUrl}
                />
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : null}

      {/* ======================
          CURRENTLY
          ====================== */}
      {currentlyVisible ? (
        <GlassPanel
          accentColor={accentColor}
          className="mt-10 p-6 text-center sm:p-8"
        >
          <SectionLabel accentColor={accentColor}>
            Currently
          </SectionLabel>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CurrentCard
              accentColor={accentColor}
              description={experience.spotlightDescription}
              icon={<Radio aria-hidden="true" className="size-4 sm:size-5" />}
              label="Focus"
              linkLabel="See What I'm On"
              title={experience.spotlightTitle}
              url={experience.spotlightUrl}
            />

            <CurrentCard
              accentColor={accentColor}
              description={experience.currentGameDescription}
              icon={<Gamepad2 aria-hidden="true" className="size-4 sm:size-5" />}
              label="Playing"
              linkLabel="Check It Out"
              title={experience.currentGame}
              url={experience.currentGameUrl}
            />

            <CurrentCard
              accentColor={accentColor}
              description={experience.currentReadingDescription}
              icon={<BookOpen aria-hidden="true" className="size-4 sm:size-5" />}
              label="Reading"
              linkLabel="Read With Me"
              title={experience.currentReading}
              url={experience.currentReadingUrl}
            />

            <CurrentCard
              accentColor={accentColor}
              description={experience.currentFoodDescription}
              icon={
                <UtensilsCrossed aria-hidden="true" className="size-4 sm:size-5" />
              }
              label="Eating"
              linkLabel="Check It Out"
              title={experience.currentFood}
              url={experience.currentFoodUrl}
            />
          </div>
        </GlassPanel>
      ) : null}



      {/* ======================
          OWNER EMPTY STATE
          ====================== */}
      {isOwner &&
      !experience.statusText &&
      !musicVisible &&
      !currentlyVisible &&
      !latestVisible &&
      !featuredPhotos.length &&
      !featuredConnections.length ? (
        <GlassPanel
          accentColor={accentColor}
          className="mx-auto mt-10 max-w-3xl p-8 text-center"
        >
          <Images
            aria-hidden="true"
            className="mx-auto size-9"
            style={{ color: accentColor }}
          />

          <h2 className="mt-4 text-xl font-black text-white">
            Make This Space Yours
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/50">
            Add featured photos, music, a current signal, favorite things,
            and friends to bring your profile to life.
          </p>
        </GlassPanel>
      ) : null}

{(!isOwner && contactActions) || featuredConnections.length ? (
  <div className="mt-12 grid gap-5 lg:grid-cols-[0.3fr_0.7fr]">
    {!isOwner && contactActions ? (
      <GlassPanel
        accentColor={accentColor}
        className="p-5 text-center sm:p-6"
      >
        <SectionLabel accentColor={accentColor}>
          Contact Me
        </SectionLabel>

        <p className="mx-auto mt-2 max-w-sm text-sm text-white/40">
          Connect, message, follow, or share this profile.
        </p>

<div className="mx-auto mt-6 flex max-w-sm flex-wrap items-center justify-center gap-4">
  {contactActions}
</div>
      </GlassPanel>
    ) : null}

    {featuredConnections.length ? (
      <GlassPanel
        accentColor={accentColor}
        className="p-6 text-center sm:p-8"
      >
        <SectionLabel accentColor={accentColor}>
          Friend Spotlight
        </SectionLabel>

        <p className="mt-2 text-sm text-white/40">
          People in {profile.displayName}&apos;s orbit.
        </p>

        <div className="mx-auto mt-7 flex max-w-4xl flex-wrap items-start justify-center gap-7 sm:gap-10">
          {featuredConnections.slice(0, 6).map((connection) => (
            <Link
              className="group flex w-24 flex-col items-center text-center outline-none"
              href={`/home/profiles/${connection.username}`}
              key={connection.id}
            >
              <span
                className="block size-20 rounded-full border-2 bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center shadow-lg transition duration-200 group-hover:-translate-y-1 group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-white"
                style={{
                  borderColor: accentColor,
                  ...(connection.avatarUrl
                    ? {
                        backgroundImage: `url(${JSON.stringify(
                          connection.avatarUrl,
                        ).slice(1, -1)})`,
                      }
                    : {}),
                }}
              />

              <span className="mt-3 max-w-full truncate text-sm font-black text-white">
                {connection.displayName}
              </span>

              <span className="mt-0.5 max-w-full truncate text-xs text-white/40">
                @{connection.username}
              </span>
            </Link>
          ))}
        </div>
      </GlassPanel>
    ) : null}
  </div>
) : null}

    </div>
  );
}