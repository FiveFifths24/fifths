"use client";

import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { PasswordField } from "@/components/forms/password-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { updatePasswordAction } from "./actions";
import { firstFieldError, initialActionState } from "./state";

export function UpdatePasswordForm() {
  const [state, action] = useActionState(
    updatePasswordAction,
    initialActionState,
  );
  return (
    <form
      action={action}
      aria-label="Choose a new password"
      className="space-y-5"
    >
      <ActionStatus state={state} />
      <PasswordField
        autoComplete="new-password"
        error={firstFieldError(state, "password")}
        hint="Use 12–72 characters and do not reuse a password from another service."
        label="New password"
        name="password"
        required
      />
      <PasswordField
        autoComplete="new-password"
        error={firstFieldError(state, "confirmPassword")}
        label="Confirm new password"
        name="confirmPassword"
        required
      />
      <SubmitButton pendingLabel="Updating password…">
        Update password
      </SubmitButton>
    </form>
  );
}
