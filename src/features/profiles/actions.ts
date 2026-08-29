"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";
import {
  blockedWordIdSchema,
  blockedWordSchema,
  featuredConnectionsSchema,
  profileRoomSettingsSchema,
  profileSettingsSchema,
  profileStatusSchema,
  targetProfileSchema,
} from "./schemas";

const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function safeReturnPath(value: FormDataEntryValue | null) {
  return typeof value === "string" &&
    /^\/(?!\/)[A-Za-z0-9/_?=&%#.-]*$/.test(value)
    ? value
    : "/home/people";
}

async function uploadProfileImage(
  kind: "avatar" | "landscape" | "background" | "featured",
  file: FormDataEntryValue | null,
  userId: string,
  currentPath: string | null,
) {
  if (!(file instanceof File) || file.size === 0) return currentPath;
  const extension = allowedImageTypes.get(file.type);
  if (
    !extension ||
    (file.type === "image/gif" && kind !== "landscape") ||
    file.size > 5 * 1024 * 1024
  ) {
    throw new Error("IMAGE_INVALID");
  }
  const supabase = await createClient();
  const path = `${userId}/${kind}-${crypto.randomUUID()}.${extension}`;
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
    accentColor: formData.get("accentColor"),
    landscapeImageFit: formData.get("landscapeImageFit"),
    landscapeImagePositionX: formData.get("landscapeImagePositionX"),
    landscapeImagePositionY: formData.get("landscapeImagePositionY"),
    landscapeImageZoom: formData.get("landscapeImageZoom"),
    backgroundImageFit: formData.get("backgroundImageFit"),
    backgroundImagePositionX: formData.get("backgroundImagePositionX"),
    backgroundImagePositionY: formData.get("backgroundImagePositionY"),
    backgroundImageZoom: formData.get("backgroundImageZoom"),
    spotlightTitle: formData.get("spotlightTitle"),
    spotlightDescription: formData.get("spotlightDescription"),
    spotlightUrl: formData.get("spotlightUrl"),
    profileSongTitle: formData.get("profileSongTitle"),
profileSongArtist: formData.get("profileSongArtist"),
profileSongUrl: formData.get("profileSongUrl"),
latestPickCategory: formData.get("latestPickCategory"),
latestPickTitle: formData.get("latestPickTitle"),
latestPickNote: formData.get("latestPickNote"),
latestPickUrl: formData.get("latestPickUrl"),
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
      .select(
  "username, avatar_url, cover_image_url, background_image_url, featured_profile_image_url",
)
      .eq("id", userData.user.id)
      .maybeSingle();
const avatarPath = await uploadProfileImage(
  "avatar",
  formData.get("avatar"),
  userData.user.id,
  current?.avatar_url ?? null,
);

const landscapePath = await uploadProfileImage(
  "landscape",
  formData.get("landscape"),
  userData.user.id,
  current?.cover_image_url ?? null,
);

const backgroundPath = await uploadProfileImage(
  "background",
  formData.get("background"),
  userData.user.id,
  current?.background_image_url ?? null,
);

const featuredPath = await uploadProfileImage(
  "featured",
  formData.get("featuredProfileImage"),
  userData.user.id,
  current?.featured_profile_image_url ?? null,
);
console.log("FEATURED UPLOAD DEBUG", {
  formValue: formData.get("featuredProfileImage"),
  featuredPath,
});
    const { error } = await supabase.rpc("update_profile_experience", {
      p_username: parsed.data.username,
      p_display_name: parsed.data.displayName,
      p_bio: parsed.data.bio,
      p_visibility: parsed.data.visibility,
      p_discoverable: parsed.data.discoverable,
      p_avatar_url: avatarPath,
      p_cover_image_url: landscapePath,
      p_background_image_url: backgroundPath,
      p_profile_accent_color: parsed.data.accentColor,
      p_landscape_image_fit: parsed.data.landscapeImageFit,
      p_landscape_image_position_x: parsed.data.landscapeImagePositionX,
      p_landscape_image_position_y: parsed.data.landscapeImagePositionY,
      p_landscape_image_zoom: parsed.data.landscapeImageZoom,
      p_background_image_fit: parsed.data.backgroundImageFit,
      p_background_image_position_x: parsed.data.backgroundImagePositionX,
      p_background_image_position_y: parsed.data.backgroundImagePositionY,
      p_background_image_zoom: parsed.data.backgroundImageZoom,
      p_spotlight_title: parsed.data.spotlightTitle,
      p_spotlight_description: parsed.data.spotlightDescription,
      p_spotlight_url: parsed.data.spotlightUrl,
      p_profile_song_title: parsed.data.profileSongTitle,
p_profile_song_artist: parsed.data.profileSongArtist,
p_profile_song_url: parsed.data.profileSongUrl,
p_latest_pick_category: parsed.data.latestPickCategory,
p_latest_pick_title: parsed.data.latestPickTitle,
p_latest_pick_note: parsed.data.latestPickNote,
p_latest_pick_url: parsed.data.latestPickUrl,
    } as never);
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
const { error: featuredImageError } = await supabase.rpc(
  "set_featured_profile_image",
  {
    p_featured_profile_image_url: featuredPath ?? "",
  },
);
console.log("FEATURED SAVE DEBUG", {
  featuredPath,
  featuredImageError,
});

if (featuredImageError) {
  return {
    status: "error",
    message: "Your featured profile image could not be saved.",
  };
}
const activePaths = new Set(
  [avatarPath, landscapePath, backgroundPath, featuredPath].filter(Boolean),
);
const replacedPaths = [
  current?.avatar_url,
  current?.cover_image_url,
  current?.background_image_url,
  current?.featured_profile_image_url,
]
    .filter((currentPath): currentPath is string =>
      Boolean(currentPath && !activePaths.has(currentPath)),
    );
    if (replacedPaths.length) {
      await supabase.storage.from("profile-media").remove(replacedPaths);
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
          ? "Use a JPG, PNG, or WebP image—or a GIF for the landscape—no larger than 5 MB."
          : error instanceof Error && error.message === "IMAGE_UPLOAD_FAILED"
            ? "Your image could not be uploaded. Please try again."
            : "Profile updates require the latest Supabase migration and media bucket.",
    };
  }
}

