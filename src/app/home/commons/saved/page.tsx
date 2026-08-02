import type { Metadata } from "next";
import { Bookmark } from "lucide-react";
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
  if (!userData.user) return <AccountUnavailable />;

  const savedResult = await supabase
    .from("saved_opportunities")
    .select("opportunity_id, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });
  if (savedResult.error)
    return (
      <StatusMessage tone="error">
        Saved opportunities need the Phase 6 migration.
      </StatusMessage>
    );
  const savedIds = (savedResult.data ?? []).map((item) => item.opportunity_id);
  const opportunityResult = savedIds.length
    ? await supabase
        .from("creator_opportunities")
        .select("*")
        .in("id", savedIds)
    : { data: [], error: null };
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
        : Promise.resolve({ data: [], error: null }),
      ids.length
        ? supabase
            .from("opportunity_interests")
            .select("opportunity_id, interest_id")
            .in("opportunity_id", ids)
        : Promise.resolve({ data: [], error: null }),
      ids.length
        ? supabase
            .from("opportunity_responses")
            .select("opportunity_id, status")
            .eq("user_id", userData.user.id)
            .in("opportunity_id", ids)
        : Promise.resolve({ data: [], error: null }),
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
      <ButtonLink href="/home/commons" variant="quiet">
        ← Back to Creator Commons
      </ButtonLink>
      <div className="mt-7 flex items-center gap-3">
        <Bookmark aria-hidden="true" className="size-6 text-amber-300" />
        <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
          Private collection
        </p>
      </div>
      <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
        Saved opportunities
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        Your saved list is private. Saving does not submit a response or reserve
        a position.
      </p>
      {cards.length ? (
        <div className="mt-9 grid gap-5 lg:grid-cols-2">
          {cards.map((card) => (
            <OpportunityCard item={card} key={card.id} />
          ))}
        </div>
      ) : (
        <div className="mt-9">
          <PreviewState title="No saved opportunities">
            Save a published opportunity to keep it here without responding.
          </PreviewState>
        </div>
      )}
    </div>
  );
}
