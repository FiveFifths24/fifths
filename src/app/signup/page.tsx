import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { SignupForm } from "@/features/auth/signup-form";

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
      <SignupForm />
    </AuthShell>
  );
}
