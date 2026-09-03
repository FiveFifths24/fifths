"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";
import { pulseCheckInSchema } from "./schemas";

export async function recordPulseCheckInAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = pulseCheckInSchema.safeParse({
    modeId: formData.get("modeId"),
    energyLevel: formData.get("energyLevel"),
    stimulationLevel: formData.get("stimulationLevel"),
    socialIntensity: formData.get("socialIntensity"),
    preferredFormat: formData.get("preferredFormat"),
    availableMinutes: formData.get("availableMinutes"),
    maximumTravelMiles: formData.get("maximumTravelMiles"),
    interestIds: formData.getAll("interestIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted Pulse signals and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return {
        status: "error",
        message: "Your session expired. Log in again to check your Pulse.",
      };
    }

    const { error } = await supabase.rpc("record_pulse_check_in", {
      p_mode_id: parsed.data.modeId,
      p_energy_level: parsed.data.energyLevel,
      p_stimulation_level: parsed.data.stimulationLevel,
      p_social_intensity: parsed.data.socialIntensity,
      p_preferred_format: parsed.data.preferredFormat,
      p_available_minutes: parsed.data.availableMinutes,
      p_maximum_travel_miles: parsed.data.maximumTravelMiles,
      p_interest_ids: parsed.data.interestIds,
    });

    if (error) {
      return {
        status: "error",
        message:
          "Your Pulse could not be saved. Refresh the page and try again.",
      };
    }
  } catch {
    return {
      status: "error",
      message:
         "Pulse is temporarily unavailable. Please try again shortly.",
    };
  }

  redirect("/home?pulse=recorded");
}
