"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";
import {
  blockedWordIdSchema,
  blockedWordSchema,
  profileSettingsSchema,
  targetProfileSchema,
} from "./schemas";

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function safeReturnPath(value: FormDataEntryValue | null) {
  return typeof value === "string" &&
    /^\/(?!\/)[A-Za-z0-9/_?=&%#.-]*$/.test(value)
    ? value
    : "/home/people";
}

async function uploadProfileImage(
  kind: "avatar" | "background",
  file: FormDataEntryValue | null,
  userId: string,
  currentPath: string | null,
) {
  if (!(file instanceof File) || file.size === 0) return currentPath;
  const extension = allowedImageTypes.get(file.type);
  if (!extension || file.size > 5 * 1024 * 1024) {
    throw new Error("IMAGE_INVALID");
  }
  const supabase = await createClient();
  const path = `${userId}/${kind}.${extension}`;
  const { error } = await supabase.storage
    .from("profile-media")
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });
  if (error) throw new Error("IMAGE_UPLOAD_FAILED");
  return path;
}

export async function updateProfileSettingsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profileSettingsSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
    visibility: formData.get("visibility"),
    discoverable: formData.get("discoverable") === "on",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted profile details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user)
      return {
        status: "error",
        message: "Sign in again to update your profile.",
      };
    const { data: current } = await supabase
      .from("profiles")
      .select("username, avatar_url, cover_image_url")
      .eq("id", userData.user.id)
      .maybeSingle();
    const avatarPath = await uploadProfileImage(
      "avatar",
      formData.get("avatar"),
      userData.user.id,
      current?.avatar_url ?? null,
    );
    const backgroundPath = await uploadProfileImage(
      "background",
      formData.get("background"),
      userData.user.id,
      current?.cover_image_url ?? null,
    );
    const { error } = await supabase.rpc("update_profile_settings", {
      p_username: parsed.data.username,
      p_display_name: parsed.data.displayName,
      p_bio: parsed.data.bio,
      p_visibility: parsed.data.visibility,
      p_discoverable: parsed.data.discoverable,
      p_avatar_url: avatarPath,
      p_cover_image_url: backgroundPath,
    });
    if (error) {
      const errorMessage = error.message.toUpperCase();
      return {
        status: "error",
        message: errorMessage.includes("USERNAME_CHANGE_COOLDOWN")
          ? "Your username can only be changed once every 7 days."
          : errorMessage.includes("DISPLAY_NAME_CHANGE_COOLDOWN")
            ? "Your display name can only be changed once every 7 days."
            : error.code === "23505"
              ? "That username is already taken. Try another one."
              : "Your profile could not be updated.",
      };
    }
    revalidatePath("/account");
    if (current?.username) {
      revalidatePath(`/home/profiles/${current.username}`);
      revalidatePath(`/profiles/${current.username}`);
    }
    revalidatePath(`/home/profiles/${parsed.data.username}`);
    revalidatePath(`/profiles/${parsed.data.username}`);
    return {
      status: "success",
      message: "Your SIGNAL profile has been updated.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error && error.message === "IMAGE_INVALID"
          ? "Use a JPG, PNG, or WebP image no larger than 5 MB."
          : error instanceof Error && error.message === "IMAGE_UPLOAD_FAILED"
            ? "Your image could not be uploaded. Please try again."
            : "Profile updates require the latest Supabase migration and media bucket.",
    };
  }
}

async function runRelationshipAction(
  formData: FormData,
  rpcName:
    | "follow_profile"
    | "unfollow_profile"
    | "remove_follower"
    | "send_friend_request"
    | "accept_friend_request"
    | "remove_friendship"
    | "block_profile"
    | "unblock_profile"
    | "mute_profile"
    | "unmute_profile",
  argumentName:
    | "p_target_user_id"
    | "p_requester_user_id"
    | "p_follower_user_id" = "p_target_user_id",
) {
  const returnTo = safeReturnPath(formData.get("returnTo"));
  const parsed = targetProfileSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
  });
  if (!parsed.success) redirect(`${returnTo}?social=invalid`);
  const supabase = await createClient();
  const { error } = await supabase.rpc(rpcName, {
    [argumentName]: parsed.data.targetUserId,
  } as never);
  revalidatePath("/home/people");
  revalidatePath(returnTo.split("?")[0] ?? returnTo);
  redirect(
    `${returnTo}${returnTo.includes("?") ? "&" : "?"}social=${error ? "error" : "updated"}`,
  );
}

export async function followProfileAction(formData: FormData) {
  return runRelationshipAction(formData, "follow_profile");
}
export async function unfollowProfileAction(formData: FormData) {
  return runRelationshipAction(formData, "unfollow_profile");
}
export async function removeFollowerAction(formData: FormData) {
  return runRelationshipAction(
    formData,
    "remove_follower",
    "p_follower_user_id",
  );
}
export async function sendFriendRequestAction(formData: FormData) {
  return runRelationshipAction(formData, "send_friend_request");
}
export async function acceptFriendRequestAction(formData: FormData) {
  return runRelationshipAction(
    formData,
    "accept_friend_request",
    "p_requester_user_id",
  );
}
export async function removeFriendshipAction(formData: FormData) {
  return runRelationshipAction(formData, "remove_friendship");
}
export async function blockProfileAction(formData: FormData) {
  return runRelationshipAction(formData, "block_profile");
}
export async function unblockProfileAction(formData: FormData) {
  return runRelationshipAction(formData, "unblock_profile");
}
export async function muteProfileAction(formData: FormData) {
  return runRelationshipAction(formData, "mute_profile");
}
export async function unmuteProfileAction(formData: FormData) {
  return runRelationshipAction(formData, "unmute_profile");
}

export async function addBlockedWordAction(formData: FormData) {
  const parsed = blockedWordSchema.safeParse({ word: formData.get("word") });
  if (!parsed.success) redirect("/account?filter=invalid");
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_blocked_word", {
    p_word: parsed.data.word,
  });
  revalidatePath("/account");
  redirect(`/account?filter=${error ? "error" : "updated"}`);
}

export async function removeBlockedWordAction(formData: FormData) {
  const parsed = blockedWordIdSchema.safeParse({
    wordId: formData.get("wordId"),
  });
  if (!parsed.success) redirect("/account?filter=invalid");
  const supabase = await createClient();
  await supabase.rpc("remove_blocked_word", { p_word_id: parsed.data.wordId });
  revalidatePath("/account");
  redirect("/account?filter=updated");
}
