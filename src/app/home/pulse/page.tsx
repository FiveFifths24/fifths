import type { Metadata } from "next";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { StatusMessage } from "@/components/ui/status-message";
import { PulseCheckInForm } from "@/features/pulse/pulse-check-in-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Check your Pulse" };
export const dynamic = "force-dynamic";

export default async function PulseCheckInPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [modeResult, interestResult] = await Promise.all([
    supabase
      .from("modes")
      .select("id, name, description")
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  if (modeResult.error || interestResult.error || !modeResult.data?.length) {
    return (
      <StatusMessage tone="error">
        Pulse options are unavailable. Confirm that the Phase 3 migration has
        been applied to the connected Supabase project.
      </StatusMessage>
    );
  }

  return (
<div className="mx-auto max-w-5xl">
  <div className="text-center">
    <p className="text-xs font-bold tracking-[0.2em] text-[#f359d2] uppercase">
      Pulse check-in
    </p>

    <h1 className="display-type mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
      Define Your Energy
    </h1>

    <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/50">
      Tell us what feels right today. Your Pulse helps shape what rises
      into your feed for the next 24 hours.
    </p>
  </div>

  <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/45 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-[#6c14ce]/15 blur-[120px]"
    />

    <div className="relative">
              <PulseCheckInForm
          interests={interestResult.data ?? []}
          modes={modeResult.data ?? []}
        />
    </div>
  </div>
</div>
  );
}
