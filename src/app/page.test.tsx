import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("landing page", () => {
  it("explains the connected ecosystem without claiming that it is live", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /real-time capacity\s*meets real-world\s*connections/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /signal converts your real-time mental, emotional, and physical capacity into meaningful ways to connect, create, and participate/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("link", { name: "Join SIGNAL" })[0],
    ).toHaveAttribute("href", "/signup");

    screen.getByRole("navigation", {
      name: /quick access to signal features/i,
    });

    const featureNavigation = screen.getByRole("navigation", {
      name: /quick access to signal features/i,
    });

    for (const moduleName of [
      "Pulse",
      "Sessions",
      "Circles",
      "Creator Commons",
      "Fifth Realm",
      "Passport",
    ]) {
      expect(
        within(featureNavigation).getByRole("link", {
          name: moduleName,
        }),
      ).toBeInTheDocument();
    }
  });
});
