import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({
  createCampaignAction: vi.fn(),
  submitCampaignApplicationAction: vi.fn(),
}));

import { CampaignApplicationForm } from "./campaign-application-form";
import { CreateCampaignForm } from "./create-campaign-form";

describe("Fifth Realm forms", () => {
  it("provides accessible originality, safety, schedule, and Pulse controls", () => {
    render(
      <CreateCampaignForm
        circles={[{ id: "circle-1", name: "Story Circle" }]}
        interests={[{ id: "interest-1", name: "Storytelling" }]}
        modes={[{ id: "mode-1", name: "Immerse" }]}
      />,
    );
    expect(
      screen.getByRole("form", { name: "Create a Fifth Realm campaign" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Original premise")).toBeRequired();
    expect(screen.getByLabelText("Safety expectations")).toBeRequired();
    expect(screen.getByLabelText("Application deadline")).toHaveAttribute(
      "type",
      "datetime-local",
    );
    expect(
      screen.getByRole("button", { name: "Create draft campaign" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/does not publish it/i)).toBeInTheDocument();
  });

  it("requires an explicit safety acknowledgement before applying", () => {
    render(
      <CampaignApplicationForm campaignId="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" />,
    );
    expect(
      screen.getByRole("form", { name: "Apply to this Fifth Realm campaign" }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/i have read this campaign’s safety expectations/i),
    ).toBeRequired();
    expect(
      screen.getByText(/do not include contact details, diagnoses/i),
    ).toBeInTheDocument();
  });
});
