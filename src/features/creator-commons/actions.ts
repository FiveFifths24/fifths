"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";

import {
  createOpportunitySchema,
  opportunityCompletionSchema,
  opportunityIdSchema,
  opportunityResponseSchema,
  opportunityStatusSchema,
  reviewOpportunityResponseSchema,
  saveOpportunitySchema,
} from "./schemas";

export async function createOpportunityAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createOpportunitySchema.safeParse({
    circleId: formData.get("circleId"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    deliverables: formData.get("deliverables"),
    kind: formData.get("kind"),
    compensation: formData.get("compensation"),
    format: formData.get("format"),
    locationLabel: formData.get("locationLabel"),
    responseDeadlineLocal: formData.get("responseDeadlineLocal"),
    timezone: formData.get("timezone"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    positions: formData.get("positions"),
    modeId: formData.get("modeId"),
    minimumEnergy: formData.get("minimumEnergy"),
    maximumEnergy: formData.get("maximumEnergy"),
    stimulationLevel: formData.get("stimulationLevel"),
    socialIntensity: formData.get("socialIntensity"),
    skillIds: formData.getAll("skillIds"),
    interestIds: formData.getAll("interestIds"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted opportunity details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let opportunityId: string | null = null;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("create_creator_opportunity", {
      p_circle_id: parsed.data.circleId,
      p_title: parsed.data.title,
      p_summary: parsed.data.summary,
      p_description: parsed.data.description,
      p_deliverables: parsed.data.deliverables,
      p_kind: parsed.data.kind,
      p_is_paid: parsed.data.compensation === "paid",
      p_format: parsed.data.format,
      p_location_label: parsed.data.locationLabel,
      p_response_deadline_local: parsed.data.responseDeadlineLocal,
      p_timezone: parsed.data.timezone,
      p_estimated_minutes: parsed.data.estimatedMinutes,
      p_positions: parsed.data.positions,
      p_mode_id: parsed.data.modeId,
      p_minimum_energy: parsed.data.minimumEnergy,
      p_maximum_energy: parsed.data.maximumEnergy,
      p_stimulation_level: parsed.data.stimulationLevel,
      p_social_intensity: parsed.data.socialIntensity,
      p_skill_ids: parsed.data.skillIds,
      p_interest_ids: parsed.data.interestIds,
    });

    if (error || !data) {
      return {
        status: "error",
        message:
          "The opportunity could not be created. Review the details and try again.",
      };
    }

    opportunityId = data;
  } catch {
    return {
      status: "error",
      message:
        "Creator Commons is temporarily unavailable. Please try again shortly.",
    };
  }

  redirect(`/home/commons/manage/${opportunityId}?created=1`);
}

export async function submitOpportunityResponseAction(
  opportunityId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = opportunityResponseSchema.safeParse({
    opportunityId,
    statement: formData.get("statement"),
    availability: formData.get("availability"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review your response and availability.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("submit_opportunity_response", {
      p_opportunity_id: parsed.data.opportunityId,
      p_statement: parsed.data.statement,
      p_availability: parsed.data.availability,
    });

    if (error) {
      return {
        status: "error",
        message:
          "This response could not be submitted. The opportunity may have closed or filled.",
      };
    }
  } catch {
    return {
      status: "error",
      message:
         "Responses are temporarily unavailable. Please try again shortly.",
    };
  }

  revalidatePath(`/home/commons/${parsed.data.opportunityId}`);
  revalidatePath("/home/commons/responses");

  return {
    status: "success",
    message: "Your private response was submitted to the opportunity creator.",
  };
}

export async function setOpportunityStatusAction(formData: FormData) {
  const parsed = opportunityStatusSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect("/home/commons/manage?status=invalid");
  }

  let outcome = "updated";

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("set_creator_opportunity_status", {
      p_opportunity_id: parsed.data.opportunityId,
      p_status: parsed.data.status,
    });

    if (error) {
      outcome = "error";
    }
  } catch {
    outcome = "error";
  }

  revalidatePath("/home");
  revalidatePath("/home/commons");
  revalidatePath(`/home/commons/${parsed.data.opportunityId}`);
  revalidatePath(`/home/commons/manage/${parsed.data.opportunityId}`);

  redirect(
    `/home/commons/manage/${parsed.data.opportunityId}?status=${outcome}`,
  );
}

export async function saveOpportunityAction(formData: FormData) {
  const parsed = saveOpportunitySchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    save: formData.get("save"),
  });

  if (!parsed.success) {
    redirect("/home/commons?saved=invalid");
  }

  let outcome = parsed.data.save ? "saved" : "removed";

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("save_creator_opportunity", {
      p_opportunity_id: parsed.data.opportunityId,
      p_save: parsed.data.save,
    });

    if (error) {
      outcome = "error";
    }
  } catch {
    outcome = "error";
  }

  revalidatePath("/home/commons");
  revalidatePath("/home/commons/saved");
  revalidatePath(`/home/commons/${parsed.data.opportunityId}`);

  redirect(`/home/commons/${parsed.data.opportunityId}?saved=${outcome}`);
}

