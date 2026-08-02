"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { forgotPasswordAction } from "./actions";
import { firstFieldError, initialActionState } from "./state";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(
    forgotPasswordAction,
    initialActionState,
  );
  return (
    <form
      action={action}
      aria-label="Request a password reset"
      className="space-y-5"
    >
      <ActionStatus state={state} />
      <TextField
        autoComplete="email"
        error={firstFieldError(state, "email")}
        hint="For privacy, the response is the same whether or not an account exists."
        label="Email address"
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />
      <SubmitButton pendingLabel="Sending secure link…">
        Send reset link
      </SubmitButton>
    </form>
  );
}
