import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./redirects";

describe("safeRedirectPath", () => {
  it("keeps local paths and query strings", () => {
    expect(safeRedirectPath("/account?tab=security")).toBe(
      "/account?tab=security",
    );
  });

  it.each(["https://attacker.example", "//attacker.example", "not-a-path"])(
    "rejects external destination %s",
    (destination) => {
      expect(safeRedirectPath(destination, "/onboarding")).toBe("/onboarding");
    },
  );
});
