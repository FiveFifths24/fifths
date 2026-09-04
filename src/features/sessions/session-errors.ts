export const SESSION_PUBLISH_CAP_ERROR =
  "You already have 5 published Sessions scheduled within the next 14 days. Cancel or complete one before publishing another.";

export type SessionStatusOutcome = "updated" | "publishing-cap" | "error";

function databaseMessage(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : "";
}

export function getSafeCreateSessionErrorMessage(error: unknown) {
  const message = databaseMessage(error);

  if (message.includes("Host role required")) {
    return "You need Session host access to create a Session.";
  }
  if (message.includes("Onboarding required")) {
    return "Complete onboarding before creating a Session.";
  }
  if (message.includes("Invalid session time")) {
    return "Check the Session start and end times and try again.";
  }
  if (message.includes("Invalid timezone")) {
    return "Choose a supported timezone and try again.";
  }
  if (message.includes("Invalid location label")) {
    return "Check the location and try again.";
  }
  if (message.includes("Invalid mode")) {
    return "Choose a valid SIGNAL mode and try again.";
  }
  if (message.includes("Invalid interest selection")) {
    return "Choose up to 8 available interests and try again.";
  }
  if (message.includes("Invalid session matching range")) {
    return "Check the capacity and matching preferences and try again.";
  }
  if (message.includes("Invalid session content")) {
    return "Check the Session title and description lengths and try again.";
  }
  if (message.includes("Please slow down")) {
    return "You’re creating Sessions too quickly. Please wait and try again.";
  }

  return "The Session could not be created. Review the details and try again.";
}

export function getSessionStatusOutcome(error: unknown): SessionStatusOutcome {
  return databaseMessage(error).includes(SESSION_PUBLISH_CAP_ERROR)
    ? "publishing-cap"
    : "error";
}
