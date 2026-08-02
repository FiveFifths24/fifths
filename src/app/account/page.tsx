import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check, LockKeyhole } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Container } from "@/components/ui/container";
import { StatusMessage } from "@/components/ui/status-message";
import { signOutAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ onboarding?: string; password?: string }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/account");

  const [profileResult, roleResult, parameters] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
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
          Your secure account and profile foundation are ready. Product activity
          begins in later phases.
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
              Pulse, recommendations, registrations, Circle membership, Creator
              Commons, Fifth Realm, and Passport activity remain intentionally
              inactive.
            </p>
          </section>
        </div>

        <form action={signOutAction} className="mt-8">
          <button
            className="min-h-12 rounded-full border border-neutral-700 px-6 py-3 font-bold text-white hover:border-neutral-500"
            type="submit"
          >
            Log out
          </button>
        </form>
      </div>
    </Container>
  );
}