export async function withdrawOpportunityResponseAction(formData: FormData) {
  const parsed = opportunityIdSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
  });

  if (!parsed.success) {
    redirect("/home/commons/responses?response=invalid");
  }

  let outcome = "withdrawn";

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("withdraw_opportunity_response", {
      p_opportunity_id: parsed.data.opportunityId,
    });

    if (error) {
      outcome = "error";
    }
  } catch {
    outcome = "error";
  }

  revalidatePath("/home/commons");
  revalidatePath("/home/commons/responses");
  revalidatePath(`/home/commons/${parsed.data.opportunityId}`);

  redirect(`/home/commons/responses?response=${outcome}`);
}

export async function reviewOpportunityResponseAction(formData: FormData) {
  const parsed = reviewOpportunityResponseSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    userId: formData.get("userId"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) {
    redirect("/home/commons/manage?response=invalid");
  }

  let outcome = parsed.data.decision === "accept" ? "accepted" : "declined";

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("review_opportunity_response", {
      p_opportunity_id: parsed.data.opportunityId,
      p_user_id: parsed.data.userId,
      p_decision: parsed.data.decision,
    });

    if (error) {
      outcome = "error";
    }
  } catch {
    outcome = "error";
  }

  revalidatePath(`/home/commons/manage/${parsed.data.opportunityId}`);

  redirect(
    `/home/commons/manage/${parsed.data.opportunityId}?response=${outcome}`,
  );
}

export async function confirmOpportunityCompletionAction(formData: FormData) {
  const parsed = opportunityCompletionSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    redirect("/home/commons/responses?completion=invalid");
  }

  let outcome = "confirmed";

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("confirm_opportunity_completion", {
      p_opportunity_id: parsed.data.opportunityId,
      p_user_id: parsed.data.userId,
    });

    if (error) {
      outcome = "error";
    }
  } catch {
    outcome = "error";
  }

  revalidatePath("/home/commons/responses");
  revalidatePath(`/home/commons/${parsed.data.opportunityId}`);
  revalidatePath(`/home/commons/manage/${parsed.data.opportunityId}`);

  redirect(`/home/commons/responses?completion=${outcome}`);
}

export async function confirmManagedOpportunityCompletionAction(
  formData: FormData,
) {
  const parsed = opportunityCompletionSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    redirect("/home/commons/manage?completion=invalid");
  }

  let outcome = "confirmed";

  try {
    const supabase = await createClient();

    const { error } = await supabase.rpc("confirm_opportunity_completion", {
      p_opportunity_id: parsed.data.opportunityId,
      p_user_id: parsed.data.userId,
    });

    if (error) {
      outcome = "error";
    }
  } catch {
    outcome = "error";
  }

  revalidatePath("/home/commons/responses");
  revalidatePath(`/home/commons/${parsed.data.opportunityId}`);
  revalidatePath(`/home/commons/manage/${parsed.data.opportunityId}`);

  redirect(
    `/home/commons/manage/${parsed.data.opportunityId}?completion=${outcome}`,
  );
}
