"use server";

import { redirect } from "next/navigation";

import type { ActionState } from "@/features/auth/state";
import { createClient } from "@/lib/supabase/server";

import { onboardingSchema } from "./schemas";

export async function completeOnboardingAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = onboardingSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    pronouns: formData.get("pronouns") || undefined,
    timezone: formData.get("timezone"),

    bio: formData.get("bio") || undefined,
    city: formData.get("city") || undefined,
    region: formData.get("region") || undefined,
    countryCode: formData.get("countryCode") || undefined,
    locationVisibility: formData.get("locationVisibility"),
    friendListVisibility: formData.get("friendListVisibility"),
    discoverable: formData.get("discoverable"),
    profileVisibility: formData.get("profileVisibility"),

    interestIds: formData.getAll("interestIds"),
    skillIds: formData.getAll("skillIds"),

    openToFriends: formData.get("openToFriends"),
    openToActivityPartners: formData.get("openToActivityPartners"),
    openToCreativeCollaboration: formData.get("openToCreativeCollaboration"),
    openToProfessionalNetworking: formData.get("openToProfessionalNetworking"),
    openToMentorship: formData.get("openToMentorship"),
    openToVolunteering: formData.get("openToVolunteering"),
    openToGaming: formData.get("openToGaming"),
    openToTravelGroups: formData.get("openToTravelGroups"),

    preferLocal: formData.get("preferLocal"),
    preferVirtual: formData.get("preferVirtual"),

    allowFriendRequests: formData.get("allowFriendRequests"),
    allowCircleInvites: formData.get("allowCircleInvites"),
    allowEventInvites: formData.get("allowEventInvites"),
    showInMutualConnections: formData.get("showInMutualConnections"),

    stepFreeAccess: formData.get("stepFreeAccess"),
    seatingAvailable: formData.get("seatingAvailable"),
    lowSensoryEnvironment: formData.get("lowSensoryEnvironment"),
    captioning: formData.get("captioning"),
    aslInterpretation: formData.get("aslInterpretation"),
    accessibleRestroom: formData.get("accessibleRestroom"),
    mobilityDeviceAccess: formData.get("mobilityDeviceAccess"),
    virtualParticipation: formData.get("virtualParticipation"),
    writtenInstructions: formData.get("writtenInstructions"),
    breaksAvailable: formData.get("breaksAvailable"),
    accessibilityNotes: formData.get("accessibilityNotes") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    console.error("SIGNAL onboarding validation errors:", fieldErrors);

    return {
      status: "error",
      message: `Validation failed: ${Object.keys(fieldErrors).join(", ")}`,
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return {
        status: "error",
        message: "Your session expired. Log in again.",
      };
    }

    const rpc = supabase.rpc.bind(supabase) as unknown as (
      functionName: string,
      args: Record<string, unknown>,
    ) => PromiseLike<{
      error: {
        code?: string;
        message?: string;
      } | null;
    }>;

    const { error } = await rpc("complete_signal_onboarding", {
      p_username: parsed.data.username,
      p_display_name: parsed.data.displayName,
      p_pronouns: parsed.data.pronouns ?? null,
      p_timezone: parsed.data.timezone,
      p_interest_ids: parsed.data.interestIds,
      p_skill_ids: parsed.data.skillIds,

      p_bio: parsed.data.bio ?? null,
      p_city: parsed.data.city ?? null,
      p_region: parsed.data.region ?? null,
      p_country_code: parsed.data.countryCode ?? null,
      p_location_visibility: parsed.data.locationVisibility,
      p_friend_list_visibility: parsed.data.friendListVisibility,
      p_discoverable: parsed.data.discoverable,

      p_open_to_friends: parsed.data.openToFriends,
      p_open_to_activity_partners: parsed.data.openToActivityPartners,
      p_open_to_creative_collaboration: parsed.data.openToCreativeCollaboration,
      p_open_to_professional_networking:
        parsed.data.openToProfessionalNetworking,
      p_open_to_mentorship: parsed.data.openToMentorship,
      p_open_to_volunteering: parsed.data.openToVolunteering,
      p_open_to_gaming: parsed.data.openToGaming,
      p_open_to_travel_groups: parsed.data.openToTravelGroups,

      p_prefer_local: parsed.data.preferLocal,
      p_prefer_virtual: parsed.data.preferVirtual,

      p_allow_friend_requests: parsed.data.allowFriendRequests,
      p_allow_circle_invites: parsed.data.allowCircleInvites,
      p_allow_event_invites: parsed.data.allowEventInvites,
      p_show_in_mutual_connections: parsed.data.showInMutualConnections,

      p_step_free_access: parsed.data.stepFreeAccess,
      p_seating_available: parsed.data.seatingAvailable,
      p_low_sensory_environment: parsed.data.lowSensoryEnvironment,
      p_captioning: parsed.data.captioning,
      p_asl_interpretation: parsed.data.aslInterpretation,
      p_accessible_restroom: parsed.data.accessibleRestroom,
      p_mobility_device_access: parsed.data.mobilityDeviceAccess,
      p_virtual_participation: parsed.data.virtualParticipation,
      p_written_instructions: parsed.data.writtenInstructions,
      p_breaks_available: parsed.data.breaksAvailable,
      p_accessibility_notes: parsed.data.accessibilityNotes ?? null,
    });

    if (error) {
      const usernameTaken = error.code === "23505";

      console.error("SIGNAL onboarding error:", error);

      return {
        status: "error",
        message: usernameTaken
          ? "That username is already in use. Choose another."
          : "Your profile could not be saved. Please try again.",
        fieldErrors: usernameTaken
          ? { username: ["Choose a different username."] }
          : undefined,
      };
    }
    const { error: visibilityError } = await supabase.rpc(
      "set_profile_visibility",
      { p_visibility: parsed.data.profileVisibility },
    );
    if (visibilityError) {
      return {
        status: "error",
        message:
          "Your profile was created, but its visibility choice could not be saved.",
      };
    }
  } catch (error) {
    console.error("SIGNAL onboarding service error:", error);

    return {
      status: "error",
      message:
        "Account services are not configured yet. The founder must complete Supabase setup.",
    };
  }

  redirect("/home?onboarding=complete");
}
