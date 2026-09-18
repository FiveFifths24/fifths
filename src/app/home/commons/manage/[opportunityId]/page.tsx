import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Eye,
  HeartHandshake,
  LockKeyhole,
  Rocket,
  Users,
  XCircle,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ClearFormDraft } from "@/components/forms/form-draft";
import { formDraftStorageKey } from "@/components/forms/form-draft-config";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  confirmManagedOpportunityCompletionAction,
  deleteOpportunityAction,
  reviewOpportunityResponseAction,
  setOpportunityStatusAction,
} from "@/features/creator-commons/actions";
import {
  formatOpportunityDeadline,
  formatOpportunityFormat,
  formatOpportunityKind,
} from "@/features/creator-commons/opportunity-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage Commons opportunity",
};

export const dynamic = "force-dynamic";

const workflowSteps = [
  {
    label: "Draft",
    description: "Review Your Opportunity",
  },
  {
    label: "Published",
    description: "Accept Private Responses",
  },
  {
    label: "Closed",
    description: "Finish The Collaboration",
  },
  {
    label: "Completed",
    description: "Confirm Completion",
  },
] as const;

function getWorkflowStep(status: string) {
  if (status === "draft") return 0;
  if (status === "published") return 1;
  if (status === "closed") return 2;
  if (status === "completed") return 3;
  return -1;
}

function buttonClass(tone: "primary" | "secondary" | "danger" = "secondary") {
  const base =
    "flex min-h-12 w-full items-center justify-center rounded-full border px-6 py-3 text-sm font-black transition sm:w-auto";

  if (tone === "primary") {
    return `${base} border-white/20 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 text-black shadow-lg shadow-white/[0.04] hover:brightness-110`;
  }

  if (tone === "danger") {
    return `${base} border-red-800/70 bg-red-950/50 text-red-100 hover:border-red-600 hover:bg-red-950/70`;
  }

  return `${base} border-white/15 bg-white/[0.03] text-white/75 hover:border-white/30 hover:bg-white/[0.07] hover:text-white`;
}

