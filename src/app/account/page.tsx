import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, EyeOff, LockKeyhole, ShieldBan } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { signOutAction } from "@/features/auth/actions";
import {
  addBlockedWordAction,
  removeBlockedWordAction,
  unblockProfileAction,
  unmuteProfileAction,
} from "@/features/profiles/actions";
import { ProfileSettingsForm } from "@/features/profiles/profile-settings-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{
    onboarding?: string;
    password?: string;
    filter?: string;
    social?: string;
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
    roleResult,
    blockedResult,
    mutedResult,
    wordsResult,
    parameters,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
    supabase
      .from("profile_blocks")
      .select("blocked_id, blocked_username, blocked_display_name, created_at")
      .eq("blocker_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profile_mutes")
      .select("muted_id, muted_username, muted_display_name, created_at")
      .eq("muter_id", userData.user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profile_blocked_words")
      .select("id, word")
      .eq("user_id", userData.user.id)
      .order("word"),
    searchParams,
  ]);

  if (!profileResult.data?.onboarding_completed_at) redirect("/onboarding");
  const profile = profileResult.data;

  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
          Your FIFTHS identity
        </p>
        <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
          Welcome, {profile.display_name}.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
          Your identity stays shared across every FIFTHS product. Pulse and your
          private personal Home are now the first active product foundation.
        </p>

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
        {parameters?.filter === "updated" ? (
          <StatusMessage className="mt-5" tone="success">
            Your word filters were updated.
          </StatusMessage>
        ) : null}
        {parameters?.filter && parameters.filter !== "updated" ? (
          <StatusMessage className="mt-5" tone="error">
            That word filter could not be changed.
          </StatusMessage>
        ) : null}
        {parameters?.social === "updated" ? (
          <StatusMessage className="mt-5" tone="success">
            Your safety controls were updated. Unblocking does not restore a
            friendship or follow.
          </StatusMessage>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-center gap-3">
              <Check aria-hidden="true" className="size-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Profile ready</h2>
            </div>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-neutral-500">Username</dt>
                <dd className="mt-1 font-semibold text-white">
                  @{profile.username}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Email</dt>
                <dd className="mt-1 break-all text-neutral-200">
                  {userData.user.email}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Time zone</dt>
                <dd className="mt-1 text-neutral-200">{profile.timezone}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-center gap-3">
              <LockKeyhole aria-hidden="true" className="size-5 text-red-400" />
              <h2 className="text-xl font-bold text-white">
                Access foundation
              </h2>
            </div>
            <p className="mt-5 text-sm leading-6 text-neutral-400">
              Active roles:{" "}
              {roleResult.data
                ?.map(({ role }) => role.replaceAll("_", " "))
                .join(", ") || "member"}
              . Elevated roles cannot be self-assigned.
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              Pulse check-ins, private history, Sessions, registrations,
              Circles, and Creator Commons participation are available from your
              Home. Fifth Realm and Passport activity remain intentionally
              inactive.
            </p>
          </section>
        </div>

        <section className="mt-10 rounded-[2rem] border border-[#992bff]/25 bg-[#992bff]/[0.05] p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-white">
            Customize your profile
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
            Add one profile photo and a static background that feels like you.
            You can replace either image whenever you want.
          </p>
          <div className="mt-7">
            <ProfileSettingsForm
              profile={{
                username: profile.username ?? "",
                displayName: profile.display_name ?? "",
                bio: profile.bio ?? "",
                visibility: profile.visibility,
                discoverable: profile.discoverable,
              }}
            />
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <EyeOff aria-hidden="true" className="size-5 text-[#f359d2]" />
            <h2 className="text-2xl font-bold text-white">Blocked words</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/45">
            SIGNAL will use these words to remove matching titles, descriptions,
            and posts from your discovery experience.
          </p>
          <form
            action={addBlockedWordAction}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <label className="sr-only" htmlFor="blocked-word">
              Word or phrase
            </label>
            <input
              className="min-h-12 min-w-0 flex-1 rounded-full border border-white/10 bg-black/35 px-5 text-white outline-none focus:border-[#ca9aff]/70"
              id="blocked-word"
              maxLength={50}
              minLength={2}
              name="word"
              placeholder="Add a word or short phrase"
              required
            />
            <button
              className="min-h-12 rounded-full bg-[#992bff] px-6 font-bold text-white"
              type="submit"
            >
              Block word
            </button>
          </form>
          {(wordsResult.data ?? []).length ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {(wordsResult.data ?? []).map((item) => (
                <li
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm text-white"
                  key={item.id}
                >
                  <span>{item.word}</span>
                  <form action={removeBlockedWordAction}>
                    <input name="wordId" type="hidden" value={item.id} />
                    <button
                      aria-label={`Remove ${item.word} filter`}
                      className="font-bold text-red-300"
                      type="submit"
                    >
                      ×
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-[2rem] border border-red-900/40 bg-red-950/15 p-6">
            <div className="flex items-center gap-3">
              <ShieldBan aria-hidden="true" className="size-5 text-red-300" />
              <h2 className="text-2xl font-bold text-white">Blocked members</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Blocking severs friendships and follows in both directions.
              Unblocking restores visibility only.
            </p>
            {(blockedResult.data ?? []).length ? (
              <ul className="mt-5 space-y-3">
                {(blockedResult.data ?? []).map((item) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-4"
                    key={item.blocked_id}
                  >
                    <div>
                      <p className="font-bold text-white">
                        {item.blocked_display_name ?? "Blocked member"}
                      </p>
                      <p className="text-xs text-white/35">
                        {item.blocked_username
                          ? `@${item.blocked_username}`
                          : ""}
                      </p>
                    </div>
                    <form action={unblockProfileAction}>
                      <input
                        name="targetUserId"
                        type="hidden"
                        value={item.blocked_id}
                      />
                      <input name="returnTo" type="hidden" value="/account" />
                      <button
                        className="text-sm font-bold text-red-200"
                        type="submit"
                      >
                        Unblock
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-white/35">
                You have not blocked anyone.
              </p>
            )}
          </section>
          <section className="rounded-[2rem] border border-white/10 bg-neutral-900 p-6">
            <div className="flex items-center gap-3">
              <EyeOff aria-hidden="true" className="size-5 text-[#ca9aff]" />
              <h2 className="text-2xl font-bold text-white">Muted members</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/45">
              Muting quietly removes someone’s content without unfollowing or
              removing the friendship.
            </p>
            {(mutedResult.data ?? []).length ? (
              <ul className="mt-5 space-y-3">
                {(mutedResult.data ?? []).map((item) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-4"
                    key={item.muted_id}
                  >
                    <div>
                      <p className="font-bold text-white">
                        {item.muted_display_name ?? "Muted member"}
                      </p>
                      <p className="text-xs text-white/35">
                        {item.muted_username ? `@${item.muted_username}` : ""}
                      </p>
                    </div>
                    <form action={unmuteProfileAction}>
                      <input
                        name="targetUserId"
                        type="hidden"
                        value={item.muted_id}
                      />
                      <input name="returnTo" type="hidden" value="/account" />
                      <button
                        className="text-sm font-bold text-[#d8b4fe]"
                        type="submit"
                      >
                        Unmute
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-white/35">
                You have not muted anyone.
              </p>
            )}
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/home">Go to your Home</ButtonLink>
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
