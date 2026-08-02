import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PulseCheckInForm } from "./pulse-check-in-form";

const modes = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Reset",
    description: "Protect capacity with a calmer path.",
  },
];
const interests = [
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Arts & culture",
  },
];

describe("PulseCheckInForm", () => {
  it("groups every matching signal with accessible labels", () => {
    render(<PulseCheckInForm interests={interests} modes={modes} />);

    expect(
      screen.getByRole("form", { name: "Check your Pulse" }),
    ).toBeInTheDocument();
    for (const group of [
      "What mode fits right now?",
      "How much energy is available?",
      "Preferred stimulation",
      "Social intensity",
      "Format",
      "Time available",
      "What sounds interesting today?",
    ]) {
      expect(screen.getByRole("group", { name: group })).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Optional travel range")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save this Pulse" }),
    ).toBeEnabled();
  });

  it("explains privacy without collecting diagnosis or free-text notes", () => {
    render(<PulseCheckInForm interests={interests} modes={modes} />);
    expect(
      screen.getByText(/does not use Pulse to diagnose/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
