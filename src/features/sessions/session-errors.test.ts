import { describe, expect, it } from "vitest";

import {
  getSafeCreateSessionErrorMessage,
  getSessionStatusOutcome,
  SESSION_PUBLISH_CAP_ERROR,
} from "./session-errors";

describe("safe Session database errors", () => {
  it("preserves useful known creation errors without exposing unknown details", () => {
    expect(
      getSafeCreateSessionErrorMessage({ message: "Invalid session time" }),
    ).toBe("Check the Session start and end times and try again.");
    expect(
      getSafeCreateSessionErrorMessage({
        message: "sensitive database internals",
      }),
    ).toBe(
      "The Session could not be created. Review the details and try again.",
    );
  });

  it("maps only the exact publishing-cap database error to the host outcome", () => {
    expect(
      getSessionStatusOutcome({ message: SESSION_PUBLISH_CAP_ERROR }),
    ).toBe("publishing-cap");
    expect(getSessionStatusOutcome({ message: "permission denied" })).toBe(
      "error",
    );
  });
});
