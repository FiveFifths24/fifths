"use server";

import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/env";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  loginSchema,
  signupSchema,
  updatePasswordSchema,
} from "./schemas";
import type { ActionState } from "./state";

const unavailableMessage =
  "Account services are not configured yet. Please try again after the founder completes Supabase setup.";

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let destination = safeRedirectPath(parsed.data.next, "/home");
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error || !data.user) {
      return {
        status: "error",
        message: "The email or password is incorrect.",
      };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!profile?.onboarding_completed_at) destination = "/onboarding";
  } catch {
    return { status: "error", message: unavailableMessage };
  }

  redirect(destination);
}

export async function signupAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let signedInImmediately = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/onboarding`,
        data: { age_confirmed: true },
      },
    });
if (error) {
  console.error("Supabase signup error:", error);

  return {
    status: "error",
    message: error.message,
  };
}
    signedInImmediately = Boolean(data.session);
  } catch {
    return { status: "error", message: unavailableMessage };
  }

  if (signedInImmediately) redirect("/onboarding");

  return {
    status: "success",
    message:
      "Check your email to confirm your account, then continue to onboarding.",
  };
}

export async function forgotPasswordAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Enter a valid email address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/update-password`,
    });
  } catch {
    return { status: "error", message: unavailableMessage };
  }

  return {
    status: "success",
    message:
      "If an eligible account exists, password-reset instructions are on the way.",
  };
}

export async function updatePasswordAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (error) {
      return {
        status: "error",
        message: "The password could not be updated. Request a new reset link.",
      };
    }
  } catch {
    return { status: "error", message: unavailableMessage };
  }

  redirect("/account?password=updated");
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } finally {
    redirect("/");
  }
}
