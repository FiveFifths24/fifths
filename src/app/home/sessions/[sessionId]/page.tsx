import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  Flag,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

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
import { ReportForm } from "@/features/trust-safety/report-form";
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

      supabase.rpc("can_manage_session", {
        p_session_id: sessionId,
      }),
    ]);

  if (sessionResult.error) {
    return (
      <StatusMessage tone="error">
        This Session is currently unavailable.
      </StatusMessage>
    );
  }

  if (!sessionResult.data) {
    notFound();
  }

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
        : Promise.resolve({
            data: null,
            error: null,
          }),
    ]);

  const card = assembleSessionCards(
    [session],
    modeResult.data ?? [],
    interestResult.data ?? [],
    linkResult.data ?? [],
  )[0];

  if (!card) {
    notFound();
  }

  const isRegistered = registrationResult.data?.status === "registered";

  const registrationOpen =
    session.status === "published" &&
    Date.parse(session.starts_at) > new Date().getTime();

  const isFull = session.confirmed_registration_count >= session.capacity;

  return (
    <div className="mx-auto max-w-5xl text-center sm:text-left">
      {/* =====================================================
          SESSION INTRO
      ====================================================== */}
      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="mx-auto max-w-full min-w-0 lg:mx-0 lg:max-w-4xl">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            <Badge className="border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe]">
              {card.modeName}
            </Badge>

            <Badge className="border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe] capitalize">
              {session.status}
            </Badge>

            <Badge className="border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe]">
              {session.confirmed_registration_count}/{session.capacity}{" "}
              registered
            </Badge>
          </div>

          <h1 className="display-type mt-5 max-w-full text-4xl leading-[0.95] [overflow-wrap:anywhere] break-words text-white sm:text-7xl">
            {session.title}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 break-words text-neutral-300 sm:mx-0 sm:text-lg sm:leading-8">
            {session.summary}
          </p>

          <p className="mt-4 text-sm font-bold text-white/40">
            Hosted by {session.host_display_name}
          </p>

          {circleResult.data ? (
            <div className="mt-4 flex flex-col items-center gap-2 text-sm text-neutral-300 sm:flex-row sm:justify-start">
              <span>Associated with</span>

              <ButtonLink
                className="min-h-0 border-[#992bff]/35 bg-[#992bff]/10 px-4 py-2 text-white hover:border-[#992bff]/60 hover:bg-[#992bff]/15"
                href={`/home/circles/${circleResult.data.id}`}
                variant="secondary"
              >
                {circleResult.data.name}
              </ButtonLink>
            </div>
          ) : null}
        </div>

        {manageResult.data ? (
          <ButtonLink
            className="mx-auto min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 lg:mx-0"
            href={`/home/sessions/host/${session.id}`}
          >
            Manage Session
          </ButtonLink>
        ) : null}
      </div>

      {/* =====================================================
          STATUS
      ====================================================== */}
      {session.status === "cancelled" ? (
        <StatusMessage className="mt-8 text-center sm:text-left" tone="error">
          This Session has been cancelled.
        </StatusMessage>
      ) : null}

      {attendanceResult.data ? (
        <StatusMessage className="mt-8 text-center sm:text-left" tone="success">
          Your attendance is marked as {attendanceResult.data.status}.
        </StatusMessage>
      ) : null}

      {/* =====================================================
          SESSION CONTENT
      ====================================================== */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* =================================================
              DESCRIPTION
          ================================================== */}
          <section className="rounded-[2rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">What to Expect</h2>

            <p className="mt-4 text-base leading-8 [overflow-wrap:anywhere] break-words whitespace-pre-wrap text-white/60">
              {session.description}
            </p>
          </section>

          {/* =================================================
              DETAILS
          ================================================== */}
          <section className="rounded-[2rem] border border-[#992bff]/20 bg-black/35 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">Session Details</h2>

            <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
              <div className="flex justify-center gap-3 text-left sm:justify-start">
                <CalendarDays
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[#992bff]"
                />

                <div>
                  <dt className="text-white/40">Starts</dt>

                  <dd className="mt-1 font-bold text-white">
                    {formatSessionDate(session.starts_at, session.timezone)}
                  </dd>
                </div>
              </div>

              <div className="flex justify-center gap-3 text-left sm:justify-start">
                <Clock3
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[#992bff]"
                />

                <div>
                  <dt className="text-white/40">Ends</dt>

                  <dd className="mt-1 font-bold text-white">
                    {formatSessionDate(session.ends_at, session.timezone)}
                  </dd>
                </div>
              </div>

              <div className="flex justify-center gap-3 text-left sm:justify-start">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[#992bff]"
                />

                <div>
                  <dt className="text-white/40">Access</dt>

                  <dd className="mt-1 font-bold text-white">
                    {formatSessionFormat(session.format)}
                    {session.location_label
                      ? ` · ${session.location_label}`
                      : ""}
                  </dd>
                </div>
              </div>

              <div className="flex justify-center gap-3 text-left sm:justify-start">
                <Users
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[#992bff]"
                />

                <div>
                  <dt className="text-white/40">Capacity</dt>

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
                aria-label="Session interests"
                className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start"
              >
                {card.interestNames.map((interest) => (
                  <li key={interest}>
                    <Badge className="border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe]">
                      {interest}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        {/* =================================================
            REGISTRATION
        ================================================== */}
        <aside className="h-fit rounded-[2rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] p-6">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <ShieldCheck aria-hidden="true" className="size-5 text-[#992bff]" />

            <h2 className="text-xl font-bold text-white">Your Place</h2>
          </div>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/50 sm:mx-0">
            Register to save your place in this Session.
          </p>

          <div className="mt-5">
            <SessionRegistrationForm
              isFull={isFull}
              isRegistered={isRegistered}
              registrationOpen={registrationOpen}
              sessionId={session.id}
            />
          </div>

          <p className="mt-5 border-t border-[#992bff]/15 pt-5 text-xs leading-5 text-white/40">
            Your registration stays connected to your account and respects
            Session capacity.
          </p>
        </aside>
      </div>

      <details className="mt-8 rounded-[1.5rem] border border-red-900/50 bg-red-950/20 p-6">
        <summary className="flex cursor-pointer list-none items-center justify-center gap-3 font-bold text-red-200 sm:justify-start">
          <Flag aria-hidden="true" className="size-5" />
          Report this Session
        </summary>
        <div className="mt-6 border-t border-red-900/40 pt-6">
          <ReportForm
            defaultContextUrl={`/home/sessions/${session.id}`}
            defaultTarget="session"
            defaultTargetId={session.id}
            lockTarget
          />
        </div>
      </details>
    </div>
  );
}
