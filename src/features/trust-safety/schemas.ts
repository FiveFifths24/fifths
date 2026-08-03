import { z } from "zod";

const optionalContextUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string()
    .trim()
    .max(300, "Keep the FIFTHS path under 300 characters.")
    .regex(
      /^\/(?!\/)[A-Za-z0-9/_?=&%#.-]*$/,
      "Use a FIFTHS path beginning with one /.",
    )
    .nullable(),
);

export const feedbackSchema = z.object({
  area: z.enum([
    "platform",
    "pulse",
    "sessions",
    "circles",
    "commons",
    "realm",
    "passport",
    "accessibility",
    "safety",
  ]),
  message: z
    .string()
    .trim()
    .min(20, "Use at least 20 characters.")
    .max(2000, "Keep feedback under 2,000 characters."),
  consentToContact: z.boolean(),
});

export const reportSchema = z.object({
  targetType: z.enum([
    "member",
    "session",
    "circle",
    "opportunity",
    "campaign",
    "platform",
  ]),
  category: z.enum([
    "harassment",
    "hate_or_discrimination",
    "threat_or_violence",
    "sexual_content",
    "spam_or_fraud",
    "privacy",
    "copyright_or_proprietary_content",
    "other",
  ]),
  summary: z
    .string()
    .trim()
    .min(10, "Use at least ten characters.")
    .max(160, "Keep the summary under 160 characters."),
  details: z
    .string()
    .trim()
    .min(30, "Use at least 30 characters.")
    .max(2000, "Keep report details under 2,000 characters."),
  contextUrl: optionalContextUrl,
});

export const notificationIdSchema = z.object({ notificationId: z.uuid() });

export const moderationReviewSchema = z
  .object({
    reportId: z.uuid(),
    status: z.enum(["reviewing", "escalated", "resolved", "dismissed"]),
    note: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(1000).nullable(),
    ),
  })
  .superRefine((value, context) => {
    if (
      value.status !== "reviewing" &&
      (!value.note || value.note.length < 10)
    ) {
      context.addIssue({
        code: "custom",
        path: ["note"],
        message: "Add a review note of at least ten characters.",
      });
    }
  });

export const feedbackReviewSchema = z.object({
  feedbackId: z.uuid(),
  status: z.enum(["reviewed", "closed"]),
});
