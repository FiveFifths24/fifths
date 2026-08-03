import type { PassportEntry } from "@/types/database";

export const passportActivityLabels: Record<
  PassportEntry["activity_kind"],
  string
> = {
  attended_session: "Attended a verified Session",
  hosted_session: "Hosted a completed Session",
  completed_opportunity: "Completed a Commons contribution",
  led_opportunity: "Led a completed Commons opportunity",
  completed_campaign: "Completed a Fifth Realm campaign",
  led_campaign: "Led a completed Fifth Realm campaign",
};

export const passportModuleLabels: Record<
  PassportEntry["source_module"],
  string
> = {
  sessions: "Sessions",
  circles: "Circles",
  commons: "Creator Commons",
  realm: "Fifth Realm",
};

export function summarizePassport(entries: PassportEntry[]) {
  const verified = entries.filter((entry) => entry.status === "verified");
  return {
    verifiedCount: verified.length,
    moduleCount: new Set(verified.map((entry) => entry.source_module)).size,
    activityCount: new Set(verified.map((entry) => entry.activity_kind)).size,
    correctionCount: entries.length - verified.length,
  };
}
