import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { EditOpportunityForm } from "@/features/creator-commons/edit-opportunity-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Creator Commons Opportunity",
};

export const dynamic = "force-dynamic";

function toLocalDateTimeInput(value: string, timezone: string) {
  const date = new Date(value);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ opportunityId: string }>;
}) {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [{ opportunityId }, { data: userData }] = await Promise.all([
    params,
    supabase.auth.getUser(),
  ]);

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

  if (!["draft", "published"].includes(opportunity.status)) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <ButtonLink
          href={`/home/commons/manage/${opportunity.id}`}
          variant="quiet"
        >
          ← Back To Opportunity
        </ButtonLink>

        <StatusMessage className="mt-8">
          This opportunity can no longer be edited because its lifecycle has
          already ended.
        </StatusMessage>
      </div>
    );
  }

  const [
    modeResult,
    skillResult,
    interestResult,
    membershipResult,
    selectedSkillResult,
    selectedInterestResult,
  ] = await Promise.all([
    supabase
      .from("modes")
      .select("id, name")
      .eq("active", true)
      .order("sort_order"),

    supabase
      .from("skills")
      .select("id, name")
      .eq("active", true)
      .order("name"),

    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),

    supabase
      .from("circle_members")
      .select("circle_id, role, status")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .in("role", ["owner", "host"]),

    supabase
      .from("opportunity_skills")
      .select("skill_id")
      .eq("opportunity_id", opportunity.id),

    supabase
      .from("opportunity_interests")
      .select("interest_id")
      .eq("opportunity_id", opportunity.id),
  ]);

  if (
    modeResult.error ||
    skillResult.error ||
    interestResult.error ||
    membershipResult.error ||
    selectedSkillResult.error ||
    selectedInterestResult.error
  ) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <ButtonLink
          href={`/home/commons/manage/${opportunity.id}`}
          variant="quiet"
        >
          ← Back To Opportunity
        </ButtonLink>

        <StatusMessage className="mt-8" tone="error">
          Creator Commons editing options are temporarily unavailable.
        </StatusMessage>
      </div>
    );
  }

  const circleIds = (membershipResult.data ?? []).map(
    (membership) => membership.circle_id,
  );

  const circleResult = circleIds.length
    ? await supabase
        .from("circles")
        .select("id, name")
        .in("id", circleIds)
        .neq("status", "archived")
        .order("name")
    : {
        data: [],
        error: null,
      };

  if (circleResult.error) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <ButtonLink
          href={`/home/commons/manage/${opportunity.id}`}
          variant="quiet"
        >
          ← Back To Opportunity
        </ButtonLink>

        <StatusMessage className="mt-8" tone="error">
          Circle options could not be loaded.
        </StatusMessage>
      </div>
    );
  }

  const responseDeadlineLocal = toLocalDateTimeInput(
    opportunity.response_deadline,
    opportunity.timezone,
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <ButtonLink
        className="mx-auto flex w-fit text-white/60 hover:text-white lg:mx-0"
        href={`/home/commons/manage/${opportunity.id}`}
        variant="quiet"
      >
        ← Back To Opportunity
      </ButtonLink>

      <header className="mt-8 text-center lg:text-left">
        <p className="font-mono text-[0.65rem] font-black tracking-[0.2em] text-white/45 uppercase">
          Creator Commons
        </p>

        <h1 className="display-type mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:mx-0">
          Edit Opportunity.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55 sm:text-lg lg:mx-0">
          Update the opportunity details members see without creating a new
          listing or changing its current lifecycle status.
        </p>
      </header>

      <section className="mt-10 overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(10,10,12,0.98))] p-6 sm:p-8 lg:p-10">
        <EditOpportunityForm
          circles={circleResult.data ?? []}
          interests={interestResult.data ?? []}
          modes={modeResult.data ?? []}
          opportunity={opportunity}
          responseDeadlineLocal={responseDeadlineLocal}
          selectedInterestIds={(selectedInterestResult.data ?? []).map(
            (item) => item.interest_id,
          )}
          selectedSkillIds={(selectedSkillResult.data ?? []).map(
            (item) => item.skill_id,
          )}
          skills={skillResult.data ?? []}
        />
      </section>
    </div>
  );
}