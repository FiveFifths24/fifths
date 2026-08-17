import { z } from "zod";

const interestSelection = z
  .array(z.uuid())
  .min(1, "Choose at least one interest.")
  .max(30, "Choose no more than 12 interests.");

const skillSelection = z
  .array(z.uuid())
  .min(1, "Choose at least one skill.")
  .max(20, "Choose no more than 12 skills.");

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => value || undefined);

const checkbox = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Use at least 3 characters.")
    .max(30, "Use no more than 30 characters.")
    .regex(
      /^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$/,
      "Use lowercase letters, numbers, and underscores only.",
    ),

  displayName: z
    .string()
    .trim()
    .min(1, "Enter the name you want people to see.")
    .max(80, "Use no more than 80 characters."),

  pronouns: optionalText(40, "Use no more than 40 characters."),

  timezone: z.enum([
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Phoenix",
    "America/Los_Angeles",
  ]),

  bio: optionalText(500, "Use no more than 500 characters."),

  city: optionalText(100, "Use no more than 100 characters."),

  region: optionalText(100, "Use no more than 100 characters."),

  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      (value) => value === "" || /^[A-Z]{2}$/.test(value),
      "Use a two-letter country code.",
    )
    .optional()
    .transform((value) => value || undefined),

  locationVisibility: z.enum(["hidden", "city_region", "region_only"]),

  friendListVisibility: z.enum(["private", "friends", "members"]),

  discoverable: checkbox,

interestIds: interestSelection,
skillIds: skillSelection,

  openToFriends: checkbox,
  openToActivityPartners: checkbox,
  openToCreativeCollaboration: checkbox,
  openToProfessionalNetworking: checkbox,
  openToMentorship: checkbox,
  openToVolunteering: checkbox,
  openToGaming: checkbox,
  openToTravelGroups: checkbox,

  preferLocal: checkbox,
  preferVirtual: checkbox,

  allowFriendRequests: checkbox,
  allowCircleInvites: checkbox,
  allowEventInvites: checkbox,
  showInMutualConnections: checkbox,

  stepFreeAccess: checkbox,
  seatingAvailable: checkbox,
  lowSensoryEnvironment: checkbox,
  captioning: checkbox,
  aslInterpretation: checkbox,
  accessibleRestroom: checkbox,
  mobilityDeviceAccess: checkbox,
  virtualParticipation: checkbox,
  writtenInstructions: checkbox,
  breaksAvailable: checkbox,

  accessibilityNotes: optionalText(500, "Use no more than 500 characters."),
});
