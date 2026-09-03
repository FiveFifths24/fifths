import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import { StatusMessage } from "@/components/ui/status-message";
import {
  acceptFriendRequestAction,
  removeFollowerAction,
  removeFriendshipAction,
} from "@/features/profiles/actions";
import { signProfileMedia } from "@/features/profiles/profile-media";
import { otherFriendId } from "@/features/profiles/relationship-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "People" };
export const dynamic = "force-dynamic";

type PreviewPerson = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  mood: string | null;
  lastSeenAt: string | null;
  accentColor: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
};

function presenceLabel(lastSeenAt: string | null) {
  if (!lastSeenAt) return null;

  const lastSeen = new Date(lastSeenAt);
  const difference = Date.now() - lastSeen.getTime();

  if (!Number.isFinite(difference) || difference < 0) return null;

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 5) return "Online now";
  if (minutes < 60) return `Active ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `Active ${hours}h ago`;
  if (hours < 48) return "Active yesterday";

  const days = Math.floor(hours / 24);

  if (days <= 7) return `Active ${days}d ago`;

  return "Active recently";
}

function ProfilePreview({
  person,
  isFriend,
  isFollowing,
  hasIncomingRequest,
}: {
  person: PreviewPerson;
  isFriend: boolean;
  isFollowing: boolean;
  hasIncomingRequest: boolean;
}) {
  const presence = presenceLabel(person.lastSeenAt);
  const online = presence === "Online now";

  return (
    <article
      className="group relative overflow-hidden rounded-[2rem] border bg-black/55 shadow-[0_24px_70px_rgba(0,0,0,.35)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(0,0,0,.5)] motion-reduce:transform-none"
      style={{
        borderColor: `${person.accentColor}70`,
      }}
    >
      <Link
        aria-label={`View ${person.displayName}'s profile`}
        className="absolute inset-0 z-10"
        href={`/home/profiles/${person.username}`}
      >
        <span className="sr-only">
          View {person.displayName}&apos;s profile
        </span>
      </Link>

      <div className="relative h-28 overflow-hidden bg-[radial-gradient(circle_at_top,#241039,#070711_65%)] sm:h-32">
        {person.backgroundUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.04] motion-reduce:transform-none"
            style={{
              backgroundImage: `url(${JSON.stringify(person.backgroundUrl)})`,
            }}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 25% 20%, ${person.accentColor}55, transparent 38%), radial-gradient(circle at 80% 70%, ${person.accentColor}30, transparent 32%), #07070b`,
            }}
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/80"
        />

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ backgroundColor: person.accentColor }}
        />
      </div>

      <div className="relative px-4 pb-5 text-center">
        <div
          className="relative z-20 mx-auto -mt-8 size-16 rounded-full border-[3px] bg-[#09090d] p-1 shadow-xl"
          style={{ borderColor: person.accentColor }}
        >
          {person.avatarUrl ? (
            <div
              aria-label={`${person.displayName}'s profile photo`}
              className="size-full rounded-full bg-cover bg-center"
              role="img"
              style={{
                backgroundImage: `url(${JSON.stringify(person.avatarUrl)})`,
              }}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex size-full items-center justify-center rounded-full text-3xl font-black text-white"
              style={{
                background: `linear-gradient(135deg, ${person.accentColor}, #15151d)`,
              }}
            >
              {person.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}

          {online ? (
            <span
              aria-label="Online now"
              className="absolute right-0 bottom-1 size-5 rounded-full border-[3px] border-[#09090d] bg-emerald-400"
              title="Online now"
            />
          ) : null}
        </div>

        <h3 className="mt-3 truncate text-lg font-black text-white">
          {person.displayName}
        </h3>

        <p className="mt-1 text-sm font-bold text-white/40">
          @{person.username}
        </p>

        {person.mood ? (
          <p className="mt-3 text-sm text-white/65">
            <span className="font-bold text-white/45">Mood:</span> {person.mood}
          </p>
        ) : null}

        {presence ? (
          <p
            className={`mt-2 text-xs font-bold tracking-[0.12em] uppercase ${
              online ? "text-emerald-300" : "text-white/35"
            }`}
          >
            {presence}
          </p>
        ) : null}

        <p className="mx-auto mt-3 line-clamp-2 min-h-10 max-w-sm text-xs leading-5 text-white/55">
          {person.bio || "Finding their SIGNAL."}
        </p>

        {isFriend || isFollowing || hasIncomingRequest ? (
          <div className="relative z-20 mt-5 flex flex-wrap justify-center gap-2">
            {isFriend ? (
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold"
                style={{
                  borderColor: `${person.accentColor}55`,
                  color: person.accentColor,
                }}
              >
                Friend
              </span>
            ) : null}

            {isFollowing ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/55">
                Following
              </span>
            ) : null}

            {hasIncomingRequest ? (
              <span className="rounded-full border border-[#f359d2]/30 bg-[#f359d2]/10 px-3 py-1 text-xs font-bold text-[#f6aee7]">
                Request received
              </span>
            ) : null}
          </div>
        ) : null}

        <div
          className="relative z-20 mx-auto mt-4 inline-flex min-h-9 items-center justify-center gap-2 rounded-full border px-4 text-xs font-bold text-white transition group-hover:bg-white/5"
          style={{ borderColor: `${person.accentColor}80` }}
        >
          View Profile
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </div>
      </div>
    </article>
  );
}

