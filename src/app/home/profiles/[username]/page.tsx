import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ExternalLink,
  Flag,
  MapPin,
  Pencil,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { RelationshipControls } from "@/features/profiles/relationship-controls";
import { friendshipState } from "@/features/profiles/relationship-data";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { ProfileWallpaper } from "@/features/profiles/profile-wallpaper";
import { ProfileStatusCountdown } from "@/features/profiles/profile-status-countdown";
import { ReportForm } from "@/features/trust-safety/report-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function MemberProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ social?: string }>;
}) {
  const [{ username }, parameters] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect(`/login?next=/home/profiles/${username}`);
  const profileResult = await supabase.rpc("get_member_profiles", {
    p_discoverable_only: false,
    p_username: username,
  });
  const profile = profileResult.data?.[0];
  if (!profile) notFound();
  const isOwnProfile = profile.id === userData.user.id;

  const [
    friendshipResult,
    followResult,
    muteResult,
    interestLinks,
    interests,
    avatarUrl,
    landscapeUrl,
    experienceResult,
    featuredResult,
  ] = await Promise.all([
    supabase
      .from("profile_friendships")
      .select("*")
      .or(
        `and(user_id_a.eq.${userData.user.id},user_id_b.eq.${profile.id}),and(user_id_a.eq.${profile.id},user_id_b.eq.${userData.user.id})`,
      )
      .maybeSingle(),
    supabase
      .from("profile_follows")
      .select("follower_id")
      .eq("follower_id", userData.user.id)
      .eq("followed_id", profile.id)
      .maybeSingle(),
    supabase
      .from("profile_mutes")
      .select("muter_id")
      .eq("muter_id", userData.user.id)
      .eq("muted_id", profile.id)
      .maybeSingle(),
    supabase
      .from("profile_interests")
      .select("interest_id")
      .eq("user_id", profile.id),
    supabase.from("interests").select("id, name").eq("active", true),
    signProfileMedia(supabase, profile.avatar_url),
    signProfileMedia(supabase, profile.cover_image_url),
    supabase.rpc("get_profile_experience", { p_user_id: profile.id }),
    supabase.rpc("get_featured_connections", { p_owner_id: profile.id }),
  ]);
  const experience = experienceResult.data?.[0];
  const accentColor = experience?.profile_accent_color ?? "#a855f7";
  const backgroundUrl = await signProfileMedia(
    supabase,
    experience?.background_image_url ?? null,
  );
  const featuredConnections = await Promise.all(
    (featuredResult.data ?? []).map(async (connection) => ({
      ...connection,
      avatarUrl: await signProfileMedia(supabase, connection.avatar_url),
    })),
  );
  const interestNames = new Map(
    (interests.data ?? []).map((item) => [item.id, item.name]),
  );
  const returnTo = `/home/profiles/${profile.username}`;

  const cardStyle = { borderColor: accentColor };

  return (
    <ProfileWallpaper backgroundUrl={backgroundUrl}>
      <div className="mx-auto max-w-5xl">
        {parameters?.social === "updated" ? (
          <StatusMessage className="mb-6" tone="success">
            Your connection settings were updated.
          </StatusMessage>
        ) : null}
        {parameters?.social === "error" ? (
          <StatusMessage className="mb-6" tone="error">
            That connection could not be changed.
          </StatusMessage>
        ) : null}

        <article
          className="overflow-hidden rounded-[2rem] border bg-black/40 shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-[2px]"
          style={cardStyle}
        >
          <div
            className="relative min-h-80 bg-[radial-gradient(circle_at_75%_20%,rgba(243,89,210,.22),transparent_30%),linear-gradient(135deg,#160626,#070711_58%,#071b20)] bg-cover bg-center"
            style={
              landscapeUrl
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.7)),url(${JSON.stringify(landscapeUrl).slice(1, -1)})`,
                  }
                : undefined
            }
          >
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
                <div className="relative shrink-0">
                  <div
                    aria-label={`${profile.display_name}'s profile photo`}
                    className="size-28 rounded-full border-4 border-black bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center shadow-2xl"
                    role="img"
                    style={{
                      borderColor: accentColor,
                      ...(avatarUrl
                        ? {
                            backgroundImage: `url(${JSON.stringify(avatarUrl).slice(1, -1)})`,
                          }
                        : {}),
                    }}
                  />
                  {isOwnProfile ? (
                    <Link
                      aria-label="Edit profile photo"
                      className="absolute -right-1 -bottom-1 inline-flex size-9 items-center justify-center rounded-full border-2 border-black text-white shadow-lg transition hover:scale-105"
                      href="/account#profile-media"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Link>
                  ) : null}
                </div>
                <div className="min-w-0 text-center sm:text-left">
                  <h1 className="display-type text-5xl text-white capitalize sm:text-7xl">
                    {profile.display_name}
                  </h1>
                  <p className="mt-2 font-bold text-white/55">
                    @{profile.username}
                  </p>
                  {experience?.status_text ? (
                    <div
                      className="mt-4 max-w-xl rounded-2xl border bg-black/55 px-4 py-3 text-sm leading-6 text-white/80 backdrop-blur-md"
                      style={cardStyle}
                    >
                      <p className="flex items-start gap-2">
                        <Radio
                          aria-hidden="true"
                          className="mt-1 size-4 shrink-0"
                          style={{ color: accentColor }}
                        />
                        <span>{experience.status_text}</span>
                      </p>
                      {isOwnProfile && experience.status_expires_at ? (
                        <p className="mt-1 text-right text-[0.68rem] text-white/40">
                          <ProfileStatusCountdown
                            expiresAt={experience.status_expires_at}
                          />
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 bg-black/30 p-6 sm:p-9">
            {isOwnProfile ? (
              <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                <ButtonLink href="/account">Edit profile</ButtonLink>
                <ButtonLink href="/home" variant="secondary">
                  Back to Home
                </ButtonLink>
              </div>
            ) : (
              <RelationshipControls
                friendship={friendshipState(
                  friendshipResult.data ?? undefined,
                  userData.user.id,
                )}
                isFollowing={Boolean(followResult.data)}
                isMuted={Boolean(muteResult.data)}
                returnTo={returnTo}
                targetUserId={profile.id}
              />
            )}
          </div>
        </article>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <section
            className="rounded-[1.5rem] border bg-black/55 p-6 backdrop-blur-md md:col-span-2"
            style={cardStyle}
          >
            <h2 className="text-xl font-bold text-white">About me</h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              {profile.bio || "No bio added yet."}
            </p>
            {profile.location_visibility !== "hidden" &&
            (profile.city || profile.region) ? (
              <p className="mt-5 flex items-center gap-2 text-sm text-white/45">
                <MapPin aria-hidden="true" className="size-4" />
                {profile.location_visibility === "city_region"
                  ? [profile.city, profile.region].filter(Boolean).join(", ")
                  : profile.region}
              </p>
            ) : null}
          </section>

          <section
            className="rounded-[1.5rem] border bg-black/55 p-6 backdrop-blur-md"
            style={cardStyle}
          >
            <h2 className="text-sm font-bold tracking-[0.16em] text-white/55 uppercase">
              Connections
            </h2>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center md:grid-cols-1 md:text-left">
              {[
                ["Friends", experience?.friend_count ?? 0],
                ["Followers", experience?.follower_count ?? 0],
                ["Following", experience?.following_count ?? 0],
              ].map(([label, count]) => (
                <div key={label}>
                  <dd className="text-2xl font-bold text-white">{count}</dd>
                  <dt className="text-xs text-white/40">{label}</dt>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {(interestLinks.data ?? []).length ? (
          <section
            className="mt-6 rounded-[1.5rem] border bg-black/55 p-6 backdrop-blur-md"
            style={cardStyle}
          >
            <h2 className="text-xl font-bold text-white">Into lately</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {(interestLinks.data ?? [])
                .map((item) => interestNames.get(item.interest_id))
                .filter((name): name is string => Boolean(name))
                .map((name) => (
                  <li key={name}>
                    <Badge>{name}</Badge>
                  </li>
                ))}
            </ul>
          </section>
        ) : null}

        {experience?.spotlight_title ? (
          <section
            className="mt-6 rounded-[1.5rem] border bg-black/55 p-6 backdrop-blur-md"
            style={cardStyle}
          >
            <div className="flex items-center gap-3">
              <Sparkles
                aria-hidden="true"
                className="size-5"
                style={{ color: accentColor }}
              />
              <h2 className="text-xl font-bold text-white">Pinned spotlight</h2>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-white">
              {experience.spotlight_title}
            </h3>
            {experience.spotlight_description ? (
              <p className="mt-3 max-w-3xl leading-7 text-white/65">
                {experience.spotlight_description}
              </p>
            ) : null}
            {experience.spotlight_url ? (
              <a
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold hover:underline"
                href={experience.spotlight_url}
                rel="noreferrer"
                style={{ color: accentColor }}
                target="_blank"
              >
                Visit spotlight
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            ) : null}
          </section>
        ) : null}

        {featuredConnections.length ? (
          <section
            className="mt-6 rounded-[1.5rem] border bg-black/55 p-6 backdrop-blur-md"
            style={cardStyle}
          >
            <div className="flex items-center gap-3">
              <UsersRound
                aria-hidden="true"
                className="size-5"
                style={{ color: accentColor }}
              />
              <h2 className="text-xl font-bold text-white">
                Featured connections
              </h2>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featuredConnections.map((connection) => (
                <li key={connection.id}>
                  <Link
                    className="block rounded-2xl border border-white/10 bg-black/30 p-4 text-center transition hover:bg-black/50"
                    href={`/home/profiles/${connection.username}`}
                  >
                    <span
                      aria-label={`${connection.display_name}'s profile photo`}
                      className="mx-auto block size-16 rounded-full bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center"
                      role="img"
                      style={
                        connection.avatarUrl
                          ? {
                              backgroundImage: `url(${JSON.stringify(connection.avatarUrl).slice(1, -1)})`,
                            }
                          : undefined
                      }
                    />
                    <span className="mt-3 block truncate font-bold text-white">
                      {connection.display_name}
                    </span>
                    <span className="block truncate text-xs text-white/40">
                      @{connection.username}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {!isOwnProfile ? (
          <>
            <details className="mt-8 rounded-[1.5rem] border border-red-900/50 bg-red-950/30 p-6 backdrop-blur-md">
              <summary className="flex cursor-pointer list-none items-center gap-3 font-bold text-red-200">
                <Flag aria-hidden="true" className="size-5" />
                Report this member
              </summary>
              <div className="mt-6 border-t border-red-900/40 pt-6">
                <ReportForm
                  defaultContextUrl={returnTo}
                  defaultTarget="member"
                  lockTarget
                />
              </div>
            </details>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-white/35">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Reports are private and reviewed by authorized moderators.
            </p>
          </>
        ) : null}
      </div>
    </ProfileWallpaper>
  );
}
