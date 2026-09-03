import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileLaunchView } from "@/features/profiles/profile-launch-view";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { ProfileWallpaper } from "@/features/profiles/profile-wallpaper";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username} on SIGNAL` };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();
  const [{ data }, { data: userData }] = await Promise.all([
    supabase.rpc("get_public_profile", { p_username: username }),
    supabase.auth.getUser(),
  ]);
  const profile = data?.[0];
  if (!profile) notFound();

  const [
    avatarUrl,
    landscapeUrl,
    experienceResult,
    featuredResult,
    currentFieldsResult,
  ] = await Promise.all([
    signProfileMedia(supabase, profile.avatar_url),
    signProfileMedia(supabase, profile.cover_image_url),
    supabase.rpc("get_profile_experience", { p_user_id: profile.id }),
    userData.user
      ? supabase.rpc("get_featured_connections", { p_owner_id: profile.id })
      : Promise.resolve({ data: [] }),

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
  const [backgroundUrl, featuredProfileImageUrl, featuredProfileImageUrl2] =
    await Promise.all([
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

  return (
    <ProfileWallpaper
      backgroundUrl={backgroundUrl}
      fit={experience.background_image_fit}
      positionX={experience.background_image_position_x}
      positionY={experience.background_image_position_y}
      zoom={experience.background_image_zoom}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <ProfileLaunchView
          contactActions={
            <div className="flex flex-wrap gap-3">
              <Link
                className="min-h-12 rounded-full bg-[#992bff] px-6 py-3 font-bold text-white"
                href={`/login?next=/home/profiles/${profile.username}`}
              >
                Connect on SIGNAL
              </Link>
              <Link
                className="min-h-12 rounded-full border border-white/15 px-6 py-3 font-bold text-white"
                href="/signup"
              >
                Join SIGNAL
              </Link>
            </div>
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
            spotlightCategory: null,
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
            currentReadingUrl:
              currentFieldsResult.data?.current_reading_url ?? null,

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
          isOwner={false}
          profile={{
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
            bio: profile.bio,
            createdAt: profile.created_at,
            avatarUrl,
            landscapeUrl,
          }}
          trackView={Boolean(userData.user && userData.user.id !== profile.id)}
        />
      </div>
    </ProfileWallpaper>
  );
}
