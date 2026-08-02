import { z } from "zod";

const selectionIds = z
  .array(z.uuid())
  .max(5, "Choose no more than five interests for this check-in.")
  .refine((ids) => new Set(ids).size === ids.length, {
    message: "Choose each interest only once.",
  });

const optionalTravelMiles = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce
    .number()
    .int()
    .pipe(z.union([z.literal(5), z.literal(15), z.literal(30), z.literal(50)]))
    .nullable(),
);

export const pulseCheckInSchema = z.object({
  modeId: z.uuid("Choose the mode that fits right now."),
  energyLevel: z.coerce
    .number()
    .int()
    .min(1, "Choose an energy level from 1 to 5.")
    .max(5, "Choose an energy level from 1 to 5."),
  stimulationLevel: z.enum(["low", "moderate", "high"], {
    error: "Choose a stimulation level.",
  }),
  socialIntensity: z.enum(["solo", "light", "social"], {
    error: "Choose a social level.",
  }),
  preferredFormat: z.enum(["in_person", "online", "either"], {
    error: "Choose a participation format.",
  }),
  availableMinutes: z.coerce
    .number()
    .int()
    .pipe(
      z.union([z.literal(30), z.literal(60), z.literal(120), z.literal(240)]),
    ),
  maximumTravelMiles: optionalTravelMiles,
  interestIds: selectionIds,
});

export type PulseCheckInInput = z.infer<typeof pulseCheckInSchema>;
