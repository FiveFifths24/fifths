import type { Metadata } from "next";
import { BriefcaseBusiness, ShieldAlert } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { CreateOpportunityForm } from "@/features/creator-commons/create-opportunity-form";
import { OpportunityCard } from "@/features/creator-commons/opportunity-card";
import { assembleOpportunityCards } from "@/features/creator-commons/opportunity-data";
import type { CreatorOpportunity } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Creator Commons" };
export const dynamic = "force-dynamic";

export default async function ManageCreatorCommonsPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

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
    : { data: [], error: null };
  const circles = circleResult.data ?? [];
  const authorized = isCreator || circles.length > 0;

  let managed: CreatorOpportunity[] = [];
  if (authorized) {
    if (isAdmin) {
      const result = await supabase
        .from("creator_opportunities")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100);
      managed = result.data ?? [];
    } else {
      const [ownedResult, circleOpportunityResult] = await Promise.all([
        supabase
          .from("creator_opportunities")
          .select("*")
          .eq("created_by", userData.user.id)
          .order("updated_at", { ascending: false }),
        circleIds.length
          ? supabase
              .from("creator_opportunities")
              .select("*")
              .in("circle_id", circleIds)
              .order("updated_at", { ascending: false })
          : Promise.resolve({ data: [], error: null }),
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
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? supabase
          .from("opportunity_interests")
          .select("opportunity_id, interest_id")
          .in("opportunity_id", ids)
      : Promise.resolve({ data: [], error: null }),
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
      <ButtonLink href="/home/commons" variant="quiet">
        ← Back to Creator Commons
      </ButtonLink>
      <div className="mt-7 flex items-center gap-3">
        <BriefcaseBusiness
          aria-hidden="true"
          className="size-6 text-amber-300"
        />
        <p className="text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
          Creator workspace
        </p>
      </div>
      <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
        Create clear opportunities.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        Authorized creators and scoped Circle hosts can prepare private drafts,
        publish them intentionally, review private responses, select
        participants, and confirm completion.
      </p>

      {!authorized ? (
        <StatusMessage className="mt-8" tone="error">
          <span>
            <strong>Creator authority required.</strong> A founder-assigned
            creator or platform-admin role can create independent opportunities.
            Active Circle owners and hosts can create only for their Circle.
          </span>
        </StatusMessage>
      ) : modeResult.error || skillResult.error || interestResult.error ? (
        <StatusMessage className="mt-8" tone="error">
          Creator taxonomies could not load. Confirm the ordered migrations.
        </StatusMessage>
      ) : (
        <section
          className="mt-10 rounded-[2rem] border border-amber-950/80 bg-neutral-900 p-6 sm:p-8"
          aria-labelledby="create-opportunity-heading"
        >
          <h2
            className="text-3xl font-bold text-white"
            id="create-opportunity-heading"
          >
            Create a private draft
          </h2>
          <div className="mt-7">
            <CreateOpportunityForm
              circles={circles}
              interests={interestResult.data ?? []}
              modes={modeResult.data ?? []}
              skills={skillResult.data ?? []}
            />
          </div>
        </section>
      )}

      <section
        className="mt-10"
        aria-labelledby="managed-opportunities-heading"
      >
        <div className="flex items-center gap-3">
          <ShieldAlert aria-hidden="true" className="size-5 text-amber-300" />
          <h2
            className="text-2xl font-bold text-white"
            id="managed-opportunities-heading"
          >
            Managed opportunities
          </h2>
        </div>
        {cards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <OpportunityCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No managed opportunities">
              An authorized creator can create a draft above. Nothing is
              published automatically.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
