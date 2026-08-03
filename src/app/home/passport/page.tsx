import type { Metadata } from "next";
import {
  BadgeCheck,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Tags,
} from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { PassportEntryCard } from "@/features/passport/passport-entry-card";
import { summarizePassport } from "@/features/passport/passport-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your Passport" };
export const dynamic = "force-dynamic";

export default async function PassportPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

  const [entryResult, profileResult] = await Promise.all([
    supabase
      .from("passport_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("occurred_at", { ascending: false })
      .limit(100),
    supabase
      .from("profiles")
      .select("timezone")
      .eq("id", userData.user.id)
      .maybeSingle(),
  ]);

  if (entryResult.error) {
    return (
      <StatusMessage tone="error">
        Passport is unavailable. Confirm that all eight ordered migrations,
        including the Phase 9 and Phase 10 migrations, are applied to Supabase.
      </StatusMessage>
    );
  }

  const entries = entryResult.data ?? [];
  const summary = summarizePassport(entries);
  const timezone = profileResult.data?.timezone ?? "UTC";

  return (
    <div>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-emerald-300 uppercase">
            <BadgeCheck aria-hidden="true" className="size-4" /> Private
            Passport
          </p>
          <h1 className="display-type mt-4 max-w-3xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Contribution, made credible.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Passport records activity only after an authorized product workflow
            verifies it. It is your private history—not a popularity score,
            public leaderboard, or place to self-report accomplishments.
          </p>
        </div>
        <ButtonLink href="/home">Find your next experience</ButtonLink>
      </div>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border border-neutral-800 bg-neutral-900 p-5">
          <dt className="flex items-center gap-2 text-sm text-neutral-400">
            <ShieldCheck
              aria-hidden="true"
              className="size-4 text-emerald-300"
            />
            Verified activities
          </dt>
          <dd className="display-type mt-3 text-4xl text-white">
            {summary.verifiedCount}
          </dd>
        </div>
        <div className="rounded-[1.5rem] border border-neutral-800 bg-neutral-900 p-5">
          <dt className="flex items-center gap-2 text-sm text-neutral-400">
            <Layers3 aria-hidden="true" className="size-4 text-emerald-300" />
            Product spaces
          </dt>
          <dd className="display-type mt-3 text-4xl text-white">
            {summary.moduleCount}
          </dd>
        </div>
        <div className="rounded-[1.5rem] border border-neutral-800 bg-neutral-900 p-5">
          <dt className="flex items-center gap-2 text-sm text-neutral-400">
            <Tags aria-hidden="true" className="size-4 text-emerald-300" />
            Contribution types
          </dt>
          <dd className="display-type mt-3 text-4xl text-white">
            {summary.activityCount}
          </dd>
        </div>
      </dl>

      {summary.correctionCount ? (
        <StatusMessage className="mt-6">
          {summary.correctionCount} corrected{" "}
          {summary.correctionCount === 1 ? "entry remains" : "entries remain"}{" "}
          visible for a transparent history, but no longer counts as verified.
        </StatusMessage>
      ) : null}

      <section aria-labelledby="passport-history" className="mt-12">
        <h2 id="passport-history" className="text-3xl font-bold text-white">
          Verified history
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-400">
          The newest 100 entries and corrections are shown. Repeated processing
          of the same source activity cannot create a duplicate.
        </p>

        {entries.length ? (
          <ol className="mt-7 grid gap-5 lg:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <PassportEntryCard entry={entry} timezone={timezone} />
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-7">
            <PreviewState title="No verified activity yet">
              Passport begins only when an authorized Session, Creator Commons,
              or Fifth Realm workflow confirms eligible participation. FIFTHS
              does not add samples or convert membership alone into credit.
            </PreviewState>
          </div>
        )}
      </section>

      <aside className="mt-12 rounded-[2rem] border border-emerald-950 bg-neutral-950 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <LockKeyhole aria-hidden="true" className="size-5 text-emerald-300" />
          <h2 className="text-2xl font-bold text-white">Private by default</h2>
        </div>
        <ul className="mt-5 grid gap-4 text-sm leading-6 text-neutral-400 md:grid-cols-3">
          <li>
            Only you can read your Passport entries under Row Level Security.
          </li>
          <li>Members cannot insert, edit, delete, or self-verify activity.</li>
          <li>
            Corrections stay visible to you and are recorded in a private audit
            log.
          </li>
        </ul>
      </aside>
    </div>
  );
}
