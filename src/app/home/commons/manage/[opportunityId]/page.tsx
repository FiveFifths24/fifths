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
    description: "Review your opportunity",
  },
  {
    label: "Published",
    description: "Accept private responses",
  },
  {
    label: "Closed",
    description: "Finish the collaboration",
  },
  {
    label: "Completed",
    description: "Confirm completion",
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
    return `${base} border-white bg-white text-black hover:bg-neutral-200`;
  }

  if (tone === "danger") {
    return `${base} border-red-900 bg-red-950/60 text-red-100 hover:border-red-600`;
  }

  return `${base} border-neutral-600 bg-neutral-950 text-white hover:border-white`;
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

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-neutral-800 bg-[#0c0910]">
        <div className="border-b border-neutral-800 bg-neutral-900 p-6 text-center sm:p-9 lg:text-left">
          <p className="text-xs font-black tracking-[0.2em] text-neutral-300 uppercase">
            Creator Workspace
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
            <Badge className="border-neutral-700 bg-neutral-950 text-neutral-200">
              {formatOpportunityKind(opportunity.kind)}
            </Badge>

            <Badge className="border-neutral-700 bg-neutral-950 text-neutral-200 capitalize">
              {opportunity.status}
            </Badge>

            {opportunity.is_paid ? (
              <Badge className="flex items-center gap-1.5 border-white bg-white text-black">
                <CircleDollarSign aria-hidden="true" className="size-3.5" />
                Paid Opportunity
              </Badge>
            ) : (
              <Badge className="flex items-center gap-1.5 border-neutral-700 bg-neutral-950 text-neutral-200">
                <HeartHandshake aria-hidden="true" className="size-3.5" />
                Unpaid / Community
              </Badge>
            )}

            <Badge className="border-neutral-700 bg-neutral-950 text-neutral-200">
              {opportunity.accepted_count}/{opportunity.positions} accepted
            </Badge>
          </div>

          <h1 className="display-type mx-auto mt-6 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:mx-0">
            {opportunity.title}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 lg:mx-0">
            {opportunity.summary}
          </p>
        </div>

        <div className="p-6 sm:p-9">
          <div className="text-center lg:text-left">
            <p className="text-xs font-black tracking-[0.18em] text-neutral-300 uppercase">
              Opportunity Workflow
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              From private draft to completed collaboration
            </h2>
          </div>

          {opportunity.status === "cancelled" ? (
            <div className="mt-6 rounded-2xl border border-red-900/70 bg-red-950/30 p-5 text-center text-sm font-bold text-red-200 lg:text-left">
              This opportunity has been cancelled and is no longer accepting
              responses.
            </div>
          ) : (
            <ol className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {workflowSteps.map((step, index) => {
                const reached = currentWorkflowStep >= index;
                const current = currentWorkflowStep === index;

                return (
                  <li
                    className={`rounded-2xl border p-4 text-center lg:text-left ${
                      current
                        ? "border-white bg-white/10"
                        : reached
                          ? "border-neutral-600 bg-neutral-900"
                          : "border-neutral-800 bg-black/20"
                    }`}
                    key={step.label}
                  >
                    <span
                      className={`text-xs font-black tracking-wider uppercase ${
                        reached ? "text-neutral-300" : "text-neutral-600"
                      }`}
                    >
                      Step {index + 1}
                    </span>

                    <p
                      className={`mt-2 font-black ${
                        reached ? "text-white" : "text-neutral-500"
                      }`}
                    >
                      {step.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          <dl className="mt-8 grid gap-4 border-y border-neutral-800 py-7 text-center text-sm sm:grid-cols-2 lg:grid-cols-5 lg:text-left">
            <div>
              <dt className="text-neutral-500">Response Deadline</dt>
              <dd className="mt-1 font-bold text-white">
                {formatOpportunityDeadline(
                  opportunity.response_deadline,
                  opportunity.timezone,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Format</dt>
              <dd className="mt-1 font-bold text-white">
                {formatOpportunityFormat(opportunity.format)}
                {opportunity.location_label
                  ? ` · ${opportunity.location_label}`
                  : ""}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Compensation</dt>
              <dd
                className={
                  opportunity.is_paid
                    ? "mt-1 font-bold text-white"
                    : "mt-1 font-bold text-neutral-300"
                }
              >
                {opportunity.is_paid ? "Paid" : "Unpaid / community"}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Available ?Openings</dt>
              <dd className="mt-1 font-bold text-white">
                {remainingOpenings} of {opportunity.positions}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Current Status</dt>
              <dd className="mt-1 font-bold text-white capitalize">
                {opportunity.status}
              </dd>
            </div>
          </dl>

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

            {opportunity.status === "published" ? (
              <form
                action={setOpportunityStatusAction}
                className="w-full sm:w-auto"
              >
                <input
                  name="opportunityId"
                  type="hidden"
                  value={opportunity.id}
                />
                <input name="status" type="hidden" value="closed" />

                <button className={buttonClass("primary")} type="submit">
                  Close Responses
                </button>
              </form>
            ) : null}

            {(["draft", "published", "closed"] as const).includes(
              opportunity.status as "draft" | "published" | "closed",
            ) && opportunity.accepted_count === 0 ? (
              <form
                action={setOpportunityStatusAction}
                className="w-full sm:w-auto"
              >
                <input
                  name="opportunityId"
                  type="hidden"
                  value={opportunity.id}
                />
                <input name="status" type="hidden" value="cancelled" />

                <button className={buttonClass("danger")} type="submit">
                  <span className="flex items-center gap-2">
                    <XCircle aria-hidden="true" className="size-4" />
                    Cancel Opportunity
                  </span>
                </button>
              </form>
            ) : null}

            <ButtonLink
              href={`/home/commons/${opportunity.id}`}
              variant="secondary"
            >
              <span className="flex items-center gap-2">
                <Eye aria-hidden="true" className="size-4" />
                View Member Page
              </span>
            </ButtonLink>
          </div>
        </div>
      </section>

      <StatusMessage className="mt-8">
        <span>
          <strong>Your response queue is private.</strong> Only you, authorized
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
            <PreviewState title="No responses yet">
              Once this opportunity is published, private member responses will
              appear here for you to review.
            </PreviewState>
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 text-center lg:text-left">
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

        <div className="rounded-2xl border border-neutral-800 bg-violet-950/15 p-5 text-center lg:text-left">
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

        <div className="rounded-2xl border border-neutral-800 bg-violet-950/15 p-5 text-center lg:text-left">
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
