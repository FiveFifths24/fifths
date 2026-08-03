import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ClipboardCheck, ShieldAlert } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  reviewFeedbackAction,
  reviewReportAction,
} from "@/features/trust-safety/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Moderation workspace" };
export const dynamic = "force-dynamic";

const inputClass =
  "min-h-12 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams?: Promise<{ review?: string; feedback?: string }>;
}) {
  const parameters = await searchParams;
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;
  const roleResult = await supabase.from("user_roles").select("role");
  const roles = new Set((roleResult.data ?? []).map((item) => item.role));
  const isAdmin = roles.has("platform_admin");
  const canModerate = isAdmin || roles.has("moderator");
  if (!canModerate) redirect("/home/safety");

  const [reportResult, feedbackResult] = await Promise.all([
    supabase
      .from("reports")
      .select(
        "id, target_type, category, summary, details, context_url, status, created_at",
      )
      .in("status", ["submitted", "reviewing", "escalated"])
      .order("created_at", { ascending: true })
      .limit(50),
    isAdmin
      ? supabase
          .from("member_feedback")
          .select("id, area, message, consent_to_contact, status, created_at")
          .in("status", ["submitted", "reviewed"])
          .order("created_at", { ascending: true })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (reportResult.error || feedbackResult.error)
    return (
      <StatusMessage tone="error">
        The moderation workspace requires the Phase 10 Supabase migration and an
        authorized role.
      </StatusMessage>
    );
  const reports = reportResult.data ?? [];
  const feedback = feedbackResult.data ?? [];

  return (
    <div>
      <ButtonLink href="/home/safety" variant="quiet">
        ← Back to trust and safety
      </ButtonLink>
      <div className="mt-7 flex items-center gap-3">
        <ShieldAlert aria-hidden="true" className="size-6 text-red-300" />
        <p className="text-xs font-bold tracking-[0.2em] text-red-300 uppercase">
          Restricted workspace
        </p>
      </div>
      <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
        Human review, with limits.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        Moderators can triage and escalate reports. Only platform administrators
        can resolve, dismiss, or review private product feedback. Every status
        transition is privately audited.
      </p>
      <StatusMessage className="mt-7">
        Do not copy report details into public channels. Phase 10 provides no
        account suspension, content deletion, evidence upload, automated
        decision, or emergency-response workflow.
      </StatusMessage>
      {parameters?.review === "updated" ? (
        <StatusMessage className="mt-5" tone="success">
          Report status updated and the reporter was notified.
        </StatusMessage>
      ) : null}
      {parameters?.review && parameters.review !== "updated" ? (
        <StatusMessage className="mt-5" tone="error">
          The report update was invalid or unauthorized.
        </StatusMessage>
      ) : null}
      {parameters?.feedback === "updated" ? (
        <StatusMessage className="mt-5" tone="success">
          Feedback status updated.
        </StatusMessage>
      ) : null}

      <section aria-labelledby="report-queue" className="mt-12">
        <div className="flex items-center gap-3">
          <ClipboardCheck aria-hidden="true" className="size-5 text-red-300" />
          <h2 className="text-3xl font-bold text-white" id="report-queue">
            Open report queue
          </h2>
        </div>
        {reports.length ? (
          <ol className="mt-6 space-y-5">
            {reports.map((report) => (
              <li
                className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6"
                key={report.id}
              >
                <div className="flex flex-wrap gap-2">
                  <Badge className="capitalize">{report.status}</Badge>
                  <Badge className="capitalize">
                    {report.target_type.replaceAll("_", " ")}
                  </Badge>
                  <Badge className="capitalize">
                    {report.category.replaceAll("_", " ")}
                  </Badge>
                </div>
                <h3 className="mt-4 text-2xl font-bold text-white">
                  {report.summary}
                </h3>
                <p className="mt-3 text-sm leading-6 whitespace-pre-wrap text-neutral-300">
                  {report.details}
                </p>
                {report.context_url ? (
                  <p className="mt-3 text-sm text-neutral-400">
                    Context:{" "}
                    <a
                      className="underline underline-offset-4 hover:text-white"
                      href={report.context_url}
                    >
                      {report.context_url}
                    </a>
                  </p>
                ) : null}
                <form
                  action={reviewReportAction}
                  className="mt-6 grid gap-4 border-t border-neutral-800 pt-6 lg:grid-cols-[12rem_1fr_auto]"
                >
                  <input name="reportId" type="hidden" value={report.id} />
                  <div>
                    <label
                      className="mb-2 block text-sm font-bold text-white"
                      htmlFor={`status-${report.id}`}
                    >
                      Next status
                    </label>
                    <select
                      className={inputClass}
                      id={`status-${report.id}`}
                      name="status"
                      defaultValue="reviewing"
                    >
                      <option value="reviewing">Reviewing</option>
                      <option value="escalated">Escalated</option>
                      {isAdmin ? (
                        <>
                          <option value="resolved">Resolved</option>
                          <option value="dismissed">Dismissed</option>
                        </>
                      ) : null}
                    </select>
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-sm font-bold text-white"
                      htmlFor={`note-${report.id}`}
                    >
                      Private review note
                    </label>
                    <textarea
                      className={inputClass}
                      id={`note-${report.id}`}
                      maxLength={1000}
                      name="note"
                      placeholder="Required for escalation or a final decision"
                    />
                  </div>
                  <button
                    className="min-h-12 self-end rounded-full border border-red-800 bg-red-950 px-5 text-sm font-bold text-red-100 hover:border-red-500"
                    type="submit"
                  >
                    Update report
                  </button>
                </form>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-6">
            <PreviewState title="No open reports">
              The restricted queue is empty. No demonstration allegation is
              shown.
            </PreviewState>
          </div>
        )}
      </section>

      {isAdmin ? (
        <section aria-labelledby="feedback-queue" className="mt-14">
          <h2 className="text-3xl font-bold text-white" id="feedback-queue">
            Private feedback queue
          </h2>
          {feedback.length ? (
            <ol className="mt-6 grid gap-5 lg:grid-cols-2">
              {feedback.map((item) => (
                <li
                  className="rounded-[1.5rem] border border-neutral-800 bg-neutral-900 p-5"
                  key={item.id}
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge className="capitalize">{item.area}</Badge>
                    <Badge className="capitalize">{item.status}</Badge>
                    {item.consent_to_contact ? (
                      <Badge>Contact permitted</Badge>
                    ) : (
                      <Badge>No contact consent</Badge>
                    )}
                  </div>
                  <p className="mt-4 text-sm leading-6 whitespace-pre-wrap text-neutral-300">
                    {item.message}
                  </p>
                  <form
                    action={reviewFeedbackAction}
                    className="mt-5 flex flex-wrap gap-3"
                  >
                    <input name="feedbackId" type="hidden" value={item.id} />
                    <button
                      className="min-h-12 rounded-full border border-neutral-600 px-4 text-sm font-bold text-white"
                      name="status"
                      type="submit"
                      value="reviewed"
                    >
                      Mark reviewed
                    </button>
                    <button
                      className="min-h-12 rounded-full border border-neutral-600 px-4 text-sm font-bold text-white"
                      name="status"
                      type="submit"
                      value="closed"
                    >
                      Close
                    </button>
                  </form>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-6">
              <PreviewState title="No open feedback">
                Private feedback requiring review will appear here.
              </PreviewState>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
