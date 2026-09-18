import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Bookmark,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HeartHandshake,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import {
  confirmOpportunityCompletionAction,
  deleteOpportunityAction,
  saveOpportunityAction,
  withdrawOpportunityResponseAction,
} from "@/features/creator-commons/actions";
import {
  formatOpportunityDeadline,
  formatOpportunityFormat,
  formatOpportunityKind,
} from "@/features/creator-commons/opportunity-card";
import { OpportunityResponseForm } from "@/features/creator-commons/opportunity-response-form";
import { ReportForm } from "@/features/trust-safety/report-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Creator Commons Opportunity",
};

export const dynamic = "force-dynamic";

function actionButtonClass() {
  return "min-h-12 w-full rounded-full border border-white/20 bg-gradient-to-r from-white via-neutral-200 to-neutral-400 px-6 py-3 text-sm font-black text-black transition hover:brightness-110 sm:w-auto";
}

export default async function OpportunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ opportunityId: string }>;
  searchParams?: Promise<{ saved?: string }>;
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

  const [
    opportunityResult,
    savedResult,
    responseResult,
    managerResult,
    acceptingResult,
  ] = await Promise.all([
    supabase
      .from("creator_opportunities")
      .select("*")
      .eq("id", opportunityId)
      .maybeSingle(),
    supabase
      .from("saved_opportunities")
      .select("opportunity_id")
      .eq("opportunity_id", opportunityId)
      .eq("user_id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("opportunity_responses")
      .select("*")
      .eq("opportunity_id", opportunityId)
      .eq("user_id", userData.user.id)
      .maybeSingle(),
    supabase.rpc("can_manage_creator_opportunity", {
      p_opportunity_id: opportunityId,
    }),
    supabase
      .from("creator_opportunities")
      .select("id")
      .eq("id", opportunityId)
      .eq("status", "published")
      .gt("response_deadline", "now")
      .maybeSingle(),
  ]);

  if (opportunityResult.error || !opportunityResult.data) {
    notFound();
  }

  const opportunity = opportunityResult.data;

  const [modeResult, skillLinkResult, interestLinkResult] = await Promise.all([
    supabase
      .from("modes")
      .select("name")
      .eq("id", opportunity.mode_id)
      .maybeSingle(),
    supabase
      .from("opportunity_skills")
      .select("skill_id")
      .eq("opportunity_id", opportunity.id),
    supabase
      .from("opportunity_interests")
      .select("interest_id")
      .eq("opportunity_id", opportunity.id),
  ]);

  const [skillsResult, interestsResult] = await Promise.all([
    skillLinkResult.data?.length
      ? supabase
          .from("skills")
          .select("id, name")
          .in(
            "id",
            skillLinkResult.data.map((item) => item.skill_id),
          )
          .order("name")
      : Promise.resolve({ data: [], error: null }),
    interestLinkResult.data?.length
      ? supabase
          .from("interests")
          .select("id, name")
          .in(
            "id",
            interestLinkResult.data.map((item) => item.interest_id),
          )
          .order("name")
      : Promise.resolve({ data: [], error: null }),
  ]);

  const response = responseResult.data;
  const isManager = managerResult.data === true;
  const deletionCheckResult = isManager
    ? await supabase
        .from("opportunity_responses")
        .select("user_id", { count: "exact", head: true })
        .eq("opportunity_id", opportunity.id)
    : { count: 0, error: null };

  const canDeleteOpportunity =
    isManager &&
    !deletionCheckResult.error &&
    (deletionCheckResult.count ?? 0) === 0;
  const acceptingResponses =
    Boolean(acceptingResult.data) &&
    opportunity.accepted_count < opportunity.positions;

  const remainingOpenings = Math.max(
    0,
    opportunity.positions - opportunity.accepted_count,
  );
  const commonsShell =
    "overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_24px_80px_rgba(0,0,0,0.45)]";

  const commonsSectionLabel =
    "text-[11px] font-semibold uppercase tracking-[0.34em] text-white/45";

  const commonsPill =
    "inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-white/80";

  const commonsPillStrong =
    "inline-flex items-center rounded-full border border-white/18 bg-white/[0.08] px-4 py-1.5 text-sm font-semibold text-white";

  const commonsPillSoft =
    "inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm font-semibold text-white/65";

  const commonsMetaLabel = "text-sm text-white/40";
  const commonsMetaValue = "mt-2 text-xl font-semibold text-white";

  const commonsPanel =
    "rounded-[24px] border border-white/10 bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

  const commonsPanelTitle =
    "text-[15px] font-semibold uppercase tracking-[0.22em] text-white/45";
  const commonsPanelHeading =
    "text-[2rem] font-semibold leading-tight text-white";
  const commonsBody = "text-base leading-7 text-white/72";

  const commonsNeutralTag =
    "inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 text-sm font-medium text-white/80";

  const commonsPrimaryButton =
    "inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-white via-zinc-100 to-zinc-300 px-6 py-3 text-sm font-bold text-black transition hover:from-zinc-100 hover:via-white hover:to-zinc-200";

  const commonsSecondaryButton =
    "inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-bold text-white/80 transition hover:bg-white/[0.06] hover:text-white";

  return (
    <article className="mx-auto w-full max-w-6xl">
      <div className="text-center lg:text-left">
        <ButtonLink href="/home/commons" variant="quiet">
          ← Back to Creator Commons
        </ButtonLink>
      </div>

      {parameters?.saved === "saved" ? (
        <StatusMessage className="mt-6" tone="success">
          Opportunity saved privately.
        </StatusMessage>
      ) : null}

      {parameters?.saved === "removed" ? (
        <StatusMessage className="mt-6">
          Opportunity removed from your saved list.
        </StatusMessage>
      ) : null}

      {parameters?.saved === "error" ? (
        <StatusMessage className="mt-6" tone="error">
          The saved-opportunity state could not be changed.
        </StatusMessage>
      ) : null}

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(12,12,14,0.98)_38%,rgba(255,255,255,0.02))]">
        <div className="border-b border-white/10 p-6 text-center sm:p-9 lg:text-left">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                <Badge className="border-white/20 bg-white/10 text-white">
                  Creator Commons
                </Badge>

                <Badge className="border-white/15 bg-white/[0.06] text-white/80">
                  {modeResult.data?.name ?? "Create"}
                </Badge>

                <Badge className="border-white/15 bg-white/[0.04] text-white/75">
                  {formatOpportunityKind(opportunity.kind)}
                </Badge>

                {opportunity.is_paid ? (
                  <Badge className="flex items-center gap-1.5 border-white/20 bg-white/[0.07] text-white">
                    <CircleDollarSign
                      aria-hidden="true"
                      className="size-3.5 text-white/65"
                    />
                    Paid Opportunity
                  </Badge>
                ) : (
                  <Badge className="flex items-center gap-1.5 border-white/15 bg-white/[0.04] text-white/75">
                    <HeartHandshake
                      aria-hidden="true"
                      className="size-3.5 text-white/60"
                    />
                    Unpaid / Community
                  </Badge>
                )}
                <Badge className="border-white/10 bg-black/30 text-white/60 capitalize">
                  {opportunity.status}
                </Badge>

                {response ? (
                  <Badge className="border-white/15 bg-white/[0.04] text-white/70 capitalize">
                    Response: {response.status}
                  </Badge>
                ) : null}
              </div>

              <h1 className="display-type mx-auto mt-6 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:mx-0">
                {opportunity.title}
              </h1>

              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-neutral-300 lg:mx-0">
                {opportunity.summary}
              </p>

              <p className="mt-4 text-xs font-black tracking-[0.16em] text-white/45 uppercase">
                Created by {opportunity.creator_display_name}
              </p>
            </div>

            {isManager ? (
              <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end">
                <details className="group relative">
                  <summary className="flex min-h-11 min-w-[15rem] cursor-pointer list-none items-center justify-center gap-3 rounded-full border border-white/25 bg-gradient-to-r from-white via-neutral-300 to-neutral-600 px-7 py-2.5 text-sm font-bold text-black shadow-[0_8px_28px_rgba(255,255,255,0.08)] transition hover:brightness-110 [&::-webkit-details-marker]:hidden">
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
            ) : null}
          </div>
        </div>

        <div className="p-6 sm:p-9">
          <dl className="grid gap-5 border-b border-white/10 pb-7 text-center text-sm sm:grid-cols-2 lg:grid-cols-5 lg:text-left">
            <div>
              <dt className="text-neutral-500">Respond by</dt>
              <dd className="mt-1 font-bold text-white/85">
                {formatOpportunityDeadline(
                  opportunity.response_deadline,
                  opportunity.timezone,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Format</dt>
              <dd className="mt-1 font-bold text-white/85">
                {formatOpportunityFormat(opportunity.format)}
                {opportunity.location_label
                  ? ` · ${opportunity.location_label}`
                  : ""}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Commitment</dt>
              <dd className="mt-1 font-bold text-white/85">
                About {opportunity.estimated_minutes} minutes
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Openings</dt>
              <dd className="mt-1 font-bold text-white/85">
                {remainingOpenings} of {opportunity.positions}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Compensation</dt>
              <dd
                className={
                  opportunity.is_paid
                    ? "mt-1 font-bold text-white/55"
                    : "mt-1 font-bold text-white/50"
                }
              >
                {opportunity.is_paid ? "Paid" : "Unpaid / Community"}
              </dd>
            </div>
          </dl>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <section
              aria-labelledby="opportunity-description"
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center lg:text-left"
            >
              <h2
                className="text-2xl font-black text-white"
                id="opportunity-description"
              >
                Opportunity
              </h2>

              <p className="mt-4 text-base leading-7 whitespace-pre-line text-neutral-300">
                {opportunity.description}
              </p>
            </section>

            <section
              aria-labelledby="opportunity-deliverables"
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center lg:text-left"
            >
              <h2
                className="text-2xl font-black text-white"
                id="opportunity-deliverables"
              >
                Expected Deliverables
              </h2>

              <p className="mt-4 text-base leading-7 whitespace-pre-line text-neutral-300">
                {opportunity.deliverables}
              </p>
            </section>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center lg:text-left">
              <h2 className="text-sm font-black tracking-[0.15em] text-white/45 uppercase">
                Relevant skills
              </h2>

              <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {(skillsResult.data ?? []).map((skill) => (
                  <li key={skill.id}>
                    <Badge className="border-white/15 bg-white/[0.04] text-white/75">
                      {skill.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-center lg:text-left">
              <h2 className="text-sm font-black tracking-[0.15em] text-white/45 uppercase">
                Interests
              </h2>

              <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {(interestsResult.data ?? []).map((interest) => (
                  <li key={interest.id}>
                    <Badge className="border-white/15 bg-white/[0.04] text-white/75">
                      {interest.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {!isManager ? (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <form
                  action={saveOpportunityAction}
                  className="w-full sm:w-auto"
                >
                  <input
                    name="opportunityId"
                    type="hidden"
                    value={opportunity.id}
                  />

                  <input
                    name="save"
                    type="hidden"
                    value={savedResult.data ? "false" : "true"}
                  />

                  <button className={actionButtonClass()} type="submit">
                    <span className="flex items-center justify-center gap-2">
                      <Bookmark aria-hidden="true" className="size-4" />

                      {savedResult.data
                        ? "Remove Saved Opportunity"
                        : "Save Opportunity"}
                    </span>
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="rounded-[2rem] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(10,10,12,0.96))] p-6 text-center sm:p-8 lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Users aria-hidden="true" className="size-5 text-white/55" />

            <h2 className="text-2xl font-black text-white">
              Your Participation
            </h2>
          </div>

          {isManager ? (
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              You created this opportunity, so you cannot respond to it. Use the
              management page to review private responses and choose
              collaborators.
            </p>
          ) : response ? (
            <div className="mt-5">
              <StatusMessage
                tone={
                  response.status === "accepted" ||
                  response.status === "completed"
                    ? "success"
                    : "info"
                }
              >
                Your response status is{" "}
                <strong className="capitalize">{response.status}</strong>.
              </StatusMessage>

              {response.status === "submitted" ||
              response.status === "accepted" ? (
                <form
                  action={withdrawOpportunityResponseAction}
                  className="mt-5"
                >
                  <input
                    name="opportunityId"
                    type="hidden"
                    value={opportunity.id}
                  />

                  <button className={actionButtonClass()} type="submit">
                    Withdraw Response
                  </button>
                </form>
              ) : null}

              {response.status === "accepted" &&
              opportunity.status === "closed" &&
              !response.participant_confirmed_at ? (
                <form
                  action={confirmOpportunityCompletionAction}
                  className="mt-5"
                >
                  <input
                    name="opportunityId"
                    type="hidden"
                    value={opportunity.id}
                  />

                  <input name="userId" type="hidden" value={userData.user.id} />

                  <button className={actionButtonClass()} type="submit">
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                      Confirm Your Completion
                    </span>
                  </button>
                </form>
              ) : null}
            </div>
          ) : acceptingResponses ? (
            <div className="mt-5 text-left">
              <OpportunityResponseForm opportunityId={opportunity.id} />
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              This opportunity is not accepting new responses.
            </p>
          )}
        </aside>

        <aside className="rounded-[2rem] border border-[#f359d2]/45 bg-[#10080e] p-6 text-center sm:p-8 lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <ShieldCheck aria-hidden="true" className="size-5 text-white/55" />

            <h2 className="text-2xl font-black text-white">
              Before You Respond
            </h2>
          </div>

          <ul className="mt-6 space-y-4 text-left text-sm leading-6 text-neutral-400">
            <li className="flex gap-3">
              {opportunity.is_paid ? (
                <CircleDollarSign
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-white/55"
                />
              ) : (
                <HeartHandshake
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-white/50"
                />
              )}

              <span>
                {opportunity.is_paid
                  ? "This opportunity is marked as paid. Confirm the compensation amount, payment schedule, and terms with the creator before beginning work."
                  : "This is an unpaid community opportunity. Participate for collaboration, experience, shared interests, or fun—not financial compensation."}
              </span>
            </li>

            <li className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-white/50"
              />

              <span>
                Your response is private and can only be viewed by you and
                authorized opportunity managers.
              </span>
            </li>

            <li className="flex gap-3">
              <Clock3
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-white/50"
              />

              <span>
                Payment arrangements, contracts, direct messaging, and file
                exchange currently happen outside SIGNAL.
              </span>
            </li>

            <li className="flex gap-3">
              <CheckCircle2
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-white/50"
              />

              <span>
                Completed collaborations are confirmed by both the participant
                and an authorized manager.
              </span>
            </li>
          </ul>
        </aside>
      </div>
      <details className="mt-10 rounded-[1.5rem] border border-red-300/15 bg-red-300/[0.03] p-5">
        <summary className="cursor-pointer font-bold text-red-100/70">
          Report This Opportunity
        </summary>
        <div className="mt-6">
          <ReportForm
            defaultContextUrl={`/home/commons/${opportunity.id}`}
            defaultTarget="opportunity"
            defaultTargetId={opportunity.id}
            lockTarget
          />
        </div>
      </details>
    </article>
  );
}
