import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CreateSessionForm } from "./create-session-form";

describe("CreateSessionForm", () => {
  it("provides labeled hosting and Pulse-fit controls", () => {
    render(
      <CreateSessionForm
        defaultTimezone="America/New_York"
        draftOwnerId="user-1"
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
      "Session Title",
      "Description",
      "Starts",
      "Ends",
      "Timezone",
      "Format",
      "Session Member Capacity",
      "Mode",
      "Energy From",
      "Energy To",
      "Stimulation",
      "Social Pace",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }

    expect(screen.getByText("Arts & culture")).toBeInTheDocument();

    expect(
      screen.getByText(/Your Session will start as a draft/i),
    ).toBeInTheDocument();
  });
});
