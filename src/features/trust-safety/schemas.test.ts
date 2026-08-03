import { describe, expect, it } from "vitest";
import {
  feedbackSchema,
  moderationReviewSchema,
  reportSchema,
} from "./schemas";

describe("Phase 10 trust-and-safety schemas", () => {
  it("accepts bounded private feedback and report details", () => {
    expect(
      feedbackSchema.safeParse({
        area: "accessibility",
        message: "The keyboard navigation explanation was clear and helpful.",
        consentToContact: false,
      }).success,
    ).toBe(true);
    expect(
      reportSchema.safeParse({
        targetType: "circle",
        category: "harassment",
        summary: "Repeated hostile conduct",
        details:
          "The conduct occurred repeatedly in a Circle interaction and should receive human review.",
        contextUrl: "/home/circles",
      }).success,
    ).toBe(true);
  });

  it("rejects external context links and underspecified allegations", () => {
    expect(
      reportSchema.safeParse({
        targetType: "platform",
        category: "other",
        summary: "Too short",
        details: "Not enough detail.",
        contextUrl: "https://example.com",
      }).success,
    ).toBe(false);
    expect(
      reportSchema.safeParse({
        targetType: "platform",
        category: "privacy",
        summary: "Unsafe external redirect",
        details:
          "This report includes enough detail but its path is protocol relative.",
        contextUrl: "//example.com",
      }).success,
    ).toBe(false);
  });

  it("requires notes for escalation and final decisions", () => {
    expect(
      moderationReviewSchema.safeParse({
        reportId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "reviewing",
        note: "",
      }).success,
    ).toBe(true);
    expect(
      moderationReviewSchema.safeParse({
        reportId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        status: "resolved",
        note: "too short",
      }).success,
    ).toBe(false);
  });
});
