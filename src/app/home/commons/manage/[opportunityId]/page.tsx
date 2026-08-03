import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, ClipboardCheck, LockKeyhole, Users } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
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
  formatOpportunityKind,
} from "@/features/creator-commons/opportunity-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Commons opportunity" };
export const dynamic = "force-dynamic";

function buttonClass(tone: "default" | "danger" = "default") {
  return `min-h-12 rounded-full border px-5 py-3 text-sm font-bold text-white ${tone === "danger" ? "border-red-800 bg-red-950 hover:border-red-600" : "border-neutral-600 bg-neutral-950 hover:border-amber-500"}`;
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
  if (!userData.user) return <AccountUnavailable />;

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
  )
    notFound();
  const opportunity = opportunityResult.data;
  const responseResult = await supabase.rpc(
    "get_creator_opportunity_responses",
    { p_opportunity_id: opportunity.id },
  );
  const responses = responseResult.data ?? [];

  return (
    <div>
      <ButtonLink href="/home/commons/manage" variant="quiet">
        ← Back to Creator workspace
      </ButtonLink>
      {parameters?.created === "1" ? (
        <StatusMessage className="mt-6" tone="success">
          Draft created. Review every boundary before publishing.
        </StatusMessage>
      ) : null}
      {parameters?.status === "updated" ? (
        <StatusMessage className="mt-6" tone="success">
          Opportunity lifecycle updated.
        </StatusMessage>
      ) : null}
      {parameters?.status === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          That lifecycle change was rejected. Review status, deadline, accepted
          responses, and Circle state.
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
          That response decision was rejected. Capacity or lifecycle may have
          changed.
        </StatusMessage>
      ) : null}
      {parameters?.completion === "confirmed" ? (
        <StatusMessage className="mt-6" tone="success">
          Creator completion confirmation recorded.
        </StatusMessage>
      ) : null}
      {parameters?.completion === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          Completion confirmation was rejected. The opportunity must be closed
          and the response accepted.
        </StatusMessage>
      ) : null}

      <div className="mt-8 rounded-[2rem] border border-amber-950/80 bg-neutral-900 p-6 sm:p-9">
        <div className="flex flex-wrap gap-2">
          <Badge>{formatOpportunityKind(opportunity.kind)}</Badge>
          <Badge className="capitalize">{opportunity.status}</Badge>
          <Badge>
            {opportunity.accepted_count}/{opportunity.positions} accepted
          </Badge>
        </div>
        <h1 className="display-type mt-5 text-5xl leading-none text-white sm:text-7xl">
          {opportunity.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
          {opportunity.summary}
        </p>
        <dl className="mt-7 grid gap-5 border-y border-neutral-800 py-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-neutral-500">Response deadline</dt>
            <dd className="mt-1 font-bold text-white">
              {formatOpportunityDeadline(
                opportunity.response_deadline,
                opportunity.timezone,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Status</dt>
            <dd className="mt-1 font-bold text-white capitalize">
              {opportunity.status}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Completion</dt>
            <dd className="mt-1 font-bold text-white">
              Two-sided confirmation required
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          {opportunity.status === "draft" ? (
            <form action={setOpportunityStatusAction}>
              <input
                name="opportunityId"
                type="hidden"
                value={opportunity.id}
              />
              <input name="status" type="hidden" value="published" />
              <button className={buttonClass()} type="submit">
                Publish opportunity
              </button>
            </form>
          ) : null}
          {opportunity.status === "published" ? (
            <form action={setOpportunityStatusAction}>
              <input
                name="opportunityId"
                type="hidden"
                value={opportunity.id}
              />
              <input name="status" type="hidden" value="closed" />
              <button className={buttonClass()} type="submit">
                Close responses
              </button>
            </form>
          ) : null}
          {(["draft", "published", "closed"] as const).includes(
            opportunity.status as "draft" | "published" | "closed",
          ) && opportunity.accepted_count === 0 ? (
            <form action={setOpportunityStatusAction}>
              <input
                name="opportunityId"
                type="hidden"
                value={opportunity.id}
              />
              <input name="status" type="hidden" value="cancelled" />
              <button className={buttonClass("danger")} type="submit">
                Cancel opportunity
              </button>
            </form>
          ) : null}
          <ButtonLink
            href={`/home/commons/${opportunity.id}`}
            variant="secondary"
          >
            View member page
          </ButtonLink>
        </div>
      </div>

      <StatusMessage className="mt-8">
        <span>
          <strong>Private review boundary:</strong> response statements and
          availability are visible only here to authorized managers and to each
          response owner. Do not copy private details into public content.
        </span>
      </StatusMessage>

      <section className="mt-10" aria-labelledby="response-queue-heading">
        <div className="flex items-center gap-3">
          <Users aria-hidden="true" className="size-5 text-amber-300" />
          <h2
            className="text-2xl font-bold text-white"
            id="response-queue-heading"
          >
            Private response queue
          </h2>
        </div>
        {responseResult.error ? (
          <StatusMessage className="mt-6" tone="error">
            The private response queue could not load.
          </StatusMessage>
        ) : responses.length ? (
          <div className="mt-6 space-y-5">
            {responses.map((response) => (
              <article
                className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6"
                key={response.user_id}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="capitalize">
                        {response.response_status}
                      </Badge>
                      {response.creator_confirmed_at ? (
                        <Badge>Creator confirmed</Badge>
                      ) : null}
                      {response.participant_confirmed_at ? (
                        <Badge>Participant confirmed</Badge>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-white">
                      {response.display_name}
                    </h3>
                    {response.username ? (
                      <p className="mt-1 text-sm text-neutral-500">
                        @{response.username}
                      </p>
                    ) : null}
                    <h4 className="mt-5 text-xs font-bold tracking-wide text-amber-200 uppercase">
                      Response
                    </h4>
                    <p className="mt-2 text-sm leading-6 whitespace-pre-line text-neutral-300">
                      {response.statement}
                    </p>
                    <h4 className="mt-5 text-xs font-bold tracking-wide text-amber-200 uppercase">
                      Availability
                    </h4>
                    <p className="mt-2 text-sm leading-6 whitespace-pre-line text-neutral-300">
                      {response.availability}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    {response.response_status === "submitted" ? (
                      <>
                        <form action={reviewOpportunityResponseAction}>
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
                          <button className={buttonClass()} type="submit">
                            Accept
                          </button>
                        </form>
                        <form action={reviewOpportunityResponseAction}>
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
                      <form action={confirmManagedOpportunityCompletionAction}>
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
                        <button className={buttonClass()} type="submit">
                          <span className="flex items-center gap-2">
                            <CheckCircle2
                              aria-hidden="true"
                              className="size-4"
                            />
                            Confirm completion
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
              Published opportunities will show private member responses here.
              No demonstration applicants are created.
            </PreviewState>
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <LockKeyhole aria-hidden="true" className="size-5 text-amber-300" />
          <h2 className="mt-4 font-bold text-white">Private by default</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Response content is never public discovery data.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <ClipboardCheck
            aria-hidden="true"
            className="size-5 text-amber-300"
          />
          <h2 className="mt-4 font-bold text-white">Capacity locked</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Acceptance locks the opportunity row before counting openings.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          <CheckCircle2 aria-hidden="true" className="size-5 text-amber-300" />
          <h2 className="mt-4 font-bold text-white">Mutual completion</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Both sides confirm before one duplicate-safe participant entry and
            one creator-lead entry can reach Passport.
          </p>
        </div>
      </section>
    </div>
  );
}
