import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Container } from "@/components/ui/container";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Build your SIGNAL profile",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login?next=/onboarding");
  }

  const [profileResult, interestResult, skillResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", userData.user.id)
      .maybeSingle(),

    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),

    supabase
      .from("skills")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

if (profileResult.data?.onboarding_completed_at) {
  redirect("/home");
}

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#020205] py-14 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(108, 20, 206, 0.18), transparent 34%), radial-gradient(circle at 80% 30%, rgba(243, 89, 210, 0.12), transparent 30%), linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 48px 48px, 48px 48px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-[#6c14ce]/15 blur-[150px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-36 top-1/3 size-96 rounded-full bg-[#f359d2]/10 blur-[160px]"
      />

      <Container className="relative">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.22em] text-[#ca9aff] uppercase">
              Welcome to SIGNAL
            </p>

            <h1 className="display-type mt-5 text-5xl leading-[0.95] text-white sm:text-7xl">
              Let’s Find What Fits You.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
              Build your profile, choose what you are open to, and set the
              preferences that help SIGNAL recommend people, places, and plans
              that feel right for you.
            </p>

          </div>

          <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-9">
            <OnboardingForm
              interests={interestResult.data ?? []}
              skills={skillResult.data ?? []}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}