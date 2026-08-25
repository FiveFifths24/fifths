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
