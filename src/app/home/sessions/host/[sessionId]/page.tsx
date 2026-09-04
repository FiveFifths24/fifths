import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardCheck, Settings2, ShieldCheck, Users } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ClearFormDraft } from "@/components/forms/form-draft";
import { formDraftStorageKey } from "@/components/forms/form-draft-config";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import {
  markSessionAttendanceAction,
  setSessionStatusAction,
} from "@/features/sessions/actions";
import {
  formatSessionDate,
  formatSessionFormat,
} from "@/features/sessions/session-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Session" };
export const dynamic = "force-dynamic";

const actionButton =
  "min-h-12 rounded-full border px-5 py-3 text-sm font-bold transition";

export default async function ManageSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams?: Promise<{
    created?: string;
    status?: string;
    attendance?: string;
  }>;
}) {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [{ sessionId }, messages] = await Promise.all([params, searchParams]);

  const [sessionResult, rosterResult] = await Promise.all([
    supabase.from("sessions").select("*").eq("id", sessionId).maybeSingle(),
    supabase.rpc("get_session_roster", { p_session_id: sessionId }),
  ]);

  if (sessionResult.error || rosterResult.error) {
    return (
      <StatusMessage tone="error">
        Session management is currently unavailable.
      </StatusMessage>
    );
  }

  if (!sessionResult.data) {
    notFound();
  }

  const session = sessionResult.data;
  const roster = rosterResult.data ?? [];

  const currentTime = new Date().getTime();
  const hasStarted = Date.parse(session.starts_at) <= currentTime;
  const hasEnded = Date.parse(session.ends_at) <= currentTime;

  const canMarkAttendance =
    hasStarted && ["published", "completed"].includes(session.status);

  return (
    <div className="mx-auto max-w-6xl text-center sm:text-left">
      {/* =====================================================
          SESSION INTRO
      ====================================================== */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="mx-auto max-w-full min-w-0 sm:max-w-4xl lg:mx-0">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#992bff] uppercase sm:justify-start">
            <Settings2 aria-hidden="true" className="size-4" />
            Session Management
          </p>

          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <h1 className="display-type max-w-full text-4xl leading-[0.95] [overflow-wrap:anywhere] break-words text-white sm:text-7xl">
              {session.title}
            </h1>

            <Badge className="border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe] capitalize">
              {session.status}
            </Badge>
          </div>

          <p className="mx-auto mt-5 max-w-full text-base leading-7 break-words text-neutral-300 sm:mx-0 sm:max-w-3xl sm:text-lg sm:leading-8">
            {formatSessionDate(session.starts_at, session.timezone)} ·{" "}
            {formatSessionFormat(session.format)} ·{" "}
            {session.confirmed_registration_count}/{session.capacity} registered
          </p>
        </div>

        <ButtonLink
          className="mx-auto min-h-12 min-w-[12.5rem] border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] px-7 text-sm whitespace-nowrap text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110 sm:mx-0"
          href={`/home/sessions/${session.id}`}
        >
          View Member Details
        </ButtonLink>
      </div>

      {/* =====================================================
          STATUS MESSAGES
      ====================================================== */}
      {messages?.created === "1" ? (
        <>
          <ClearFormDraft
            storageKey={formDraftStorageKey(
              "session-create",
              session.host_user_id,
            )}
          />
          <StatusMessage
            className="mt-8 text-center sm:text-left"
            tone="success"
          >
            Draft created. Review the details before publishing.
          </StatusMessage>
        </>
      ) : null}

      {messages?.status === "updated" ? (
        <StatusMessage className="mt-8 text-center sm:text-left" tone="success">
          Session status updated.
        </StatusMessage>
      ) : null}

      {messages?.status === "error" ? (
        <StatusMessage className="mt-8 text-center sm:text-left" tone="error">
          The status change could not be completed.
        </StatusMessage>
      ) : null}

      {messages?.attendance === "updated" ? (
        <StatusMessage className="mt-8 text-center sm:text-left" tone="success">
          Attendance updated.
        </StatusMessage>
      ) : null}

      {messages?.attendance === "error" ? (
        <StatusMessage className="mt-8 text-center sm:text-left" tone="error">
          Attendance could not be updated.
        </StatusMessage>
      ) : null}

      {/* =====================================================
          MANAGEMENT GRID
      ====================================================== */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        {/* =================================================
            LIFECYCLE
        ================================================== */}
        <section
          aria-labelledby="lifecycle-heading"
          className="h-fit rounded-[2rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] p-6 sm:p-8"
        >
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <ShieldCheck aria-hidden="true" className="size-5 text-[#992bff]" />

            <h2
              className="text-2xl font-bold text-white"
              id="lifecycle-heading"
            >
              Session Controls
            </h2>
          </div>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/50 sm:mx-0">
            Publish when your Session is ready for discovery, or cancel it if
            plans change.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {session.status === "draft" ? (
              <form action={setSessionStatusAction}>
                <input name="sessionId" type="hidden" value={session.id} />
                <input name="status" type="hidden" value="published" />

                <button
                  className={`${actionButton} w-full border-0 bg-gradient-to-r from-[#6c14ce] via-[#a855f7] to-[#992bff] text-white shadow-lg shadow-[#6c14ce]/20 hover:brightness-110`}
                  type="submit"
                >
                  Publish Session
                </button>
              </form>
            ) : null}

            {session.status === "published" && hasEnded ? (
              <form action={setSessionStatusAction}>
                <input name="sessionId" type="hidden" value={session.id} />
                <input name="status" type="hidden" value="completed" />

                <button
                  className={`${actionButton} w-full border-[#992bff]/35 bg-[#992bff]/10 text-white hover:border-[#992bff]/60 hover:bg-[#992bff]/15`}
                  type="submit"
                >
                  Mark Session Complete
                </button>
              </form>
            ) : null}

            {["draft", "published"].includes(session.status) ? (
              <form action={setSessionStatusAction}>
                <input name="sessionId" type="hidden" value={session.id} />
                <input name="status" type="hidden" value="cancelled" />

                <button
                  className={`${actionButton} w-full border-red-900 bg-red-950/30 text-red-100 hover:border-red-700 hover:bg-red-950/50`}
                  type="submit"
                >
                  Cancel Session
                </button>
              </form>
            ) : null}

            {["cancelled", "completed"].includes(session.status) ? (
              <StatusMessage className="text-center sm:text-left">
                This Session is {session.status}.
              </StatusMessage>
            ) : null}
          </div>
        </section>

        {/* =================================================
            ROSTER
        ================================================== */}
        <section
          aria-labelledby="roster-heading"
          className="rounded-[2rem] border border-[#992bff]/20 bg-[#992bff]/[0.035] p-6 sm:p-8"
        >
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <Users aria-hidden="true" className="size-5 text-[#992bff]" />

            <h2 className="text-2xl font-bold text-white" id="roster-heading">
              Active Roster
            </h2>
          </div>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/50 sm:mx-0">
            View registered members and record attendance once the Session
            begins.
          </p>

          {roster.length ? (
            <ul className="mt-6 space-y-4">
              {roster.map((member) => (
                <li
                  className="rounded-2xl border border-[#992bff]/15 bg-black/35 p-5"
                  key={member.user_id}
                >
                  <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <div>
                      <p className="font-bold text-white">
                        {member.display_name}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {member.username
                          ? `@${member.username}`
                          : "Registered member"}
                      </p>

                      {member.attendance_status ? (
                        <Badge className="mt-3 border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe]">
                          Attendance: {member.attendance_status}
                        </Badge>
                      ) : null}
                    </div>

                    {canMarkAttendance ? (
                      <form
                        action={markSessionAttendanceAction}
                        className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
                      >
                        <input
                          name="sessionId"
                          type="hidden"
                          value={session.id}
                        />

                        <input
                          name="userId"
                          type="hidden"
                          value={member.user_id}
                        />

                        <label
                          className="sr-only"
                          htmlFor={`attendance-${member.user_id}`}
                        >
                          Attendance for {member.display_name}
                        </label>

                        <select
                          className="min-h-12 rounded-xl border border-[#992bff]/25 bg-black/40 px-4 text-white focus:border-[#992bff] focus:outline-none"
                          defaultValue={member.attendance_status ?? ""}
                          id={`attendance-${member.user_id}`}
                          name="status"
                          required
                        >
                          <option disabled value="">
                            Choose status
                          </option>
                          <option value="attended">Attended</option>
                          <option value="absent">Absent</option>
                          <option value="excused">Excused</option>
                        </select>

                        <button
                          className={`${actionButton} border-[#992bff]/35 bg-[#992bff]/10 text-white hover:border-[#992bff]/60 hover:bg-[#992bff]/15`}
                          type="submit"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs leading-5 text-white/40">
                        Attendance opens when the Session starts.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-[#992bff]/20 bg-black/30 px-6 py-9 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center">
                <Users aria-hidden="true" className="size-6 text-[#992bff]" />

                <h3 className="mt-4 text-lg font-bold text-white">
                  No Active Registrations
                </h3>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  Registered members will appear here.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-3 border-t border-[#992bff]/15 pt-6 text-center text-sm leading-6 text-white/45 sm:flex-row sm:items-start sm:text-left">
            <ClipboardCheck
              aria-hidden="true"
              className="size-5 shrink-0 text-[#992bff]"
            />
            Attendance records help keep your Session history and member
            participation accurate.
          </div>
        </section>
      </div>
    </div>
  );
}
