import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ForgotPasswordPage from "./forgot-password/page";
import LoginPage from "./login/page";
import SignupPage from "./signup/page";

describe("authentication interfaces", () => {
  it("provides validation-ready login controls without enabling authentication", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("form", { name: "Log in to FIFTHS" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(
      screen.getByRole("button", { name: /coming in phase 2/i }),
    ).toBeDisabled();
  });

  it("includes the adult and policy agreement on signup", () => {
    render(<SignupPage />);
    expect(
      screen.getByText(/i confirm that i am 18 or older/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Community Guidelines" }),
    ).toHaveAttribute("href", "/community-guidelines");
    expect(
      screen.getAllByRole("button", { name: /show password/i }),
    ).toHaveLength(2);
  });

  it("labels the password reset email field", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByRole("form", { name: "Request a password reset" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeRequired();
  });
});
