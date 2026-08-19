import type { Metadata } from "next";
import { CheckCircle2, TicketCheck } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
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

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const registrationResult = await supabase
    .from("registrations")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("registered_at", { ascending: false })
    .limit(30);

  if (registrationResult.error) {
    return (
      <StatusMessage tone="error">
        Registrations are currently unavailable.
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
        Your registered Session details are currently unavailable.
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
    <div className="text-center sm:text-left">
      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="mx-auto max-w-4xl sm:mx-0">
<p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#992bff] uppercase sm:justify-start">
  <TicketCheck aria-hidden="true" className="size-4" />
  My
</p>

<h1 className="display-type mt-4 text-center text-5xl text-white sm:text-left sm:text-7xl">
  Your Registered Sessions.
</h1>

<p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-neutral-300 sm:mx-0 sm:text-left">
  See the Sessions you&apos;ve joined, check your registration status,
  and review attendance details in one place.
</p>
        </div>

        <ButtonLink
          className="mx-auto min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 sm:mx-0"
          href="/home/sessions"
        >
          Discover Sessions
        </ButtonLink>
      </div>

      {/* =====================================================
          REGISTRATIONS
      ====================================================== */}
      {registrations.length ? (
        <ol className="mt-10 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
          {registrations.map((registration) => {
            const card = cardsById.get(registration.session_id);

            if (!card) {
              return null;
            }

            const attendance = attendanceById.get(registration.session_id);

            return (
              <li
  className="w-full min-w-0 max-w-full space-y-3"
  key={registration.session_id}
>
                <div className="flex flex-wrap items-center justify-center gap-2 px-1 sm:justify-start">
                  <Badge
                    className={
                      registration.status === "registered"
                        ? "border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe]"
                        : "border-neutral-700 bg-neutral-900/50 text-neutral-400"
                    }
                  >
                    Registration: {registration.status}
                  </Badge>

                  {attendance ? (
                    <Badge className="border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe]">
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
        <div className="mt-10 rounded-[1.75rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] px-6 py-10 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <TicketCheck aria-hidden="true" className="size-6 text-[#992bff]" />

            <h2 className="mt-4 text-xl font-bold text-white">
              No Registrations Yet
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
              Sessions you register for will appear here.
            </p>

            <ButtonLink
              className="mt-6 min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110"
              href="/home/sessions"
            >
              Discover Sessions
            </ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
