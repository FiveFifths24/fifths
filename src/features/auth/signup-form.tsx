"use client";

import Link from "next/link";
import { useActionState } from "react";

import { ActionStatus } from "@/components/forms/action-status";
import { PasswordField } from "@/components/forms/password-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";

import { signupAction } from "./actions";
import { firstFieldError, initialActionState } from "./state";

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialActionState);
  const agreementError = firstFieldError(state, "agreement");

  return (
    <form
      action={action}
      aria-label="Create a FIFTHS account"
      className="space-y-6"
    >
      <ActionStatus state={state} />

      <TextField
        autoComplete="email"
        error={firstFieldError(state, "email")}
        label="Email Address"
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />

      <PasswordField
        autoComplete="new-password"
        error={firstFieldError(state, "password")}
        hint="Use 8–72 characters. A password manager is recommended."
        label="Create a password"
        maxLength={72}
        minLength={8}
        name="password"
        required
      />

      <PasswordField
        autoComplete="new-password"
        error={firstFieldError(state, "confirmPassword")}
        label="Confirm password"
        maxLength={72}
        minLength={8}
        name="confirmPassword"
        required
      />

      <div>
        <label className="group flex items-start gap-3 rounded-2xl border border-[#992bff]/25 bg-gradient-to-br from-[#992bff]/10 via-black to-[#f359d2]/5 p-5 text-sm leading-6 text-white/70 shadow-inner shadow-[#992bff]/5 transition-colors hover:border-[#f359d2]/40">
          <input
            aria-describedby={agreementError ? "agreement-error" : undefined}
            aria-invalid={agreementError ? true : undefined}
            className="mt-1 size-5 shrink-0 accent-[#f359d2] focus:ring-2 focus:ring-[#f359d2]/50 focus:ring-offset-2 focus:ring-offset-black"
            name="agreement"
            required
            type="checkbox"
          />

          <span>
            I confirm that I am 18 or older and agree to the{" "}
            <Link
              className="font-bold text-[#e9c5ff] underline decoration-[#f359d2]/50 underline-offset-4 transition-colors hover:text-[#f359d2]"
              href="/community-guidelines"
            >
              Community Guidelines
            </Link>
            ,{" "}
            <Link
              className="font-bold text-[#e9c5ff] underline decoration-[#f359d2]/50 underline-offset-4 transition-colors hover:text-[#f359d2]"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            , and{" "}
            <Link
              className="font-bold text-[#e9c5ff] underline decoration-[#f359d2]/50 underline-offset-4 transition-colors hover:text-[#f359d2]"
              href="/terms"
            >
              Terms of Use
            </Link>
            .
          </span>
        </label>

        {agreementError ? (
          <p
            className="mt-2 text-xs leading-5 text-[#ff9ae6]"
            id="agreement-error"
          >
            {agreementError}
          </p>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Creating account…">
        Create Account
      </SubmitButton>
    </form>
  );
}
