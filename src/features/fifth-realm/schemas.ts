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
  z.string().trim().min(2).max(120).nullable(),
);

const uniqueInterests = z
  .array(z.uuid())
  .min(1, "Choose at least one interest.")
  .max(8, "Choose no more than eight interests.")
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Choose each interest only once.",
  });

export const campaignGenres = [
  "fantasy",
  "science_fiction",
  "horror",
  "mystery",
  "adventure",
  "superhero",
  "anime_inspired",
  "post_apocalyptic",
  "cyberpunk",
  "steampunk",
  "urban_fantasy",
  "dark_fantasy",
  "historical",
  "comedy",
  "romance",
  "thriller",
  "slice_of_life",
  "space_opera",
  "western",
  "other",
] as const;

export const campaignTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
] as const;

export const createCampaignSchema = z
  .object({
    circleId: optionalUuid,
    title: z.string().trim().min(5).max(120),
    summary: z.string().trim().min(10).max(280),
    premise: z.string().trim().min(20).max(5000),
    genre: z.enum(campaignGenres),
    tone: z.string().trim().min(2).max(160),
    safetyExpectations: z.string().trim().min(20).max(2000),
    format: z.enum(["in_person", "online", "either"]),
    locationLabel: optionalLabel,
    scheduleSummary: z.string().trim().min(10).max(500),
    timezone: z.enum(campaignTimezones),
    estimatedSessionMinutes: z.coerce.number().int().min(30).max(480),
    applicationDeadlineLocal: localDateTime,
    playerCapacity: z.coerce.number().int().min(1).max(12),
    experienceLevel: z.enum(["new", "comfortable", "experienced"]),
    modeId: z.uuid("Choose a Pulse mode."),
    minimumEnergy: z.coerce.number().int().min(1).max(5),
    maximumEnergy: z.coerce.number().int().min(1).max(5),
    stimulationLevel: z.enum(["low", "moderate", "high"]),
    socialIntensity: z.enum(["solo", "light", "social"]),
    interestIds: uniqueInterests,
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

export const campaignIdSchema = z.object({ campaignId: z.uuid() });

export const campaignStatusSchema = z.object({
  campaignId: z.uuid(),
  status: z.enum(["recruiting", "active", "completed", "cancelled"]),
});

export const campaignApplicationSchema = z.object({
  campaignId: z.uuid(),
  motivation: z.string().trim().min(20).max(2000),
  availability: z.string().trim().min(10).max(500),
  experienceLevel: z.enum(["new", "comfortable", "experienced"]),
  safetyAcknowledged: z.literal("on", {
    error: "Acknowledge the campaign safety expectations.",
  }),
});

export const campaignApplicationDecisionSchema = z.object({
  campaignId: z.uuid(),
  userId: z.uuid(),
  decision: z.enum(["accept", "decline"]),
});

export const campaignMemberActionSchema = z.object({
  campaignId: z.uuid(),
  userId: z.uuid().optional(),
});

export const campaignSessionSchema = z.object({
  campaignId: z.uuid(),
  sessionId: z.uuid(),
  associate: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
