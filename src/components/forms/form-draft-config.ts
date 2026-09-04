export const FORM_DRAFT_PREFIX = "signal:form-draft:v1";

export type DraftFormId =
  | "realm-campaign-create"
  | "session-create"
  | "circle-create"
  | "commons-opportunity-create"
  | "profile-settings";

export function formDraftStorageKey(formId: DraftFormId, ownerId: string) {
  return `${FORM_DRAFT_PREFIX}:${ownerId}:${formId}`;
}

export const campaignDraftFields = [
  "circleId",
  "title",
  "summary",
  "premise",
  "genre",
  "tone",
  "safetyExpectations",
  "format",
  "locationLabel",
  "scheduleSummary",
  "timezone",
  "estimatedSessionMinutes",
  "applicationDeadlineLocal",
  "playerCapacity",
  "experienceLevel",
  "modeId",
  "minimumEnergy",
  "maximumEnergy",
  "stimulationLevel",
  "socialIntensity",
  "interestIds",
] as const;

export const sessionDraftFields = [
  "title",
  "description",
  "format",
  "startsAtLocal",
  "endsAtLocal",
  "timezone",
  "capacity",
  "locationLabel",
  "modeId",
  "minimumEnergy",
  "maximumEnergy",
  "stimulationLevel",
  "socialIntensity",
  "interestIds",
] as const;

export const circleDraftFields = [
  "name",
  "slug",
  "summary",
  "description",
  "rules",
  "visibility",
  "joinPolicy",
  "format",
  "locationLabel",
  "modeId",
  "minimumEnergy",
  "maximumEnergy",
  "stimulationLevel",
  "socialIntensity",
  "interestIds",
] as const;

export const opportunityDraftFields = [
  "circleId",
  "title",
  "summary",
  "description",
  "deliverables",
  "kind",
  "compensation",
  "format",
  "locationLabel",
  "responseDeadlineLocal",
  "timezone",
  "estimatedMinutes",
  "positions",
  "modeId",
  "minimumEnergy",
  "maximumEnergy",
  "stimulationLevel",
  "socialIntensity",
  "skillIds",
  "interestIds",
] as const;

export const profileSettingsDraftFields = [
  "username",
  "displayName",
  "bio",
  "mood",
  "accentColor",
  "landscapeImageFit",
  "landscapeImagePositionX",
  "landscapeImagePositionY",
  "landscapeImageZoom",
  "backgroundImageFit",
  "backgroundImagePositionX",
  "backgroundImagePositionY",
  "backgroundImageZoom",
  "spotlightCategory",
  "spotlightTitle",
  "spotlightDescription",
  "spotlightUrl",
  "currentGame",
  "currentGameDescription",
  "currentGameUrl",
  "currentReading",
  "currentReadingDescription",
  "currentReadingUrl",
  "currentFood",
  "currentFoodDescription",
  "currentFoodUrl",
  "viewMyLabel",
  "viewMyUrl",
  "profileSongTitle",
  "profileSongArtist",
  "profileSongUrl",
  "latestPickCategory",
  "latestPickTitle",
  "latestPickNote",
  "latestPickUrl",
  "visibility",
  "discoverable",
] as const;
