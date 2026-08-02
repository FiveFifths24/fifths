import { z } from "zod";

const localDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    "Choose a valid local date and time.",
  );

const optionalUuid = z
  .union([z.uuid(), z.literal("")])
  .transform((value) => value || null);

const optionalLabel = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string()
    .trim()
    .min(2, "Use at least two characters.")
    .max(120, "Keep the label under 120 characters.")
    .nullable(),
);

function uniqueIds(maximum: number, label: string, minimum = 0) {
  return z
    .array(z.uuid())
    .min(minimum, minimum ? `Choose at least one ${label}.` : undefined)
    .max(maximum, `Choose no more than ${maximum} ${label}.`)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: `Choose each ${label} only once.`,
    });
}

export const opportunityTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
] as const;

export const createOpportunitySchema = z
  .object({
    circleId: optionalUuid,
    title: z
      .string()
      .trim()
      .min(5, "Use at least five characters.")
      .max(120, "Keep the title under 120 characters."),
    summary: z
      .string()
      .trim()
      .min(10, "Use at least ten characters.")
      .max(280, "Keep the summary under 280 characters."),
    description: z
      .string()
      .trim()
      .min(20, "Use at least 20 characters.")
      .max(5000, "Keep the description under 5,000 characters."),
    deliverables: z
      .string()
      .trim()
      .min(20, "Use at least 20 characters.")
      .max(3000, "Keep the deliverables under 3,000 characters."),
    kind: z.enum(["collaboration", "project", "volunteer", "mentorship"]),
    format: z.enum(["in_person", "online", "either"]),
    locationLabel: optionalLabel,
    responseDeadlineLocal: localDateTime,
    timezone: z.enum(opportunityTimezones),
    estimatedMinutes: z.coerce.number().int().min(15).max(1440),
    positions: z.coerce.number().int().min(1).max(25),
    modeId: z.uuid("Choose a Pulse mode."),
    minimumEnergy: z.coerce.number().int().min(1).max(5),
    maximumEnergy: z.coerce.number().int().min(1).max(5),
    stimulationLevel: z.enum(["low", "moderate", "high"]),
    socialIntensity: z.enum(["solo", "light", "social"]),
    skillIds: uniqueIds(8, "skill", 1),
    interestIds: uniqueIds(8, "interest"),
  })
  .superRefine((value, context) => {
    if (value.maximumEnergy < value.minimumEnergy) {
      context.addIssue({
        code: "custom",
        path: ["maximumEnergy"],
        message: "Maximum energy must be at least the minimum.",
      });
    }
  });

export const opportunityIdSchema = z.object({ opportunityId: z.uuid() });

export const opportunityStatusSchema = z.object({
  opportunityId: z.uuid(),
  status: z.enum(["published", "closed", "cancelled"]),
});

export const saveOpportunitySchema = z.object({
  opportunityId: z.uuid(),
  save: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export const opportunityResponseSchema = z.object({
  opportunityId: z.uuid(),
  statement: z
    .string()
    .trim()
    .min(20, "Use at least 20 characters.")
    .max(2000, "Keep the response under 2,000 characters."),
  availability: z
    .string()
    .trim()
    .min(10, "Use at least ten characters.")
    .max(500, "Keep availability under 500 characters."),
});

export const reviewOpportunityResponseSchema = z.object({
  opportunityId: z.uuid(),
  userId: z.uuid(),
  decision: z.enum(["accept", "decline"]),
});

export const opportunityCompletionSchema = z.object({
  opportunityId: z.uuid(),
  userId: z.uuid(),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
