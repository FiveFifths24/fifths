import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { StatusMessage } from "@/components/ui/status-message";
import { LoginForm } from "@/features/auth/login-form";
import { safeRedirectPath } from "@/lib/auth/redirects";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string; error?: string }>;
}) {
  const parameters = await searchParams;
  return (
    <AuthShell
      eyebrow="Welcome Back"
      title="Return To Your Space."
      description="We've missed you! Log in to continue where you left off."
      footer={
        <>
          New to SIGNAL?{" "}
          <Link
            className="font-bold text-white underline decoration-neutral-600 underline-offset-4"
            href="/signup"
          >
            Create an account
          </Link>
        </>
      }
    >
      {parameters?.error ? (
        <StatusMessage className="mb-5" tone="error">
          The confirmation link is invalid or expired. Request a new link and
          try again.
        </StatusMessage>
      ) : null}
      <LoginForm next={safeRedirectPath(parameters?.next, "/home")} />
    </AuthShell>
  );
}
