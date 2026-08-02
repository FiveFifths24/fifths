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
      {parameters?.error ? (
        <StatusMessage className="mb-5" tone="error">
          The confirmation link is invalid or expired. Request a new link and
          try again.
        </StatusMessage>
      ) : null}
      <LoginForm next={safeRedirectPath(parameters?.next, "/home")} />
      <div className="mt-7 border-t border-neutral-800 pt-6">
        <button
          className="min-h-12 w-full cursor-not-allowed rounded-full border border-neutral-700 px-6 py-3 text-sm font-bold text-neutral-500"
          disabled
          type="button"
        >
          Social login is intentionally deferred
        </button>
      </div>
    </AuthShell>
  );
}
