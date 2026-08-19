import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/forms/auth-shell";
import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "Join Signal" };

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Join Signal"
      title="One Account For Every Way You Show Up."
      description="Create your Signal account to bring your daily capacity, communities, creative work, campaigns, and Passport together in one place."
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