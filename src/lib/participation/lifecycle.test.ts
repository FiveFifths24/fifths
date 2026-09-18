import { describe, expect, it } from "vitest";

import {
  getParticipationLifecycle,
  isMainDiscoveryLifecycle,
  isRecentlyEndedLifecycle,
} from "./lifecycle";

const now = new Date("2026-09-17T20:00:00.000Z");

describe("participation lifecycle", () => {
  it("keeps upcoming and live participation in main discovery", () => {
    expect(
      getParticipationLifecycle("2026-09-17T21:00:00.000Z", now),
    ).toBe("active");
  });

  it("keeps ended participation in main discovery for 24 hours", () => {
    const lifecycle = getParticipationLifecycle(
      "2026-09-17T08:00:00.000Z",
      now,
    );

    expect(lifecycle).toBe("grace");
    expect(isMainDiscoveryLifecycle(lifecycle)).toBe(true);
  });

  it("moves participation into Recently Ended after 24 hours", () => {
    const lifecycle = getParticipationLifecycle(
      "2026-09-16T18:00:00.000Z",
      now,
    );

    expect(lifecycle).toBe("recent");
    expect(isRecentlyEndedLifecycle(lifecycle)).toBe(true);
  });

  it("archives participation after seven days", () => {
    expect(
      getParticipationLifecycle("2026-09-09T20:00:00.000Z", now),
    ).toBe("archive");
  });
});