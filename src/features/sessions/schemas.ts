import { z } from "zod";

const localDateTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
    "Choose a valid local date and time.",
  );

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
  .max(8, "Choose no more than eight interests.")
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Choose each interest only once.",
  });

export const sessionTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
] as const;

export const createSessionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Use at least three characters.")
      .max(40, "Keep the Session title to 40 characters or fewer."),
    description: z
      .string()
      .trim()
      .min(20, "Tell people a little more about the Session.")
      .max(4000, "Keep the description under 4,000 characters."),
    format: z.enum(["in_person", "online", "either"], {
      error: "Choose a session format.",
    }),
    startsAtLocal: localDateTime,
    endsAtLocal: localDateTime,
    timezone: z.enum(sessionTimezones, {
      error: "Choose a supported timezone.",
    }),
    capacity: z.coerce
      .number()
      .int()
      .min(1, "Capacity must be at least one.")
      .max(100, "Capacity cannot exceed 100."),
    locationLabel: optionalLabel,
    modeId: z.uuid("Choose a Pulse mode."),
    minimumEnergy: z.coerce.number().int().min(1).max(5),
    maximumEnergy: z.coerce.number().int().min(1).max(5),
    stimulationLevel: z.enum(["low", "moderate", "high"], {
      error: "Choose a stimulation level.",
    }),
    socialIntensity: z.enum(["solo", "light", "social"], {
      error: "Choose a social level.",
    }),
    interestIds,
  })
  .superRefine((value, context) => {
    const startTime = new Date(value.startsAtLocal).getTime();
    const endTime = new Date(value.endsAtLocal).getTime();

    if (endTime <= startTime) {
      context.addIssue({
        code: "custom",
        path: ["endsAtLocal"],
        message: "End time must be after the start time.",
      });
    }
    if (value.minimumEnergy > value.maximumEnergy) {
      context.addIssue({
        code: "custom",
        path: ["maximumEnergy"],
        message: "Maximum energy must be at least the minimum.",
      });
    }
  });

export const sessionRegistrationSchema = z.object({ sessionId: z.uuid() });

export const sessionStatusSchema = z.object({
  sessionId: z.uuid(),
  status: z.enum(["published", "cancelled", "completed"]),
});

export const attendanceSchema = z.object({
  sessionId: z.uuid(),
  userId: z.uuid(),
  status: z.enum(["attended", "absent", "excused"]),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
