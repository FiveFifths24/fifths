"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";

export async function updateActivitySharingAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { status: "error", message: "Sign in again to update privacy." };
    }

    const { error } = await supabase.rpc(
      "update_activity_sharing_preferences",
      {
        p_share_with_friends: formData.get("shareWithFriends") === "on",
        p_share_session_activity: formData.get("shareSessionActivity") === "on",
        p_share_circle_activity: formData.get("shareCircleActivity") === "on",
        p_share_profile_activity: formData.get("shareProfileActivity") === "on",
        p_share_commons_activity: formData.get("shareCommonsActivity") === "on",
      },
    );
    if (error) {
      return {
        status: "error",
        message: "Activity privacy could not be updated. Please try again.",
      };
    }

    revalidatePath("/account");
    revalidatePath("/home");
    return { status: "success", message: "Activity privacy updated." };
  } catch {
    return {
      status: "error",
      message: "Activity privacy is temporarily unavailable.",
    };
  }
}
