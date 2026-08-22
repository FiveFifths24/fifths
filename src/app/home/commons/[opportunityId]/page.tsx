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
  saveOpportunityAction,
  withdrawOpportunityResponseAction,
} from "@/features/creator-commons/actions";
import {
  formatOpportunityDeadline,
  formatOpportunityFormat,
  formatOpportunityKind,
} from "@/features/creator-commons/opportunity-card";
import { OpportunityResponseForm } from "@/features/creator-commons/opportunity-response-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Creator Commons opportunity",
};

export const dynamic = "force-dynamic";

function actionButtonClass() {
  return "min-h-12 w-full rounded-full border border-[#f359d2] bg-[#f359d2] px-6 py-3 text-sm font-black text-black transition hover:bg-[#ff78df] sm:w-auto";
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
  const acceptingResponses =
    Boolean(acceptingResult.data) &&
    opportunity.accepted_count < opportunity.positions;

  const remainingOpenings = Math.max(
    0,
    opportunity.positions - opportunity.accepted_count,
  );

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

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-[#f359d2]/55 bg-[#10080e]">
        <div className="border-b border-[#f359d2]/20 p-6 text-center sm:p-9 lg:text-left">
          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            <Badge className="border-white bg-white text-black">
              Creator Commons
            </Badge>

            <Badge className="border-white bg-white text-black">
              {modeResult.data?.name ?? "Create"}
            </Badge>

            <Badge className="border-[#f359d2]/60 bg-black/30 text-[#f359d2]">
              {formatOpportunityKind(opportunity.kind)}
            </Badge>

            {opportunity.is_paid ? (
              <Badge className="flex items-center gap-1.5 border-emerald-700 bg-emerald-950/60 text-emerald-200">
                <CircleDollarSign aria-hidden="true" className="size-3.5" />
                Paid opportunity
              </Badge>
            ) : (
              <Badge className="flex items-center gap-1.5 border-[#f359d2]/60 bg-black/30 text-[#f359d2]">
                <HeartHandshake aria-hidden="true" className="size-3.5" />
                Unpaid / community
              </Badge>
            )}

            <Badge className="border-neutral-700 bg-neutral-950 text-neutral-200 capitalize">
              {opportunity.status}
            </Badge>

            {response ? (
              <Badge className="border-[#f359d2]/60 bg-black/30 text-[#f359d2] capitalize">
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

          <p className="mt-4 text-xs font-black tracking-[0.16em] text-[#f359d2] uppercase">
            Created by {opportunity.creator_display_name}
          </p>
        </div>

        <div className="p-6 sm:p-9">
          <dl className="grid gap-5 border-b border-[#f359d2]/20 pb-7 text-center text-sm sm:grid-cols-2 lg:grid-cols-5 lg:text-left">
            <div>
              <dt className="text-neutral-500">Respond by</dt>
              <dd className="mt-1 font-bold text-[#f359d2]">
                {formatOpportunityDeadline(
                  opportunity.response_deadline,
                  opportunity.timezone,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Format</dt>
              <dd className="mt-1 font-bold text-[#f359d2]">
                {formatOpportunityFormat(opportunity.format)}
                {opportunity.location_label
                  ? ` · ${opportunity.location_label}`
                  : ""}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Commitment</dt>
              <dd className="mt-1 font-bold text-[#f359d2]">
                About {opportunity.estimated_minutes} minutes
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Openings</dt>
              <dd className="mt-1 font-bold text-[#f359d2]">
                {remainingOpenings} of {opportunity.positions}
              </dd>
            </div>

            <div>
              <dt className="text-neutral-500">Compensation</dt>
              <dd
                className={
                  opportunity.is_paid
                    ? "mt-1 font-bold text-emerald-300"
                    : "mt-1 font-bold text-[#f359d2]"
                }
              >
                {opportunity.is_paid ? "Paid" : "Unpaid / community"}
              </dd>
            </div>
          </dl>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <section
              aria-labelledby="opportunity-description"
              className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center lg:text-left"
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
              className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center lg:text-left"
            >
              <h2
                className="text-2xl font-black text-white"
                id="opportunity-deliverables"
              >
                Expected deliverables
              </h2>

              <p className="mt-4 text-base leading-7 whitespace-pre-line text-neutral-300">
                {opportunity.deliverables}
              </p>
            </section>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center lg:text-left">
              <h2 className="text-sm font-black tracking-[0.15em] text-[#f359d2] uppercase">
                Relevant skills
              </h2>

              <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {(skillsResult.data ?? []).map((skill) => (
                  <li key={skill.id}>
                    <Badge className="border-[#f359d2]/50 bg-[#10080e] text-[#f359d2]">
                      {skill.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-white/10 bg-black/20 p-5 text-center lg:text-left">
              <h2 className="text-sm font-black tracking-[0.15em] text-[#f359d2] uppercase">
                Interests
              </h2>

              <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {(interestsResult.data ?? []).map((interest) => (
                  <li key={interest.id}>
                    <Badge className="border-[#f359d2]/50 bg-[#10080e] text-[#f359d2]">
                      {interest.name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {!isManager ? (
              <form action={saveOpportunityAction} className="w-full sm:w-auto">
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
                      ? "Remove saved opportunity"
                      : "Save opportunity"}
                  </span>
                </button>
              </form>
            ) : (
              <ButtonLink
                className="border-[#f359d2] bg-[#f359d2] text-black hover:bg-[#ff78df]"
                href={`/home/commons/manage/${opportunity.id}`}
              >
                Manage opportunity
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-[#f359d2]/45 bg-[#10080e] p-6 text-center sm:p-8 lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Users aria-hidden="true" className="size-5 text-[#f359d2]" />

            <h2 className="text-2xl font-black text-white">
              Your participation
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
                    Withdraw response
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
                      Confirm your completion
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
        </section>

        <aside className="rounded-[2rem] border border-[#f359d2]/45 bg-[#10080e] p-6 text-center sm:p-8 lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <ShieldCheck aria-hidden="true" className="size-5 text-[#f359d2]" />

            <h2 className="text-2xl font-black text-white">
              Before you respond
            </h2>
          </div>

          <ul className="mt-6 space-y-4 text-left text-sm leading-6 text-neutral-400">
            <li className="flex gap-3">
              {opportunity.is_paid ? (
                <CircleDollarSign
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-emerald-300"
                />
              ) : (
                <HeartHandshake
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-[#f359d2]"
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
                className="mt-1 size-4 shrink-0 text-[#f359d2]"
              />

              <span>
                Your response is private and can only be viewed by you and
                authorized opportunity managers.
              </span>
            </li>

            <li className="flex gap-3">
              <Clock3
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-[#f359d2]"
              />

              <span>
                Payment arrangements, contracts, direct messaging, and file
                exchange currently happen outside SIGNAL.
              </span>
            </li>

            <li className="flex gap-3">
              <CheckCircle2
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-[#f359d2]"
              />

              <span>
                Completed collaborations are confirmed by both the participant
                and an authorized manager.
              </span>
            </li>
          </ul>
        </aside>
      </div>
    </article>
  );
}
