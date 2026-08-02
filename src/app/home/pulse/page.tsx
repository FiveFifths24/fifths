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
      <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
        Pulse check-in
      </p>
      <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
        Match the moment you are actually in.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        A Pulse is a short-lived set of preferences for right now. It is not a
        diagnosis, personality score, or permanent label.
      </p>
      <div className="mt-10 rounded-[2rem] border border-neutral-800 bg-neutral-900/95 p-6 shadow-2xl shadow-black sm:p-9">
        <PulseCheckInForm
          interests={interestResult.data ?? []}
          modes={modeResult.data ?? []}
        />
      </div>
    </div>
  );
}
