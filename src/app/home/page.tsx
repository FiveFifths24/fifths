import type { Metadata } from "next";
import { Activity, Map, Sparkles } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { FriendsActivity } from "@/features/activity/friends-activity";
import { updateTutorialAction } from "@/features/onboarding/tutorial-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your Home" };
export const dynamic = "force-dynamic";

function readable(value: string) {
  return value.replaceAll("_", " ");
}

const dailySignals = [
  {
    type: "Joke",
    text: "Why did the developer go broke? Because they used up all their cache.",
  },
  { type: "Fact", text: "Octopuses have three hearts." },
  {
    type: "Joke",
    text: "Why was the calendar nervous? Its days were numbered.",
  },
  { type: "Fact", text: "A day on Venus is longer than a year on Venus." },
  {
    type: "Joke",
    text: "Why don't skeletons start group chats? They don't have the guts.",
  },
  { type: "Fact", text: "Wombat droppings are cube-shaped." },
  { type: "Fact", text: "Sharks existed before trees." },
] as const;

function getDailySignal() {
  const now = new Date();
  const dayNumber = Math.floor(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) /
      86_400_000,
  );
  return dailySignals[dayNumber % dailySignals.length]!;
}

function validActivityCursor(value: string | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

function validActivityId(value: string | undefined) {
  return value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
    ? value
    : null;
}

export default async function PersonalHomePage({
  searchParams,
}: {
  searchParams?: Promise<{
    onboarding?: string;
    pulse?: string;
    activityBefore?: string;
    activityBeforeId?: string;
  }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const parameters = await searchParams;
  const { data: userData } = await supabase.auth.getUser();
  const activityBefore = validActivityCursor(parameters?.activityBefore);
  const activityBeforeId = validActivityId(parameters?.activityBeforeId);
  const [
    pulseResult,
    modeResult,
    profileResult,
    activityResult,
    tutorialResult,
  ] = await Promise.all([
    supabase
      .from("pulse_check_ins")
      .select("*")
      .gt("expires_at", "now")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("modes").select("id, slug, name").order("sort_order"),
    userData.user
      ? supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userData.user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.rpc("get_friend_activity", {
      p_before: activityBefore,
      p_before_id: activityBeforeId,
      p_limit: 20,
    }),
    supabase.from("signal_tutorial_progress").select("status").maybeSingle(),
  ]);

  if (pulseResult.error) {
    return (
      <StatusMessage tone="error">
        Your Home is temporarily unavailable. Please try again shortly.
      </StatusMessage>
    );
  }

  const pulse = pulseResult.data;
  const mode = pulse
    ? (modeResult.data ?? []).find((item) => item.id === pulse.mode_id)
    : null;
  const displayName = profileResult.data?.display_name ?? "You";
  const dailySignal = getDailySignal();
  const showTutorialWelcome =
    !tutorialResult.data || tutorialResult.data.status === "not_started";

  return (
    <div>
      {parameters?.pulse === "recorded" ? (
        <StatusMessage className="mt-8" tone="success">
          Your Pulse was saved privately and is active for matching for 24
          hours.
        </StatusMessage>
      ) : null}
      {parameters?.onboarding === "complete" ? (
        <StatusMessage className="mt-8" tone="success">
          Your Home is ready.
        </StatusMessage>
      ) : null}

      {showTutorialWelcome ? (
        <section className="mt-8 rounded-[2rem] border border-[#f359d2]/30 bg-[radial-gradient(circle_at_top_right,rgba(243,89,210,.13),transparent_42%),rgba(0,0,0,.42)] p-6 text-center shadow-[0_18px_60px_rgba(0,0,0,.3)] sm:p-8 sm:text-left">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div>
              <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.18em] text-[#f359d2] uppercase sm:justify-start">
                <Map aria-hidden="true" className="size-4" />
                New to SIGNAL?
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                Learn it one place at a time.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300">
                Take a short, skippable tour using real product routes. Your
                place is saved so you can return later.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink
                className="w-full sm:w-auto"
                href="/home/getting-started"
              >
                Start Tour
              </ButtonLink>
              <form action={updateTutorialAction}>
                <input name="intent" type="hidden" value="skip" />
                <input name="step" type="hidden" value="0" />
                <button
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f359d2] sm:w-auto"
                  type="submit"
                >
                  Explore On My Own
                </button>
              </form>
            </div>
          </div>
        </section>
      ) : null}

      <header className="mt-10 text-center sm:text-left">
        <p className="text-xs font-black tracking-[0.2em] text-[#f359d2] uppercase">
          {displayName}&apos;s SIGNAL
        </p>
        <h1 className="display-type mt-3 text-5xl text-white sm:text-7xl">
          What&apos;s happening in your world?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
          A finite look at meaningful updates from your friends—without an
          endless feed or passive tracking.
        </p>
      </header>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/45 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
          <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:text-left">
            <div className="flex items-center gap-3">
              <Activity aria-hidden="true" className="size-6 text-[#f359d2]" />
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Current Pulse
              </h2>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-2 sm:w-auto sm:items-end">
              <ButtonLink className="w-full sm:w-52" href="/home/pulse">
                {pulse ? "Refresh Your Pulse" : "Check Your Pulse"}
              </ButtonLink>
              {pulse ? (
                <ButtonLink
                  className="w-full sm:w-52"
                  href="/home/pulse/history"
                  variant="secondary"
                >
                  View Private History
                </ButtonLink>
              ) : null}
            </div>
          </div>

          {pulse ? (
            <>
              <div className="mt-10 border-b border-white/10 pb-5 text-center sm:text-left">
                <p className="display-type text-4xl text-white">
                  {mode?.name ?? "Your mode"}
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  Energy {pulse.energy_level}/5 ·{" "}
                  {readable(pulse.stimulation_level)} Stimulation
                </p>
              </div>
              <dl className="mt-6 grid gap-5 text-center text-sm sm:grid-cols-3 sm:text-left">
                <div>
                  <dt className="text-neutral-500">Social Pace</dt>
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
            </>
          ) : (
            <div className="mt-6">
              <PreviewState title="No Pulse Recorded">
                Check in when you are ready. SIGNAL does not infer your energy
                or manufacture activity in your private Home.
              </PreviewState>
            </div>
          )}
        </section>

        <aside className="relative overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/45 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles aria-hidden="true" className="size-5 text-[#f359d2]" />
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Daily Signal
              </h2>
            </div>
            <span className="rounded-full border border-[#ca9aff]/20 bg-[#6c14ce]/10 px-3 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-[#ca9aff] uppercase">
              {dailySignal.type}
            </span>
          </div>
          <div className="flex min-h-44 items-center py-8">
            <p className="max-w-md text-2xl leading-relaxed font-semibold tracking-tight text-white">
              {dailySignal.text}
            </p>
          </div>
          <p className="border-t border-white/10 pt-4 text-xs text-white/35">
            A new Signal appears every 24 hours.
          </p>
        </aside>
      </div>

      <FriendsActivity
        items={activityResult.data ?? []}
        unavailable={Boolean(activityResult.error)}
      />
    </div>
  );
}
