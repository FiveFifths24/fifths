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

export const metadata: Metadata = {
  title: "Realm applications and campaigns",
};

export const dynamic = "force-dynamic";

const realmBadge =
  "border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#a5f3fc] shadow-[0_0_16px_rgba(34,211,238,0.06)]";

const realmButton =
  "border border-white/10 bg-gradient-to-r from-[#0891b2] via-[#22d3ee] to-[#7c3aed] text-white shadow-lg shadow-[#0891b2]/20 hover:brightness-110 hover:shadow-[#22d3ee]/25";

export default async function RealmApplicationsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    application?: string;
    membership?: string;
  }>;
}) {
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

  if (applicationResult.error || membershipResult.error) {
    return (
      <StatusMessage tone="error">
        Campaign history needs the Phase 7 migration.
      </StatusMessage>
    );
  }

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
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          BACK
      ====================================================== */}

      <ButtonLink
        className="mx-auto flex w-fit text-[#22d3ee]/75 hover:text-[#a5f3fc] lg:mx-0"
        href="/home/realm"
        variant="quiet"
      >
        ← Back to Fifth Realm
      </ButtonLink>

      {/* =====================================================
          HERO
      ====================================================== */}

      <header className="mt-10 border-b border-[#22d3ee]/12 pb-10 text-center lg:text-left">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <div className="flex size-9 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.07]">
                <ClipboardList
                  aria-hidden="true"
                  className="size-4 text-[#22d3ee]"
                />
              </div>

              <p className="font-mono text-xs font-bold tracking-[0.2em] text-[#22d3ee]/80 uppercase">
                Your Realm Path
              </p>
            </div>

            <h1 className="display-type mt-5 max-w-4xl text-5xl leading-[0.94] text-white sm:text-7xl">
              Keep Track Of The Worlds You&apos;re Entering.
            </h1>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-white/45 lg:pb-1">
            Review the campaigns you&apos;ve joined, follow your applications,
            and manage where you&apos;re currently participating. Application
            answers stay private between you and authorized game masters.
          </p>
        </div>
      </header>

      {/* =====================================================
          STATUS MESSAGES
      ====================================================== */}

      <div className="mt-7 space-y-3">
        {parameters?.application === "withdrawn" ? (
          <StatusMessage tone="success">
            Your application was withdrawn.
          </StatusMessage>
        ) : null}

        {parameters?.application === "error" ? (
          <StatusMessage tone="error">
            That application could not be withdrawn.
          </StatusMessage>
        ) : null}

        {parameters?.membership === "left" ? (
          <StatusMessage tone="success">You left the campaign.</StatusMessage>
        ) : null}

        {parameters?.membership === "error" ? (
          <StatusMessage tone="error">
            The campaign membership could not be changed.
          </StatusMessage>
        ) : null}
      </div>

      {/* =====================================================
          ACTIVE CAMPAIGNS
      ====================================================== */}

      <section className="mt-10" aria-labelledby="active-campaigns-heading">
        <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:text-left">
          <div className="flex size-11 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.07]">
            <Users aria-hidden="true" className="size-5 text-[#22d3ee]" />
          </div>

          <div>
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
              Current Worlds
            </p>

            <h2
              className="mt-1 text-2xl font-bold text-white sm:text-3xl"
              id="active-campaigns-heading"
            >
              Active Campaigns
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Campaigns where you currently have an active seat will appear
              here.
            </p>
          </div>
        </div>

        {(membershipResult.data ?? []).length ? (
          <div className="mt-7 space-y-4">
            {(membershipResult.data ?? []).map((membership) => {
              const campaign = campaigns.get(membership.campaign_id);

              return campaign ? (
                <article
                  className="rounded-[2rem] border border-[#22d3ee]/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.04),rgba(0,0,0,0.3))] p-6 shadow-[0_0_40px_rgba(34,211,238,0.025)] sm:p-7"
                  key={membership.campaign_id}
                >
                  <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
                    <div>
                      <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                        <Badge className={`${realmBadge} capitalize`}>
                          {membership.role.replaceAll("_", " ")}
                        </Badge>

                        <Badge className={`${realmBadge} capitalize`}>
                          {campaign.status}
                        </Badge>
                      </div>

                      <h3 className="mt-5 text-2xl font-bold text-white">
                        {campaign.title}
                      </h3>

                      <p className="mt-2 text-sm text-white/40">
                        Game Master {campaign.game_master_display_name}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <ButtonLink
                        className={realmButton}
                        href={`/home/realm/${campaign.id}`}
                        variant="secondary"
                      >
                        View Campaign
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
                            className="min-h-11 rounded-full border border-red-700/70 bg-red-950/40 px-5 py-2.5 text-sm font-bold text-red-100 transition hover:border-red-500 hover:bg-red-950/70"
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
          <div className="mt-7">
            <PreviewState title="No Active Campaigns">
              Accepted campaign participation will appear here.
            </PreviewState>
          </div>
        )}
      </section>

      {/* =====================================================
          APPLICATION HISTORY
      ====================================================== */}

      <section
        className="mt-12 border-t border-[#22d3ee]/10 pt-10"
        aria-labelledby="application-history-heading"
      >
        <div>
          <p className="text-center font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
            Recruitment Trail
          </p>

          <h2
            className="mt-1 text-center text-2xl font-bold text-white sm:text-3xl"
            id="application-history-heading"
          >
            Application History
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
            Keep track of the campaigns you&apos;ve applied to and where each
            application currently stands.
          </p>
        </div>

        {(applicationResult.data ?? []).length ? (
          <div className="mt-7 space-y-4">
            {(applicationResult.data ?? []).map((application) => {
              const campaign = campaigns.get(application.campaign_id);

              return campaign ? (
                <article
                  className="rounded-[2rem] border border-[#22d3ee]/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.025),rgba(0,0,0,0.28))] p-6 sm:p-7"
                  key={application.campaign_id}
                >
                  <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
                    <div>
                      <Badge className={`${realmBadge} capitalize`}>
                        {application.status}
                      </Badge>

                      <h3 className="mt-5 text-xl font-bold text-white">
                        {campaign.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-white/40">
                        Submitted{" "}
                        {formatCampaignDeadline(
                          application.submitted_at,
                          campaign.timezone,
                        )}{" "}
                        · {application.experience_level}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                      <ButtonLink
                        className={realmButton}
                        href={`/home/realm/${campaign.id}`}
                        variant="secondary"
                      >
                        View Campaign
                      </ButtonLink>

                      {application.status === "submitted" ? (
                        <form action={withdrawCampaignApplicationAction}>
                          <input
                            name="campaignId"
                            type="hidden"
                            value={campaign.id}
                          />

                          <button
                            className="min-h-11 rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/[0.04] px-5 py-2.5 text-sm font-bold text-[#a5f3fc] transition hover:border-[#22d3ee]/60 hover:bg-[#22d3ee]/10 hover:text-white"
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
          <div className="mt-7">
            <PreviewState title="No Applications">
              Campaigns you apply to will appear here.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
