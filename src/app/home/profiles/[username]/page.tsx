import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Flag, MapPin, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { RelationshipControls } from "@/features/profiles/relationship-controls";
import { friendshipState } from "@/features/profiles/relationship-data";
import { signProfileMedia } from "@/features/profiles/profile-media";
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
    backgroundUrl,
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
  ]);
  const interestNames = new Map(
    (interests.data ?? []).map((item) => [item.id, item.name]),
  );
  const returnTo = `/home/profiles/${profile.username}`;

  return (
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
      <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/45">
        <div
          className="relative min-h-72 bg-gradient-to-br from-[#14051f] via-[#4d0d79] to-[#071321] bg-cover bg-center"
          style={
            backgroundUrl
              ? {
                  backgroundImage: `linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.72)),url(${JSON.stringify(backgroundUrl).slice(1, -1)})`,
                }
              : undefined
          }
        >
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
              <div
                aria-label={`${profile.display_name}'s profile photo`}
                className="size-28 shrink-0 rounded-full border-4 border-black bg-gradient-to-br from-[#992bff] to-[#f359d2] bg-cover bg-center shadow-2xl"
                role="img"
                style={
                  avatarUrl
                    ? {
                        backgroundImage: `url(${JSON.stringify(avatarUrl).slice(1, -1)})`,
                      }
                    : undefined
                }
              />
              <div className="text-center sm:text-left">
                <h1 className="display-type text-5xl text-white sm:text-7xl">
                  {profile.display_name}
                </h1>
                <p className="mt-2 font-bold text-white/55">
                  @{profile.username}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8 p-6 sm:p-9">
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
          {profile.bio ? (
            <p className="max-w-3xl text-lg leading-8 text-white/70">
              {profile.bio}
            </p>
          ) : null}
          {profile.location_visibility !== "hidden" &&
          (profile.city || profile.region) ? (
            <p className="flex items-center justify-center gap-2 text-sm text-white/45 sm:justify-start">
              <MapPin aria-hidden="true" className="size-4" />
              {profile.location_visibility === "city_region"
                ? [profile.city, profile.region].filter(Boolean).join(", ")
                : profile.region}
            </p>
          ) : null}
          {(interestLinks.data ?? []).length ? (
            <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {(interestLinks.data ?? [])
                .map((item) => interestNames.get(item.interest_id))
                .filter((name): name is string => Boolean(name))
                .map((name) => (
                  <li key={name}>
                    <Badge>{name}</Badge>
                  </li>
                ))}
            </ul>
          ) : null}
        </div>
      </article>

      {!isOwnProfile ? (
        <>
          <details className="mt-8 rounded-[1.5rem] border border-red-900/50 bg-red-950/20 p-6">
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
  );
}
