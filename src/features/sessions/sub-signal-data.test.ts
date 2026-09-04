import { describe, expect, it } from "vitest";

import {
  getSubSignalPageState,
  isEligibleCampaign,
  isEligibleCircle,
  isEligibleOpportunity,
  isEligibleSession,
} from "./sub-signal-data";

const now = "2027-03-10T12:00:00.000Z";

describe("Sessions Sub-Signal eligibility", () => {
  it("preserves published, current standard Sessions", () => {
    expect(
      isEligibleSession(
        { status: "published", ends_at: "2027-03-10T13:00:00.000Z" },
        now,
      ),
    ).toBe(true);
    expect(
      isEligibleSession(
        { status: "draft", ends_at: "2027-03-10T13:00:00.000Z" },
        now,
      ),
    ).toBe(false);
    expect(
      isEligibleSession(
        { status: "published", ends_at: "2027-03-10T11:00:00.000Z" },
        now,
      ),
    ).toBe(false);
  });

  it.each(["recruiting", "active"] as const)(
    "includes %s Fifth Realm campaigns",
    (status) => {
      expect(isEligibleCampaign({ status })).toBe(true);
    },
  );

  it.each(["draft", "completed", "cancelled"] as const)(
    "excludes %s Fifth Realm campaigns",
    (status) => {
      expect(isEligibleCampaign({ status })).toBe(false);
    },
  );

  it("includes in-person and hybrid Circles but excludes online-only Circles", () => {
    expect(isEligibleCircle({ status: "published", format: "in_person" })).toBe(
      true,
    );
    expect(isEligibleCircle({ status: "published", format: "either" })).toBe(
      true,
    );
    expect(isEligibleCircle({ status: "published", format: "online" })).toBe(
      false,
    );
    expect(isEligibleCircle({ status: "draft", format: "in_person" })).toBe(
      false,
    );
  });

  it("includes only published Creator Commons opportunities with a future deadline", () => {
    expect(
      isEligibleOpportunity(
        {
          status: "published",
          response_deadline: "2027-03-11T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(true);
    expect(
      isEligibleOpportunity(
        {
          status: "published",
          response_deadline: "2027-03-09T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(false);
    expect(
      isEligibleOpportunity(
        {
          status: "draft",
          response_deadline: "2027-03-11T12:00:00.000Z",
        },
        now,
      ),
    ).toBe(false);
  });
});

describe("Sessions mixed-source state", () => {
  it("shows results with a non-blocking source warning when another source fails", () => {
    expect(getSubSignalPageState(2, ["commons"])).toBe("results");
  });

  it("uses the unified empty state only when every source loaded without items", () => {
    expect(getSubSignalPageState(0, [])).toBe("empty");
  });

  it("does not claim the page is empty when a source could not be loaded", () => {
    expect(getSubSignalPageState(0, ["sessions", "circles"])).toBe(
      "unavailable",
    );
  });
});
