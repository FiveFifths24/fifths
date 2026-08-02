import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      title="Find your way back in."
      description="Enter the email associated with your FIFTHS account. We will send a time-limited recovery link when the account is eligible."
      footer={
        <Link
          className="font-bold text-white underline decoration-neutral-600 underline-offset-4"
          href="/login"
        >
          Return to login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
