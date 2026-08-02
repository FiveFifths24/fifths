import type { Metadata } from "next";
import { ClipboardList, Users } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import {
  leaveCampaignAction,
  withdrawCampaignApplicationAction,
} from "@/features/fifth-realm/actions";
import { formatCampaignDeadline } from "@/features/fifth-realm/campaign-card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Realm applications and campaigns" };
export const dynamic = "force-dynamic";

export default async function RealmApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ application?: string; membership?: string }>;
}) {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;
  const [applicationResult, membershipResult, parameters] = await Promise.all([
    supabase
      .from("campaign_applications")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("campaign_members")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .order("joined_at", { ascending: false }),
    searchParams,
  ]);
  if (applicationResult.error || membershipResult.error)
    return (
      <StatusMessage tone="error">
        Campaign history needs the Phase 7 migration.
      </StatusMessage>
    );
  const campaignIds = [
    ...new Set([
      ...(applicationResult.data ?? []).map((item) => item.campaign_id),
      ...(membershipResult.data ?? []).map((item) => item.campaign_id),
    ]),
  ];
  const campaignResult = campaignIds.length
    ? await supabase.from("realm_campaigns").select("*").in("id", campaignIds)
    : { data: [], error: null };
  const campaigns = new Map(
    (campaignResult.data ?? []).map((campaign) => [campaign.id, campaign]),
  );

  return (
    <div>
      <ButtonLink href="/home/realm" variant="quiet">
        ← Back to Fifth Realm
      </ButtonLink>
      <div className="mt-7 flex items-center gap-3">
        <ClipboardList aria-hidden="true" className="size-6 text-indigo-300" />
        <p className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase">
          Private participation
        </p>
      </div>
      <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
        Your Realm path.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        Review private applications and active campaign membership. Application
        answers are visible only to you and authorized game masters.
      </p>
      {parameters?.application === "withdrawn" ? (
        <StatusMessage className="mt-7" tone="success">
          Your application was withdrawn.
        </StatusMessage>
      ) : null}
      {parameters?.application === "error" ? (
        <StatusMessage className="mt-7" tone="error">
          That application could not be withdrawn.
        </StatusMessage>
      ) : null}
      {parameters?.membership === "left" ? (
        <StatusMessage className="mt-7" tone="success">
          You left the campaign.
        </StatusMessage>
      ) : null}
      {parameters?.membership === "error" ? (
        <StatusMessage className="mt-7" tone="error">
          The campaign membership could not be changed.
        </StatusMessage>
      ) : null}
      <section className="mt-10" aria-labelledby="active-campaigns-heading">
        <div className="flex items-center gap-3">
          <Users aria-hidden="true" className="size-5 text-indigo-300" />
          <h2
            className="text-2xl font-bold text-white"
            id="active-campaigns-heading"
          >
            Active campaigns
          </h2>
        </div>
        {(membershipResult.data ?? []).length ? (
          <div className="mt-6 space-y-4">
            {(membershipResult.data ?? []).map((membership) => {
              const campaign = campaigns.get(membership.campaign_id);
              return campaign ? (
                <article
                  className="rounded-[1.75rem] border border-indigo-950 bg-neutral-900 p-6"
                  key={membership.campaign_id}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="capitalize">
                          {membership.role.replaceAll("_", " ")}
                        </Badge>
                        <Badge className="capitalize">{campaign.status}</Badge>
                      </div>
                      <h3 className="mt-4 text-2xl font-bold text-white">
                        {campaign.title}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-400">
                        Game master {campaign.game_master_display_name}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <ButtonLink
                        href={`/home/realm/${campaign.id}`}
                        variant="secondary"
                      >
                        View campaign
                      </ButtonLink>
                      {membership.role === "player" &&
                      campaign.status !== "completed" ? (
                        <form action={leaveCampaignAction}>
                          <input
                            name="campaignId"
                            type="hidden"
                            value={campaign.id}
                          />
                          <button
                            className="min-h-12 rounded-full border border-red-800 bg-red-950 px-5 py-3 text-sm font-bold text-white"
                            type="submit"
                          >
                            Leave
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </article>
              ) : null;
            })}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No active campaigns">
              Accepted campaign participation will appear here. No demonstration
              memberships are created.
            </PreviewState>
          </div>
        )}
      </section>
      <section className="mt-10" aria-labelledby="application-history-heading">
        <h2
          className="text-2xl font-bold text-white"
          id="application-history-heading"
        >
          Application history
        </h2>
        {(applicationResult.data ?? []).length ? (
          <div className="mt-6 space-y-4">
            {(applicationResult.data ?? []).map((application) => {
              const campaign = campaigns.get(application.campaign_id);
              return campaign ? (
                <article
                  className="rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6"
                  key={application.campaign_id}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Badge className="capitalize">{application.status}</Badge>
                      <h3 className="mt-4 text-xl font-bold text-white">
                        {campaign.title}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-400">
                        Submitted{" "}
                        {formatCampaignDeadline(
                          application.submitted_at,
                          campaign.timezone,
                        )}{" "}
                        · {application.experience_level}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <ButtonLink
                        href={`/home/realm/${campaign.id}`}
                        variant="secondary"
                      >
                        View campaign
                      </ButtonLink>
                      {application.status === "submitted" ? (
                        <form action={withdrawCampaignApplicationAction}>
                          <input
                            name="campaignId"
                            type="hidden"
                            value={campaign.id}
                          />
                          <button
                            className="min-h-12 rounded-full border border-neutral-600 bg-neutral-950 px-5 py-3 text-sm font-bold text-white"
                            type="submit"
                          >
                            Withdraw
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </article>
              ) : null;
            })}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No applications">
              Apply intentionally from an eligible recruiting campaign.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