function ConnectionList({
  title,
  ids,
  people,
  action,
  actionLabel,
}: {
  title: string;
  ids: Set<string>;
  people: PreviewPerson[];
  action?: (formData: FormData) => void | Promise<void>;
  actionLabel?: string;
}) {
  const matches = people.filter((profile) => ids.has(profile.id));

  if (!matches.length) return null;

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
      <h3 className="text-center text-sm font-bold tracking-[0.15em] text-white/45 uppercase">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {matches.map((profile) => (
          <li
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3"
            key={profile.id}
          >
            <Link
              className="flex min-w-0 flex-1 items-center gap-3"
              href={`/home/profiles/${profile.username}`}
            >
              <div
                className="size-11 shrink-0 rounded-full border-2 bg-black bg-cover bg-center"
                style={{
                  borderColor: profile.accentColor,
                  ...(profile.avatarUrl
                    ? {
                        backgroundImage: `url(${JSON.stringify(
                          profile.avatarUrl,
                        )})`,
                      }
                    : {}),
                }}
              />

              <span className="min-w-0">
                <span className="block truncate font-bold text-white">
                  {profile.displayName}
                </span>
                <span className="block truncate text-xs text-white/35">
                  @{profile.username}
                </span>
              </span>
            </Link>

            {action && actionLabel ? (
              <form action={action}>
                <input name="targetUserId" type="hidden" value={profile.id} />
                <input name="returnTo" type="hidden" value="/home/people" />

                <button
                  className="text-xs font-bold text-red-200/70 transition hover:text-red-200"
                  type="submit"
                >
                  {actionLabel}
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    interest?: string;
    social?: string;
  }>;
}) {
  const parameters = await searchParams;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/home/people");
  }

  const userId = userData.user.id;

  const [
    peopleResult,
    friendshipsResult,
    followsResult,
    interestsResult,
    profileInterestsResult,
  ] = await Promise.all([
    supabase.rpc("get_member_profiles", {
      p_discoverable_only: false,
      p_username: null,
    }),

    supabase
      .from("profile_friendships")
      .select("*")
      .or(`user_id_a.eq.${userId},user_id_b.eq.${userId}`),

    supabase
      .from("profile_follows")
      .select("follower_id, followed_id")
      .or(`follower_id.eq.${userId},followed_id.eq.${userId}`),
    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),

    supabase.from("profile_interests").select("user_id, interest_id"),
  ]);

  if (peopleResult.error || friendshipsResult.error || followsResult.error) {
    return (
      <StatusMessage tone="error">
        People and connections are temporarily unavailable. Please try again
        shortly.
      </StatusMessage>
    );
  }

  const query = parameters?.q?.trim().toLowerCase() ?? "";
  const selectedInterest = parameters?.interest ?? "";

  const profileInterestIds = new Map<string, Set<string>>();

  for (const item of profileInterestsResult.data ?? []) {
    const current = profileInterestIds.get(item.user_id) ?? new Set<string>();

    current.add(item.interest_id);
    profileInterestIds.set(item.user_id, current);
  }

  const rawVisiblePeople = (peopleResult.data ?? []).filter(
    (profile) => profile.id !== userId,
  );

  const visibleIds = rawVisiblePeople.map((profile) => profile.id);

  const { data: appearanceRows } = visibleIds.length
    ? await supabase
        .from("profiles")
        .select(
          "id, mood, last_seen_at, profile_accent_color, background_image_url",
        )
        .in("id", visibleIds)
    : { data: [] };

  const appearanceById = new Map(
    (appearanceRows ?? []).map((profile) => [profile.id, profile]),
  );

  const allVisiblePeople: PreviewPerson[] = await Promise.all(
    rawVisiblePeople.map(async (profile) => {
      const appearance = appearanceById.get(profile.id);

      return {
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        bio: profile.bio,

        mood: appearance?.mood ?? null,
        lastSeenAt: appearance?.last_seen_at ?? null,

        accentColor: appearance?.profile_accent_color || "#f359d2",

        avatarUrl: await signProfileMedia(supabase, profile.avatar_url ?? null),

        backgroundUrl: await signProfileMedia(
          supabase,
          appearance?.background_image_url ?? profile.cover_image_url ?? null,
        ),
      };
    }),
  );

  const visibleById = new Map(
    rawVisiblePeople.map((profile) => [profile.id, profile]),
  );

  const people = allVisiblePeople.filter((profile) => {
    const rawProfile = visibleById.get(profile.id);

    if (!rawProfile?.discoverable) return false;

    const matchesSearch =
      !query ||
      `${profile.displayName} ${profile.username} ${profile.bio ?? ""}`
        .toLowerCase()
        .includes(query);

    const matchesInterest =
      !selectedInterest ||
      profileInterestIds.get(profile.id)?.has(selectedInterest);

    return matchesSearch && matchesInterest;
  });

  const friendships = friendshipsResult.data ?? [];

  const incoming = friendships.filter(
    (item) => item.status === "pending" && item.requested_by !== userId,
  );

  const incomingIds = new Set(
    incoming.map((item) => otherFriendId(item, userId)),
  );

  const friendIds = new Set(
    friendships
      .filter((item) => item.status === "accepted")
      .map((item) => otherFriendId(item, userId)),
  );

  const followingIds = new Set(
    (followsResult.data ?? [])
      .filter((item) => item.follower_id === userId)
      .map((item) => item.followed_id),
  );

  const followerIds = new Set(
    (followsResult.data ?? [])
      .filter((item) => item.followed_id === userId)
      .map((item) => item.follower_id),
  );

  return (
    <div className="mx-auto max-w-7xl px-1 pb-20">
      <header className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-black tracking-[0.24em] text-[#f359d2] uppercase">
          Your Community
        </p>

        <h1 className="display-type mt-5 text-5xl leading-none text-white sm:text-7xl lg:text-8xl">
          Find Your People.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/50 sm:text-lg sm:leading-8">
          Discover all the people, personalities, and interests moving through
          SIGNAL.
        </p>
      </header>

      {parameters?.social === "updated" ? (
        <StatusMessage className="mx-auto mt-8 max-w-3xl" tone="success">
          Your connection settings were updated.
        </StatusMessage>
      ) : null}

      {parameters?.social === "error" ? (
        <StatusMessage className="mx-auto mt-8 max-w-3xl" tone="error">
          That connection could not be changed.
        </StatusMessage>
      ) : null}

      <form
        className="mx-auto mt-10 flex max-w-4xl flex-col gap-3 sm:flex-row"
        method="get"
      >
        <label className="sr-only" htmlFor="people-search">
          Search People
        </label>
        <div className="relative">
          <label className="sr-only" htmlFor="interest-filter">
            Filter By Interest
          </label>

          <SlidersHorizontal
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35"
          />

          <select
            className="min-h-14 w-full appearance-none rounded-full border border-white/10 bg-black/45 pr-10 pl-11 text-sm font-bold text-white/70 backdrop-blur-xl transition outline-none hover:border-white/20 focus:border-[#ca9aff]/70 sm:w-52"
            defaultValue={selectedInterest}
            id="interest-filter"
            name="interest"
          >
            <option value="">Filter By Interests</option>

            {(interestsResult.data ?? []).map((interest) => (
              <option key={interest.id} value={interest.id}>
                {interest.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-5 size-4 -translate-y-1/2 text-white/30"
          />

          <input
            className="min-h-14 w-full rounded-full border border-white/10 bg-black/45 pr-5 pl-12 text-white shadow-xl backdrop-blur-xl transition outline-none placeholder:text-white/25 focus:border-[#ca9aff]/70"
            defaultValue={parameters?.q}
            id="people-search"
            name="q"
            placeholder="Search bios, usernames, or interests"
          />
        </div>

        <button
          className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6c14ce] to-[#992bff] px-7 font-bold text-white shadow-[0_12px_40px_rgba(108,20,206,.25)] transition hover:scale-[1.02] motion-reduce:transform-none"
          type="submit"
        >
          Search
        </button>
      </form>

      {incoming.length ? (
        <section className="mt-16" aria-labelledby="requests-title">
          <h2
            className="flex items-center justify-center gap-3 text-2xl font-bold text-white"
            id="requests-title"
          >
            <UserRoundPlus
              aria-hidden="true"
              className="size-5 text-[#ca9aff]"
            />
            Friend Requests
          </h2>

          <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-2">
            {allVisiblePeople
              .filter((profile) => incomingIds.has(profile.id))
              .map((profile) => (
                <article
                  className="rounded-[1.75rem] border border-white/10 bg-black/45 p-5 text-center backdrop-blur-xl"
                  key={profile.id}
                >
                  <div
                    className="mx-auto size-16 rounded-full border-2 bg-black bg-cover bg-center"
                    style={{
                      borderColor: profile.accentColor,
                      ...(profile.avatarUrl
                        ? {
                            backgroundImage: `url(${JSON.stringify(
                              profile.avatarUrl,
                            )})`,
                          }
                        : {}),
                    }}
                  />

                  <Link
                    className="mt-3 block text-xl font-bold text-white hover:text-[#ca9aff]"
                    href={`/home/profiles/${profile.username}`}
                  >
                    {profile.displayName}
                  </Link>

                  <p className="mt-1 text-sm text-white/40">
                    @{profile.username}
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-4">
                    <form action={acceptFriendRequestAction}>
                      <input
                        name="targetUserId"
                        type="hidden"
                        value={profile.id}
                      />
                      <input
                        name="returnTo"
                        type="hidden"
                        value="/home/people"
                      />

                      <button
                        className="min-h-10 rounded-full bg-[#992bff] px-5 text-sm font-bold text-white"
                        type="submit"
                      >
                        Accept
                      </button>
                    </form>

                    <form action={removeFriendshipAction}>
                      <input
                        name="targetUserId"
                        type="hidden"
                        value={profile.id}
                      />
                      <input
                        name="returnTo"
                        type="hidden"
                        value="/home/people"
                      />

                      <button
                        className="text-sm font-bold text-white/45 hover:text-white/70"
                        type="submit"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ) : null}

      <section className="mt-20" aria-labelledby="discover-title">
        {people.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {people.map((profile) => (
              <ProfilePreview
                hasIncomingRequest={incomingIds.has(profile.id)}
                isFollowing={followingIds.has(profile.id)}
                isFriend={friendIds.has(profile.id)}
                key={profile.id}
                person={profile}
              />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-xl rounded-[2rem] border border-white/10 bg-black/35 p-10 text-center backdrop-blur-xl">
            <Sparkles
              aria-hidden="true"
              className="mx-auto size-6 text-[#f359d2]"
            />

            <p className="mt-4 font-bold text-white">No Profiles Found.</p>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Try another name, username, or bio keyword.
            </p>
          </div>
        )}
      </section>

      <section className="mt-24" aria-labelledby="connections-title">
        <div className="text-center">
          <p className="text-xs font-black tracking-[0.2em] text-[#ca9aff] uppercase">
            Your Circle
          </p>

          <h2
            className="mt-3 text-3xl font-black text-white sm:text-4xl"
            id="connections-title"
          >
            Your Connections
          </h2>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <ConnectionList
            action={removeFriendshipAction}
            actionLabel="Remove"
            ids={friendIds}
            people={allVisiblePeople}
            title="Friends"
          />

          <ConnectionList
            ids={followingIds}
            people={allVisiblePeople}
            title="Following"
          />

          <ConnectionList
            action={removeFollowerAction}
            actionLabel="Remove"
            ids={followerIds}
            people={allVisiblePeople}
            title="Followers"
          />
        </div>
      </section>
    </div>
  );
}
