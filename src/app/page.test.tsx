import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("landing page", () => {
  it("explains the connected ecosystem without claiming that it is live", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /broadcast your\s*signal\.\s*find your people\./i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /find communities, creators, events, collaborations, and experiences worth doing/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("link", { name: "Join SIGNAL" })[0],
    ).toHaveAttribute("href", "/signup");

    const featureNavigation = screen.getByRole("navigation", {
      name: "SIGNAL features",
    });

    for (const moduleName of [
      "Pulse",
      "Sessions",
      "Circles",
      "Commons",
      "Realm",
      "Passport",
    ]) {
      expect(
        within(featureNavigation).getByRole("link", { name: moduleName }),
      ).toBeInTheDocument();
    }
  });
});
