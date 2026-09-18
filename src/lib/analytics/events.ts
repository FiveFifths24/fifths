import { z } from "zod";

export const analyticsEventNames = [
  "page_view",
  "account_created",
  "onboarding_completed",
  "tutorial_started",
  "tutorial_completed",
  "profile_customized",
  "pulse_check_in_completed",
  "session_viewed",
  "session_registered",
  "session_attended",
  "circle_viewed",
  "circle_joined",
  "opportunity_viewed",
  "opportunity_created",
  "opportunity_response_submitted",
  "collaboration_completed",
  "campaign_viewed",
  "campaign_application_submitted",
  "campaign_joined",
  "passport_credit_awarded",
  "email_preferences_updated",
] as const;

const allowedPropertyValue = z.union([
  z
    .string()
    .max(80)
    .regex(/^[a-z0-9_-]+$/),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

export const analyticsEventSchema = z
  .object({
    eventName: z.enum(analyticsEventNames),
    route: z
      .string()
      .max(240)
      .regex(/^\/[A-Za-z0-9/_-]*$/)
      .optional(),
    entityType: z
      .enum(["session", "circle", "opportunity", "campaign", "passport_entry"])
      .optional(),
    entityId: z.uuid().optional(),
    properties: z
      .object({
        source: allowedPropertyValue.optional(),
        outcome: allowedPropertyValue.optional(),
        feature: allowedPropertyValue.optional(),
        step: allowedPropertyValue.optional(),
        duration_bucket: allowedPropertyValue.optional(),
      })
      .strict()
      .optional(),
  })
  .superRefine((event, context) => {
    if (Boolean(event.entityType) !== Boolean(event.entityId)) {
      context.addIssue({
        code: "custom",
        message: "Analytics entity type and ID must be provided together.",
      });
    }
  });

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
