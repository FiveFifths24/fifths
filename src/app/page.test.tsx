import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("landing page", () => {
  it("explains the connected ecosystem without claiming that it is live", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /find your space.+match your energy/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /PULSE helps you discover ways to participate that fit your energy, interests, and availability/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Join FIFTHS" })[0],
    ).toHaveAttribute("href", "/signup");

    for (const moduleName of [
      "Pulse",
      "Circles",
      "Creator Commons",
      "Fifth Realm",
      "Passport",
    ]) {
      expect(
        screen.getByRole("heading", { name: moduleName }),
      ).toBeInTheDocument();
    }
  });
});
