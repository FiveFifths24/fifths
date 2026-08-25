import { z } from "zod";

export const profileSettingsSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Use at least 3 characters.")
    .max(30, "Use no more than 30 characters.")
    .regex(
      /^[a-z0-9](?:[a-z0-9_]*[a-z0-9])?$/,
      "Use lowercase letters, numbers, and underscores only.",
    ),
  displayName: z
    .string()
    .trim()
    .min(1, "Add a display name.")
    .max(80, "Use no more than 80 characters."),
  bio: z
    .string()
    .trim()
    .max(500, "Use no more than 500 characters.")
    .transform((value) => value || null),
  visibility: z.enum(["private", "members", "public"]),
  discoverable: z.boolean(),
  accentColor: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^#[0-9a-f]{6}$/, "Use a six-digit hex color such as #ff3cac."),
  landscapeImageFit: z.enum(["cover", "contain"]),
  landscapeImagePositionX: z.coerce.number().int().min(0).max(100),
  landscapeImagePositionY: z.coerce.number().int().min(0).max(100),
  landscapeImageZoom: z.coerce.number().int().min(100).max(200),
  backgroundImageFit: z.enum(["cover", "contain"]),
  backgroundImagePositionX: z.coerce.number().int().min(0).max(100),
  backgroundImagePositionY: z.coerce.number().int().min(0).max(100),
  backgroundImageZoom: z.coerce.number().int().min(100).max(200),
  spotlightTitle: z
    .string()
    .trim()
    .max(80, "Use no more than 80 characters.")
    .transform((value) => value || null),
  spotlightDescription: z
    .string()
    .trim()
    .max(240, "Use no more than 240 characters.")
    .transform((value) => value || null),
  spotlightUrl: z
    .string()
    .trim()
    .max(500, "Use no more than 500 characters.")
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      "Use a complete http:// or https:// link.",
    )
    .transform((value) => value || null),
});

export const profileStatusSchema = z.object({
  statusText: z
    .string()
    .trim()
    .max(180, "Keep your Current Signal to 180 characters or fewer."),
});

export const profileRoomSettingsSchema = z.object({
  enabled: z.boolean(),
  wallColor: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^#[0-9a-f]{6}$/, "Use a six-digit hex color."),
  lightingTheme: z.enum(["cosmic", "warm", "daylight", "midnight"]),
  currentVibe: z.enum(["chill", "focused", "gaming", "creative", "social"]),
  characterColor: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^#[0-9a-f]{6}$/, "Use a six-digit hex color."),
  headAccessory: z.enum([
    "none",
    "headphones",
    "beanie",
    "bow",
    "hat",
    "crown",
    "flower",
    "headband",
  ]),
  faceAccessory: z.enum(["none", "glasses", "sunglasses"]),
  neckAccessory: z.enum(["none", "scarf", "bandana"]),
  motionEnabled: z.boolean(),
});

export const featuredConnectionsSchema = z.object({
  featuredUserIds: z.array(z.uuid()).max(8, "Choose no more than 8 friends."),
});

export const targetProfileSchema = z.object({ targetUserId: z.uuid() });
export const blockedWordSchema = z.object({
  word: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Use at least 2 characters.")
    .max(50, "Use no more than 50 characters."),
});
export const blockedWordIdSchema = z.object({ wordId: z.uuid() });
