import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionRegistrationForm } from "./session-registration-form";

const sessionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("SessionRegistrationForm", () => {
  it("offers registration when capacity is open", () => {
    render(
      <SessionRegistrationForm
        isFull={false}
        isRegistered={false}
        registrationOpen
        sessionId={sessionId}
      />,
    );
    expect(
      screen.getByRole("form", { name: "Register for this Session" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register for Session" }),
    ).toBeEnabled();
  });

  it("labels full capacity without relying on color", () => {
    render(
      <SessionRegistrationForm
        isFull
        isRegistered={false}
        registrationOpen
        sessionId={sessionId}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/full/i);
    expect(
      screen.getByText(/does not include a waitlist/i),
    ).toBeInTheDocument();
  });
});
