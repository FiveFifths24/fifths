import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search, UserRoundPlus, UsersRound } from "lucide-react";
import { StatusMessage } from "@/components/ui/status-message";
import {
  acceptFriendRequestAction,
  removeFollowerAction,
  removeFriendshipAction,
} from "@/features/profiles/actions";
import { otherFriendId } from "@/features/profiles/relationship-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "People" };
export const dynamic = "force-dynamic";

const cardClass = "rounded-[1.5rem] border border-white/10 bg-black/30 p-5";

function ConnectionList({
  title,
  ids,
  people,
  action,
  actionLabel,
}: {
  title: string;
  ids: Set<string>;
  people: Array<{ id: string; username: string; display_name: string }>;
  action?: (formData: FormData) => void | Promise<void>;
  actionLabel?: string;
}) {
  const matches = people.filter((profile) => ids.has(profile.id));
  if (!matches.length) return null;
  return (
    <div>
      <h3 className="text-sm font-bold tracking-wide text-white/45 uppercase">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {matches.map((profile) => (
          <li
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 p-4"
            key={profile.id}
          >
            <Link
              className="font-bold text-white hover:text-[#ca9aff]"
              href={`/home/profiles/${profile.username}`}
            >
              {profile.display_name}
              <span className="ml-2 text-xs font-normal text-white/35">
                @{profile.username}
              </span>
            </Link>
            {action && actionLabel ? (
              <form action={action}>
                <input name="targetUserId" type="hidden" value={profile.id} />
                <input name="returnTo" type="hidden" value="/home/people" />
                <button
                  className="text-xs font-bold text-red-200"
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
  searchParams?: Promise<{ q?: string; social?: string }>;
}) {
  const parameters = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/home/people");
  const userId = userData.user.id;

  const [peopleResult, friendshipsResult, followsResult] = await Promise.all([
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
  ]);

  if (peopleResult.error || friendshipsResult.error || followsResult.error) {
    return (
      <StatusMessage tone="error">
        People and connections require the latest profile social migration.
      </StatusMessage>
    );
  }

  const query = parameters?.q?.trim().toLowerCase() ?? "";
  const allVisiblePeople = (peopleResult.data ?? []).filter(
    (profile) => profile.id !== userId,
  );
  const people = allVisiblePeople.filter(
    (profile) =>
      profile.discoverable &&
      (!query ||
        `${profile.display_name ?? ""} ${profile.username ?? ""} ${profile.bio ?? ""}`
          .toLowerCase()
          .includes(query)),
  );
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
    <div className="mx-auto max-w-6xl">
      <p className="text-xs font-bold tracking-[0.2em] text-[#f359d2] uppercase">
        Your community
      </p>
      <h1 className="display-type mt-4 text-center text-5xl text-white sm:text-left sm:text-7xl">
        Find your people.
      </h1>
      <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-white/55 sm:mx-0 sm:text-left">
        Follow people whose energy interests you. Friendship begins only when
        both people choose it.
      </p>
      {parameters?.social === "updated" ? (
        <StatusMessage className="mt-7" tone="success">
          Your connection settings were updated.
        </StatusMessage>
      ) : null}
      {parameters?.social === "error" ? (
        <StatusMessage className="mt-7" tone="error">
          That connection could not be changed.
        </StatusMessage>
      ) : null}

      <form className="mt-8 flex gap-3" method="get">
        <label className="sr-only" htmlFor="people-search">
          Search people
        </label>
        <input
          className="min-h-12 min-w-0 flex-1 rounded-full border border-white/10 bg-black/35 px-5 text-white outline-none focus:border-[#ca9aff]/70"
          defaultValue={parameters?.q}
          id="people-search"
          name="q"
          placeholder="Search names, usernames, or bios"
        />
        <button
          className="flex min-h-12 items-center gap-2 rounded-full bg-[#992bff] px-5 font-bold text-white"
          type="submit"
        >
          <Search aria-hidden="true" className="size-4" />
          Search
        </button>
      </form>

      {incoming.length ? (
        <section className="mt-10" aria-labelledby="requests-title">
          <h2
            className="flex items-center gap-3 text-2xl font-bold text-white"
            id="requests-title"
          >
            <UserRoundPlus
              aria-hidden="true"
              className="size-5 text-[#ca9aff]"
            />
            Friend requests
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {allVisiblePeople
              .filter((profile) => incomingIds.has(profile.id))
              .map((profile) => (
                <article className={cardClass} key={profile.id}>
                  <Link
                    className="text-xl font-bold text-white hover:text-[#ca9aff]"
                    href={`/home/profiles/${profile.username}`}
                  >
                    {profile.display_name}
                  </Link>
                  <p className="mt-1 text-sm text-white/40">
                    @{profile.username}
                  </p>
                  <form action={acceptFriendRequestAction} className="mt-4">
                    <input
                      name="targetUserId"
                      type="hidden"
                      value={profile.id}
                    />
                    <input name="returnTo" type="hidden" value="/home/people" />
                    <button
                      className="min-h-10 rounded-full bg-[#992bff] px-4 text-sm font-bold text-white"
                      type="submit"
                    >
                      Accept
                    </button>
                  </form>
                  <form action={removeFriendshipAction} className="mt-3">
                    <input
                      name="targetUserId"
                      type="hidden"
                      value={profile.id}
                    />
                    <input name="returnTo" type="hidden" value="/home/people" />
                    <button
                      className="text-sm font-bold text-white/45"
                      type="submit"
                    >
                      Decline
                    </button>
                  </form>
                </article>
              ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12" aria-labelledby="connections-title">
        <h2 className="text-2xl font-bold text-white" id="connections-title">
          Your connections
        </h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-3">
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

      <section className="mt-12" aria-labelledby="discover-title">
        <h2
          className="flex items-center gap-3 text-2xl font-bold text-white"
          id="discover-title"
        >
          <UsersRound aria-hidden="true" className="size-5 text-[#f359d2]" />
          People on SIGNAL
        </h2>
        {people.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((profile) => (
              <article className={cardClass} key={profile.id}>
                <Link
                  className="text-xl font-bold text-white hover:text-[#ca9aff]"
                  href={`/home/profiles/${profile.username}`}
                >
                  {profile.display_name}
                </Link>
                <p className="mt-1 text-sm text-white/40">
                  @{profile.username}
                </p>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/55">
                  {profile.bio || "Finding their SIGNAL."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#d8b4fe]">
                  {friendIds.has(profile.id) ? <span>Friend</span> : null}
                  {followingIds.has(profile.id) ? <span>Following</span> : null}
                  {incomingIds.has(profile.id) ? (
                    <span>Request received</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-white/45">
            No discoverable profiles match that search.
          </p>
        )}
      </section>
    </div>
  );
}
