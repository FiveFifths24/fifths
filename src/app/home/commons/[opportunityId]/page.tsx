import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Bookmark,
  CheckCircle2,
  Clock3,
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

export const metadata: Metadata = { title: "Creator Commons opportunity" };
export const dynamic = "force-dynamic";

function actionButtonClass() {
  return "min-h-12 rounded-full border border-neutral-600 bg-neutral-950 px-6 py-3 text-sm font-bold text-white hover:border-amber-500";
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
  if (!userData.user) return <AccountUnavailable />;

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
  if (opportunityResult.error || !opportunityResult.data) notFound();
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

  return (
    <article>
      <ButtonLink href="/home/commons" variant="quiet">
        ← Back to Creator Commons
      </ButtonLink>
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

      <div className="mt-8 rounded-[2rem] border border-amber-950/80 bg-neutral-900 p-6 sm:p-9">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-amber-900 bg-amber-950/40 text-amber-100">
            {modeResult.data?.name ?? "Create"}
          </Badge>
          <Badge>{formatOpportunityKind(opportunity.kind)}</Badge>
          <Badge>{opportunity.status}</Badge>
          {response ? (
            <Badge className="capitalize">Response: {response.status}</Badge>
          ) : null}
        </div>
        <h1 className="display-type mt-5 max-w-4xl text-5xl leading-none text-white sm:text-7xl">
          {opportunity.title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
          {opportunity.summary}
        </p>
        <p className="mt-4 text-xs font-bold tracking-[0.14em] text-neutral-500 uppercase">
          Created by {opportunity.creator_display_name}
        </p>

        <dl className="mt-8 grid gap-5 border-y border-neutral-800 py-7 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-neutral-500">Respond by</dt>
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
            <dt className="text-neutral-500">Commitment</dt>
            <dd className="mt-1 font-bold text-white">
              About {opportunity.estimated_minutes} minutes
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Openings</dt>
            <dd className="mt-1 font-bold text-white">
              {Math.max(0, opportunity.positions - opportunity.accepted_count)}{" "}
              of {opportunity.positions}
            </dd>
          </div>
        </dl>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="opportunity-description">
            <h2
              className="text-2xl font-bold text-white"
              id="opportunity-description"
            >
              Opportunity
            </h2>
            <p className="mt-4 text-base leading-7 whitespace-pre-line text-neutral-300">
              {opportunity.description}
            </p>
          </section>
          <section aria-labelledby="opportunity-deliverables">
            <h2
              className="text-2xl font-bold text-white"
              id="opportunity-deliverables"
            >
              Expected deliverables
            </h2>
            <p className="mt-4 text-base leading-7 whitespace-pre-line text-neutral-300">
              {opportunity.deliverables}
            </p>
          </section>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section>
            <h2 className="text-sm font-bold tracking-wide text-amber-200 uppercase">
              Relevant skills
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {(skillsResult.data ?? []).map((skill) => (
                <li key={skill.id}>
                  <Badge>{skill.name}</Badge>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-sm font-bold tracking-wide text-amber-200 uppercase">
              Interests
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {(interestsResult.data ?? []).map((interest) => (
                <li key={interest.id}>
                  <Badge>{interest.name}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {!isManager ? (
            <form action={saveOpportunityAction}>
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
                <span className="flex items-center gap-2">
                  <Bookmark aria-hidden="true" className="size-4" />
                  {savedResult.data
                    ? "Remove saved opportunity"
                    : "Save opportunity"}
                </span>
              </button>
            </form>
          ) : (
            <ButtonLink href={`/home/commons/manage/${opportunity.id}`}>
              Manage opportunity
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Users aria-hidden="true" className="size-5 text-amber-300" />
            <h2 className="text-2xl font-bold text-white">
              Your participation
            </h2>
          </div>
          {isManager ? (
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              Creators cannot respond to their own managed opportunity. Use the
              management view to review private responses.
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
                    <span className="flex items-center gap-2">
                      <CheckCircle2 aria-hidden="true" className="size-4" />
                      Confirm your completion
                    </span>
                  </button>
                </form>
              ) : null}
            </div>
          ) : acceptingResponses ? (
            <div className="mt-5">
              <OpportunityResponseForm opportunityId={opportunity.id} />
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-neutral-400">
              This opportunity is not accepting new responses.
            </p>
          )}
        </section>

        <aside className="rounded-[2rem] border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-emerald-400"
            />
            <h2 className="text-xl font-bold text-white">Phase 6 boundary</h2>
          </div>
          <ul className="mt-6 space-y-4 text-sm leading-6 text-neutral-400">
            <li className="flex gap-3">
              <Clock3
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-amber-300"
              />
              A response is an expression of interest—not a contract, employment
              offer, or payment promise.
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-amber-300"
              />
              Only you and authorized managers can read your response under Row
              Level Security.
            </li>
            <li className="flex gap-3">
              <CheckCircle2
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-amber-300"
              />
              Completion requires confirmation from both the accepted
              participant and an authorized manager.
            </li>
          </ul>
        </aside>
      </div>
    </article>
  );
}
