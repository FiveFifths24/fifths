"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";
import {
  campaignApplicationDecisionSchema,
  campaignApplicationSchema,
  campaignIdSchema,
  campaignMemberActionSchema,
  campaignSessionSchema,
  campaignStatusSchema,
  createCampaignSchema,
} from "./schemas";

export async function createCampaignAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createCampaignSchema.safeParse({
    circleId: formData.get("circleId"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    premise: formData.get("premise"),
    genre: formData.get("genre"),
    tone: formData.get("tone"),
    safetyExpectations: formData.get("safetyExpectations"),
    format: formData.get("format"),
    locationLabel: formData.get("locationLabel"),
    scheduleSummary: formData.get("scheduleSummary"),
    timezone: formData.get("timezone"),
    estimatedSessionMinutes: formData.get("estimatedSessionMinutes"),
    applicationDeadlineLocal: formData.get("applicationDeadlineLocal"),
    playerCapacity: formData.get("playerCapacity"),
    experienceLevel: formData.get("experienceLevel"),
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
      message: "Check the highlighted campaign details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let campaignId: string | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("create_realm_campaign", {
      p_circle_id: parsed.data.circleId,
      p_title: parsed.data.title,
      p_summary: parsed.data.summary,
      p_premise: parsed.data.premise,
      p_genre: parsed.data.genre,
      p_tone: parsed.data.tone,
      p_safety_expectations: parsed.data.safetyExpectations,
      p_format: parsed.data.format,
      p_location_label: parsed.data.locationLabel,
      p_schedule_summary: parsed.data.scheduleSummary,
      p_timezone: parsed.data.timezone,
      p_estimated_session_minutes: parsed.data.estimatedSessionMinutes,
      p_application_deadline_local: parsed.data.applicationDeadlineLocal,
      p_player_capacity: parsed.data.playerCapacity,
      p_experience_level: parsed.data.experienceLevel,
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
          "The campaign could not be created. Confirm your game-master and scoped Circle authority.",
      };
    }
    campaignId = data;
  } catch {
    return {
      status: "error",
      message:
        "Fifth Realm is unavailable until the Phase 7 migration is connected.",
    };
  }
  redirect(`/home/realm/manage/${campaignId}?created=1`);
}

export async function submitCampaignApplicationAction(
  campaignId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = campaignApplicationSchema.safeParse({
    campaignId,
    motivation: formData.get("motivation"),
    availability: formData.get("availability"),
    experienceLevel: formData.get("experienceLevel"),
    safetyAcknowledged: formData.get("safetyAcknowledged"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Review your application and safety acknowledgement.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_campaign_application", {
      p_campaign_id: parsed.data.campaignId,
      p_motivation: parsed.data.motivation,
      p_availability: parsed.data.availability,
      p_experience_level: parsed.data.experienceLevel,
      p_safety_acknowledged: true,
    });
    if (error)
      return {
        status: "error",
        message:
          "The application could not be submitted. Recruiting or capacity may have changed.",
      };
  } catch {
    return {
      status: "error",
      message:
        "Applications are unavailable until the Phase 7 migration is connected.",
    };
  }
  revalidatePath(`/home/realm/${parsed.data.campaignId}`);
  revalidatePath("/home/realm/applications");
  return {
    status: "success",
    message: "Your private application was submitted to the game master.",
  };
}

export async function setCampaignStatusAction(formData: FormData) {
  const parsed = campaignStatusSchema.safeParse({
    campaignId: formData.get("campaignId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/home/realm/manage?status=invalid");
  let outcome = "updated";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_realm_campaign_status", {
      p_campaign_id: parsed.data.campaignId,
      p_status: parsed.data.status,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }
  revalidatePath("/home");
  revalidatePath("/home/realm");
  revalidatePath(`/home/realm/${parsed.data.campaignId}`);
  revalidatePath(`/home/realm/manage/${parsed.data.campaignId}`);
  redirect(`/home/realm/manage/${parsed.data.campaignId}?status=${outcome}`);
}

export async function withdrawCampaignApplicationAction(formData: FormData) {
  const parsed = campaignIdSchema.safeParse({
    campaignId: formData.get("campaignId"),
  });
  if (!parsed.success) redirect("/home/realm/applications?application=invalid");
  let outcome = "withdrawn";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("withdraw_campaign_application", {
      p_campaign_id: parsed.data.campaignId,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }
  revalidatePath("/home/realm");
  revalidatePath(`/home/realm/${parsed.data.campaignId}`);
  revalidatePath("/home/realm/applications");
  redirect(`/home/realm/applications?application=${outcome}`);
}

export async function reviewCampaignApplicationAction(formData: FormData) {
  const parsed = campaignApplicationDecisionSchema.safeParse({
    campaignId: formData.get("campaignId"),
    userId: formData.get("userId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) redirect("/home/realm/manage?application=invalid");
  let outcome = parsed.data.decision === "accept" ? "accepted" : "declined";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("review_campaign_application", {
      p_campaign_id: parsed.data.campaignId,
      p_user_id: parsed.data.userId,
      p_decision: parsed.data.decision,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }
  revalidatePath(`/home/realm/manage/${parsed.data.campaignId}`);
  redirect(
    `/home/realm/manage/${parsed.data.campaignId}?application=${outcome}`,
  );
}

export async function leaveCampaignAction(formData: FormData) {
  const parsed = campaignMemberActionSchema.safeParse({
    campaignId: formData.get("campaignId"),
  });
  if (!parsed.success) redirect("/home/realm/applications?membership=invalid");
  let outcome = "left";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("leave_realm_campaign", {
      p_campaign_id: parsed.data.campaignId,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }
  revalidatePath("/home/realm");
  revalidatePath(`/home/realm/${parsed.data.campaignId}`);
  revalidatePath("/home/realm/applications");
  redirect(`/home/realm/applications?membership=${outcome}`);
}

export async function removeCampaignMemberAction(formData: FormData) {
  const parsed = campaignMemberActionSchema.safeParse({
    campaignId: formData.get("campaignId"),
    userId: formData.get("userId"),
  });
  if (!parsed.success || !parsed.data.userId)
    redirect("/home/realm/manage?member=invalid");
  let outcome = "removed";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("remove_campaign_member", {
      p_campaign_id: parsed.data.campaignId,
      p_user_id: parsed.data.userId,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }
  revalidatePath(`/home/realm/manage/${parsed.data.campaignId}`);
  redirect(`/home/realm/manage/${parsed.data.campaignId}?member=${outcome}`);
}

export async function setCampaignSessionAction(formData: FormData) {
  const parsed = campaignSessionSchema.safeParse({
    campaignId: formData.get("campaignId"),
    sessionId: formData.get("sessionId"),
    associate: formData.get("associate"),
  });
  if (!parsed.success) redirect("/home/realm/manage?session=invalid");
  let outcome = parsed.data.associate ? "associated" : "removed";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_session_campaign", {
      p_session_id: parsed.data.sessionId,
      p_campaign_id: parsed.data.associate ? parsed.data.campaignId : null,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }
  revalidatePath("/home/sessions");
  revalidatePath(`/home/realm/${parsed.data.campaignId}`);
  revalidatePath(`/home/realm/manage/${parsed.data.campaignId}`);
  redirect(`/home/realm/manage/${parsed.data.campaignId}?session=${outcome}`);
}
