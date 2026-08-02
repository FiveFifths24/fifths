import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, MapPin, ShieldCheck, Users } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { assembleSessionCards } from "@/features/sessions/session-data";
import {
  formatSessionDate,
  formatSessionFormat,
} from "@/features/sessions/session-card";
import { SessionRegistrationForm } from "@/features/sessions/session-registration-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Session details" };
export const dynamic = "force-dynamic";

export default async function SessionDetailsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const { sessionId } = await params;
  const { data: userData } = await supabase.auth.getUser();
  const [sessionResult, registrationResult, attendanceResult, manageResult] =
    await Promise.all([
      supabase.from("sessions").select("*").eq("id", sessionId).maybeSingle(),
      supabase
        .from("registrations")
        .select("status")
        .eq("session_id", sessionId)
        .eq("user_id", userData.user?.id ?? "")
        .maybeSingle(),
      supabase
        .from("attendance_records")
        .select("status")
        .eq("session_id", sessionId)
        .eq("user_id", userData.user?.id ?? "")
        .maybeSingle(),
      supabase.rpc("can_manage_session", { p_session_id: sessionId }),
    ]);

  if (sessionResult.error) {
    return (
      <StatusMessage tone="error">
        This Session could not load. Confirm the Phase 4 migration and your
        access to the record.
      </StatusMessage>
    );
  }
  if (!sessionResult.data) notFound();

  const session = sessionResult.data;
  const [modeResult, linkResult, interestResult, circleResult] =
    await Promise.all([
      supabase.from("modes").select("id, name").eq("id", session.mode_id),
      supabase
        .from("session_interests")
        .select("session_id, interest_id")
        .eq("session_id", session.id),
      supabase
        .from("interests")
        .select("id, name")
        .eq("active", true)
        .order("name"),
      session.circle_id
        ? supabase
            .from("circles")
            .select("id, name")
            .eq("id", session.circle_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);
  const card = assembleSessionCards(
    [session],
    modeResult.data ?? [],
    interestResult.data ?? [],
    linkResult.data ?? [],
  )[0];
  if (!card) notFound();

  const isRegistered = registrationResult.data?.status === "registered";
  const registrationOpen =
    session.status === "published" &&
    Date.parse(session.starts_at) > new Date().getTime();
  const isFull = session.confirmed_registration_count >= session.capacity;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-red-900 bg-red-950/40 text-red-200">
              {card.modeName}
            </Badge>
            <Badge>{session.status}</Badge>
            <Badge>
              {session.confirmed_registration_count}/{session.capacity}{" "}
              registered
            </Badge>
          </div>
          <h1 className="display-type mt-5 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
            {session.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            {session.summary}
          </p>
          <p className="mt-4 text-sm font-bold text-neutral-500">
            Hosted by {session.host_display_name}
          </p>
          {circleResult.data ? (
            <p className="mt-4 text-sm text-neutral-300">
              Associated with{" "}
              <ButtonLink
                className="ml-2 min-h-0 px-4 py-2"
                href={`/home/circles/${circleResult.data.id}`}
                variant="secondary"
              >
                {circleResult.data.name}
              </ButtonLink>
            </p>
          ) : null}
        </div>
        {manageResult.data ? (
          <ButtonLink
            href={`/home/sessions/host/${session.id}`}
            variant="secondary"
          >
            Manage Session
          </ButtonLink>
        ) : null}
      </div>

      {session.status === "cancelled" ? (
        <StatusMessage className="mt-8" tone="error">
          This Session was cancelled. It remains visible to its host and
          registered members for clarity.
        </StatusMessage>
      ) : null}
      {attendanceResult.data ? (
        <StatusMessage className="mt-8" tone="success">
          Your attendance record is marked as {attendanceResult.data.status}.
          Passport credit is intentionally not created in Phase 4.
        </StatusMessage>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">What to expect</h2>
            <p className="mt-4 text-base leading-8 whitespace-pre-wrap text-neutral-300">
              {session.description}
            </p>
          </section>

          <section className="rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Session details</h2>
            <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <CalendarDays
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-red-400"
                />
                <div>
                  <dt className="text-neutral-500">Starts</dt>
                  <dd className="mt-1 font-bold text-white">
                    {formatSessionDate(session.starts_at, session.timezone)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock3
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-red-400"
                />
                <div>
                  <dt className="text-neutral-500">Ends</dt>
                  <dd className="mt-1 font-bold text-white">
                    {formatSessionDate(session.ends_at, session.timezone)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-red-400"
                />
                <div>
                  <dt className="text-neutral-500">Access</dt>
                  <dd className="mt-1 font-bold text-white">
                    {formatSessionFormat(session.format)}
                    {session.location_label
                      ? ` · ${session.location_label}`
                      : ""}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Users
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-red-400"
                />
                <div>
                  <dt className="text-neutral-500">Capacity</dt>
                  <dd className="mt-1 font-bold text-white">
                    {Math.max(
                      0,
                      session.capacity - session.confirmed_registration_count,
                    )}{" "}
                    spots remaining
                  </dd>
                </div>
              </div>
            </dl>

            {card.interestNames.length ? (
              <ul
                className="mt-6 flex flex-wrap gap-2"
                aria-label="Session interests"
              >
                {card.interestNames.map((interest) => (
                  <li key={interest}>
                    <Badge>{interest}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <aside className="h-fit rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-emerald-400"
            />
            <h2 className="text-xl font-bold text-white">Your place</h2>
          </div>
          <div className="mt-5">
            <SessionRegistrationForm
              isFull={isFull}
              isRegistered={isRegistered}
              registrationOpen={registrationOpen}
              sessionId={session.id}
            />
          </div>
          <p className="mt-5 border-t border-neutral-800 pt-5 text-xs leading-5 text-neutral-500">
            Registration enforces capacity in the database. Circle association
            changes visibility but does not add payment, waitlist, messaging, or
            Passport issuance.
          </p>
        </aside>
      </div>
    </div>
  );
}
