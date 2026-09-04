import { describe, expect, it } from "vitest";
import { normalizeSafeExternalUrl } from "./url-safety";

describe("external URL safety", () => {
  it("preserves legitimate portfolio and media links", () => {
    expect(normalizeSafeExternalUrl("https://open.spotify.com/track/123")).toBe(
      "https://open.spotify.com/track/123",
    );
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,bad",
    "file:///etc/passwd",
    "http://localhost:3000/admin",
    "http://127.0.0.1/private",
    "http://192.168.1.20/private",
    "https://user:password@example.com",
  ])("rejects unsafe URL %s", (value) => {
    expect(normalizeSafeExternalUrl(value)).toBeNull();
  });
});