export default async function ManageOpportunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ opportunityId: string }>;
  searchParams?: Promise<{
    created?: string;
    status?: string;
    response?: string;
    completion?: string;
  }>;
}) {
  const [{ opportunityId }, parameters] = await Promise.all([
    params,
    searchParams,
  ]);

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

  const [opportunityResult, managerResult] = await Promise.all([
    supabase
      .from("creator_opportunities")
      .select("*")
      .eq("id", opportunityId)
      .maybeSingle(),
    supabase.rpc("can_manage_creator_opportunity", {
      p_opportunity_id: opportunityId,
    }),
  ]);

  if (
    opportunityResult.error ||
    !opportunityResult.data ||
    managerResult.data !== true
  ) {
    notFound();
  }

  const opportunity = opportunityResult.data;

  const responseResult = await supabase.rpc(
    "get_creator_opportunity_responses",
    {
      p_opportunity_id: opportunity.id,
    },
  );

  const responses = responseResult.data ?? [];

  const memberResponses = responses.filter(
    (response) => response.user_id !== opportunity.created_by,
  );

  const canDeleteOpportunity = memberResponses.length === 0;
  const currentWorkflowStep = getWorkflowStep(opportunity.status);
  const remainingOpenings = Math.max(
    0,
    opportunity.positions - opportunity.accepted_count,
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="text-center lg:text-left">
        <ButtonLink href="/home/commons/manage" variant="quiet">
          ← Back to Creator Workspace
        </ButtonLink>
      </div>

      {parameters?.created === "1" ? (
        <>
          <ClearFormDraft
            storageKey={formDraftStorageKey(
              "commons-opportunity-create",
              opportunity.created_by,
            )}
          />
          <StatusMessage className="mt-6" tone="success">
            Your private draft is ready. Review the details below before
            publishing it to Creator Commons.
          </StatusMessage>
        </>
      ) : null}

      {parameters?.status === "updated" ? (
        <StatusMessage className="mt-6" tone="success">
          Your opportunity was updated successfully.
        </StatusMessage>
      ) : null}

      {parameters?.status === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          That change could not be completed. Review the opportunity status,
          deadline, responses, and available openings.
        </StatusMessage>
      ) : null}

      {parameters?.response === "accepted" ? (
        <StatusMessage className="mt-6" tone="success">
          The response was accepted.
        </StatusMessage>
      ) : null}

      {parameters?.response === "declined" ? (
        <StatusMessage className="mt-6">
          The response was declined.
        </StatusMessage>
      ) : null}

      {parameters?.response === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          That response decision could not be completed. The opportunity’s
          capacity or status may have changed.
        </StatusMessage>
      ) : null}

      {parameters?.completion === "confirmed" ? (
        <StatusMessage className="mt-6" tone="success">
          Your completion confirmation was recorded.
        </StatusMessage>
      ) : null}

      {parameters?.completion === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          Completion could not be confirmed. The opportunity must be closed and
          the participant’s response must be accepted.
        </StatusMessage>
      ) : null}

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(8,8,10,0.98)_42%,rgba(255,255,255,0.015))]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 right-0 size-80 rounded-full bg-white/[0.035] blur-3xl"
        />

        {/* =====================================================
      OPPORTUNITY HEADER
  ====================================================== */}

        <div className="relative border-b border-white/10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl min-w-0 text-center lg:text-left">
              <p className="font-mono text-[0.65rem] font-black tracking-[0.2em] text-white/40 uppercase">
                Creator Commons Control
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                <Badge className="border-white/15 bg-white/[0.04] text-white/75">
                  {formatOpportunityKind(opportunity.kind)}
                </Badge>

                <Badge className="border-white/15 bg-white/[0.04] text-white/75 capitalize">
                  {opportunity.status}
                </Badge>

                {opportunity.is_paid ? (
                  <Badge className="flex items-center gap-1.5 border-white/20 bg-white/10 text-white">
                    <CircleDollarSign
                      aria-hidden="true"
                      className="size-3.5 text-white/60"
                    />
                    Paid Opportunity
                  </Badge>
                ) : (
                  <Badge className="flex items-center gap-1.5 border-white/15 bg-white/[0.04] text-white/70">
                    <HeartHandshake
                      aria-hidden="true"
                      className="size-3.5 text-white/60"
                    />
                    Community
                  </Badge>
                )}

                <Badge className="border-white/10 bg-black/30 text-white/65">
                  {opportunity.accepted_count}/{opportunity.positions} accepted
                </Badge>
              </div>

              <h1 className="display-type mx-auto mt-6 max-w-5xl text-5xl leading-[0.92] text-white sm:text-7xl lg:mx-0">
                {opportunity.title}
              </h1>

              <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/50 sm:text-lg lg:mx-0">
                {opportunity.summary}
              </p>
            </div>

            <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end">
              <details className="group relative">
                <summary className="flex min-h-11 min-w-[15rem] cursor-pointer list-none items-center justify-center gap-3 rounded-full border border-white/35 bg-white px-7 py-2.5 text-sm font-bold text-black shadow-[0_0_28px_rgba(255,255,255,0.12)] transition hover:bg-white/90 hover:shadow-[0_0_36px_rgba(255,255,255,0.18)] [&::-webkit-details-marker]:hidden">
                  Opportunity Actions
                  <span
                    aria-hidden="true"
                    className="text-[0.65rem] transition-transform group-open:rotate-180"
                  >
                    ▼
                  </span>
                </summary>

                <div className="absolute right-0 z-30 mt-3 w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#09090b]/98 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:w-[22rem]">
                  <div className="px-3 pt-2 pb-2">
                    <p className="font-mono text-[0.58rem] font-bold tracking-[0.18em] text-white/30 uppercase">
                      Opportunity
                    </p>
                  </div>

                  <ButtonLink
                    className="flex min-h-0 w-full justify-start rounded-xl border-0 bg-transparent px-3 py-3 text-left text-sm font-semibold text-white/70 shadow-none transition hover:bg-white/[0.055] hover:text-white"
                    href={`/home/commons/${opportunity.id}`}
                  >
                    View Public Opportunity
                  </ButtonLink>

                  {(["draft", "published"] as const).includes(
                    opportunity.status as "draft" | "published",
                  ) ? (
                    <ButtonLink
                      className="flex min-h-0 w-full justify-start rounded-xl border-0 bg-transparent px-3 py-3 text-left text-sm font-semibold text-white/70 shadow-none transition hover:bg-white/[0.055] hover:text-white"
                      href={`/home/commons/manage/${opportunity.id}/edit`}
                    >
                      Edit Opportunity
                    </ButtonLink>
                  ) : null}

                  {canDeleteOpportunity ? (
                    <>
                      <div className="my-2 border-t border-white/[0.07]" />

                      <form action={deleteOpportunityAction}>
                        <input
                          name="opportunityId"
                          type="hidden"
                          value={opportunity.id}
                        />

                        <button
                          className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-300/80 transition hover:bg-red-950/35 hover:text-red-200"
                          type="submit"
                        >
                          Delete Opportunity
                        </button>
                      </form>
                    </>
                  ) : null}
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* =====================================================
      STATUS / WORKFLOW
  ====================================================== */}

        <div className="relative p-6 sm:p-8 lg:p-10">
          {opportunity.status === "cancelled" ? (
            <div className="rounded-2xl border border-red-900/60 bg-red-950/25 px-5 py-4 text-center text-sm font-semibold text-red-200 lg:text-left">
              This opportunity has been cancelled and is no longer accepting
              responses.
            </div>
          ) : (
            <div>
              <div className="text-center lg:text-left">
                <p className="font-mono text-[0.62rem] font-black tracking-[0.18em] text-white/40 uppercase">
                  Opportunity Workflow
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  Manage This Opportunity
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                  Move the opportunity through its lifecycle as responses arrive
                  and the collaboration progresses.
                </p>
              </div>

              <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {workflowSteps.map((step, index) => {
                  const reached = currentWorkflowStep >= index;
                  const current = currentWorkflowStep === index;

                  return (
                    <li
                      className={`rounded-2xl border p-4 ${
                        current
                          ? "border-white/30 bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : reached
                            ? "border-white/15 bg-white/[0.035]"
                            : "border-white/[0.07] bg-black/20"
                      }`}
                      key={step.label}
                    >
                      <span
                        className={`font-mono text-[0.6rem] font-black tracking-[0.16em] uppercase ${
                          reached ? "text-white/55" : "text-white/20"
                        }`}
                      >
                        Step {index + 1}
                      </span>

                      <p
                        className={`mt-2 font-black ${
                          reached ? "text-white" : "text-white/30"
                        }`}
                      >
                        {step.label}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/30">
                        {step.description}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* =====================================================
        OPPORTUNITY SNAPSHOT
    ====================================================== */}

          <dl className="mx-auto mt-8 grid w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] text-center sm:grid-cols-2 lg:grid-cols-5 lg:text-left">
            <div className="flex min-h-28 flex-col items-center justify-center border-b border-white/10 bg-black/40 p-5 sm:border-r lg:items-start lg:border-b-0">
              <dt className="text-xs font-bold tracking-wide text-white/30 uppercase">
                Response Deadline
              </dt>

              <dd className="mt-2 font-bold text-white/85">
                {formatOpportunityDeadline(
                  opportunity.response_deadline,
                  opportunity.timezone,
                )}
              </dd>
            </div>

            <div className="flex min-h-28 flex-col items-center justify-center border-b border-white/10 bg-black/40 p-5 lg:items-start lg:border-r lg:border-b-0">
              <dt className="text-xs font-bold tracking-wide text-white/30 uppercase">
                Format
              </dt>

              <dd className="mt-2 font-bold text-white/85">
                {formatOpportunityFormat(opportunity.format)}
                {opportunity.location_label
                  ? ` · ${opportunity.location_label}`
                  : ""}
              </dd>
            </div>

            <div className="flex min-h-28 flex-col items-center justify-center border-b border-white/10 bg-black/40 p-5 sm:border-r lg:items-start lg:border-b-0">
              <dt className="text-xs font-bold tracking-wide text-white/30 uppercase">
                Compensation
              </dt>

              <dd className="mt-2 font-bold text-white/85">
                {opportunity.is_paid ? "Paid" : "Community"}
              </dd>
            </div>

            <div className="flex min-h-28 flex-col items-center justify-center border-b border-white/10 bg-black/40 p-5 lg:items-start lg:border-r lg:border-b-0">
              <dt className="text-xs font-bold tracking-wide text-white/30 uppercase">
                Openings
              </dt>

              <dd className="mt-2 font-bold text-white/85">
                {remainingOpenings} of {opportunity.positions} available
              </dd>
            </div>

            <div className="flex min-h-28 flex-col items-center justify-center bg-black/40 p-5 lg:items-start">
              <dt className="text-xs font-bold tracking-wide text-white/30 uppercase">
                Status
              </dt>

              <dd className="mt-2 font-bold text-white/85 capitalize">
                {opportunity.status}
              </dd>
            </div>
          </dl>

          {/* =====================================================
        LIFECYCLE ACTIONS
    ====================================================== */}

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {opportunity.status === "draft" ? (
              <form
                action={setOpportunityStatusAction}
                className="w-full sm:w-auto"
              >
                <input
                  name="opportunityId"
                  type="hidden"
                  value={opportunity.id}
                />

                <input name="status" type="hidden" value="published" />

                <button className={buttonClass("primary")} type="submit">
                  <span className="flex items-center gap-2">
                    <Rocket aria-hidden="true" className="size-4" />
                    Publish Opportunity
                  </span>
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      <StatusMessage className="mt-8">
        <span>
          <strong>Your Response Queue Is Private.</strong> Only you, authorized
          opportunity managers, and each individual response owner can view
          their submitted information.
        </span>
      </StatusMessage>

      <section className="mt-10" aria-labelledby="response-queue-heading">
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Users aria-hidden="true" className="size-5 text-neutral-300" />

            <h2
              className="text-3xl font-black text-white"
              id="response-queue-heading"
            >
              Private Response Queue
            </h2>
          </div>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-400 lg:mx-0">
            Review responses, choose collaborators, and track completion from
            one place.
          </p>
        </div>

        {responseResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            The private response queue could not load.
          </StatusMessage>
        ) : responses.length ? (
          <div className="mt-6 space-y-5">
            {responses.map((response) => (
              <article
                className="rounded-[1.75rem] border border-neutral-800 bg-[#0c0910] p-6"
                key={response.user_id}
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl text-center lg:text-left">
                    <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                      <Badge className="border-neutral-700 bg-neutral-950 text-neutral-200 capitalize">
                        {response.response_status}
                      </Badge>

                      {response.creator_confirmed_at ? (
                        <Badge className="border-neutral-600 bg-neutral-800 text-white">
                          Creator Confirmed
                        </Badge>
                      ) : null}

                      {response.participant_confirmed_at ? (
                        <Badge className="border-neutral-600 bg-neutral-800 text-white">
                          Participant Confirmed
                        </Badge>
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-white">
                      {response.display_name}
                    </h3>

                    {response.username ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        @{response.username}
                      </p>
                    ) : null}

                    <h4 className="mt-6 text-xs font-black tracking-[0.16em] text-neutral-300 uppercase">
                      Their Response
                    </h4>

                    <p className="mt-2 text-sm leading-6 whitespace-pre-line text-neutral-300">
                      {response.statement}
                    </p>

                    <h4 className="mt-5 text-xs font-black tracking-[0.16em] text-neutral-300 uppercase">
                      Availability
                    </h4>

                    <p className="mt-2 text-sm leading-6 whitespace-pre-line text-neutral-300">
                      {response.availability}
                    </p>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-3 sm:flex-row lg:w-auto lg:flex-col">
                    {response.response_status === "submitted" ? (
                      <>
                        <form
                          action={reviewOpportunityResponseAction}
                          className="w-full"
                        >
                          <input
                            name="opportunityId"
                            type="hidden"
                            value={opportunity.id}
                          />
                          <input
                            name="userId"
                            type="hidden"
                            value={response.user_id}
                          />
                          <input name="decision" type="hidden" value="accept" />

                          <button
                            className={buttonClass("primary")}
                            type="submit"
                          >
                            Accept response
                          </button>
                        </form>

                        <form
                          action={reviewOpportunityResponseAction}
                          className="w-full"
                        >
                          <input
                            name="opportunityId"
                            type="hidden"
                            value={opportunity.id}
                          />
                          <input
                            name="userId"
                            type="hidden"
                            value={response.user_id}
                          />
                          <input
                            name="decision"
                            type="hidden"
                            value="decline"
                          />

                          <button
                            className={buttonClass("danger")}
                            type="submit"
                          >
                            Decline
                          </button>
                        </form>
                      </>
                    ) : null}

                    {response.response_status === "accepted" &&
                    opportunity.status === "closed" &&
                    !response.creator_confirmed_at ? (
                      <form
                        action={confirmManagedOpportunityCompletionAction}
                        className="w-full"
                      >
                        <input
                          name="opportunityId"
                          type="hidden"
                          value={opportunity.id}
                        />
                        <input
                          name="userId"
                          type="hidden"
                          value={response.user_id}
                        />

                        <button
                          className={buttonClass("primary")}
                          type="submit"
                        >
                          <span className="flex items-center gap-2">
                            <CheckCircle2
                              aria-hidden="true"
                              className="size-4"
                            />
                            Confirm Completion
                          </span>
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No Responses Yet">
              Once this opportunity is published, private member responses will
              appear here for you to review.
            </PreviewState>
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center lg:text-left">
          <LockKeyhole
            aria-hidden="true"
            className="mx-auto size-5 text-neutral-300 lg:mx-0"
          />

          <h2 className="mt-4 font-black text-white">Responses Stay Private</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Submitted responses are only shared with the people authorized to
            review them.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-white/[0.025] p-5 text-center lg:text-left">
          <ClipboardCheck
            aria-hidden="true"
            className="mx-auto size-5 text-neutral-300 lg:mx-0"
          />

          <h2 className="mt-4 font-black text-white">
            Openings Update Automatically
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Accepting a response updates the number of available openings for
            members.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-white/[0.025] p-5 text-center lg:text-left">
          <CheckCircle2
            aria-hidden="true"
            className="mx-auto size-5 text-neutral-300 lg:mx-0"
          />

          <h2 className="mt-4 font-black text-white">Completion Is Mutual</h2>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            You and the accepted participant both confirm when the collaboration
            is complete.
          </p>
        </div>
      </section>
    </div>
  );
}
