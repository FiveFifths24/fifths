import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, ClipboardList, FileText } from "lucide-react";

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

export const metadata: Metadata = {
  title: "My Creator Commons responses",
};

export const dynamic = "force-dynamic";

function actionClass() {
  return "min-h-11 rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-sm font-bold text-white/75 transition hover:border-white/35 hover:bg-white/[0.06] hover:text-white";
}

export default async function OpportunityResponsesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    response?: string;
    completion?: string;
  }>;
}) {
  const parameters = await searchParams;

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

  const responseResult = await supabase
    .from("opportunity_responses")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("updated_at", {
      ascending: false,
    });

  if (responseResult.error) {
    return (
      <StatusMessage tone="error">
        Response history needs the Phase 6 migration.
      </StatusMessage>
    );
  }

  const responses = responseResult.data ?? [];

  const opportunityIds = responses.map((response) => response.opportunity_id);

  const opportunityResult = opportunityIds.length
    ? await supabase
        .from("creator_opportunities")
        .select("id, title, summary, status, creator_display_name")
        .in("id", opportunityIds)
    : {
        data: [],
        error: null,
      };

  const opportunityById = new Map(
    (opportunityResult.data ?? []).map((opportunity) => [
      opportunity.id,
      opportunity,
    ]),
  );

  return (
    <div>
      {/* =====================================================
          BACK LINK
      ====================================================== */}
      <ButtonLink
        className="mx-auto flex w-fit text-white/60 hover:text-white lg:mx-0"
        href="/home/commons"
        variant="quiet"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Creator Commons
      </ButtonLink>

      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-16">
        <div className="mx-auto max-w-4xl text-center lg:mx-0 lg:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-white uppercase lg:justify-start">
            <ClipboardList aria-hidden="true" className="size-4" />
            Private Response History
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Keep Track Of Where You&apos;ve Raised Your Hand.
          </h1>
        </div>

        <p className="mx-auto max-w-xl text-center text-base leading-8 text-white/55 sm:text-lg lg:mx-0 lg:text-left">
          Review the Creator Commons opportunities you&apos;ve responded to,
          track what&apos;s been accepted or withdrawn, and confirm completed
          collaborations without making your responses public.
        </p>
      </div>

      {/* =====================================================
          STATUS MESSAGES
      ====================================================== */}
      {parameters?.response === "withdrawn" ? (
        <StatusMessage className="mt-8" tone="success">
          Your response was withdrawn.
        </StatusMessage>
      ) : null}

      {parameters?.response === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          That response could not be withdrawn.
        </StatusMessage>
      ) : null}

      {parameters?.completion === "confirmed" ? (
        <StatusMessage className="mt-8" tone="success">
          Your completion confirmation was recorded.
        </StatusMessage>
      ) : null}

      {parameters?.completion === "error" ? (
        <StatusMessage className="mt-8" tone="error">
          Completion could not be confirmed. The opportunity must be closed and
          your response accepted.
        </StatusMessage>
      ) : null}

      {/* =====================================================
          RESPONSE HISTORY
      ====================================================== */}
      <section
        aria-labelledby="response-history-heading"
        className="mt-10 border-t border-white/10 pt-10"
      >
        <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-start lg:text-left">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.035]">
            <FileText aria-hidden="true" className="size-5 text-white" />
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <h2
              className="text-2xl font-bold text-white"
              id="response-history-heading"
            >
              Your Responses
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Everything you&apos;ve submitted through Creator Commons will stay
              organized here.
            </p>
          </div>
        </div>

        {responses.length ? (
          <div className="mt-7 space-y-5">
            {responses.map((response) => {
              const opportunity = opportunityById.get(response.opportunity_id);

              if (!opportunity) {
                return null;
              }

              return (
                <article
                  className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 sm:p-7"
                  key={response.opportunity_id}
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap gap-2">
                        <Badge className="capitalize">{response.status}</Badge>

                        <Badge>{opportunity.status}</Badge>
                      </div>

                      <h3 className="mt-4 text-2xl font-bold text-white">
                        <a
                          className="underline decoration-white/20 underline-offset-4 transition hover:decoration-white/70"
                          href={`/home/commons/${opportunity.id}`}
                        >
                          {opportunity.title}
                        </a>
                      </h3>

                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
                        {opportunity.summary}
                      </p>

                      <p className="mt-4 text-xs font-bold tracking-[0.14em] text-white/30 uppercase">
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
                    <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-sm text-white/45 sm:grid-cols-2">
                      <p>
                        <span className="font-bold text-white/70">
                          Creator confirmation:
                        </span>{" "}
                        {response.creator_confirmed_at ? "recorded" : "pending"}
                      </p>

                      <p>
                        <span className="font-bold text-white/70">
                          Your confirmation:
                        </span>{" "}
                        {response.participant_confirmed_at
                          ? "recorded"
                          : "pending"}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-7">
            <PreviewState title="No Responses Yet">
              When you respond to a published Creator Commons opportunity, your
              private response history will appear here.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
