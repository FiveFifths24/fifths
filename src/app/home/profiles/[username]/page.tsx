import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Flag, Pencil, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { RelationshipControls } from "@/features/profiles/relationship-controls";
import { friendshipState } from "@/features/profiles/relationship-data";
import { ProfileImageLayer } from "@/features/profiles/profile-image-layer";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { ProfileRoom } from "@/features/profiles/profile-room";
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
    avatarUrl,
    landscapeUrl,
    experienceResult,
    featuredResult,
    latestPickResult,
    roomResult,
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
    signProfileMedia(supabase, profile.avatar_url),
    signProfileMedia(supabase, profile.cover_image_url),
    supabase.rpc("get_profile_experience", { p_user_id: profile.id }),
supabase.rpc("get_featured_connections", { p_owner_id: profile.id }),

supabase
  .from("profiles")
.select(
  "latest_pick_category, latest_pick_title, latest_pick_note, latest_pick_url, featured_profile_image_url",
)
  .eq("id", profile.id)
  .maybeSingle(),

supabase.rpc("get_profile_room", { p_user_id: profile.id }),
  ]);
  const experience = experienceResult.data?.[0];
  const room = roomResult.data?.[0];
  const featuredProfileImageUrl = await signProfileMedia(
  supabase,
  latestPickResult.data?.featured_profile_image_url ?? null,
);
console.log("FEATURED IMAGE DEBUG", {
  rawPath: latestPickResult.data?.featured_profile_image_url ?? null,
  signedUrl: featuredProfileImageUrl,
  queryError: latestPickResult.error?.message ?? null,
});
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
  const returnTo = `/home/profiles/${profile.username}`;

  const cardStyle = { borderColor: accentColor };

  return (
    <ProfileWallpaper
      backgroundUrl={backgroundUrl}
      fit={experience?.background_image_fit ?? "cover"}
      positionX={experience?.background_image_position_x ?? 50}
      positionY={experience?.background_image_position_y ?? 50}
      zoom={experience?.background_image_zoom ?? 100}
    >
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
  className="overflow-hidden rounded-[2rem] border bg-black/20 shadow-[0_28px_90px_rgba(0,0,0,.45)] backdrop-blur-[2px]"
  style={cardStyle}
>
<div className="relative min-h-[470px] overflow-hidden bg-[radial-gradient(circle_at_75%_20%,rgba(243,89,210,.22),transparent_30%),linear-gradient(135deg,#160626,#070711_58%,#071b20)] sm:min-h-[470px] lg:min-h-[390px]">
      <ProfileImageLayer
      fit={experience?.landscape_image_fit ?? "cover"}
      imageUrl={landscapeUrl}
      overlayClassName="bg-gradient-to-b from-black/10 via-black/20 to-black/55"
      positionX={experience?.landscape_image_position_x ?? 50}
      positionY={experience?.landscape_image_position_y ?? 50}
      zoom={experience?.landscape_image_zoom ?? 100}
    />

    <div className="absolute inset-x-0 bottom-0 z-10 p-3 pt-20 sm:p-7 sm:pt-20 lg:pt-7">
      <div
        className="flex flex-col gap-4 rounded-[1.5rem] border bg-black/55 px-4 pt-7 pb-7 text-center shadow-2xl backdrop-blur-xl sm:gap-6 sm:rounded-[1.75rem] sm:px-6 sm:pt-8 sm:pb-8 sm:text-left lg:flex-row lg:items-center lg:justify-between lg:py-6"
        style={cardStyle}
      >
        <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row">
          <div className="relative shrink-0">
            <div
              aria-label={`${profile.display_name}'s profile photo`}
              className="size-24 rounded-full border-4 border-black bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center shadow-2xl sm:size-28"
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
                aria-label="Edit Profile Photo"
                className="absolute -right-1 -bottom-1 inline-flex size-9 items-center justify-center rounded-full border-2 border-black text-white shadow-lg transition hover:scale-105"
                href="/account#profile-media"
                style={{ backgroundColor: accentColor }}
              >
                <Pencil aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <h1 className="display-type text-4xl text-white capitalize sm:text-6xl">
              {profile.display_name}
            </h1>

            <p className="mt-1 font-bold text-white/55">
              @{profile.username}
            </p>

            {profile.bio ? (
              <div className="mt-4 max-w-xl">
                <p className="mb-1 text-xs font-bold tracking-[0.14em] text-white/45 uppercase">
                  About Me
                </p>

                <p className="text-sm leading-6 text-white/80">
                  {profile.bio}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0">
          {isOwnProfile ? (
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-end">
              <ButtonLink href="/account#edit-my-room">
                Edit My Room
              </ButtonLink>

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
      </div>
    </div>
  </div>
</article>

        <ProfileRoom
          accentColor={accentColor}
          featuredProfileImageUrl={featuredProfileImageUrl}
          latestPick={{
  category: latestPickResult.data?.latest_pick_category ?? null,
  title: latestPickResult.data?.latest_pick_title ?? null,
  note: latestPickResult.data?.latest_pick_note ?? null,
  url: latestPickResult.data?.latest_pick_url ?? null,
}}
          bio={profile.bio}
          displayName={profile.display_name}
          featuredConnections={featuredConnections.map((connection) => ({
            id: connection.id,
            username: connection.username,
            displayName: connection.display_name,
            avatarUrl: connection.avatarUrl,
          }))}
          isOwner={isOwnProfile}
          settings={{
            enabled: room?.enabled ?? true,
            wallColor: room?.wall_color ?? "#241039",
            floorColor: room?.floor_color ?? "#4a403c",
couchColor: room?.couch_color ?? "#4a4048",
bookshelfColor: room?.bookshelf_color ?? "#594139",
tvColor: room?.tv_color ?? "#262329",
doorColor: room?.door_color ?? "#4a3935",
accessoryColor: room?.accessory_color ?? "#5a5059",
            lightingTheme: room?.lighting_theme ?? "cosmic",
            currentVibe: room?.current_vibe ?? "chill",
            characterColor: room?.character_color ?? "#f359d2",
            headAccessory: room?.head_accessory ?? "headphones",
            faceAccessory: room?.face_accessory ?? "none",
            neckAccessory: room?.neck_accessory ?? "none",
            motionEnabled: room?.motion_enabled ?? true,
          }}
          song={{
            title: room?.profile_song_title ?? null,
            artist: room?.profile_song_artist ?? null,
            url: room?.profile_song_url ?? null,
          }}
          spotlight={{
            title: experience?.spotlight_title ?? null,
            description: experience?.spotlight_description ?? null,
            url: experience?.spotlight_url ?? null,
          }}
          statusCountdown={
            isOwnProfile && experience?.status_expires_at ? (
              <ProfileStatusCountdown
                expiresAt={experience.status_expires_at}
              />
            ) : undefined
          }
          statusText={experience?.status_text ?? null}
        />

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
