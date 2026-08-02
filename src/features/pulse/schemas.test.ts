import { describe, expect, it } from "vitest";
import { pulseCheckInSchema } from "./schemas";

const validCheckIn = {
  modeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  energyLevel: "3",
  stimulationLevel: "moderate",
  socialIntensity: "light",
  preferredFormat: "either",
  availableMinutes: "60",
  maximumTravelMiles: "15",
  interestIds: ["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"],
};

describe("Pulse check-in validation", () => {
  it("normalizes form values into recommendation signals", () => {
    const result = pulseCheckInSchema.parse(validCheckIn);
    expect(result.energyLevel).toBe(3);
    expect(result.availableMinutes).toBe(60);
    expect(result.maximumTravelMiles).toBe(15);
  });

  it("allows an omitted travel preference", () => {
    const result = pulseCheckInSchema.parse({
      ...validCheckIn,
      maximumTravelMiles: "",
    });
    expect(result.maximumTravelMiles).toBeNull();
  });

  it("rejects out-of-range capacity and time values", () => {
    const result = pulseCheckInSchema.safeParse({
      ...validCheckIn,
      energyLevel: "6",
      availableMinutes: "45",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.energyLevel).toBeDefined();
      expect(result.error.flatten().fieldErrors.availableMinutes).toBeDefined();
    }
  });

  it("limits each check-in to five unique interests", () => {
    const repeated = Array.from(
      { length: 6 },
      (_, index) =>
        `bbbbbbbb-bbbb-4bbb-8bbb-${index.toString().padStart(12, "0")}`,
    );
    expect(
      pulseCheckInSchema.safeParse({
        ...validCheckIn,
        interestIds: repeated,
      }).success,
    ).toBe(false);
    expect(
      pulseCheckInSchema.safeParse({
        ...validCheckIn,
        interestIds: [repeated[0], repeated[0]],
      }).success,
    ).toBe(false);
  });
});
