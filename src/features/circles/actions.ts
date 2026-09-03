"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";
import {
  circleIdSchema,
  circleMemberRoleSchema,
  circleStatusSchema,
  createCircleSchema,
  invitationResponseSchema,
  inviteCircleMemberSchema,
  reviewCircleMembershipSchema,
  sessionCircleSchema,
} from "./schemas";

export async function createCircleAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const values: Record<string, string | string[]> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;

    const existing = values[key];

    if (existing === undefined) {
      values[key] = value;
    } else if (Array.isArray(existing)) {
      values[key] = [...existing, value];
    } else {
      values[key] = [existing, value];
    }
  }

  const parsed = createCircleSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    rules: formData.get("rules"),
    visibility: formData.get("visibility"),
    joinPolicy: formData.get("joinPolicy"),
    format: formData.get("format"),
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
      message: "Check the highlighted Circle details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values,
    };
  }

  let circleId: string | null = null;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("create_circle", {
      p_name: parsed.data.name,
      p_slug: parsed.data.slug,
      p_summary: parsed.data.summary,
      p_description: parsed.data.description,
      p_rules: parsed.data.rules,
      p_visibility: parsed.data.visibility,
      p_join_policy: parsed.data.joinPolicy,
      p_format: parsed.data.format,
      p_location_label: parsed.data.locationLabel,
      p_mode_id: parsed.data.modeId,
      p_minimum_energy: parsed.data.minimumEnergy,
      p_maximum_energy: parsed.data.maximumEnergy,
      p_stimulation_level: parsed.data.stimulationLevel,
      p_social_intensity: parsed.data.socialIntensity,
      p_interest_ids: parsed.data.interestIds,
    });

    if (error || !data) {
      if (error?.code === "23505") {
        return {
          status: "error",
          message: "That URL name is already taken.",
          fieldErrors: {
            slug: ["That URL name is already in use. Choose a different one."],
          },
          values,
        };
      }

      return {
        status: "error",
        message: "The Circle could not be created. Check the details below.",
        values,
      };
    }

    circleId = data;
  } catch {
    return {
      status: "error",
      message: "The Circle could not be created. Please try again.",
      values,
    };
  }

  redirect(`/home/circles/manage/${circleId}?created=1`);
}

export async function joinCircleAction(
  circleId: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _previousState;
  void _formData;
  const parsed = circleIdSchema.safeParse({ circleId });
  if (!parsed.success)
    return { status: "error", message: "This Circle link is not valid." };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("join_circle", {
      p_circle_id: parsed.data.circleId,
    });
    if (error || !data) {
      return {
        status: "error",
        message: "The Circle could not accept this membership action.",
      };
    }
    revalidatePath(`/home/circles/${parsed.data.circleId}`);
    revalidatePath("/home/circles/memberships");
    return {
      status: "success",
      message:
        data === "active"
          ? "You joined this Circle."
          : "Your membership request was sent for review.",
    };
  } catch {
    return {
      status: "error",
      message:
        "We couldn't process your membership request. Please try again later.",
    };
  }
}

export async function leaveCircleAction(
  circleId: string,
  _previousState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _previousState;
  void _formData;
  const parsed = circleIdSchema.safeParse({ circleId });
  if (!parsed.success)
    return { status: "error", message: "This Circle link is not valid." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("leave_circle", {
      p_circle_id: parsed.data.circleId,
    });
    if (error) {
      return {
        status: "error",
        message:
          "This membership could not be ended. Circle owners must transfer or close the Circle before leaving.",
      };
    }
  } catch {
    return {
      status: "error",
      message:
        "Membership is temporarily unavailable. Please try again shortly.",
    };
  }

  revalidatePath(`/home/circles/${parsed.data.circleId}`);
  revalidatePath("/home/circles/memberships");
  return { status: "success", message: "You left this Circle." };
}

