import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SESSION_PUBLISH_CAP_ERROR } from "./session-errors";
import { SessionStatusFeedback } from "./session-status-feedback";

describe("Session host status feedback", () => {
  it("shows the specific publishing-cap message in the host UI", () => {
    render(<SessionStatusFeedback status="publishing-cap" />);
    expect(screen.getByText(SESSION_PUBLISH_CAP_ERROR)).toBeInTheDocument();
  });
});
