import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Flag, Pencil, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { ProfileLaunchView } from "@/features/profiles/profile-launch-view";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { ProfileWallpaper } from "@/features/profiles/profile-wallpaper";
import { RelationshipControls } from "@/features/profiles/relationship-controls";
import { friendshipState } from "@/features/profiles/relationship-data";
import { ReportForm } from "@/features/trust-safety/report-form";
import { createClient } from "@/lib/supabase/server";
import { FlashStatusMessage } from "@/components/ui/flash-status-message";

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
  currentFieldsResult,
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
  "current_game, current_game_description, current_game_url, current_reading, current_reading_description, current_reading_url, current_food, current_food_description, current_food_url, featured_profile_image_2_url",
)
  .eq("id", profile.id)
  .maybeSingle(),
  ]);
  const experience = experienceResult.data?.[0];
  if (!experience) notFound();
  const accentColor = experience.profile_accent_color ?? "#a855f7";
const [
  backgroundUrl,
  featuredProfileImageUrl,
  featuredProfileImageUrl2,
] = await Promise.all([
  signProfileMedia(supabase, experience.background_image_url),
  signProfileMedia(supabase, experience.featured_profile_image_url),
  signProfileMedia(
    supabase,
    currentFieldsResult.data?.featured_profile_image_2_url ?? null,
  ),
]);
  const featuredConnections = await Promise.all(
    (featuredResult.data ?? []).map(async (connection) => ({
      id: connection.id,
      username: connection.username,
      displayName: connection.display_name,
      avatarUrl: await signProfileMedia(supabase, connection.avatar_url),
    })),
  );
  const returnTo = `/home/profiles/${profile.username}`;

  return (
    <ProfileWallpaper
      backgroundUrl={backgroundUrl}
      fit={experience.background_image_fit}
      positionX={experience.background_image_position_x}
      positionY={experience.background_image_position_y}
      zoom={experience.background_image_zoom}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
{parameters?.social === "updated" ? (
  <FlashStatusMessage param="social" value="updated">
    Your Friend Request Was Sent.
  </FlashStatusMessage>
) : null}
        {parameters?.social === "error" ? (
          <StatusMessage className="mb-6" tone="error">
            That connection could not be changed.
          </StatusMessage>
        ) : null}

        <ProfileLaunchView
          contactActions={
            !isOwnProfile ? (
              <RelationshipControls
              accentColor={accentColor}
                friendship={friendshipState(
                  friendshipResult.data ?? undefined,
                  userData.user.id,
                )}
                isFollowing={Boolean(followResult.data)}
                isMuted={Boolean(muteResult.data)}
                returnTo={returnTo}
                targetUserId={profile.id}
              />
            ) : undefined
          }
          experience={{
            accentColor,
            mood: experience.mood,
            lastSeenAt: experience.last_seen_at,
            statusText: experience.status_text,
            statusExpiresAt: experience.status_expires_at,
            friendCount: experience.friend_count,
            followerCount: experience.follower_count,
            followingCount: experience.following_count,
            profileViewCount: experience.profile_view_count,
            spotlightTitle: experience.spotlight_title,
            spotlightDescription: experience.spotlight_description,
            spotlightUrl: experience.spotlight_url,
currentGame: currentFieldsResult.data?.current_game ?? null,
currentGameDescription:
  currentFieldsResult.data?.current_game_description ?? null,
currentGameUrl: currentFieldsResult.data?.current_game_url ?? null,

currentReading: currentFieldsResult.data?.current_reading ?? null,
currentReadingDescription:
  currentFieldsResult.data?.current_reading_description ?? null,
currentReadingUrl: currentFieldsResult.data?.current_reading_url ?? null,

currentFood: currentFieldsResult.data?.current_food ?? null,
currentFoodDescription:
  currentFieldsResult.data?.current_food_description ?? null,
currentFoodUrl: currentFieldsResult.data?.current_food_url ?? null,
            viewMyLabel: experience.view_my_label,
            viewMyUrl: experience.view_my_url,
            songTitle: experience.profile_song_title,
            songArtist: experience.profile_song_artist,
            songUrl: experience.profile_song_url,
            latestPickCategory: experience.latest_pick_category,
            latestPickTitle: experience.latest_pick_title,
            latestPickNote: experience.latest_pick_note,
            latestPickUrl: experience.latest_pick_url,
            landscapeFit: experience.landscape_image_fit,
            landscapePositionX: experience.landscape_image_position_x,
            landscapePositionY: experience.landscape_image_position_y,
            landscapeZoom: experience.landscape_image_zoom,
          }}
          featuredConnections={featuredConnections}
          featuredProfileImageUrl={featuredProfileImageUrl}
          featuredProfileImageUrl2={featuredProfileImageUrl2}
headerAction={
  isOwnProfile ? (
    <ButtonLink
      href="/account"
      variant="secondary"
      style={{
        borderColor: accentColor,
        color: accentColor,
        boxShadow: `0 0 0 1px ${accentColor}25`,
      }}
    >
      <Pencil aria-hidden="true" className="size-4" />
      Customize Profile
    </ButtonLink>
  ) : undefined
}
          isOwner={isOwnProfile}
          profile={{
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
            bio: profile.bio,
            createdAt: profile.created_at,
            avatarUrl,
            landscapeUrl,
          }}
safetySection={
  !isOwnProfile ? (
    <details
      className="mx-auto mt-8 w-full max-w-2xl text-center"
      id="report-member"
    >
      <summary className="mx-auto inline-flex cursor-pointer list-none items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(220,38,38,.25)] transition hover:bg-red-500">
        <Flag aria-hidden="true" className="size-4" />
        Report This Member
      </summary>

      <div className="mt-4 rounded-[1.5rem] border border-red-900/35 bg-red-950/45 p-5 text-left backdrop-blur-md">
        <ReportForm
          defaultContextUrl={returnTo}
          defaultTarget="member"
          lockTarget
        />

        <p className="mt-4 flex items-center gap-2 text-xs text-white/35">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Reports are private and reviewed by authorized moderators.
        </p>
      </div>
    </details>
  ) : undefined
}
          trackView={!isOwnProfile}
        />
      </div>
    </ProfileWallpaper>
  );
}
