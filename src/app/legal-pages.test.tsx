import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CommunityGuidelinesPage from "./community-guidelines/page";
import PrivacyPage from "./privacy/page";
import RealmSafetyPage from "./realm/safety/page";

describe("legal and safety drafts", () => {
  it.each([
    ["privacy", PrivacyPage],
    ["community", CommunityGuidelinesPage],
    ["realm safety", RealmSafetyPage],
  ])("marks the %s page as a draft requiring legal review", (_name, Page) => {
    render(<Page />);
    expect(screen.getByText(/this is a phase 1 draft/i)).toBeInTheDocument();
    expect(
      screen.getByText(/legal review is required before public launch/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/18 and older/i).length).toBeGreaterThan(0);
  });
});
