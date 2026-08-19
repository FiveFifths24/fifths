import { describe, expect, it } from "vitest";
import { createSessionSchema } from "./schemas";

const validSession = {
  title: "Design Studio",
  summary: "A focused session for shaping a neighborhood creative project.",
  description:
    "Bring one idea and leave with a practical next step, peer context, and time to reflect.",
  format: "in_person",
  startsAtLocal: "2027-01-15T18:00",
  endsAtLocal: "2027-01-15T20:00",
  timezone: "America/New_York",
  capacity: "20",
  locationLabel: "Downtown studio; details after registration",
  modeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  minimumEnergy: "2",
  maximumEnergy: "4",
  stimulationLevel: "moderate",
  socialIntensity: "social",
  interestIds: ["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"],
};

describe("createSessionSchema", () => {
  it("accepts bounded hosting and Pulse-matching inputs", () => {
    const result = createSessionSchema.safeParse(validSession);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(20);
      expect(result.data.minimumEnergy).toBe(2);
    }
  });

  it("rejects reversed times and energy ranges", () => {
    const result = createSessionSchema.safeParse({
      ...validSession,
      endsAtLocal: "2027-01-15T17:00",
      minimumEnergy: "5",
      maximumEnergy: "2",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.endsAtLocal).toBeDefined();
      expect(result.error.flatten().fieldErrors.maximumEnergy).toBeDefined();
    }
  });

  it("limits capacity, interests, and free-text lengths", () => {
    const result = createSessionSchema.safeParse({
      ...validSession,
      capacity: "101",
      description: "Too short",
      interestIds: Array.from(
        { length: 9 },
        (_, index) =>
          `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      ),
    });
    expect(result.success).toBe(false);
  });
});
