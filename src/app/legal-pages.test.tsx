import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AccessibilityPage from "./accessibility/page";
import CommunityGuidelinesPage from "./community-guidelines/page";
import PrivacyPage from "./privacy/page";
import TermsPage from "./terms/page";

describe("launch legal and accessibility routes", () => {
  it.each([
    ["Terms of Use", <TermsPage key="terms" />],
    ["Privacy Policy", <PrivacyPage key="privacy" />],
    [
      "Community Guidelines",
      <CommunityGuidelinesPage key="community-guidelines" />,
    ],
  ])("renders the %s draft and legal-review warning", (heading, page) => {
    render(page);
    expect(
      screen.getByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/professional legal review is required/i),
    ).toBeInTheDocument();
  });

  it("publishes an honest Accessibility Statement with a feedback route", () => {
    render(<AccessibilityPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /make room for people/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /has not received independent accessibility certification/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /share accessibility feedback/i }),
    ).toHaveAttribute("href", "/home/safety");
  });
});
