import type { Metadata } from "next";
import { ArrowLeft, FilePenLine, ShieldCheck } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { CreateOpportunityForm } from "@/features/creator-commons/create-opportunity-form";
import { OpportunityCard } from "@/features/creator-commons/opportunity-card";
import { assembleOpportunityCards } from "@/features/creator-commons/opportunity-data";
import { createClient } from "@/lib/supabase/server";
import type { CreatorOpportunity } from "@/types/database";

export const metadata: Metadata = {
  title: "Manage Creator Commons",
};

export const dynamic = "force-dynamic";

export default async function ManageCreatorCommonsPage() {
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
    roleResult,
    membershipResult,
    modeResult,
    skillResult,
    interestResult,
  ] = await Promise.all([
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

    supabase.from("skills").select("id, name").eq("active", true).order("name"),

    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  const roles = (roleResult.data ?? []).map((item) => item.role);

  const isAdmin = roles.includes("platform_admin");

  const isCreator = roles.includes("creator") || isAdmin;

  const circleIds = (membershipResult.data ?? []).map((item) => item.circle_id);

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

  const circles = circleResult.data ?? [];

  const authorized = isCreator || circles.length > 0;

  let managed: CreatorOpportunity[] = [];

  if (authorized) {
    if (isAdmin) {
      const result = await supabase
        .from("creator_opportunities")
        .select("*")
        .order("updated_at", {
          ascending: false,
        })
        .limit(100);

      managed = result.data ?? [];
    } else {
      const [ownedResult, circleOpportunityResult] = await Promise.all([
        supabase
          .from("creator_opportunities")
          .select("*")
          .eq("created_by", userData.user.id)
          .order("updated_at", {
            ascending: false,
          }),

        circleIds.length
          ? supabase
              .from("creator_opportunities")
              .select("*")
              .in("circle_id", circleIds)
              .order("updated_at", {
                ascending: false,
              })
          : Promise.resolve({
              data: [],
              error: null,
            }),
      ]);

      managed = [
        ...new Map(
          [
            ...(ownedResult.data ?? []),
            ...(circleOpportunityResult.data ?? []),
          ].map((item) => [item.id, item]),
        ).values(),
      ];
    }
  }

  const ids = managed.map((item) => item.id);

  const [skillLinks, interestLinks] = await Promise.all([
    ids.length
      ? supabase
          .from("opportunity_skills")
          .select("opportunity_id, skill_id")
          .in("opportunity_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),

    ids.length
      ? supabase
          .from("opportunity_interests")
          .select("opportunity_id, interest_id")
          .in("opportunity_id", ids)
      : Promise.resolve({
          data: [],
          error: null,
        }),
  ]);

  const cards = assembleOpportunityCards(
    managed,
    modeResult.data ?? [],
    skillResult.data ?? [],
    interestResult.data ?? [],
    skillLinks.data ?? [],
    interestLinks.data ?? [],
  );

  return (
    <div>
      {/* =====================================================
          BACK LINK
      ====================================================== */}
      <ButtonLink
        className="text-white/60 hover:text-white"
        href="/home/commons"
        variant="quiet"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Creator Commons
      </ButtonLink>

      {/* =====================================================
          PAGE INTRO
      ====================================================== */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-16">
        <div className="max-w-4xl">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-white uppercase">
            <FilePenLine aria-hidden="true" className="size-4" />
            Creator Workspace
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Turn An Idea Into An Opportunity.
          </h1>
        </div>

        <p className="max-w-xl text-base leading-8 text-white/55 sm:text-lg">
          Build a clear opportunity, define who and what you need, save it as a
          private draft, and publish it when you&apos;re ready for people to
          respond.
        </p>
      </div>

      {/* =====================================================
          AUTHORIZATION
      ====================================================== */}
      {!authorized ? (
        <StatusMessage className="mt-10" tone="error">
          <span>
            <strong>Creator authority required.</strong> A creator or platform
            administrator can create independent opportunities. Active Circle
            owners and hosts can create opportunities for the Circles they
            manage.
          </span>
        </StatusMessage>
      ) : modeResult.error || skillResult.error || interestResult.error ? (
        <StatusMessage className="mt-10" tone="error">
          Creator options could not load. Confirm that the required migrations
          have been applied.
        </StatusMessage>
      ) : (
        /* =================================================
            CREATE OPPORTUNITY
        ================================================== */
        <section
          aria-labelledby="create-opportunity-heading"
          className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(255,255,255,0.015))] p-6 sm:p-8 lg:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/[0.04] blur-[100px]"
          />

          <div className="relative z-10">
            <p className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-white/45 uppercase">
              Start With A Blank Page
            </p>

            <h2
              className="display-type mt-3 text-3xl text-white sm:text-4xl"
              id="create-opportunity-heading"
            >
              Create a private draft.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              Nothing goes live automatically. Build the opportunity first,
              review the details, then publish when it is ready for the
              community.
            </p>

            <div className="mt-8">
              <CreateOpportunityForm
                circles={circles}
                interests={interestResult.data ?? []}
                modes={modeResult.data ?? []}
                skills={skillResult.data ?? []}
              />
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          MANAGED OPPORTUNITIES
      ====================================================== */}
      <section
        aria-labelledby="managed-opportunities-heading"
        className="mt-12 border-t border-white/10 pt-10"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.035]">
            <ShieldCheck aria-hidden="true" className="size-5 text-white" />
          </div>

          <div>
            <h2
              className="text-2xl font-bold text-white"
              id="managed-opportunities-heading"
            >
              Your Opportunities
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Drafts and published opportunities you are authorized to manage
              will appear here.
            </p>
          </div>
        </div>

        {cards.length ? (
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <OpportunityCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <PreviewState title="Nothing Here Yet">
              Once you create an opportunity, your drafts and published work
              will appear here for you to manage.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
