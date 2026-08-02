import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CreateSessionForm } from "./create-session-form";

describe("CreateSessionForm", () => {
  it("provides labeled hosting and Pulse-fit controls", () => {
    render(
      <CreateSessionForm
        defaultTimezone="America/New_York"
        interests={[
          {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            name: "Arts & culture",
          },
        ]}
        modes={[
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            name: "Create",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("form", { name: "Create a Session" }),
    ).toBeInTheDocument();
    for (const label of [
      "Title",
      "Short summary",
      "Full description",
      "Starts",
      "Ends",
      "Timezone",
      "Format",
      "Capacity",
      "Primary mode",
      "Minimum energy",
      "Maximum energy",
      "Stimulation",
      "Social pace",
      "Arts & culture",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(/does not publish it/i)).toBeInTheDocument();
  });
});
