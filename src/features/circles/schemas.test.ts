import { describe, expect, it } from "vitest";
import { createCircleSchema } from "./schemas";

const validCircle = {
  name: "North Jersey Creator Circle",
  slug: "north-jersey-creators",
  summary: "A community for creators building thoughtful work together.",
  description:
    "Members share context, join structured sessions, and create room for focused collaboration.",
  rules:
    "Respect privacy, name expectations clearly, honor consent, and follow the community guidelines.",
  visibility: "public",
  joinPolicy: "request",
  format: "either",
  locationLabel: "Northern New Jersey and online",
  modeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  minimumEnergy: "2",
  maximumEnergy: "4",
  stimulationLevel: "moderate",
  socialIntensity: "light",
  interestIds: ["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"],
};

describe("createCircleSchema", () => {
  it("accepts bounded Circle identity, access, and Pulse-fit inputs", () => {
    const result = createCircleSchema.safeParse(validCircle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("north-jersey-creators");
      expect(result.data.minimumEnergy).toBe(2);
    }
  });

  it("requires private Circles to remain invite only", () => {
    const result = createCircleSchema.safeParse({
      ...validCircle,
      visibility: "private",
      joinPolicy: "request",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.joinPolicy).toBeDefined();
    }
  });

  it("rejects unsafe slugs, reversed energy, and oversized interest sets", () => {
    const result = createCircleSchema.safeParse({
      ...validCircle,
      slug: "Not A Safe URL",
      minimumEnergy: "5",
      maximumEnergy: "2",
      interestIds: Array.from(
        { length: 9 },
        (_, index) =>
          `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      ),
    });
    expect(result.success).toBe(false);
  });
});
