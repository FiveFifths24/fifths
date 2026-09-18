import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusMessage } from "@/components/ui/status-message";
import { EditCampaignForm } from "@/features/fifth-realm/edit-campaign-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Fifth Realm campaign",
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

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  let supabase;

  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }

  const [{ campaignId }, { data: userData }] = await Promise.all([
    params,
    supabase.auth.getUser(),
  ]);

  if (!userData.user) {
    return <AccountUnavailable />;
  }

  const [campaignResult, managerResult, roleResult] = await Promise.all([
    supabase
      .from("realm_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle(),

    supabase.rpc("can_manage_realm_campaign", {
      p_campaign_id: campaignId,
    }),

    supabase.from("user_roles").select("role"),
  ]);

  if (
    campaignResult.error ||
    !campaignResult.data ||
    managerResult.data !== true
  ) {
    notFound();
  }

  const campaign = campaignResult.data;

  if (!["draft", "recruiting"].includes(campaign.status)) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <ButtonLink href={`/home/realm/manage/${campaign.id}`} variant="quiet">
          ← Back To Campaign
        </ButtonLink>

        <StatusMessage className="mt-8">
          This campaign can no longer be edited because it has already entered
          active or historical lifecycle state.
        </StatusMessage>
      </div>
    );
  }

  const roles = (roleResult.data ?? []).map((item) => item.role);
  const isAdmin = roles.includes("platform_admin");

  const [modeResult, interestResult, membershipResult, selectedInterestResult] =
    await Promise.all([
      supabase
        .from("modes")
        .select("id, name")
        .eq("active", true)
        .order("sort_order"),

      supabase
        .from("interests")
        .select("id, name")
        .eq("active", true)
        .eq("realm_enabled", true)
        .order("name"),

      supabase
        .from("circle_members")
        .select("circle_id, role, status")
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .in("role", ["owner", "host"]),

      supabase
        .from("campaign_interests")
        .select("interest_id")
        .eq("campaign_id", campaign.id),
    ]);

  if (
    modeResult.error ||
    interestResult.error ||
    membershipResult.error ||
    selectedInterestResult.error
  ) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <ButtonLink href={`/home/realm/manage/${campaign.id}`} variant="quiet">
          ← Back To Campaign
        </ButtonLink>

        <StatusMessage className="mt-8" tone="error">
          Fifth Realm editing options are temporarily unavailable.
        </StatusMessage>
      </div>
    );
  }

  const circleIds = (membershipResult.data ?? []).map(
    (membership) => membership.circle_id,
  );

  const circleResult = isAdmin
    ? await supabase
        .from("circles")
        .select("id, name")
        .neq("status", "archived")
        .order("name")
    : circleIds.length
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
        <ButtonLink href={`/home/realm/manage/${campaign.id}`} variant="quiet">
          ← Back To Campaign
        </ButtonLink>

        <StatusMessage className="mt-8" tone="error">
          Circle options could not be loaded.
        </StatusMessage>
      </div>
    );
  }

  const applicationDeadlineLocal = toLocalDateTimeInput(
    campaign.application_deadline,
    campaign.timezone,
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <ButtonLink
        className="mx-auto flex w-fit text-[#22d3ee]/75 hover:text-[#a5f3fc] lg:mx-0"
        href={`/home/realm/manage/${campaign.id}`}
        variant="quiet"
      >
        ← Back To Campaign
      </ButtonLink>

      <header className="mt-8 text-center lg:text-left">
        <p className="font-mono text-[0.65rem] font-bold tracking-[0.2em] text-[#22d3ee]/70 uppercase">
          Fifth Realm
        </p>

        <h1 className="display-type mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:mx-0">
          Edit Campaign.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55 sm:text-lg lg:mx-0">
          Update the campaign details members see without creating a new world
          or changing its current lifecycle status.
        </p>
      </header>

      <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#22d3ee]/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.055),rgba(7,7,12,0.9))] p-6 sm:p-8 lg:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[#22d3ee]/[0.06] blur-[110px]"
        />

        <div className="relative z-10">
          <EditCampaignForm
            applicationDeadlineLocal={applicationDeadlineLocal}
            campaign={campaign}
            circles={circleResult.data ?? []}
            interests={interestResult.data ?? []}
            modes={modeResult.data ?? []}
            selectedInterestIds={(selectedInterestResult.data ?? []).map(
              (item) => item.interest_id,
            )}
          />
        </div>
      </section>
    </div>
  );
}
