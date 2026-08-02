import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import {
  PulseHistoryList,
  type PulseHistoryItem,
} from "@/features/pulse/pulse-history-list";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pulse history" };
export const dynamic = "force-dynamic";

export default async function PulseHistoryPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [historyResult, modeResult] = await Promise.all([
    supabase
      .from("pulse_check_ins")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("modes").select("id, name").order("sort_order"),
  ]);

  if (historyResult.error || modeResult.error) {
    return (
      <StatusMessage tone="error">
        Pulse history could not load. Confirm that the Phase 3 migration has
        been applied to the connected Supabase project.
      </StatusMessage>
    );
  }

  const modeNames = new Map(
    (modeResult.data ?? []).map((mode) => [mode.id, mode.name]),
  );
  const items: PulseHistoryItem[] = (historyResult.data ?? []).map((item) => ({
    ...item,
    modeName: modeNames.get(item.mode_id) ?? "Archived mode",
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">
            <LockKeyhole aria-hidden="true" className="size-4" /> Private
            history
          </p>
          <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
            Your Pulse over time.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
            Only you can read this timeline. Expired check-ins remain visible
            here but stop influencing recommendations after 24 hours.
          </p>
        </div>
        <ButtonLink href="/home/pulse">Check in again</ButtonLink>
      </div>

      <div className="mt-10">
        <PulseHistoryList items={items} />
      </div>
    </div>
  );
}
