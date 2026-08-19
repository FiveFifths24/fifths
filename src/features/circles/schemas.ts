import { z } from "zod";

const optionalLabel = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string()
    .trim()
    .min(2, "Use at least two characters.")
    .max(120, "Keep the label under 120 characters.")
    .nullable(),
);

const interestIds = z
  .array(z.uuid())
  .length(1, "Choose one topic for this Circle.");

export const createCircleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Use at least three characters.")
      .max(40, "Keep the Circle name to 40 characters or fewer."),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Use at least three characters.")
      .max(60, "Keep the URL name under 60 characters.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers, and single hyphens.",
      ),
    summary: z
      .string()
      .trim()
      .min(10, "Use at least ten characters.")
      .max(240, "Keep the summary under 240 characters."),
    description: z
      .string()
      .trim()
      .min(20, "Use at least 20 characters.")
      .max(4000, "Keep the description under 4,000 characters."),
    rules: z
      .string()
      .trim()
      .min(20, "Use at least 20 characters.")
      .max(4000, "Keep the rules under 4,000 characters."),
    visibility: z.enum(["public", "private"]),
    joinPolicy: z.enum(["open", "request", "invite_only"]),
    format: z.enum(["in_person", "online", "either"]),
    locationLabel: optionalLabel,
    modeId: z.uuid("Choose a Pulse mode."),
    minimumEnergy: z.coerce.number().int().min(1).max(5),
    maximumEnergy: z.coerce.number().int().min(1).max(5),
    stimulationLevel: z.enum(["low", "moderate", "high"]),
    socialIntensity: z.enum(["solo", "light", "social"]),
    interestIds,
  })
  .superRefine((value, context) => {
    if (value.minimumEnergy > value.maximumEnergy) {
      context.addIssue({
        code: "custom",
        path: ["maximumEnergy"],
        message: "Maximum energy must be at least the minimum.",
      });
    }
    if (value.visibility === "private" && value.joinPolicy !== "invite_only") {
      context.addIssue({
        code: "custom",
        path: ["joinPolicy"],
        message: "Private Circles must be invite only.",
      });
    }
  });

export const circleIdSchema = z.object({ circleId: z.uuid() });

export const circleStatusSchema = z.object({
  circleId: z.uuid(),
  status: z.enum(["published", "archived"]),
});

export const invitationResponseSchema = z.object({
  circleId: z.uuid(),
  response: z.enum(["accept", "decline"]),
});

export const inviteCircleMemberSchema = z.object({
  circleId: z.uuid(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Enter a valid username.")
    .max(30, "Enter a valid username.")
    .regex(/^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$/, "Enter a valid username."),
});

export const reviewCircleMembershipSchema = z.object({
  circleId: z.uuid(),
  userId: z.uuid(),
  decision: z.enum(["approve", "decline", "remove"]),
});

export const circleMemberRoleSchema = z.object({
  circleId: z.uuid(),
  userId: z.uuid(),
  role: z.enum(["member", "host", "moderator"]),
});

export const sessionCircleSchema = z.object({
  sessionId: z.uuid(),
  circleId: z
    .union([z.uuid(), z.literal("")])
    .transform((value) => value || null),
});

export type CreateCircleInput = z.infer<typeof createCircleSchema>;
