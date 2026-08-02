import type { Metadata } from "next";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  confirmOpportunityCompletionAction,
  withdrawOpportunityResponseAction,
} from "@/features/creator-commons/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "My Creator Commons responses" };
export const dynamic = "force-dynamic";

function actionClass() {
  return "min-h-12 rounded-full border border-neutral-600 bg-neutral-950 px-5 py-3 text-sm font-bold text-white hover:border-amber-500";
}

export default async function OpportunityResponsesPage({
  searchParams,
}: {
  searchParams?: Promise<{ response?: string; completion?: string }>;
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

  const responseResult = await supabase
    .from("opportunity_responses")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("updated_at", { ascending: false });
  if (responseResult.error)
    return (
      <StatusMessage tone="error">
        Response history needs the Phase 6 migration.
      </StatusMessage>
    );
  const responses = responseResult.data ?? [];
  const opportunityIds = responses.map((response) => response.opportunity_id);
  const opportunityResult = opportunityIds.length
    ? await supabase
        .from("creator_opportunities")
        .select("id, title, summary, status, creator_display_name")
        .in("id", opportunityIds)
    : { data: [], error: null };
  const opportunityById = new Map(
    (opportunityResult.data ?? []).map((opportunity) => [
      opportunity.id,
      opportunity,
    ]),
  );

  return (
    <div>
      <ButtonLink href="/home/commons" variant="quiet">
        ← Back to Creator Commons
      </ButtonLink>
      <div className="mt-7 flex items-center gap-3">
        <ClipboardList aria-hidden="true" className="size-6 text-amber-300" />
        <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
          Private response history
        </p>
      </div>
      <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
        Your opportunity responses
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        Track submission, acceptance, withdrawal, and completion confirmation
        without exposing your response publicly.
      </p>
      {parameters?.response === "withdrawn" ? (
        <StatusMessage className="mt-7" tone="success">
          Your response was withdrawn.
        </StatusMessage>
      ) : null}
      {parameters?.response === "error" ? (
        <StatusMessage className="mt-7" tone="error">
          That response could not be withdrawn.
        </StatusMessage>
      ) : null}
      {parameters?.completion === "confirmed" ? (
        <StatusMessage className="mt-7" tone="success">
          Your completion confirmation was recorded.
        </StatusMessage>
      ) : null}
      {parameters?.completion === "error" ? (
        <StatusMessage className="mt-7" tone="error">
          Completion could not be confirmed. The opportunity must be closed and
          your response accepted.
        </StatusMessage>
      ) : null}

      {responses.length ? (
        <div className="mt-9 space-y-5">
          {responses.map((response) => {
            const opportunity = opportunityById.get(response.opportunity_id);
            if (!opportunity) return null;
            return (
              <article
                className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6"
                key={response.opportunity_id}
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="capitalize">{response.status}</Badge>
                      <Badge>{opportunity.status}</Badge>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-white">
                      <a
                        className="underline decoration-neutral-700 underline-offset-4 hover:decoration-amber-400"
                        href={`/home/commons/${opportunity.id}`}
                      >
                        {opportunity.title}
                      </a>
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
                      {opportunity.summary}
                    </p>
                    <p className="mt-3 text-xs font-bold text-neutral-500 uppercase">
                      Created by {opportunity.creator_display_name}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    {response.status === "submitted" ||
                    response.status === "accepted" ? (
                      <form action={withdrawOpportunityResponseAction}>
                        <input
                          name="opportunityId"
                          type="hidden"
                          value={opportunity.id}
                        />
                        <button className={actionClass()} type="submit">
                          Withdraw
                        </button>
                      </form>
                    ) : null}
                    {response.status === "accepted" &&
                    opportunity.status === "closed" &&
                    !response.participant_confirmed_at ? (
                      <form action={confirmOpportunityCompletionAction}>
                        <input
                          name="opportunityId"
                          type="hidden"
                          value={opportunity.id}
                        />
                        <input
                          name="userId"
                          type="hidden"
                          value={userData.user.id}
                        />
                        <button className={actionClass()} type="submit">
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
                {response.status === "accepted" ? (
                  <p className="mt-5 border-t border-neutral-800 pt-5 text-sm text-neutral-400">
                    Creator confirmation:{" "}
                    {response.creator_confirmed_at ? "recorded" : "pending"} ·
                    Your confirmation:{" "}
                    {response.participant_confirmed_at ? "recorded" : "pending"}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-9">
          <PreviewState title="No opportunity responses yet">
            Respond to a published Creator Commons opportunity to begin a
            private history.
          </PreviewState>
        </div>
      )}
    </div>
  );
}
