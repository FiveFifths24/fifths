import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CreateCircleForm } from "./create-circle-form";

describe("CreateCircleForm", () => {
  it("provides labeled identity, access, rules, and Pulse-fit controls", () => {
    render(
      <CreateCircleForm
        interests={[
          {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            name: "Creative technology",
          },
        ]}
        modes={[
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            name: "Connect",
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("form", { name: "Create a Circle" }),
    ).toBeInTheDocument();

    for (const label of [
      "Circle Name",
      "URL Name",
      "Short Summary",
      "Full Description",
      "Community Rules",
      "Visibility",
      "Membership",
      "Format",
      "Primary mode",
      "Minimum Energy",
      "Maximum Energy",
      "Stimulation",
      "Participation Style",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }

    expect(screen.getByText("Creative technology")).toBeInTheDocument();
    expect(
      screen.getByText(/Creating a Circle starts a community draft/i),
    ).toBeInTheDocument();
  });
});
