import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  updatePasswordSchema,
} from "./schemas";

describe("authentication validation", () => {
  it("accepts a complete adult signup agreement", () => {
    expect(
      signupSchema.safeParse({
        email: "member@example.com",
        password: "correct horse battery staple",
        confirmPassword: "correct horse battery staple",
        agreement: "on",
      }).success,
    ).toBe(true);
  });

  it("rejects short, mismatched signup data", () => {
    const result = signupSchema.safeParse({
      email: "member@example.com",
      password: "short",
      confirmPassword: "different",
      agreement: "on",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      expect(fields.password).toBeDefined();
      expect(fields.confirmPassword).toBeDefined();
    }
  });

  it("requires the adult policy agreement", () => {
    const result = signupSchema.safeParse({
      email: "member@example.com",
      password: "correct horse battery staple",
      confirmPassword: "correct horse battery staple",
      agreement: undefined,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.agreement).toBeDefined();
    }
  });

  it("validates login, reset, and replacement-password inputs", () => {
    expect(
      loginSchema.safeParse({ email: "not-email", password: "" }).success,
    ).toBe(false);
    expect(
      forgotPasswordSchema.safeParse({ email: "member@example.com" }).success,
    ).toBe(true);
    expect(
      updatePasswordSchema.safeParse({
        password: "a secure new password",
        confirmPassword: "a secure new password",
      }).success,
    ).toBe(true);
  });
});