export async function updateProfileStatusAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profileStatusSchema.safeParse({
    statusText: formData.get("statusText"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Your Current Signal could not be updated.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_profile_status", {
    p_status_text: parsed.data.statusText,
  });
  if (error) {
    return {
      status: "error",
      message: "Your Current Signal could not be updated.",
    };
  }
  revalidatePath("/account");
  revalidatePath("/profile");
  return {
    status: "success",
    message: parsed.data.statusText
      ? "Your Current Signal is live for 24 hours."
      : "Your Current Signal was cleared.",
  };
}

export async function updateProfileRoomAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
const parsed = profileRoomSettingsSchema.safeParse({
  enabled: formData.get("enabled") === "on",
  wallColor: formData.get("wallColor"),
  floorColor: formData.get("floorColor"),
  couchColor: formData.get("couchColor"),
  bookshelfColor: formData.get("bookshelfColor"),
  tvColor: formData.get("tvColor"),
  doorColor: formData.get("doorColor"),
  accessoryColor: formData.get("accessoryColor"),
  lightingTheme: formData.get("lightingTheme"),
  currentVibe: formData.get("currentVibe"),
  characterColor: formData.get("characterColor"),
  headAccessory: formData.get("headAccessory"),
  faceAccessory: formData.get("faceAccessory"),
  neckAccessory: formData.get("neckAccessory"),
  motionEnabled: formData.get("motionEnabled") === "on",
});
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check your room choices and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { status: "error", message: "Sign in again to update your room." };
  }
  const { error } = await supabase.rpc("update_profile_room", {
    p_enabled: parsed.data.enabled,
    p_wall_color: parsed.data.wallColor,
    p_lighting_theme: parsed.data.lightingTheme,
    p_current_vibe: parsed.data.currentVibe,
    p_character_color: parsed.data.characterColor,
    p_head_accessory: parsed.data.headAccessory,
    p_face_accessory: parsed.data.faceAccessory,
    p_neck_accessory: parsed.data.neckAccessory,
    p_motion_enabled: parsed.data.motionEnabled,
  });
  const { error: layerColorError } = await supabase.rpc(
  "update_profile_room_layer_colors",
  {
    p_floor_color: parsed.data.floorColor,
    p_couch_color: parsed.data.couchColor,
    p_bookshelf_color: parsed.data.bookshelfColor,
    p_tv_color: parsed.data.tvColor,
    p_door_color: parsed.data.doorColor,
    p_accessory_color: parsed.data.accessoryColor,
  },
);
if (error || layerColorError) {
  return {
    status: "error",
    message: "My Room requires the latest Supabase migration.",
  };
}

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userData.user.id)
    .maybeSingle();
  revalidatePath("/account");
  revalidatePath("/profile");
  if (profile?.username) {
    revalidatePath(`/home/profiles/${profile.username}`);
    revalidatePath(`/profiles/${profile.username}`);
  }
  return { status: "success", message: "Your room has been updated." };
}

export async function updateFeaturedConnectionsAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = featuredConnectionsSchema.safeParse({
    featuredUserIds: formData
      .getAll("featuredUserIds")
      .filter((value): value is string => typeof value === "string"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Choose up to 3 current friends.",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_featured_connections", {
    p_featured_ids: parsed.data.featuredUserIds,
  });
  if (error) {
    return {
      status: "error",
      message: "Your featured connections could not be updated.",
    };
  }
  revalidatePath("/account");
  revalidatePath("/profile");
  return {
    status: "success",
    message: "Your featured connections were updated.",
  };
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
  if (!parsed.success) redirect("/account/safety?filter=invalid");
  const supabase = await createClient();
  const { error } = await supabase.rpc("add_blocked_word", {
    p_word: parsed.data.word,
  });
  revalidatePath("/account/safety");
  redirect(`/account/safety?filter=${error ? "error" : "updated"}`);
}

export async function removeBlockedWordAction(formData: FormData) {
  const parsed = blockedWordIdSchema.safeParse({
    wordId: formData.get("wordId"),
  });
  if (!parsed.success) redirect("/account/safety?filter=invalid");
  const supabase = await createClient();
  await supabase.rpc("remove_blocked_word", { p_word_id: parsed.data.wordId });
  revalidatePath("/account/safety");
  redirect("/account/safety?filter=updated");
}
