import type { Metadata } from "next";
import {
  ArrowLeft,
  Compass,
  FolderOpen,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { CampaignCard } from "@/features/fifth-realm/campaign-card";
import { assembleCampaignCards } from "@/features/fifth-realm/campaign-data";
import { CreateCampaignForm } from "@/features/fifth-realm/create-campaign-form";
import { createClient } from "@/lib/supabase/server";
import type { RealmCampaign } from "@/types/database";

export const metadata: Metadata = {
  title: "Fifth Realm GM workspace",
};

export const dynamic = "force-dynamic";

export default async function ManageRealmPage({
  searchParams,
}: {
  searchParams?: Promise<{ create?: string }>;
}) {
  const parameters = await searchParams;
  const showCreateForm = parameters?.create === "1";

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

  const [roleResult, membershipResult, modeResult, interestResult] =
    await Promise.all([
      supabase.from("user_roles").select("role"),

      supabase
        .from("circle_members")
        .select("circle_id, role, status")
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .in("role", ["owner", "host"]),

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
    ]);

  const roles = (roleResult.data ?? []).map((item) => item.role);
  const isAdmin = roles.includes("platform_admin");
  const authorized = true;

  const circleIds = (membershipResult.data ?? []).map((item) => item.circle_id);

  const circleResult =
    authorized && circleIds.length
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

  let managed: RealmCampaign[] = [];

  if (authorized) {
    const result = isAdmin
      ? await supabase
          .from("realm_campaigns")
          .select("*")
          .order("updated_at", {
            ascending: false,
          })
          .limit(100)
      : await supabase
          .from("realm_campaigns")
          .select("*")
          .eq("created_by", userData.user.id)
          .order("updated_at", {
            ascending: false,
          });

    managed = result.data ?? [];
  }

  const ids = managed.map((campaign) => campaign.id);

  const [linksResult, applicationsResult] = await Promise.all([
    ids.length
      ? supabase
          .from("campaign_interests")
          .select("campaign_id, interest_id")
          .in("campaign_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    ids.length
      ? supabase
          .from("campaign_applications")
          .select("campaign_id, status")
          .in("campaign_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  const cards = assembleCampaignCards(
    managed,
    modeResult.data ?? [],
    interestResult.data ?? [],
    linksResult.data ?? [],
  );

  const pendingApplications = (applicationsResult.data ?? []).filter(
    (application) => application.status === "submitted",
  );

  const pendingByCampaign = new Map<string, number>();

  for (const application of pendingApplications) {
    pendingByCampaign.set(
      application.campaign_id,
      (pendingByCampaign.get(application.campaign_id) ?? 0) + 1,
    );
  }

  const drafts = cards.filter((card) => card.status === "draft");

  const recruiting = cards.filter((card) => card.status === "recruiting");

  const active = cards.filter((card) => card.status === "active");

  const history = cards.filter(
    (card) => card.status === "completed" || card.status === "cancelled",
  );

  const campaignsNeedingReview = cards.filter(
    (card) => (pendingByCampaign.get(card.id) ?? 0) > 0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <ButtonLink
        className="mx-auto flex w-fit text-[#22d3ee]/75 hover:text-[#a5f3fc] lg:mx-0"
        href="/home/realm"
        variant="quiet"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Fifth Realm
      </ButtonLink>

      <header className="mt-8 grid gap-8 text-center lg:grid-cols-[1fr_auto] lg:items-end lg:text-left">
        <div>
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-[#22d3ee] uppercase lg:justify-start">
            <Compass aria-hidden="true" className="size-4" />
            Game Master Workspace
          </p>

          <h1 className="display-type mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:mx-0">
            Run The Worlds You Build.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55 sm:text-lg lg:mx-0">
            Manage campaign drafts, review applications, track your roster, and
            guide active worlds from one workspace.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <ButtonLink
            className="min-h-12 border-0 bg-gradient-to-r from-[#0891b2] via-[#22d3ee] to-[#6c14ce] px-7 text-white shadow-lg shadow-[#22d3ee]/15 hover:brightness-110"
            href={
              showCreateForm
                ? "/home/realm/manage"
                : "/home/realm/manage?create=1"
            }
          >
            <span className="flex items-center gap-2">
              {showCreateForm ? (
                <FolderOpen aria-hidden="true" className="size-4" />
              ) : (
                <Plus aria-hidden="true" className="size-4" />
              )}

              {showCreateForm
                ? "Return to GM dashboard"
                : "Create New Campaign"}
            </span>
          </ButtonLink>
        </div>
      </header>

      {modeResult.error || interestResult.error ? (
        <StatusMessage className="mt-10" tone="error">
          Realm options are temporarily unavailable. Please try again shortly.
        </StatusMessage>
      ) : showCreateForm ? (
        <section
          aria-labelledby="create-campaign-heading"
          className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#22d3ee]/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.055),rgba(7,7,12,0.9))] p-6 sm:p-8 lg:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[#22d3ee]/[0.06] blur-[110px]"
          />

          <div className="relative z-10 text-center lg:text-left">
            <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-[#22d3ee]/70 uppercase">
              Start With The Invitation
            </p>

            <h2
              className="display-type mt-3 text-3xl text-white sm:text-4xl"
              id="create-campaign-heading"
            >
              Campaign Draft.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base lg:mx-0">
              Shape the world, set the rhythm, and make it clear who will feel
              at home in the campaign.
            </p>

            <div className="mt-8 text-left">
              <CreateCampaignForm
                circles={circleResult.data ?? []}
                interests={interestResult.data ?? []}
                modes={modeResult.data ?? []}
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          <section
            aria-label="GM dashboard summary"
            className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            <div className="rounded-2xl border border-[#22d3ee]/15 bg-[#22d3ee]/[0.035] p-5 text-center lg:text-left">
              <p className="text-3xl font-black text-white">{cards.length}</p>

              <p className="mt-1 text-xs font-bold tracking-wide text-[#22d3ee]/65 uppercase">
                Total Campaigns
              </p>
            </div>

            <div className="rounded-2xl border border-[#22d3ee]/15 bg-[#22d3ee]/[0.035] p-5 text-center lg:text-left">
              <p className="text-3xl font-black text-white">
                {recruiting.length}
              </p>

              <p className="mt-1 text-xs font-bold tracking-wide text-[#22d3ee]/65 uppercase">
                Recruiting
              </p>
            </div>

            <div className="rounded-2xl border border-[#22d3ee]/15 bg-[#22d3ee]/[0.035] p-5 text-center lg:text-left">
              <p className="text-3xl font-black text-white">{active.length}</p>

              <p className="mt-1 text-xs font-bold tracking-wide text-[#22d3ee]/65 uppercase">
                Active Worlds
              </p>
            </div>

            <div className="rounded-2xl border border-[#22d3ee]/15 bg-[#22d3ee]/[0.035] p-5 text-center lg:text-left">
              <p className="text-3xl font-black text-white">
                {pendingApplications.length}
              </p>

              <p className="mt-1 text-xs font-bold tracking-wide text-[#22d3ee]/65 uppercase">
                Awaiting Review
              </p>
            </div>
          </section>

          {campaignsNeedingReview.length ? (
            <section
              aria-labelledby="applications-awaiting-heading"
              className="mt-10 rounded-[2rem] border border-[#22d3ee]/25 bg-[linear-gradient(145deg,rgba(34,211,238,0.06),rgba(0,0,0,0.35))] p-6 sm:p-8"
            >
              <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:text-left">
                <div className="flex size-10 items-center justify-center rounded-full border border-[#22d3ee]/25 bg-[#22d3ee]/[0.07]">
                  <Users aria-hidden="true" className="size-5 text-[#22d3ee]" />
                </div>

                <div>
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                    Needs Your Attention
                  </p>

                  <h2
                    className="mt-1 text-2xl font-bold text-white"
                    id="applications-awaiting-heading"
                  >
                    Applications Awaiting Review
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                {campaignsNeedingReview.map((campaign) => {
                  const pendingCount = pendingByCampaign.get(campaign.id) ?? 0;

                  return (
                    <div
                      className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#22d3ee]/15 bg-black/30 p-5 text-center sm:flex-row sm:text-left"
                      key={campaign.id}
                    >
                      <div>
                        <h3 className="font-bold text-white">
                          {campaign.title}
                        </h3>

                        <p className="mt-1 text-sm text-white/45">
                          {pendingCount}{" "}
                          {pendingCount === 1 ? "application" : "applications"}{" "}
                          waiting
                        </p>
                      </div>

                      <ButtonLink
                        className="border-[#22d3ee]/35 bg-[#22d3ee]/[0.06] text-[#cffafe] hover:border-[#22d3ee]/70 hover:bg-[#22d3ee]/10"
                        href={`/home/realm/manage/${campaign.id}`}
                        variant="secondary"
                      >
                        Review
                      </ButtonLink>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      )}

      <section
        aria-labelledby="managed-campaigns-heading"
        className="mt-12 border-t border-[#22d3ee]/15 pt-10"
      >
        <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-start lg:text-left">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/[0.05]">
            <ShieldCheck aria-hidden="true" className="size-5 text-[#22d3ee]" />
          </div>

          <div>
            <h2
              className="text-3xl font-bold text-white"
              id="managed-campaigns-heading"
            >
              Your Campaigns
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Return to any campaign to publish recruitment, review
              applications, manage players, and track its progress.
            </p>
          </div>
        </div>

        {cards.length ? (
          <div className="mt-8 space-y-12">
            {drafts.length ? (
              <section aria-labelledby="draft-campaigns-heading">
                <div className="text-center lg:text-left">
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                    Private Worlds
                  </p>

                  <h3
                    className="mt-1 text-2xl font-bold text-white"
                    id="draft-campaigns-heading"
                  >
                    Drafts
                  </h3>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {drafts.map((campaign) => (
                    <div className="flex flex-col gap-3" key={campaign.id}>
                      <CampaignCard item={campaign} />

                      <ButtonLink
                        className="border-[#22d3ee]/35 bg-[#22d3ee]/[0.06] text-[#cffafe] hover:border-[#22d3ee]/70 hover:bg-[#22d3ee]/10"
                        href={`/home/realm/manage/${campaign.id}`}
                        variant="secondary"
                      >
                        Manage Draft
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {recruiting.length ? (
              <section aria-labelledby="recruiting-campaigns-heading">
                <div className="text-center lg:text-left">
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                    Open To Players
                  </p>

                  <h3
                    className="mt-1 text-2xl font-bold text-white"
                    id="recruiting-campaigns-heading"
                  >
                    Recruiting
                  </h3>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {recruiting.map((campaign) => (
                    <div className="flex flex-col gap-3" key={campaign.id}>
                      <CampaignCard item={campaign} />

                      <ButtonLink
                        className="border-[#22d3ee]/35 bg-[#22d3ee]/[0.06] text-[#cffafe] hover:border-[#22d3ee]/70 hover:bg-[#22d3ee]/10"
                        href={`/home/realm/manage/${campaign.id}`}
                        variant="secondary"
                      >
                        Manage Recruitment
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {active.length ? (
              <section aria-labelledby="active-campaigns-heading">
                <div className="text-center lg:text-left">
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                    Worlds In Progress
                  </p>

                  <h3
                    className="mt-1 text-2xl font-bold text-white"
                    id="active-campaigns-heading"
                  >
                    Active
                  </h3>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {active.map((campaign) => (
                    <div className="flex flex-col gap-3" key={campaign.id}>
                      <CampaignCard item={campaign} />

                      <ButtonLink
                        className="border-[#22d3ee]/35 bg-[#22d3ee]/[0.06] text-[#cffafe] hover:border-[#22d3ee]/70 hover:bg-[#22d3ee]/10"
                        href={`/home/realm/manage/${campaign.id}`}
                        variant="secondary"
                      >
                        Open GM Workspace
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {history.length ? (
              <section aria-labelledby="campaign-history-heading">
                <div className="text-center lg:text-left">
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                    Previous Worlds
                  </p>

                  <h3
                    className="mt-1 text-2xl font-bold text-white"
                    id="campaign-history-heading"
                  >
                    History
                  </h3>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {history.map((campaign) => (
                    <div className="flex flex-col gap-3" key={campaign.id}>
                      <CampaignCard item={campaign} />

                      <ButtonLink
                        className="border-neutral-700 bg-neutral-950 text-white/75 hover:border-white"
                        href={`/home/realm/manage/${campaign.id}`}
                        variant="secondary"
                      >
                        View Campaign Record
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-8">
            <PreviewState title="No Campaigns Yet">
              Create your first private campaign draft and it will appear here
              for you to build, publish, and manage.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
