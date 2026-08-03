import { describe, expect, it } from "vitest";
import { getPlatformModule, platformModules } from "./modules";

describe("platformModules", () => {
  it("defines the five connected FIFTHS products once", () => {
    expect(platformModules).toHaveLength(5);
    expect(new Set(platformModules.map(({ slug }) => slug)).size).toBe(5);
  });

  it("connects the public Passport story to the protected private ledger", () => {
    expect(getPlatformModule("passport")?.memberHref).toBe("/home/passport");
  });
});
