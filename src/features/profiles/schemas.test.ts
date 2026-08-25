import { describe, expect, it } from "vitest";
import { blockedWordSchema, profileSettingsSchema } from "./schemas";

describe("profile settings schema", () => {
  it("accepts a customized member profile", () => {
    expect(
      profileSettingsSchema.safeParse({
        username: "seven_signal",
        displayName: "Seven",
        bio: "Building something different.",
        visibility: "members",
        discoverable: true,
      }).success,
    ).toBe(true);
  });

  it("rejects animated-profile-era unsafe inputs and oversized bios", () => {
    expect(
      profileSettingsSchema.safeParse({
        username: "Bad Name",
        displayName: "Seven",
        bio: "x".repeat(501),
        visibility: "public",
        discoverable: true,
      }).success,
    ).toBe(false);
  });
});

describe("blocked word schema", () => {
  it("normalizes a phrase", () => {
    expect(blockedWordSchema.parse({ word: "  Spoilers  " }).word).toBe(
      "spoilers",
    );
  });
});
