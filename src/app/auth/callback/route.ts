import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeRedirectPath(
    requestUrl.searchParams.get("next"),
    "/onboarding",
  );

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error)
        return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch {
      // Redirect below with a safe, non-sensitive message.
    }
  }

  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set(
    "error",
    "The confirmation link is invalid or expired. Please try again.",
  );
  return NextResponse.redirect(loginUrl);
}
