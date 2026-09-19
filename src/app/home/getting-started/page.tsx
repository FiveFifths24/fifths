import type { Metadata } from "next";
import { Check, ChevronRight, Map, RotateCcw, Sparkles } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import {
  starterTasks,
  tutorialSteps,
} from "@/features/onboarding/signal-tutorial";
import {
  recordStarterExplorationAction,
  updateTutorialAction,
} from "@/features/onboarding/tutorial-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Getting Started" };
export const dynamic = "force-dynamic";

function validStep(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed < tutorialSteps.length
    ? parsed
    : fallback;
}

export default async function GettingStartedPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string; notice?: string }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const parameters = await searchParams;
  const [tutorialResult, starterResult] = await Promise.all([
    supabase.from("signal_tutorial_progress").select("*").maybeSingle(),
    supabase.rpc("sync_signal_starter_path"),
  ]);

  if (tutorialResult.error || starterResult.error) {
    return (
      <StatusMessage tone="error">
        Getting Started is temporarily unavailable. Your existing SIGNAL data
        was not changed.
      </StatusMessage>
    );
  }

  const progress = tutorialResult.data;
  const savedStep = progress?.current_step ?? 0;
  const activeStep = validStep(parameters?.step, savedStep);
  const step = tutorialSteps[activeStep]!;
  const completed = new Set(
    (starterResult.data ?? []).map((task) => task.task_key),
  );
  const completedCount = starterTasks.filter((task) =>
    completed.has(task.key),
  ).length;
  const showTour =
    progress?.status === "in_progress" || parameters?.step !== undefined;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {parameters?.notice === "complete" ? (
        <StatusMessage className="mb-7" tone="success">
          Tour complete. You can revisit any step whenever you want.
        </StatusMessage>
      ) : null}
      {parameters?.notice === "error" ? (
        <StatusMessage className="mb-7" tone="error">
          That progress could not be saved. Nothing was lost; please try again.
        </StatusMessage>
      ) : null}

      <header className="text-center sm:text-left">
        <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] text-[#ca9aff] uppercase sm:justify-start">
          <Map aria-hidden="true" className="size-4" />
          Getting Started
        </p>
        <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
          Welcome to SIGNAL.
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-neutral-300 sm:mx-0 sm:text-lg">
          There&apos;s a lot here, but you don&apos;t need to learn it all at
          once. Take a short, route-based tour or explore on your own. You can
          always resume later.
        </p>
      </header>

      {!showTour ? (
        <section className="mt-9 rounded-[2rem] border border-[#6c14ce]/35 bg-black/40 p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,.35)] sm:p-8 sm:text-left">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.18em] text-[#f359d2] uppercase">
                {progress?.status === "completed"
                  ? "Tour complete"
                  : progress?.status === "skipped"
                    ? "Ready when you are"
                    : "A quick orientation"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {progress?.status === "completed"
                  ? "Revisit the SIGNAL tour"
                  : progress?.status === "skipped"
                    ? "Resume your tour"
                    : "Learn SIGNAL one place at a time"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400">
                The tour uses normal product routes, never traps navigation, and
                saves your place across devices.
              </p>
            </div>

            <form action={updateTutorialAction}>
              <input name="intent" type="hidden" value="start" />
              <input name="step" type="hidden" value={savedStep} />
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#6c14ce,#f359d2)] px-6 py-3 text-sm font-black text-white shadow-[0_12px_35px_rgba(243,89,210,.2)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f359d2]"
                type="submit"
              >
                {progress ? (
                  <RotateCcw aria-hidden="true" className="size-4" />
                ) : (
                  <Sparkles aria-hidden="true" className="size-4" />
                )}
                {progress ? "Start or Resume" : "Start Tour"}
              </button>
            </form>
          </div>
        </section>
      ) : (
        <section
          aria-labelledby="tutorial-step-title"
          className="mt-9 overflow-hidden rounded-[2rem] border border-[#f359d2]/35 bg-[radial-gradient(circle_at_top_right,rgba(243,89,210,.14),transparent_40%),rgba(0,0,0,.48)] p-6 shadow-[0_20px_80px_rgba(0,0,0,.45)] sm:p-9"
        >
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <p className="text-xs font-black tracking-[0.18em] text-[#f359d2] uppercase">
              Step {activeStep + 1} of {tutorialSteps.length}
            </p>
            <div
              aria-label={`Tour progress: ${activeStep + 1} of ${tutorialSteps.length}`}
              className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10"
              role="progressbar"
              aria-valuemax={tutorialSteps.length}
              aria-valuemin={1}
              aria-valuenow={activeStep + 1}
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6c14ce,#f359d2)]"
                style={{
                  width: `${((activeStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl text-center sm:mx-0 sm:text-left">
            <step.Icon
              aria-hidden="true"
              className="mx-auto size-9 text-[#ca9aff] sm:mx-0"
            />
            <p className="mt-5 text-xs font-black tracking-[0.16em] text-[#ca9aff] uppercase">
              {step.eyebrow}
            </p>
            <h2
              className="mt-2 text-3xl font-black text-white sm:text-4xl"
              id="tutorial-step-title"
            >
              {step.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-neutral-300">
              {step.description}
            </p>
          </div>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
            <form action={updateTutorialAction}>
              <input name="intent" type="hidden" value="visit" />
              <input name="step" type="hidden" value={activeStep} />
              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:bg-[#f4e9ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f359d2] sm:w-auto"
                type="submit"
              >
                {step.cta}
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </form>

            <form action={updateTutorialAction}>
              <input
                name="intent"
                type="hidden"
                value={
                  activeStep === tutorialSteps.length - 1 ? "complete" : "next"
                }
              />
              <input name="step" type="hidden" value={activeStep} />
              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f359d2] sm:w-auto"
                type="submit"
              >
                {activeStep === tutorialSteps.length - 1
                  ? "Finish Tour"
                  : "Continue Without Visiting"}
              </button>
            </form>

            <form action={updateTutorialAction} className="sm:ml-auto">
              <input name="intent" type="hidden" value="skip" />
              <input name="step" type="hidden" value={activeStep} />
              <button
                className="min-h-12 w-full rounded-full px-5 py-3 text-sm font-bold text-white/55 transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f359d2] sm:w-auto"
                type="submit"
              >
                Explore On My Own
              </button>
            </form>
          </div>
        </section>
      )}

      <section aria-labelledby="starter-path-title" className="mt-14">
        <div className="text-center sm:text-left">
          <p className="text-xs font-black tracking-[0.18em] text-[#b7ff3c] uppercase">
            {completedCount} of {starterTasks.length} complete
          </p>
          <h2
            className="mt-2 text-3xl font-black text-white sm:text-4xl"
            id="starter-path-title"
          >
            SIGNAL Starter Path
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-neutral-400 sm:mx-0">
            These are private onboarding milestones—not verified Passport
            participation, public scores, or a leaderboard.
          </p>
        </div>

        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {starterTasks.map((task) => {
            const isComplete = completed.has(task.key);
            const exploration =
              task.key === "commons_explored"
                ? "commons"
                : task.key === "realm_visited"
                  ? "realm"
                  : task.key === "passport_opened"
                    ? "passport"
                    : null;

            return (
              <li
                className="flex flex-col items-center rounded-[1.5rem] border border-white/10 bg-black/35 p-5 text-center sm:items-start sm:text-left"
                key={task.key}
              >
                <div className="flex size-9 items-center justify-center rounded-full border border-[#b7ff3c]/35 bg-[#b7ff3c]/10">
                  {isComplete ? (
                    <Check
                      aria-label="Complete"
                      className="size-4 text-[#b7ff3c]"
                    />
                  ) : (
                    <span
                      aria-label="Not complete"
                      className="size-2 rounded-full bg-white/25"
                    />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-black text-white">
                  {task.name}
                </h3>
                <p className="mt-2 grow text-sm leading-6 text-neutral-400">
                  {task.description}
                </p>
                {exploration ? (
                  <form
                    action={recordStarterExplorationAction}
                    className="mt-4"
                  >
                    <input
                      name="destination"
                      type="hidden"
                      value={exploration}
                    />
                    <button
                      className="min-h-11 rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b7ff3c]"
                      type="submit"
                    >
                      {isComplete ? "View Again" : "Begin Task"}
                    </button>
                  </form>
                ) : (
                  <ButtonLink
                    className="mt-4"
                    href={`${task.href}?starter=1`}
                    variant="secondary"
                  >
                    {isComplete ? "View Again" : "Begin Task"}
                  </ButtonLink>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
