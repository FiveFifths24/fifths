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
import { StatusMessage } from "@/components/ui/status-message";
import { PassportEntryCard } from "@/features/passport/passport-entry-card";
import { summarizePassport } from "@/features/passport/passport-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your Passport",
};

export const dynamic = "force-dynamic";

export default async function PassportPage() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const [entryResult, profileResult] = await Promise.all([
    supabase
      .from("passport_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("occurred_at", {
        ascending: false,
      })
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
        Passport is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }

  const entries = entryResult.data ?? [];
  const summary = summarizePassport(entries);
  const timezone = profileResult.data?.timezone ?? "UTC";

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="grid gap-8 text-center lg:grid-cols-[1fr_auto] lg:items-end lg:text-left">
        <div>
          <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] text-[#b7ff3c] uppercase lg:justify-start">
            <BadgeCheck aria-hidden="true" className="size-4" />
            Private Passport
          </p>

          <h1 className="display-type mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:mx-0">
            Contribution, Made Credible.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-neutral-300 sm:text-lg lg:mx-0">
            Passport brings your verified activity across SIGNAL into one
            private record. Revisit the Sessions, Creator Commons opportunities,
            and Fifth Realm campaigns you’ve completed, track the ways you’ve
            contributed, and build a trusted history of your experience as you
            grow across the community.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ButtonLink
            className="min-h-12 border-0 bg-gradient-to-r from-[#00ff87] via-[#7dff00] to-[#eaff00] px-7 font-black text-black shadow-[0_0_30px_rgba(125,255,0,0.28)] transition hover:brightness-110"
            href="/home"
          >
            <BadgeCheck aria-hidden="true" className="size-4" />
            Find Your Next Experience
          </ButtonLink>
        </div>
      </header>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.75rem] border border-[#b7ff3c]/35 bg-[#071006] p-6 text-center shadow-[0_0_35px_rgba(183,255,60,0.04)] lg:text-left">
          <dt className="flex items-center justify-center gap-2 text-sm font-bold text-neutral-400 lg:justify-start">
            <ShieldCheck aria-hidden="true" className="size-4 text-[#b7ff3c]" />
            Verified activities
          </dt>

          <dd className="display-type mt-4 text-5xl text-[#b7ff3c]">
            {summary.verifiedCount}
          </dd>
        </div>

        <div className="rounded-[1.75rem] border border-[#b7ff3c]/35 bg-[#071006] p-6 text-center shadow-[0_0_35px_rgba(183,255,60,0.04)] lg:text-left">
          <dt className="flex items-center justify-center gap-2 text-sm font-bold text-neutral-400 lg:justify-start">
            <Layers3 aria-hidden="true" className="size-4 text-[#b7ff3c]" />
            Product spaces
          </dt>

          <dd className="display-type mt-4 text-5xl text-[#b7ff3c]">
            {summary.moduleCount}
          </dd>
        </div>

        <div className="rounded-[1.75rem] border border-[#b7ff3c]/35 bg-[#071006] p-6 text-center shadow-[0_0_35px_rgba(183,255,60,0.04)] lg:text-left">
          <dt className="flex items-center justify-center gap-2 text-sm font-bold text-neutral-400 lg:justify-start">
            <Tags aria-hidden="true" className="size-4 text-[#b7ff3c]" />
            Contribution types
          </dt>

          <dd className="display-type mt-4 text-5xl text-[#b7ff3c]">
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

      <section
        aria-labelledby="passport-history"
        className="mt-12 border-t border-[#b7ff3c]/15 pt-10"
      >
        <div className="text-center lg:text-left">
          <p className="text-xs font-black tracking-[0.18em] text-[#b7ff3c] uppercase">
            Your verified record
          </p>

          <h2
            className="mt-2 text-3xl font-black text-white"
            id="passport-history"
          >
            Verified History
          </h2>

          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-neutral-400 lg:mx-0">
            Your newest 100 entries and corrections appear here. The same source
            activity can never create a duplicate Passport record.
          </p>
        </div>

        {entries.length ? (
          <ol className="mt-7 grid gap-5 lg:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <PassportEntryCard entry={entry} timezone={timezone} />
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-7 rounded-[2rem] border border-dashed border-[#b7ff3c]/40 bg-[#071006] p-7 text-center sm:p-9">
            <div className="mx-auto flex size-11 items-center justify-center rounded-full border border-[#b7ff3c]/40 bg-[#b7ff3c]/10">
              <BadgeCheck
                aria-hidden="true"
                className="size-5 text-[#b7ff3c]"
              />
            </div>

            <h3 className="mt-5 text-xl font-black text-white">
              No Verified Activity Yet
            </h3>

            <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-neutral-400">
              Your Passport begins when an authorized Session, Creator Commons,
              or Fifth Realm workflow confirms eligible participation. FIFTHS
              does not add sample activity or turn membership alone into credit.
            </p>

            <ButtonLink
              className="mx-auto mt-6 flex w-fit border-0 bg-gradient-to-r from-[#00ff87] via-[#7dff00] to-[#eaff00] font-black text-black shadow-[0_0_30px_rgba(125,255,0,0.24)] transition hover:brightness-110"
              href="/home"
            >
              <BadgeCheck aria-hidden="true" className="size-4" />
              Explore Signal
            </ButtonLink>
          </div>
        )}
      </section>

      <aside className="mt-12 rounded-[2rem] border border-[#b7ff3c]/35 bg-[#050b04] p-6 shadow-[0_0_45px_rgba(183,255,60,0.035)] sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
          <div className="flex size-10 items-center justify-center rounded-full border border-[#b7ff3c]/40 bg-[#b7ff3c]/10">
            <LockKeyhole aria-hidden="true" className="size-5 text-[#b7ff3c]" />
          </div>

          <div>
            <p className="text-xs font-black tracking-[0.18em] text-[#b7ff3c] uppercase">
              Protected record
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              Private By Default
            </h2>
          </div>
        </div>

        <ul className="mt-7 grid gap-4 text-sm leading-6 text-neutral-400 md:grid-cols-3">
          <li className="rounded-2xl border border-[#b7ff3c]/15 bg-black/25 p-5 text-center lg:text-left">
            <ShieldCheck
              aria-hidden="true"
              className="mx-auto size-4 text-[#b7ff3c] lg:mx-0"
            />

            <p className="mt-3">Only you can read your Passport entries.</p>
          </li>

          <li className="rounded-2xl border border-[#b7ff3c]/15 bg-black/25 p-5 text-center lg:text-left">
            <LockKeyhole
              aria-hidden="true"
              className="mx-auto size-4 text-[#b7ff3c] lg:mx-0"
            />

            <p className="mt-3">
              Members cannot insert, edit, delete, or self-verify activity.
            </p>
          </li>

          <li className="rounded-2xl border border-[#b7ff3c]/15 bg-black/25 p-5 text-center lg:text-left">
            <BadgeCheck
              aria-hidden="true"
              className="mx-auto size-4 text-[#b7ff3c] lg:mx-0"
            />

            <p className="mt-3">
              Corrections remain visible to you in a private audit history.
            </p>
          </li>
        </ul>
      </aside>
    </div>
  );
}
