import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Eye, House, Radio, Sparkles, UsersRound } from "lucide-react";
import { AccountTabs } from "@/components/account/account-tabs";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { signOutAction } from "@/features/auth/actions";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { ProfileSettingsForm } from "@/features/profiles/profile-settings-form";
import { ProfileRoomSettingsForm } from "@/features/profiles/profile-room-settings-form";
import { ProfileStatusForm } from "@/features/profiles/profile-status-form";
import { FeaturedConnectionsForm } from "@/features/profiles/featured-connections-form";
import { otherFriendId } from "@/features/profiles/relationship-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit My Room" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{
    onboarding?: string;
    password?: string;
  }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/account");

  const [
    profileResult,
    statusResult,
    friendshipsResult,
    peopleResult,
    featuredResult,
    roomResult,
    parameters,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("profile_statuses")
      .select("status_text, expires_at")
      .eq("user_id", userData.user.id)
      .gt("expires_at", "now")
      .maybeSingle(),
    supabase
      .from("profile_friendships")
      .select("*")
      .or(`user_id_a.eq.${userData.user.id},user_id_b.eq.${userData.user.id}`),
    supabase.rpc("get_member_profiles", {
      p_discoverable_only: false,
      p_username: null,
    }),
    supabase
      .from("profile_featured_connections")
      .select("featured_id")
      .eq("owner_id", userData.user.id),
    supabase.rpc("get_profile_room", { p_user_id: userData.user.id }),
    searchParams,
  ]);

  if (!profileResult.data?.onboarding_completed_at) redirect("/onboarding");
  const profile = profileResult.data;
  const room = roomResult.data?.[0];
  const [landscapeUrl, backgroundUrl] = await Promise.all([
    signProfileMedia(supabase, profile.cover_image_url),
    signProfileMedia(supabase, profile.background_image_url),
  ]);
  const friendIds = new Set(
    (friendshipsResult.data ?? [])
      .filter((friendship) => friendship.status === "accepted")
      .map((friendship) => otherFriendId(friendship, userData.user.id)),
  );
  const friends = (peopleResult.data ?? [])
    .filter((person) => friendIds.has(person.id))
    .map((person) => ({
      id: person.id,
      username: person.username,
      displayName: person.display_name,
    }));

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(24,0,173,0.2),rgba(4,4,8,0.94)_46%,rgba(243,89,210,0.12))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.38)] sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -top-28 -right-20 size-72 rounded-full bg-[#f359d2]/10 blur-[100px]"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-16 size-72 rounded-full bg-[#6c14ce]/15 blur-[110px]"
          />
          <div className="relative">
            <p className="w-fit bg-[linear-gradient(90deg,#a855f7,#f359d2,#7cff00)] bg-clip-text text-xs font-bold tracking-[0.22em] text-transparent uppercase [-webkit-text-fill-color:transparent]">
              Your SIGNAL identity
            </p>
            <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
              Welcome,{" "}
              <span className="capitalize">{profile.display_name}</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              Shape how you appear and express yourself across SIGNAL.
            </p>
            <ButtonLink
              className="mt-7"
              href={`/home/profiles/${profile.username}`}
              variant="secondary"
            >
              <Eye aria-hidden="true" className="size-4" />
              View My Room
            </ButtonLink>
          </div>
        </header>

        <AccountTabs active="profile" />

        {parameters?.onboarding === "complete" ? (
          <StatusMessage className="mt-8" tone="success">
            Your profile foundation is complete.
          </StatusMessage>
        ) : null}
        {parameters?.password === "updated" ? (
          <StatusMessage className="mt-8" tone="success">
            Your password was updated securely.
          </StatusMessage>
        ) : null}
        <section className="relative mt-8 overflow-hidden rounded-[2rem] border border-[#a855f7]/30 bg-[linear-gradient(145deg,rgba(108,20,206,0.12),rgba(3,3,7,0.9)_50%,rgba(243,89,210,0.07))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-8">
          <div className="flex items-center gap-3">
            <Sparkles aria-hidden="true" className="size-5 text-[#f359d2]" />
            <h2 className="text-3xl font-bold text-white">Edit My Room</h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Shape the profile people meet first, then give them a room that
            feels unmistakably yours.
          </p>
          <div
            className="mt-7 scroll-mt-28 rounded-2xl border border-[#a855f7]/25 bg-black/25 p-5 sm:p-6"
            id="edit-my-room"
          >
            <div className="flex items-center gap-3">
              <House aria-hidden="true" className="size-5 text-[#ca9aff]" />
              <h3 className="text-xl font-bold text-white">Room Appearance</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Choose the room color, lighting, vibe, blob color, and compatible
              accessories. Your profile accent still controls the matching
              borders and profile-photo ring.
            </p>
            <div className="mt-5">
              <ProfileRoomSettingsForm
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
              />
            </div>
          </div>
          <div className="mt-7 rounded-2xl border border-[#f359d2]/25 bg-black/25 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Radio aria-hidden="true" className="size-5 text-[#f359d2]" />
              <h3 className="text-xl font-bold text-white">Current Signal</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Share a short update for 24 hours. Only you can see its countdown.
            </p>
            <div className="mt-5">
              <ProfileStatusForm
                expiresAt={statusResult.data?.expires_at ?? null}
                statusText={statusResult.data?.status_text ?? ""}
              />
            </div>
          </div>
          <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles aria-hidden="true" className="size-5 text-[#7cff00]" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Profile & Background
                </h3>
                <p className="mt-1 text-sm leading-6 text-white/45">
                  Edit your names, bio, photo, landscape, wallpaper, and
                  matching accent color.
                </p>
              </div>
            </div>
            <ProfileSettingsForm
              profile={{
                username: profile.username ?? "",
                usernameChangedAt: profile.username_changed_at,
                displayName: profile.display_name ?? "",
                displayNameChangedAt: profile.display_name_changed_at,
                bio: profile.bio ?? "",
                accentColor: profile.profile_accent_color,
                landscapeUrl,
                landscapeImageFit: profile.landscape_image_fit,
                landscapeImagePositionX: profile.landscape_image_position_x,
                landscapeImagePositionY: profile.landscape_image_position_y,
                landscapeImageZoom: profile.landscape_image_zoom,
                backgroundUrl,
                backgroundImageFit: profile.background_image_fit,
                backgroundImagePositionX: profile.background_image_position_x,
                backgroundImagePositionY: profile.background_image_position_y,
                backgroundImageZoom: profile.background_image_zoom,
                spotlightTitle: profile.spotlight_title ?? "",
                spotlightDescription: profile.spotlight_description ?? "",
                spotlightUrl: profile.spotlight_url ?? "",
                profileSongTitle: profile.profile_song_title ?? "",
profileSongArtist: profile.profile_song_artist ?? "",
profileSongUrl: profile.profile_song_url ?? "",
latestPickCategory: profile.latest_pick_category ?? "",
latestPickTitle: profile.latest_pick_title ?? "",
latestPickNote: profile.latest_pick_note ?? "",
latestPickUrl: profile.latest_pick_url ?? "",
                visibility: profile.visibility,
                discoverable: profile.discoverable,
              }}
            />
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-[#a855f7]/20 bg-[linear-gradient(145deg,rgba(108,20,206,0.08),rgba(3,3,7,0.92))] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <UsersRound aria-hidden="true" className="size-5 text-[#ca9aff]" />
            <h2 className="text-2xl font-bold text-white">Friend Spotlight</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Choose up to three friends whose photos appear inside your room.
          </p>
          <div className="mt-6">
            <FeaturedConnectionsForm
              friends={friends}
              selectedIds={(featuredResult.data ?? []).map(
                (item) => item.featured_id,
              )}
            />
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/home">Go To Your Home</ButtonLink>
          <form action={signOutAction}>
            <button
              className="min-h-12 rounded-full border border-neutral-700 px-6 py-3 font-bold text-white hover:border-neutral-500"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}
