import type { Metadata } from "next";
import { ArrowLeft, Compass, ShieldCheck } from "lucide-react";

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

export default async function ManageRealmPage() {
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

  const links = ids.length
    ? await supabase
        .from("campaign_interests")
        .select("campaign_id, interest_id")
        .in("campaign_id", ids)
    : {
        data: [],
        error: null,
      };

  const cards = assembleCampaignCards(
    managed,
    modeResult.data ?? [],
    interestResult.data ?? [],
    links.data ?? [],
  );

  return (
    <div>
      {/* =====================================================
          BACK LINK
      ====================================================== */}
      <ButtonLink
        className="text-[#22d3ee]/75 hover:text-[#a5f3fc]"
        href="/home/realm"
        variant="quiet"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Fifth Realm
      </ButtonLink>

      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-16">
        <div className="max-w-4xl">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#22d3ee] uppercase">
            <Compass aria-hidden="true" className="size-4" />
            Game Master Workspace
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Build A World People Want To Enter.
          </h1>
        </div>

        <div className="flex flex-col items-start gap-6">
          <p className="max-w-xl text-base leading-8 text-white/55 sm:text-lg">
            Create campaign drafts, define expectations, open recruitment,
            review applications, manage players, and connect Sessions around the
            experience you&apos;re building.
          </p>

          {authorized ? (
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border-0 bg-gradient-to-r from-[#0891b2] via-[#22d3ee] to-[#6c14ce] px-7 text-sm font-bold text-white shadow-lg shadow-[#22d3ee]/15 transition hover:brightness-110"
              href="#create-campaign-heading"
            >
              Create Realm Campaign
            </a>
          ) : null}
        </div>
      </div>

      {/* =====================================================
          AUTHORIZATION / CREATE
      ====================================================== */}
      {modeResult.error || interestResult.error ? (
        <StatusMessage className="mt-10" tone="error">
          Realm options could not load. Confirm that the required migrations
          have been applied.
        </StatusMessage>
      ) : (
        <section
          aria-labelledby="create-campaign-heading"
          className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#22d3ee]/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.055),rgba(7,7,12,0.9))] p-6 sm:p-8 lg:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-[#22d3ee]/[0.06] blur-[110px]"
          />

          <div className="relative z-10">
            <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-[#22d3ee]/70 uppercase">
              Start With The Invitation
            </p>

            <h2
              className="display-type mt-3 text-3xl text-white sm:text-4xl"
              id="create-campaign-heading"
            >
              Campaign Draft.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              Shape the world, set the rhythm, and make it clear who will feel
              at home in the campaign.
            </p>

            <div className="mt-8">
              <CreateCampaignForm
                circles={circleResult.data ?? []}
                interests={interestResult.data ?? []}
                modes={modeResult.data ?? []}
              />
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          MANAGED CAMPAIGNS
      ====================================================== */}
      <section
        aria-labelledby="managed-campaigns-heading"
        className="mt-12 border-t border-[#22d3ee]/15 pt-10"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/[0.05]">
            <ShieldCheck aria-hidden="true" className="size-5 text-[#22d3ee]" />
          </div>

          <div>
            <h2
              className="text-2xl font-bold text-white"
              id="managed-campaigns-heading"
            >
              Your Campaigns
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Drafts, recruiting campaigns, and active worlds you&apos;re
              authorized to manage will stay organized here.
            </p>
          </div>
        </div>

        {cards.length ? (
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <CampaignCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <PreviewState title="No Campaigns Yet">
              Once you create a campaign draft, it will appear here for you to
              build, publish, and manage.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
