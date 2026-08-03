import type { Metadata } from "next";
import { AlertTriangle, MessageSquareText, ShieldCheck } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { FeedbackForm } from "@/features/trust-safety/feedback-form";
import { ReportForm } from "@/features/trust-safety/report-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Trust and safety" };
export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function SafetyPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

  const [reportResult, feedbackResult, roleResult] = await Promise.all([
    supabase
      .from("reports")
      .select("id, target_type, category, summary, status, created_at")
      .eq("reporter_user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("member_feedback")
      .select("id, area, status, created_at")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("user_roles").select("role"),
  ]);
  const roles = new Set((roleResult.data ?? []).map((item) => item.role));
  const canModerate = roles.has("moderator") || roles.has("platform_admin");
  const unavailable = reportResult.error || feedbackResult.error;

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-red-300 uppercase">
            <ShieldCheck aria-hidden="true" className="size-4" /> Trust and
            safety
          </p>
          <h1 className="display-type mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Speak up without making it public.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Feedback and safety reports are private. Reports enter a restricted
            human-review queue; they are never posted to a member profile or
            scored by an automated system.
          </p>
        </div>
        {canModerate ? (
          <ButtonLink href="/home/admin/moderation" variant="secondary">
            Open moderation workspace
          </ButtonLink>
        ) : null}
      </div>

      <StatusMessage className="mt-8">
        <span>
          <strong>Immediate danger:</strong> contact local emergency services.
          FIFTHS reporting is not emergency response, medical care, or a
          substitute for law enforcement.
        </span>
      </StatusMessage>

      {unavailable ? (
        <StatusMessage className="mt-6" tone="error">
          Trust-and-safety history requires the Phase 10 Supabase migration. The
          interface remains visible for review, but submissions cannot operate
          yet.
        </StatusMessage>
      ) : null}

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section
          aria-labelledby="feedback-heading"
          className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8"
        >
          <MessageSquareText
            aria-hidden="true"
            className="size-6 text-blue-300"
          />
          <h2
            className="mt-4 text-3xl font-bold text-white"
            id="feedback-heading"
          >
            Private product feedback
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Share accessibility needs, friction, or ideas. This is not the route
            for urgent safety concerns.
          </p>
          <div className="mt-7">
            <FeedbackForm />
          </div>
        </section>
        <section
          aria-labelledby="report-heading"
          className="rounded-[2rem] border border-red-950/70 bg-neutral-900 p-6 sm:p-8"
        >
          <AlertTriangle aria-hidden="true" className="size-6 text-red-300" />
          <h2
            className="mt-4 text-3xl font-bold text-white"
            id="report-heading"
          >
            Private safety report
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Describe conduct or content that may violate community expectations.
            Knowingly false or retaliatory reports may themselves require
            review.
          </p>
          <div className="mt-7">
            <ReportForm />
          </div>
        </section>
      </div>

      <section aria-labelledby="report-history" className="mt-12">
        <h2 className="text-3xl font-bold text-white" id="report-history">
          Your report history
        </h2>
        {(reportResult.data ?? []).length ? (
          <ol className="mt-6 grid gap-4 lg:grid-cols-2">
            {(reportResult.data ?? []).map((report) => (
              <li
                className="rounded-[1.5rem] border border-neutral-800 bg-neutral-900 p-5"
                key={report.id}
              >
                <div className="flex flex-wrap gap-2">
                  <Badge className="capitalize">{report.status}</Badge>
                  <Badge className="capitalize">
                    {report.target_type.replaceAll("_", " ")}
                  </Badge>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {report.summary}
                </h3>
                <p className="mt-2 text-sm text-neutral-400 capitalize">
                  {report.category.replaceAll("_", " ")} ·{" "}
                  {formatDate(report.created_at)}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-6">
            <PreviewState title="No reports submitted">
              Your private reports and text-based review status will appear
              here. Internal moderator notes are never exposed.
            </PreviewState>
          </div>
        )}
      </section>

      <section aria-labelledby="feedback-history" className="mt-12">
        <h2 className="text-3xl font-bold text-white" id="feedback-history">
          Feedback receipts
        </h2>
        {(feedbackResult.data ?? []).length ? (
          <ul className="mt-6 flex flex-wrap gap-3">
            {(feedbackResult.data ?? []).map((feedback) => (
              <li key={feedback.id}>
                <Badge className="capitalize">
                  {feedback.area}: {feedback.status} ·{" "}
                  {formatDate(feedback.created_at)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            No feedback receipts yet.
          </p>
        )}
      </section>
    </div>
  );
}