export async function respondToCircleInvitationAction(formData: FormData) {
  const parsed = invitationResponseSchema.safeParse({
    circleId: formData.get("circleId"),
    response: formData.get("response"),
  });
  if (!parsed.success) redirect("/home/circles/memberships?invitation=invalid");

  let outcome = parsed.data.response === "accept" ? "accepted" : "declined";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("respond_to_circle_invitation", {
      p_circle_id: parsed.data.circleId,
      p_accept: parsed.data.response === "accept",
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath("/home/circles");
  revalidatePath("/home/circles/memberships");
  redirect(`/home/circles/memberships?invitation=${outcome}`);
}

export async function setCircleStatusAction(formData: FormData) {
  const parsed = circleStatusSchema.safeParse({
    circleId: formData.get("circleId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/home/circles/manage?status=invalid");

  let outcome = "updated";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_circle_status", {
      p_circle_id: parsed.data.circleId,
      p_status: parsed.data.status,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath(`/home/circles/manage/${parsed.data.circleId}`);
  revalidatePath(`/home/circles/${parsed.data.circleId}`);
  revalidatePath("/home/circles");
  redirect(`/home/circles/manage/${parsed.data.circleId}?status=${outcome}`);
}

export async function inviteCircleMemberAction(formData: FormData) {
  const parsed = inviteCircleMemberSchema.safeParse({
    circleId: formData.get("circleId"),
    username: formData.get("username"),
  });
  if (!parsed.success) redirect("/home/circles/manage?invite=invalid");

  let outcome = "sent";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("invite_circle_member", {
      p_circle_id: parsed.data.circleId,
      p_username: parsed.data.username,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath(`/home/circles/manage/${parsed.data.circleId}`);
  redirect(`/home/circles/manage/${parsed.data.circleId}?invite=${outcome}`);
}

export async function reviewCircleMembershipAction(formData: FormData) {
  const parsed = reviewCircleMembershipSchema.safeParse({
    circleId: formData.get("circleId"),
    userId: formData.get("userId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) redirect("/home/circles/manage?membership=invalid");

  let outcome = "updated";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("review_circle_membership", {
      p_circle_id: parsed.data.circleId,
      p_user_id: parsed.data.userId,
      p_decision: parsed.data.decision,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath(`/home/circles/manage/${parsed.data.circleId}`);
  redirect(
    `/home/circles/manage/${parsed.data.circleId}?membership=${outcome}`,
  );
}

export async function setCircleMemberRoleAction(formData: FormData) {
  const parsed = circleMemberRoleSchema.safeParse({
    circleId: formData.get("circleId"),
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) redirect("/home/circles/manage?role=invalid");

  let outcome = "updated";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_circle_member_role", {
      p_circle_id: parsed.data.circleId,
      p_user_id: parsed.data.userId,
      p_role: parsed.data.role,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath(`/home/circles/manage/${parsed.data.circleId}`);
  redirect(`/home/circles/manage/${parsed.data.circleId}?role=${outcome}`);
}

export async function setSessionCircleAction(formData: FormData) {
  const parsed = sessionCircleSchema.safeParse({
    sessionId: formData.get("sessionId"),
    circleId: formData.get("circleId"),
  });
  if (!parsed.success) redirect("/home/circles/manage?session=invalid");

  let outcome = "updated";
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("set_session_circle", {
      p_session_id: parsed.data.sessionId,
      p_circle_id: parsed.data.circleId,
    });
    if (error) outcome = "error";
  } catch {
    outcome = "error";
  }

  revalidatePath("/home/sessions");
  revalidatePath(`/home/sessions/host/${parsed.data.sessionId}`);
  if (parsed.data.circleId) {
    revalidatePath(`/home/circles/${parsed.data.circleId}`);
    revalidatePath(`/home/circles/manage/${parsed.data.circleId}`);
    redirect(`/home/circles/manage/${parsed.data.circleId}?session=${outcome}`);
  }
  redirect("/home/circles/manage?session=updated");
}
