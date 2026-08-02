import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your Home" };
export const dynamic = "force-dynamic";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

export default async function PersonalHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ onboarding?: string; pulse?: string }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [pulseResult, parameters] = await Promise.all([
    supabase
      .from("pulse_check_ins")
      .select("*")
      .gt("expires_at", "now")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    searchParams,
  ]);

  if (pulseResult.error) {
    return (
      <StatusMessage tone="error">
        Your personal Home could not load Pulse data. Confirm that the Phase 3
        migration has been applied to the connected Supabase project.
      </StatusMessage>
    );
  }

  const pulse = pulseResult.data;
  const mode = pulse
    ? (
        await supabase
          .from("modes")
          .select("name")
          .eq("id", pulse.mode_id)
          .maybeSingle()
      ).data
    : null;

  return (
    <div>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            Personal Home
          </p>
          <h1 className="display-type mt-4 max-w-3xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Start with what you have today.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
            Your Home turns a private Pulse into clear, explainable paths across
            the FIFTHS ecosystem as each product becomes available.
          </p>
        </div>
        <ButtonLink href="/home/pulse">
          {pulse ? "Refresh your Pulse" : "Check your Pulse"}
        </ButtonLink>
      </div>

      {parameters?.pulse === "recorded" ? (
        <StatusMessage className="mt-8" tone="success">
          Your Pulse was saved privately and is active for matching for 24
          hours.
        </StatusMessage>
      ) : null}
      {parameters?.onboarding === "complete" ? (
        <StatusMessage className="mt-8" tone="success">
          Your profile foundation is complete. Your personal Home is ready.
        </StatusMessage>
      ) : null}

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Activity aria-hidden="true" className="size-5 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Current Pulse</h2>
          </div>
          {pulse ? (
            <>
              <div className="mt-7 flex flex-col gap-5 border-b border-neutral-800 pb-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="display-type text-4xl text-white">
                    {mode?.name ?? "Your mode"}
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    Energy {pulse.energy_level}/5 ·{" "}
                    {readable(pulse.stimulation_level)} stimulation
                  </p>
                </div>
                <span className="w-fit rounded-full border border-neutral-700 px-4 py-2 text-xs font-bold text-neutral-200">
                  24-hour matching window
                </span>
              </div>
              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-neutral-500">Social pace</dt>
                  <dd className="mt-1 font-bold text-white capitalize">
                    {readable(pulse.social_intensity)}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Format</dt>
                  <dd className="mt-1 font-bold text-white capitalize">
                    {readable(pulse.preferred_format)}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Time</dt>
                  <dd className="mt-1 font-bold text-white">
                    {pulse.available_minutes >= 60
                      ? `${pulse.available_minutes / 60} hr`
                      : `${pulse.available_minutes} min`}
                  </dd>
                </div>
              </dl>
              <ButtonLink
                className="mt-7"
                href="/home/pulse/history"
                variant="secondary"
              >
                View private history
              </ButtonLink>
            </>
          ) : (
            <div className="mt-6">
              <PreviewState title="No Pulse recorded">
                Check in when you are ready. FIFTHS does not infer your energy
                or show demonstration activity in your private Home.
              </PreviewState>
            </div>
          )}
        </section>

        <aside className="rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-emerald-400"
            />
            <h2 className="text-xl font-bold text-white">Private by design</h2>
          </div>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-neutral-400">
            <li className="flex gap-3">
              <ArrowRight
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-red-400"
              />
              Only you can read your Pulse history under Row Level Security.
            </li>
            <li className="flex gap-3">
              <Clock3
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-red-400"
              />
              A check-in stops influencing matches after 24 hours.
            </li>
            <li className="flex gap-3">
              <Sparkles
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-red-400"
              />
              Matching uses documented rules and reason labels—not AI or health
              profiling.
            </li>
          </ul>
        </aside>
      </div>

      <section className="mt-10 rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[0.18em] text-red-400 uppercase">
          Recommendation foundation
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          Explainable matches, ready for real inventory.
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
          Phase 3 can rank eligible future experiences by mode, energy,
          stimulation, social pace, format, time, interests, and broad travel
          range. It returns plain-language reasons and never exposes a raw
          score.
        </p>
        <div className="mt-6">
          <PreviewState title="No live recommendations yet">
            Sessions and product discovery begin in Phase 4 and later. This
            state will not invent events, communities, opportunities, or
            campaigns before they exist.
          </PreviewState>
        </div>
      </section>
    </div>
  );
}
