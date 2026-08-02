import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./actions", () => ({ submitOpportunityResponseAction: vi.fn() }));

import { OpportunityResponseForm } from "./opportunity-response-form";

describe("OpportunityResponseForm", () => {
  it("labels private response and availability controls without contact collection", () => {
    render(
      <OpportunityResponseForm opportunityId="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" />,
    );
    expect(
      screen.getByRole("form", { name: "Respond to this opportunity" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Your response")).toBeRequired();
    expect(screen.getByLabelText("Availability")).toBeRequired();
    expect(
      screen.getByText(/do not include private contact details/i),
    ).toBeInTheDocument();
  });
});
