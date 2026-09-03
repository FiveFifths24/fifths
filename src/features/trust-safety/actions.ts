"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";
import {
  feedbackReviewSchema,
  feedbackSchema,
  moderationReviewSchema,
  notificationIdSchema,
  reportSchema,
} from "./schemas";

export async function submitFeedbackAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = feedbackSchema.safeParse({
    area: formData.get("area"),
    message: formData.get("message"),
    consentToContact: formData.get("consentToContact") === "on",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted feedback details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_feedback", {
      p_area: parsed.data.area,
      p_message: parsed.data.message,
      p_consent_to_contact: parsed.data.consentToContact,
    });
    if (error) {
      return {
        status: "error",
        message:
          "Feedback could not be submitted. You may have reached the daily limit.",
      };
    }
    revalidatePath("/home/safety");
    return {
      status: "success",
      message: "Your private feedback was received.",
    };
  } catch {
    return {
      status: "error",
      message: "Feedback is temporarily unavailable. Please try again shortly.",
    };
  }
}

export async function submitReportAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    category: formData.get("category"),
    summary: formData.get("summary"),
    details: formData.get("details"),
    contextUrl: formData.get("contextUrl"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted report details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_report", {
      p_target_type: parsed.data.targetType,
      p_category: parsed.data.category,
      p_summary: parsed.data.summary,
      p_details: parsed.data.details,
      p_context_url: parsed.data.contextUrl,
    });
    if (error) {
      return {
        status: "error",
        message:
          "The report could not be submitted. A matching report may already be active or the daily limit may be reached.",
      };
    }
    revalidatePath("/home/safety");
    revalidatePath("/home/notifications");
    return {
      status: "success",
      message: "Your private report entered the restricted human-review queue.",
    };
  } catch {
    return {
      status: "error",
      message:
        "Safety reports are temporarily unavailable. Please try again shortly.",
    };
  }
}

export async function markNotificationReadAction(formData: FormData) {
  const parsed = notificationIdSchema.safeParse({
    notificationId: formData.get("notificationId"),
  });
  if (!parsed.success) redirect("/home/notifications?read=invalid");
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("mark_notification_read", {
      p_notification_id: parsed.data.notificationId,
    });
    if (error) redirect("/home/notifications?read=error");
  } catch {
    redirect("/home/notifications?read=error");
  }
  revalidatePath("/home/notifications");
  redirect("/home/notifications?read=updated");
}

export async function markAllNotificationsReadAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("mark_all_notifications_read");
    if (error) redirect("/home/notifications?read=error");
  } catch {
    redirect("/home/notifications?read=error");
  }
  revalidatePath("/home/notifications");
  redirect("/home/notifications?read=all");
}

export async function reviewReportAction(formData: FormData) {
  const parsed = moderationReviewSchema.safeParse({
    reportId: formData.get("reportId"),
    status: formData.get("status"),
    note: formData.get("note"),
  });
  if (!parsed.success) redirect("/home/admin/moderation?review=invalid");
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("review_report", {
      p_report_id: parsed.data.reportId,
      p_status: parsed.data.status,
      p_note: parsed.data.note,
    });
    if (error) redirect("/home/admin/moderation?review=denied");
  } catch {
    redirect("/home/admin/moderation?review=error");
  }
  revalidatePath("/home/admin/moderation");
  redirect("/home/admin/moderation?review=updated");
}

export async function reviewFeedbackAction(formData: FormData) {
  const parsed = feedbackReviewSchema.safeParse({
    feedbackId: formData.get("feedbackId"),
    status: formData.get("status"),
  });
  if (!parsed.success) redirect("/home/admin/moderation?feedback=invalid");
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("review_feedback", {
      p_feedback_id: parsed.data.feedbackId,
      p_status: parsed.data.status,
    });
    if (error) redirect("/home/admin/moderation?feedback=denied");
  } catch {
    redirect("/home/admin/moderation?feedback=error");
  }
  revalidatePath("/home/admin/moderation");
  redirect("/home/admin/moderation?feedback=updated");
}
