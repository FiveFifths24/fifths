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
      className="space-y-5"
    >
      <ActionStatus state={state} />
      <TextField
        autoComplete="email"
        error={firstFieldError(state, "email")}
        label="Email address"
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />
      <PasswordField
        autoComplete="new-password"
        error={firstFieldError(state, "password")}
        hint="Use 12–72 characters. A password manager is recommended."
        label="Create a password"
        name="password"
        required
      />
      <PasswordField
        autoComplete="new-password"
        error={firstFieldError(state, "confirmPassword")}
        label="Confirm password"
        name="confirmPassword"
        required
      />
      <div>
        <label className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300">
          <input
            aria-describedby={agreementError ? "agreement-error" : undefined}
            aria-invalid={agreementError ? true : undefined}
            className="mt-1 size-5 shrink-0 accent-red-600"
            name="agreement"
            required
            type="checkbox"
          />
          <span>
            I confirm that I am 18 or older and agree to the{" "}
            <Link
              className="font-bold text-white underline underline-offset-4"
              href="/community-guidelines"
            >
              Community Guidelines
            </Link>
            ,{" "}
            <Link
              className="font-bold text-white underline underline-offset-4"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            , and{" "}
            <Link
              className="font-bold text-white underline underline-offset-4"
              href="/terms"
            >
              Terms of Use
            </Link>
            .
          </span>
        </label>
        {agreementError ? (
          <p
            className="mt-2 text-xs leading-5 text-red-300"
            id="agreement-error"
          >
            {agreementError}
          </p>
        ) : null}
      </div>
      <SubmitButton pendingLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
