"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ActionStatus } from "@/components/forms/action-status";
import { PasswordField } from "@/components/forms/password-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { loginAction } from "./actions";
import { firstFieldError, initialActionState } from "./state";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialActionState);
  return (
    <form action={action} aria-label="Log in to FIFTHS" className="space-y-5">
      <ActionStatus state={state} />
      {next ? <input name="next" type="hidden" value={next} /> : null}
      <TextField
        autoComplete="email"
        error={firstFieldError(state, "email")}
        label="Email address"
        name="email"
        placeholder="you@example.com"
        required
        type="email"
      />
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span
            aria-hidden="true"
            className="text-sm font-bold text-neutral-100"
          >
            Password
          </span>
          <Link
            className="text-xs font-bold text-[#ca9aff] hover:text-[#f359d2]"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordField
          aria-label="Password"
          autoComplete="current-password"
          error={firstFieldError(state, "password")}
          label=""
          name="password"
          required
        />
      </div>
<SubmitButton
  className="border-transparent bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#f359d2] shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
  pendingLabel="Logging in…"
>
  Log in
</SubmitButton>
    </form>
  );
}
