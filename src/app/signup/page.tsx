import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { PasswordField } from "@/components/forms/password-field";
import { TextField } from "@/components/forms/text-field";

export const metadata: Metadata = { title: "Join FIFTHS" };

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Join FIFTHS"
      title="One identity. Every way you participate."
      description="Create the account that will eventually connect your daily capacity, communities, creative work, campaigns, and Passport."
      footer={
        <>
          Already have an account?{" "}
          <Link
            className="font-bold text-white underline decoration-neutral-600 underline-offset-4"
            href="/login"
          >
            Log in
          </Link>
        </>
      }
    >
      <form aria-label="Create a FIFTHS account" className="space-y-5">
        <TextField
          autoComplete="email"
          label="Email address"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <PasswordField
          autoComplete="new-password"
          hint="Use at least 12 characters. Final password requirements will be enforced in Phase 2."
          label="Create a password"
          name="password"
          required
        />
        <PasswordField
          autoComplete="new-password"
          label="Confirm password"
          name="confirm-password"
          required
        />
        <label className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm leading-6 text-neutral-300">
          <input
            className="mt-1 size-5 shrink-0 accent-red-600"
            disabled
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
        <button
          className="min-h-12 w-full cursor-not-allowed rounded-full bg-neutral-700 px-6 py-3 font-bold text-neutral-300"
          disabled
          type="submit"
        >
          Create account · Coming in Phase 2
        </button>
      </form>
    </AuthShell>
  );
}
