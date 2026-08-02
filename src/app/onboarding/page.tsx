import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Container } from "@/components/ui/container";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Build your profile" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/onboarding");

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
    supabase.from("skills").select("id, name").eq("active", true).order("name"),
  ]);

  if (profileResult.data?.onboarding_completed_at) redirect("/account");

  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div
        aria-hidden="true"
        className="surface-grid absolute inset-0 opacity-50"
      />
      <Container className="relative">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            Account foundation
          </p>
          <h1 className="display-type mt-5 text-5xl leading-[0.95] text-white sm:text-7xl">
            Make FIFTHS feel like yours.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            Set your identity and a few signals for the connected ecosystem. We
            do not ask for medical diagnoses or a precise home address.
          </p>
          <div className="mt-10 rounded-[2rem] border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl shadow-black sm:p-9">
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
