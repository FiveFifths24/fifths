import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardCheck, Settings2, ShieldCheck, Users } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
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
  "min-h-12 rounded-full border px-5 py-3 text-sm font-bold transition-colors";

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
        Session management could not load. Confirm your host access and the
        Phase 4 migration.
      </StatusMessage>
    );
  }
  if (!sessionResult.data) notFound();

  const session = sessionResult.data;
  const roster = rosterResult.data ?? [];
  const currentTime = new Date().getTime();
  const hasStarted = Date.parse(session.starts_at) <= currentTime;
  const hasEnded = Date.parse(session.ends_at) <= currentTime;
  const canMarkAttendance =
    hasStarted && ["published", "completed"].includes(session.status);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            <Settings2 aria-hidden="true" className="size-4" /> Session
            management
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="display-type text-5xl text-white sm:text-7xl">
              {session.title}
            </h1>
            <Badge>{session.status}</Badge>
          </div>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            {formatSessionDate(session.starts_at, session.timezone)} ·{" "}
            {formatSessionFormat(session.format)} ·{" "}
            {session.confirmed_registration_count}/{session.capacity} registered
          </p>
        </div>
        <ButtonLink href={`/home/sessions/${session.id}`} variant="secondary">
          View member details
        </ButtonLink>
      </div>

      {messages?.created === "1" ? (
        <StatusMessage className="mt-8" tone="success">
          Draft created. Review the details before publishing.
        </StatusMessage>
      ) : null}
      {messages?.status === "updated" ? (
        <StatusMessage className="mt-8" tone="success">
          Session status updated.
        </StatusMessage>
      ) : null}
      {messages?.status === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          The status change was rejected. Check the lifecycle and timing rules.
        </StatusMessage>
      ) : null}
      {messages?.attendance === "updated" ? (
        <StatusMessage className="mt-8" tone="success">
          Attendance was recorded in the audited Session history.
        </StatusMessage>
      ) : null}
      {messages?.attendance === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          Attendance could not be updated. Only active registrants can be marked
          after the Session begins.
        </StatusMessage>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <section
          className="h-fit rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8"
          aria-labelledby="lifecycle-heading"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-emerald-400"
            />
            <h2
              className="text-2xl font-bold text-white"
              id="lifecycle-heading"
            >
              Lifecycle controls
            </h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            Drafts are visible only to their host and platform administrators.
            Publishing opens discovery and registration. Completed and cancelled
            states are final in Phase 4.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {session.status === "draft" ? (
              <form action={setSessionStatusAction}>
                <input name="sessionId" type="hidden" value={session.id} />
                <input name="status" type="hidden" value="published" />
                <button
                  className={`${actionButton} w-full border-red-700 bg-red-700 text-white hover:border-red-600 hover:bg-red-600`}
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
                  className={`${actionButton} w-full border-emerald-800 bg-emerald-950 text-emerald-100 hover:border-emerald-600`}
                  type="submit"
                >
                  Mark Session completed
                </button>
              </form>
            ) : null}
            {["draft", "published"].includes(session.status) ? (
              <form action={setSessionStatusAction}>
                <input name="sessionId" type="hidden" value={session.id} />
                <input name="status" type="hidden" value="cancelled" />
                <button
                  className={`${actionButton} w-full border-red-900 bg-red-950/40 text-red-100 hover:border-red-700`}
                  type="submit"
                >
                  Cancel Session
                </button>
              </form>
            ) : null}
            {["cancelled", "completed"].includes(session.status) ? (
              <StatusMessage>
                This Session has reached its final {session.status} state.
              </StatusMessage>
            ) : null}
          </div>
        </section>

        <section
          className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8"
          aria-labelledby="roster-heading"
        >
          <div className="flex items-center gap-3">
            <Users aria-hidden="true" className="size-5 text-red-400" />
            <h2 className="text-2xl font-bold text-white" id="roster-heading">
              Active roster
            </h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            Only this Session&apos;s host and platform administrators can view
            the roster or mark attendance. Members can read only their own
            records.
          </p>

          {roster.length ? (
            <ul className="mt-6 space-y-4">
              {roster.map((member) => (
                <li
                  className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                  key={member.user_id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-white">
                        {member.display_name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {member.username
                          ? `@${member.username}`
                          : "Registered member"}
                      </p>
                      {member.attendance_status ? (
                        <Badge className="mt-3">
                          Attendance: {member.attendance_status}
                        </Badge>
                      ) : null}
                    </div>
                    {canMarkAttendance ? (
                      <form
                        action={markSessionAttendanceAction}
                        className="flex flex-col gap-3 sm:flex-row"
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
                          className="min-h-12 rounded-xl border border-neutral-700 bg-neutral-900 px-4 text-white focus:border-red-500 focus:outline-none"
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
                          className={`${actionButton} border-neutral-600 bg-neutral-900 text-white hover:border-neutral-400`}
                          type="submit"
                        >
                          Save
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs leading-5 text-neutral-500">
                        Attendance opens when the Session starts.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <PreviewState title="No active registrations">
                Capacity remains at zero until a member registers. Cancelled
                registrations do not appear in the active roster.
              </PreviewState>
            </div>
          )}

          <div className="mt-6 flex gap-3 border-t border-neutral-800 pt-6 text-sm leading-6 text-neutral-400">
            <ClipboardCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-emerald-400"
            />
            Attendance updates are audited. They do not create Passport entries
            until the separately reviewed Phase 9 workflow exists.
          </div>
        </section>
      </div>
    </div>
  );
}
