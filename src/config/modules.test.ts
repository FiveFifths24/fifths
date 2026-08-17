import { describe, expect, it } from "vitest";
import { getPlatformModule, platformModules } from "./modules";

describe("platformModules", () => {
  it("defines the six connected SIGNAL products once", () => {
    expect(platformModules).toHaveLength(6);
    expect(new Set(platformModules.map(({ slug }) => slug)).size).toBe(6);
  });

  it("connects the public Passport story to the protected private ledger", () => {
    expect(getPlatformModule("passport")?.memberHref).toBe("/home/passport");
  });
});
