export const moderationCategories = [
  "sexual_explicit",
  "sexual_nudity",
  "sexual_minors",
  "graphic_violence",
  "hate_extremism",
  "self_harm",
  "other_unsafe",
] as const;

export type ModerationCategory = (typeof moderationCategories)[number];
export type ModerationOutcome = "approved" | "review" | "rejected";

export type ModerationCategoryScores = Partial<
  Record<ModerationCategory, number>
>;

export type NormalizedModerationResult = {
  outcome: ModerationOutcome;
  categories: ModerationCategoryScores;
  provider: string;
  requestId?: string;
  requiresSpecialHandling?: boolean;
};

export type ModerationImageInput = {
  bytes: Buffer;
  mimeType: "image/webp";
  sha256: string;
};

export interface ImageModerator {
  moderateImage(
    input: ModerationImageInput,
  ): Promise<NormalizedModerationResult>;
}

export type MediaUploadSurface =
  | "profile_avatar"
  | "profile_featured"
  | "profile_featured_2"
  | "profile_wallpaper"
  | "profile_landscape";

export type MediaUploadOutcome = ModerationOutcome | "unchanged";

export type MediaUploadResult = {
  path: string | null;
  outcome: MediaUploadOutcome;
};
