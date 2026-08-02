import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { UpdatePasswordForm } from "@/features/auth/update-password-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Secure your return."
      description="Choose a strong new password for your confirmed recovery session."
      footer={
        <Link
          className="font-bold text-white underline underline-offset-4"
          href="/login"
        >
          Return to login
        </Link>
      }
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
