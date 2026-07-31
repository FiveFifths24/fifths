import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Return to your space."
      description="One account will connect your Pulse, communities, collaborations, campaigns, and verified participation."
      footer={
        <>
          New to FIFTHS?{" "}
          <Link
            className="font-bold text-white underline decoration-neutral-600 underline-offset-4"
            href="/signup"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form aria-label="Log in to FIFTHS" className="space-y-5">
        <TextField
          autoComplete="email"
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
              className="text-xs font-bold text-red-300 hover:text-red-200"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordField
            aria-label="Password"
            autoComplete="current-password"
            label=""
            name="password"
            required
          />
        </div>
        <button
          className="min-h-12 w-full cursor-not-allowed rounded-full bg-neutral-700 px-6 py-3 font-bold text-neutral-300"
          disabled
          type="submit"
        >
          Log in · Coming in Phase 2
        </button>
      </form>
      <div className="mt-7 border-t border-neutral-800 pt-6">
        <button
          className="min-h-12 w-full cursor-not-allowed rounded-full border border-neutral-700 px-6 py-3 text-sm font-bold text-neutral-500"
          disabled
          type="button"
        >
          Social login will be available later
        </button>
      </div>
    </AuthShell>
  );
}
