import { describe, expect, it } from "vitest";
import {
  createOpportunitySchema,
  opportunityResponseSchema,
  saveOpportunitySchema,
} from "./schemas";

const opportunity = {
  circleId: "",
  title: "Produce a launch interview series",
  summary: "Collaborate on a focused interview series for local creators.",
  description:
    "Plan and produce a short interview series with a defined scope and accessible workflow.",
  deliverables:
    "Three edited interviews, captions, and a shared handoff document are expected.",
kind: "collaboration",
compensation: "paid",
format: "either",
  locationLabel: "Northern New Jersey or online",
  responseDeadlineLocal: "2026-09-01T17:00",
  timezone: "America/New_York",
  estimatedMinutes: "240",
  positions: "3",
  modeId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  minimumEnergy: "2",
  maximumEnergy: "4",
  stimulationLevel: "moderate",
  socialIntensity: "light",
  skillIds: ["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"],
  interestIds: ["cccccccc-cccc-4ccc-8ccc-cccccccccccc"],
};

describe("Creator Commons schemas", () => {
  it("accepts a bounded opportunity draft", () => {
    expect(createOpportunitySchema.safeParse(opportunity).success).toBe(true);
  });

  it("requires a skill and a valid energy range", () => {
    const result = createOpportunitySchema.safeParse({
      ...opportunity,
      skillIds: [],
      minimumEnergy: "5",
      maximumEnergy: "2",
    });
    expect(result.success).toBe(false);
  });

  it("validates response content and save intent", () => {
    expect(
      opportunityResponseSchema.safeParse({
        opportunityId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        statement:
          "My production experience and workflow align with this project.",
        availability: "Weekday evenings for the next six weeks.",
      }).success,
    ).toBe(true);
    expect(
      saveOpportunitySchema.parse({
        opportunityId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        save: "false",
      }).save,
    ).toBe(false);
  });
});
