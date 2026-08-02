import { z } from "zod";

const taxonomySelection = z.array(z.uuid()).max(12);

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
  pronouns: z.string().trim().max(40).optional(),
  timezone: z.enum([
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Phoenix",
    "America/Los_Angeles",
  ]),
  interestIds: taxonomySelection,
  skillIds: taxonomySelection,
  ageConfirmation: z.literal("on", {
    error: "Confirm that you are 18 or older to continue.",
  }),
});
