"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/features/auth/state";
import { onboardingSchema } from "./schemas";

export async function completeOnboardingAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = onboardingSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    pronouns: formData.get("pronouns") || undefined,
    timezone: formData.get("timezone"),
    interestIds: formData.getAll("interestIds"),
    skillIds: formData.getAll("skillIds"),
    ageConfirmation: formData.get("ageConfirmation"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return {
        status: "error",
        message: "Your session expired. Log in again.",
      };
    }

    const { error } = await supabase.rpc("complete_onboarding", {
      p_username: parsed.data.username,
      p_display_name: parsed.data.displayName,
      p_pronouns: parsed.data.pronouns || null,
      p_timezone: parsed.data.timezone,
      p_interest_ids: parsed.data.interestIds,
      p_skill_ids: parsed.data.skillIds,
    });
    if (error) {
      const usernameTaken = error.code === "23505";
      return {
        status: "error",
        message: usernameTaken
          ? "That username is already in use. Choose another."
          : "Your profile could not be saved. Please try again.",
        fieldErrors: usernameTaken
          ? { username: ["Choose a different username."] }
          : undefined,
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "Account services are not configured yet. The founder must complete Supabase setup.",
    };
  }

  redirect("/account?onboarding=complete");
}
