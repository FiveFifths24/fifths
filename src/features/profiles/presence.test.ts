import { describe, expect, it } from "vitest";
import { formatPresence } from "./presence";

describe("formatPresence", () => {
  const now = new Date("2026-08-29T12:00:00Z").getTime();

  it("uses a five-minute online window", () => {
    expect(formatPresence("2026-08-29T11:56:00Z", now)).toBe("Online Now");
    expect(formatPresence("2026-08-29T11:48:00Z", now)).toBe("Active 12m ago");
  });

  it("keeps older activity deliberately approximate", () => {
    expect(formatPresence("2026-08-28T08:00:00Z", now)).toBe(
      "Active yesterday",
    );
    expect(formatPresence("2026-08-01T08:00:00Z", now)).toBe("Active recently");
  });
});
