"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAnalyticsSafely } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";

const enabled = (formData: FormData, name: string) =>
  formData.get(name) === "on";

export async function updateCommunicationPreferencesAction(formData: FormData) {
  let failed = false;

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("update_communication_preferences", {
      p_session_activity: enabled(formData, "sessionActivity"),
      p_circle_activity: enabled(formData, "circleActivity"),
      p_commons_activity: enabled(formData, "commonsActivity"),
      p_realm_activity: enabled(formData, "realmActivity"),
      p_passport_activity: enabled(formData, "passportActivity"),
      p_social_activity: enabled(formData, "socialActivity"),
      p_newsletter: enabled(formData, "newsletter"),
      p_five_fifths_updates: enabled(formData, "fiveFifthsUpdates"),
      p_ehub_updates: enabled(formData, "ehubUpdates"),
      p_fundraising: enabled(formData, "fundraising"),
      p_community_events: enabled(formData, "communityEvents"),
      p_feature_announcements: enabled(formData, "featureAnnouncements"),
      p_source: "account_settings",
    });
    failed = Boolean(error);
    if (!failed) {
      await recordAnalyticsSafely(supabase, {
        eventName: "email_preferences_updated",
        route: "/account/communications",
        properties: { source: "account_settings" },
      });
    }
  } catch {
    failed = true;
  }

  if (failed) redirect("/account/communications?saved=error");

  revalidatePath("/account/communications");
  redirect("/account/communications?saved=success");
}

export async function unsubscribeOptionalEmailAction() {
  let failed = false;

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("unsubscribe_optional_email");
    failed = Boolean(error);
    if (!failed) {
      await recordAnalyticsSafely(supabase, {
        eventName: "email_preferences_updated",
        route: "/account/communications",
        properties: { source: "unsubscribe" },
      });
    }
  } catch {
    failed = true;
  }

  if (failed) redirect("/account/communications?saved=error");

  revalidatePath("/account/communications");
  redirect("/account/communications?saved=unsubscribed");
}
