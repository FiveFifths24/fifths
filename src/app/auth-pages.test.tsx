import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ForgotPasswordPage from "./forgot-password/page";
import SignupPage from "./signup/page";
import { LoginForm } from "@/features/auth/login-form";

describe("authentication interfaces", () => {
  it("provides enabled, validation-ready login controls", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("form", { name: "Log in to FIFTHS" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
      "type",
      "email",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled();
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
    expect(screen.getByRole("checkbox")).toBeRequired();
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeEnabled();
  });

  it("labels the password reset email field", () => {
    render(<ForgotPasswordPage />);
    expect(
      screen.getByRole("form", { name: "Request a password reset" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeRequired();
  });
});
