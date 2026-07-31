import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { TextField } from "@/components/forms/text-field";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Find your way back in."
      description="Enter the email associated with your future FIFTHS account. Secure reset delivery will be connected during Phase 2."
      footer={
        <Link
          className="font-bold text-white underline decoration-neutral-600 underline-offset-4"
          href="/login"
        >
          Return to login
        </Link>
      }
    >
      <form aria-label="Request a password reset" className="space-y-5">
        <TextField
          autoComplete="email"
          hint="When authentication is live, reset instructions will be sent only if an eligible account exists."
          label="Email address"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
        <button
          className="min-h-12 w-full cursor-not-allowed rounded-full bg-neutral-700 px-6 py-3 font-bold text-neutral-300"
          disabled
          type="submit"
        >
          Send reset link · Coming in Phase 2
        </button>
      </form>
    </AuthShell>
  );
}
