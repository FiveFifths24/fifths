import { describe, expect, it } from "vitest";
import { analyticsEventSchema, analyticsEventNames } from "./events";

describe("privacy-conscious analytics events", () => {
  it("accepts the documented finite event vocabulary", () => {
    expect(analyticsEventNames).toContain("page_view");
    expect(analyticsEventNames).toContain("tutorial_completed");
    expect(analyticsEventNames).toContain("session_registered");
    expect(analyticsEventNames).toContain("email_preferences_updated");
    expect(
      analyticsEventSchema.safeParse({
        eventName: "session_registered",
        route: "/home/sessions/550e8400-e29b-41d4-a716-446655440000",
        entityType: "session",
        entityId: "550e8400-e29b-41d4-a716-446655440000",
        properties: { source: "detail_page" },
      }).success,
    ).toBe(true);
  });

  it.each([
    "email",
    "username",
    "message",
    "chat_body",
    "report_details",
    "profile_text",
    "exact_location",
  ])("rejects sensitive property key %s", (key) => {
    expect(
      analyticsEventSchema.safeParse({
        eventName: "page_view",
        route: "/home",
        properties: { [key]: "sensitive text" },
      }).success,
    ).toBe(false);
  });

  it("rejects query strings so search and private parameters are not logged", () => {
    expect(
      analyticsEventSchema.safeParse({
        eventName: "page_view",
        route: "/home/people?query=someone",
      }).success,
    ).toBe(false);
  });

  it("rejects free text even when placed under an allowed property key", () => {
    for (const value of [
      "member@example.com",
      "This is a private chat message",
      "123 Main Street",
    ]) {
      expect(
        analyticsEventSchema.safeParse({
          eventName: "page_view",
          route: "/home",
          properties: { source: value },
        }).success,
      ).toBe(false);
    }
  });
});
