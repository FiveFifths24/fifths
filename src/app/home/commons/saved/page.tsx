import type { Metadata } from "next";
import { ArrowLeft, Bookmark, FileText } from "lucide-react";

import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { OpportunityCard } from "@/features/creator-commons/opportunity-card";
import { assembleOpportunityCards } from "@/features/creator-commons/opportunity-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved Creator Commons opportunities",
};

export const dynamic = "force-dynamic";

export default async function SavedOpportunitiesPage() {
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

  const savedResult = await supabase
    .from("saved_opportunities")
    .select("opportunity_id, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", {
      ascending: false,
    });

  if (savedResult.error) {
    return (
      <StatusMessage tone="error">
        Saved opportunities need the Phase 6 migration.
      </StatusMessage>
    );
  }

  const savedIds = (savedResult.data ?? []).map((item) => item.opportunity_id);

  const opportunityResult = savedIds.length
    ? await supabase
        .from("creator_opportunities")
        .select("*")
        .in("id", savedIds)
    : {
        data: [],
        error: null,
      };

  const opportunities = opportunityResult.data ?? [];

  const ids = opportunities.map((item) => item.id);

  const [modes, skills, interests, skillLinks, interestLinks, responses] =
    await Promise.all([
      supabase.from("modes").select("id, name").order("sort_order"),

      supabase.from("skills").select("id, name").eq("active", true),

      supabase.from("interests").select("id, name").eq("active", true),

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

      ids.length
        ? supabase
            .from("opportunity_responses")
            .select("opportunity_id, status")
            .eq("user_id", userData.user.id)
            .in("opportunity_id", ids)
        : Promise.resolve({
            data: [],
            error: null,
          }),
    ]);

  const cards = assembleOpportunityCards(
    opportunities,
    modes.data ?? [],
    skills.data ?? [],
    interests.data ?? [],
    skillLinks.data ?? [],
    interestLinks.data ?? [],
    [],
    savedIds,
    responses.data ?? [],
  );

  return (
    <div>
      {/* =====================================================
          BACK LINK
      ====================================================== */}
      <ButtonLink
        className="mx-auto flex w-fit text-white/60 hover:text-white lg:mx-0"
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
        <div className="mx-auto max-w-4xl text-center lg:mx-0 lg:text-left">
          <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.2em] text-white uppercase lg:justify-start">
            <Bookmark aria-hidden="true" className="size-4" />
            Private Collection
          </p>

          <h1 className="display-type mt-4 text-5xl leading-[0.95] text-white sm:text-7xl">
            Keep The Opportunities Worth Coming Back To.
          </h1>
        </div>

        <p className="mx-auto max-w-xl text-center text-base leading-8 text-white/55 sm:text-lg lg:mx-0 lg:text-left">
          Save opportunities that catch your attention and return to them when
          the timing feels right. Your saved list stays private, and saving
          something does not submit a response or reserve a spot.
        </p>
      </div>

      {/* =====================================================
          SAVED COLLECTION
      ====================================================== */}
      <section
        aria-labelledby="saved-opportunities-heading"
        className="mt-10 border-t border-white/10 pt-10"
      >
        <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-start lg:text-left">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.035]">
            <FileText aria-hidden="true" className="size-5 text-white" />
          </div>

          <div className="flex flex-col items-center lg:items-start">
            <h2
              className="text-2xl font-bold text-white"
              id="saved-opportunities-heading"
            >
              Saved Opportunities
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              A private place to hold onto ideas, projects, and collaborations
              you may want to revisit.
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
            <PreviewState title="Nothing Saved Yet">
              Save a published Creator Commons opportunity and it will appear
              here until you decide what you want to do with it.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
