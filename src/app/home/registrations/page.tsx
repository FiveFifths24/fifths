import type { Metadata } from "next";
import { CheckCircle2, TicketCheck } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { assembleSessionCards } from "@/features/sessions/session-data";
import { SessionCard } from "@/features/sessions/session-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My registrations" };
export const dynamic = "force-dynamic";

export default async function RegistrationsPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

  const registrationResult = await supabase
    .from("registrations")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("registered_at", { ascending: false })
    .limit(30);

  if (registrationResult.error) {
    return (
      <StatusMessage tone="error">
        Registrations are unavailable. Confirm that the Phase 4 migration has
        been applied to the connected Supabase project.
      </StatusMessage>
    );
  }

  const registrations = registrationResult.data ?? [];
  const sessionIds = registrations.map(
    (registration) => registration.session_id,
  );
  const [
    sessionResult,
    modeResult,
    interestResult,
    linkResult,
    attendanceResult,
  ] = sessionIds.length
    ? await Promise.all([
        supabase.from("sessions").select("*").in("id", sessionIds),
        supabase.from("modes").select("id, name").order("sort_order"),
        supabase
          .from("interests")
          .select("id, name")
          .eq("active", true)
          .order("name"),
        supabase
          .from("session_interests")
          .select("session_id, interest_id")
          .in("session_id", sessionIds),
        supabase
          .from("attendance_records")
          .select("session_id, status")
          .eq("user_id", userData.user.id)
          .in("session_id", sessionIds),
      ])
    : [
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
        { data: [], error: null },
      ];

  if (sessionResult.error) {
    return (
      <StatusMessage tone="error">
        Registered Session details could not load. Check the Phase 4 policies
        and migration state.
      </StatusMessage>
    );
  }

  const cards = assembleSessionCards(
    sessionResult.data ?? [],
    modeResult.data ?? [],
    interestResult.data ?? [],
    linkResult.data ?? [],
  );
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const attendanceById = new Map(
    (attendanceResult.data ?? []).map((item) => [item.session_id, item.status]),
  );

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            <TicketCheck aria-hidden="true" className="size-4" /> Private
            registrations
          </p>
          <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
            Your Session places.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Review active and cancelled registrations tied to your account.
            Hosts can see only the roster for Sessions they manage.
          </p>
        </div>
        <ButtonLink href="/home/sessions">Discover Sessions</ButtonLink>
      </div>

      {registrations.length ? (
        <ol className="mt-10 grid gap-6 lg:grid-cols-2">
          {registrations.map((registration) => {
            const card = cardsById.get(registration.session_id);
            if (!card) return null;
            const attendance = attendanceById.get(registration.session_id);
            return (
              <li className="space-y-3" key={registration.session_id}>
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <Badge
                    className={
                      registration.status === "registered"
                        ? "border-emerald-900 bg-emerald-950/30 text-emerald-100"
                        : "border-neutral-700 text-neutral-400"
                    }
                  >
                    Registration: {registration.status}
                  </Badge>
                  {attendance ? (
                    <Badge className="border-blue-900 bg-blue-950/30 text-blue-100">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mr-1 size-3"
                      />
                      Attendance: {attendance}
                    </Badge>
                  ) : null}
                </div>
                <SessionCard item={card} />
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="mt-10">
          <PreviewState title="No registrations yet">
            Published Sessions will appear here only after you register. No
            sample participation is added to your private account.
          </PreviewState>
        </div>
      )}
    </div>
  );
}
