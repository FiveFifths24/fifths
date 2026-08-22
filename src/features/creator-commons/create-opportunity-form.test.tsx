import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ createOpportunityAction: vi.fn() }));

import { CreateOpportunityForm } from "./create-opportunity-form";

describe("CreateOpportunityForm", () => {
  it("provides accessible draft, scope, deadline, skill, and Pulse controls", () => {
    render(
      <CreateOpportunityForm
        circles={[{ id: "circle-1", name: "Creator Circle" }]}
        interests={[{ id: "interest-1", name: "Media" }]}
        modes={[{ id: "mode-1", name: "Create" }]}
        skills={[{ id: "skill-1", name: "Production" }]}
      />,
    );
    expect(
      screen.getByRole("form", {
        name: "Create a Creator Commons opportunity",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/response deadline/i)).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(screen.getByLabelText("Production")).toHaveAttribute(
      "name",
      "skillIds",
    );
    expect(
      screen.getByRole("button", {
        name: /create draft opportunity/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not publish the opportunity automatically/i),
    ).toBeInTheDocument();
  });
});
