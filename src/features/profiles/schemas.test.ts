import { describe, expect, it } from "vitest";
import {
  blockedWordSchema,
  profileRoomSettingsSchema,
  profileSettingsSchema,
} from "./schemas";

describe("profile settings schema", () => {
  it("accepts a customized member profile", () => {
    expect(
      profileSettingsSchema.safeParse({
        username: "seven_signal",
        displayName: "Seven",
        bio: "Building something different.",
        visibility: "members",
        discoverable: true,
        accentColor: "#ff3cac",
        landscapeImageFit: "contain",
        landscapeImagePositionX: 40,
        landscapeImagePositionY: 35,
        landscapeImageZoom: 115,
        backgroundImageFit: "cover",
        backgroundImagePositionX: 50,
        backgroundImagePositionY: 60,
        backgroundImageZoom: 125,
        spotlightTitle: "Building SIGNAL",
        spotlightDescription: "A profile spotlight.",
        spotlightUrl: "https://example.com",
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
        accentColor: "not-a-color",
        spotlightTitle: "",
        spotlightDescription: "",
        spotlightUrl: "",
      }).success,
    ).toBe(false);
  });
});

describe("My Room settings schema", () => {
  it("accepts the intentionally limited phase-one customization", () => {
    expect(
      profileRoomSettingsSchema.safeParse({
        enabled: true,
        wallColor: "#241039",
        lightingTheme: "cosmic",
        currentVibe: "creative",
        characterColor: "#ff3cac",
        characterShape: "ghost",
        characterExpression: "wink",
        characterAccessory: "headphones",
        motionEnabled: false,
      }).success,
    ).toBe(true);
  });

  it("rejects arbitrary CSS and unsupported character options", () => {
    expect(
      profileRoomSettingsSchema.safeParse({
        enabled: true,
        wallColor: "url(https://example.com)",
        lightingTheme: "strobe",
        currentVibe: "creative",
        characterColor: "pink",
        characterShape: "human",
        characterExpression: "wink",
        characterAccessory: "headphones",
        motionEnabled: true,
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
