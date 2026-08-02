"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";
import {
  attendanceSchema,
  createSessionSchema,
  sessionRegistrationSchema,
  sessionStatusSchema,
} from "./schemas";

export async function createSessionAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createSessionSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    format: formData.get("format"),
    startsAtLocal: formData.get("startsAtLocal"),
    endsAtLocal: formData.get("endsAtLocal"),
    timezone: formData.get("timezone"),
    capacity: formData.get("capacity"),
    locationLabel: formData.get("locationLabel"),
    modeId: formData.get("modeId"),
    minimumEnergy: formData.get("minimumEnergy"),
    maximumEnergy: formData.get("maximumEnergy"),
    stimulationLevel: formData.get("stimulationLevel"),
    socialIntensity: formData.get("socialIntensity"),
    interestIds: formData.getAll("interestIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted session details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let sessionId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return {
        status: "error",
        message: "Your session expired. Log in again to create a Session.",
      };
    }

    const { data, error } = await supabase.rpc("create_session", {
      p_title: parsed.data.title,
      p_summary: parsed.data.summary,
      p_description: parsed.data.description,
      p_format: parsed.data.format,
      p_starts_local: parsed.data.startsAtLocal,
      p_ends_local: parsed.data.endsAtLocal,
      p_timezone: parsed.data.timezone,
      p_capacity: parsed.data.capacity,
      p_location_label: parsed.data.locationLabel,
      p_mode_id: parsed.data.modeId,
      p_minimum_energy: parsed.data.minimumEnergy,
      p_maximum_energy: parsed.data.maximumEnergy,
      p_stimulation_level: parsed.data.stimulationLevel,
      p_social_intensity: parsed.data.socialIntensity,
      p_interest_ids: parsed.data.interestIds,
    });

    if (error || !data) {
      return {
        status: "error",
        message:
          "The Session could not be created. Confirm your host role and review the details.",
      };
    }
    sessionId = data;
  } catch {
    return {
      status: "error",
      message:
        "Sessions are not connected yet. The founder must apply the Phase 4 migration.",
    };
  }

  redirect(`/home/sessions/host/${sessionId}?created=1`);
}

export async function registerForSessionAction(
  sessionId: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _previousState;
  void _formData;
  const parsed = sessionRegistrationSchema.safeParse({ sessionId });
  if (!parsed.success) {
    return { status: "error", message: "This Session link is not valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("register_for_session", {
      p_session_id: parsed.data.sessionId,
    });
    if (error) {
      return {
        status: "error",
        message:
          "Registration could not be completed. The Session may have filled or closed.",
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "Registration is unavailable until the Phase 4 migration is connected.",
    };
  }

  revalidatePath(`/home/sessions/${parsed.data.sessionId}`);
  revalidatePath("/home/registrations");
  return { status: "success", message: "You are registered for this Session." };
}

export async function cancelSessionRegistrationAction(
  sessionId: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _previousState;
  void _formData;
  const parsed = sessionRegistrationSchema.safeParse({ sessionId });
  if (!parsed.success) {
    return { status: "error", message: "This Session link is not valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("cancel_session_registration", {
      p_session_id: parsed.data.sessionId,
    });
    if (error) {
      return {
        status: "error",
        message:
          "This registration could not be cancelled. It may already have started or changed.",
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "Registration is unavailable until the Phase 4 migration is connected.",
    };
  }

  revalidatePath(`/home/sessions/${parsed.data.sessionId}`);
  revalidatePath("/home/registrations");
  return { status: "success", message: "Your registration was cancelled." };
}

export async function setSessionStatusAction(formData: FormData) {
  const parsed = sessionStatusSchema.safeParse({
    sessionId: formData.get("sessionId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/home/sessions/host?status=invalid");

  let outcome = "updated";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_session_status", {
      p_session_id: parsed.data.sessionId,
      p_status: parsed.data.status,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath(`/home/sessions/host/${parsed.data.sessionId}`);
  revalidatePath(`/home/sessions/${parsed.data.sessionId}`);
  revalidatePath("/home/sessions");
  redirect(`/home/sessions/host/${parsed.data.sessionId}?status=${outcome}`);
}

export async function markSessionAttendanceAction(formData: FormData) {
  const parsed = attendanceSchema.safeParse({
    sessionId: formData.get("sessionId"),
    userId: formData.get("userId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/home/sessions/host?attendance=invalid");

  let outcome = "updated";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("mark_session_attendance", {
      p_session_id: parsed.data.sessionId,
      p_user_id: parsed.data.userId,
      p_status: parsed.data.status,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath(`/home/sessions/host/${parsed.data.sessionId}`);
  redirect(
    `/home/sessions/host/${parsed.data.sessionId}?attendance=${outcome}`,
  );
}
