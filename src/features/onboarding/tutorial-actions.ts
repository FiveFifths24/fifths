"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { recordAnalyticsSafely } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";
import { tutorialSteps } from "./signal-tutorial";

const intentSchema = z.enum(["start", "skip", "next", "visit", "complete"]);

export async function updateTutorialAction(formData: FormData) {
  const intent = intentSchema.safeParse(formData.get("intent"));
  const stepResult = z.coerce
    .number()
    .int()
    .min(0)
    .max(9)
    .safeParse(formData.get("step") ?? 0);

  if (!intent.success || !stepResult.success) {
    redirect("/home/getting-started?notice=invalid");
  }

  const step = stepResult.data;
  let destination = "/home/getting-started";
  let action: "start" | "advance" | "skip" | "complete" = "advance";
  let savedStep = step;

  if (intent.data === "start") {
    action = "start";
    savedStep = 0;
    destination = "/home/getting-started?step=0";
  } else if (intent.data === "skip") {
    action = "skip";
    destination = "/home?tour=skipped";
  } else if (intent.data === "complete" || step === tutorialSteps.length - 1) {
    action = "complete";
    savedStep = tutorialSteps.length - 1;
    destination =
      intent.data === "visit"
        ? tutorialSteps[step]!.href
        : "/home/getting-started?notice=complete";
  } else {
    action = "advance";
    savedStep = step + 1;
    destination =
      intent.data === "visit"
        ? tutorialSteps[step]!.href
        : `/home/getting-started?step=${savedStep}`;
  }

  let failed = false;

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_signal_tutorial_progress", {
      p_action: action,
      p_step: savedStep,
    });
    failed = Boolean(error);

    const exploration = tutorialSteps[step]?.destination;
    if (!failed && intent.data === "visit" && exploration) {
      const { error: explorationError } = await supabase.rpc(
        "record_signal_exploration",
        { p_destination: exploration },
      );
      failed = Boolean(explorationError);
    }

    if (!failed && (intent.data === "start" || action === "complete")) {
      await recordAnalyticsSafely(supabase, {
        eventName:
          action === "complete" ? "tutorial_completed" : "tutorial_started",
        route: "/home/getting-started",
        properties: { source: "guided_tour" },
      });
    }
  } catch {
    failed = true;
  }

  if (failed) {
    redirect(`/home/getting-started?step=${step}&notice=error`);
  }

  revalidatePath("/home");
  revalidatePath("/home/getting-started");
  revalidatePath("/home/passport");
  redirect(destination);
}

export async function recordStarterExplorationAction(formData: FormData) {
  const destination = z
    .enum(["commons", "realm", "passport"])
    .safeParse(formData.get("destination"));

  if (!destination.success) {
    redirect("/home/getting-started?notice=invalid");
  }

  const href = {
    commons: "/home/commons",
    realm: "/home/realm",
    passport: "/home/passport",
  }[destination.data];

  let failed = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("record_signal_exploration", {
      p_destination: destination.data,
    });
    failed = Boolean(error);
  } catch {
    failed = true;
  }

  if (failed) redirect("/home/getting-started?notice=error");

  revalidatePath("/home/getting-started");
  redirect(href);
}
