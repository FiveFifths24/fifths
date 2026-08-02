import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254, "Email address is too long.");

const password = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(72, "Use no more than 72 characters.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const signupSchema = z
  .object({
    email,
    password,
    confirmPassword: z.string(),
    agreement: z.literal("on", {
      error: "Confirm that you are 18 or older and accept the policies.",
    }),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
