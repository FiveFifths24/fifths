import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { EditOpportunityForm } from "@/features/creator-commons/edit-opportunity-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Creator Commons opportunity",
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
    hourCycle: "h23",
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
  const { opportunityId } = await params;

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

  const [opportunityResult, managerResult, roleResult] = await Promise.all([
    supabase
      .from("creator_opportunities")
      .select("*")
      .eq("id", opportunityId)
      .maybeSingle(),

    supabase.rpc("can_manage_creator_opportunity", {
      p_opportunity_id: opportunityId,
    }),

    supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
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
      <div className="mx-auto max-w-5xl">
        <ButtonLink
          href={`/home/commons/manage/${opportunity.id}`}
          variant="quiet"
        >
          ← Back to Opportunity
        </ButtonLink>

        <div className="mt-8">
          <StatusMessage>
            This opportunity can no longer be edited.
          </StatusMessage>
        </div>
      </div>
    );
  }

  const [
    modeResult,
    skillResult,
    interestResult,
    circleMembershipResult,
    selectedSkillResult,
    selectedInterestResult,
  ] = await Promise.all([
    supabase
      .from("modes")
      .select("id, name")
      .eq("active", true)
      .order("sort_order"),

    supabase.from("skills").select("id, name").eq("active", true).order("name"),

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
    circleMembershipResult.error ||
    selectedSkillResult.error ||
    selectedInterestResult.error
  ) {
    return (
      <div className="mx-auto max-w-5xl">
        <ButtonLink
          href={`/home/commons/manage/${opportunity.id}`}
          variant="quiet"
        >
          ← Back to Opportunity
        </ButtonLink>

        <div className="mt-8">
          <StatusMessage tone="error">
            This opportunity could not be prepared for editing.
          </StatusMessage>
        </div>
      </div>
    );
  }

  const circleIds = (circleMembershipResult.data ?? []).map(
    (membership) => membership.circle_id,
  );

  const hostedCircleResult = circleIds.length
    ? await supabase
        .from("circles")
        .select("id, name, status")
        .in("id", circleIds)
        .neq("status", "archived")
        .order("name")
    : {
        data: [],
        error: null,
      };

  if (hostedCircleResult.error) {
    return (
      <div className="mx-auto max-w-5xl">
        <ButtonLink
          href={`/home/commons/manage/${opportunity.id}`}
          variant="quiet"
        >
          ← Back to Opportunity
        </ButtonLink>

        <div className="mt-8">
          <StatusMessage tone="error">
            Circle options could not be loaded.
          </StatusMessage>
        </div>
      </div>
    );
  }

  let circles: Array<{ id: string; name: string }> = [];

  const responseDeadlineLocal = toLocalDateTimeInput(
    opportunity.response_deadline,
    opportunity.timezone,
  );

  return (
    <div className="mx-auto max-w-5xl">
      <ButtonLink
        href={`/home/commons/manage/${opportunity.id}`}
        variant="quiet"
      >
        ← Back to Opportunity
      </ButtonLink>

      <div className="mt-8">
        <p className="font-mono text-xs font-bold tracking-[0.2em] text-white/40 uppercase">
          Creator Commons
        </p>

        <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
          Edit Opportunity
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Update the opportunity details without creating a new listing.
        </p>
      </div>

      <div className="mt-8">
        <EditOpportunityForm
          circles={circles}
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
      </div>
    </div>
  );
}
