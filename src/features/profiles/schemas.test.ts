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
        mood: "Inspired",
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
        spotlightCategory: "Building",
        spotlightTitle: "Building SIGNAL",
        spotlightDescription: "A profile spotlight.",
        spotlightUrl: "https://example.com",
        currentGame: "",
        currentGameDescription: "",
        currentGameUrl: "",
        currentReading: "",
        currentReadingDescription: "",
        currentReadingUrl: "",
        currentFood: "",
        currentFoodDescription: "",
        currentFoodUrl: "",
        viewMyLabel: "Latest Video",
        viewMyUrl: "https://example.com/video",
        profileSongTitle: "A Song",
        profileSongArtist: "An Artist",
        profileSongUrl: "https://open.spotify.com/track/example",
        latestPickCategory: "Listening",
        latestPickTitle: "A new album",
        latestPickNote: "On repeat this week.",
        latestPickUrl: "https://example.com/album",
      }).success,
    ).toBe(true);
  });

  it("limits SIGNAL handles to twenty characters", () => {
    const base = {
      username: "a1234567890123456789",
      displayName: "Seven",
      bio: "",
      mood: "",
      visibility: "members",
      discoverable: true,
      accentColor: "#ff3cac",
      landscapeImageFit: "cover",
      landscapeImagePositionX: 50,
      landscapeImagePositionY: 50,
      landscapeImageZoom: 100,
      backgroundImageFit: "cover",
      backgroundImagePositionX: 50,
      backgroundImagePositionY: 50,
      backgroundImageZoom: 100,
      spotlightCategory: "",
      spotlightTitle: "",
      spotlightDescription: "",
      spotlightUrl: "",
      currentGame: "",
      currentGameDescription: "",
      currentGameUrl: "",
      currentReading: "",
      currentReadingDescription: "",
      currentReadingUrl: "",
      currentFood: "",
      currentFoodDescription: "",
      currentFoodUrl: "",
      viewMyLabel: "",
      viewMyUrl: "",
      profileSongTitle: "",
      profileSongArtist: "",
      profileSongUrl: "",
      latestPickCategory: "",
      latestPickTitle: "",
      latestPickNote: "",
      latestPickUrl: "",
    };

    expect(profileSettingsSchema.safeParse(base).success).toBe(true);
    expect(
      profileSettingsSchema.safeParse({
        ...base,
        username: "a12345678901234567890",
      }).success,
    ).toBe(false);
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
        floorColor: "#442f58",
        couchColor: "#992bff",
        bookshelfColor: "#6e3f24",
        tvColor: "#16121e",
        doorColor: "#55306f",
        accessoryColor: "#ff3cac",
        lightingTheme: "cosmic",
        currentVibe: "creative",
        characterColor: "#ff3cac",
        headAccessory: "headphones",
        faceAccessory: "glasses",
        neckAccessory: "none",
        motionEnabled: false,
      }).success,
    ).toBe(true);
  });

  it("rejects arbitrary CSS and unsupported character options", () => {
    expect(
      profileRoomSettingsSchema.safeParse({
        enabled: true,
        wallColor: "url(https://example.com)",
        floorColor: "#442f58",
        couchColor: "#992bff",
        bookshelfColor: "#6e3f24",
        tvColor: "#16121e",
        doorColor: "#55306f",
        accessoryColor: "#ff3cac",
        lightingTheme: "strobe",
        currentVibe: "creative",
        characterColor: "pink",
        headAccessory: "helmet",
        faceAccessory: "glasses",
        neckAccessory: "none",
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
