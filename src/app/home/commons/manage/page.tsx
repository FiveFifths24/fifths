import type { Metadata } from "next";
import {
  ArrowLeft,
  FilePenLine,
  FolderOpen,
  Plus,
  ShieldCheck,
} from "lucide-react";

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

export default async function ManageCreatorCommonsPage({
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

  const [
    roleResult,
    creatorCapabilityResult,
    membershipResult,
    modeResult,
    skillResult,
    interestResult,
  ] = await Promise.all([
    supabase.from("user_roles").select("role"),

    supabase.rpc("has_role", {
      requested_role: "creator",
    }),

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
  const isCreator = creatorCapabilityResult.data === true || isAdmin;

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

  const drafts = cards.filter((card) => card.status === "draft");

  const published = cards.filter((card) => card.status === "published");

  const history = cards.filter(
    (card) =>
      card.status === "closed" ||
      card.status === "completed" ||
      card.status === "cancelled",
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <ButtonLink
        className="mx-auto flex w-fit text-white/60 hover:text-white lg:mx-0"
        href="/home/commons"
        variant="quiet"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Creator Commons
      </ButtonLink>

      <header className="mt-8 text-center lg:text-left">
        <p className="flex items-center justify-center gap-2 text-xs font-black tracking-[0.2em] text-white/70 uppercase lg:justify-start">
          <ShieldCheck aria-hidden="true" className="size-4" />
          Creator workspace
        </p>

        <h1 className="display-type mx-auto mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl lg:mx-0">
          Manage Your Opportunities.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/55 sm:text-lg lg:mx-0">
          Create private drafts, publish opportunities, review responses, and
          keep track of everything you have shared through Creator Commons.
        </p>

        {authorized ? (
          <div className="mt-7 flex justify-center lg:justify-start">
            <ButtonLink
              className="border-white bg-white text-black hover:bg-neutral-200"
              href={
                showCreateForm
                  ? "/home/commons/manage"
                  : "/home/commons/manage?create=1"
              }
            >
              <span className="flex items-center gap-2">
                {showCreateForm ? (
                  <FolderOpen aria-hidden="true" className="size-4" />
                ) : (
                  <Plus aria-hidden="true" className="size-4" />
                )}

                {showCreateForm
                  ? "Return to opportunities"
                  : "Create Private Draft"}
              </span>
            </ButtonLink>
          </div>
        ) : null}
      </header>

      {!authorized ? (
        <StatusMessage className="mt-10" tone="error">
          You do not currently have permission to create or manage Creator
          Commons opportunities.
        </StatusMessage>
      ) : modeResult.error || skillResult.error || interestResult.error ? (
        <StatusMessage className="mt-10" tone="error">
          Creator options could not load. Confirm that the required migrations
          have been applied.
        </StatusMessage>
      ) : showCreateForm ? (
        <section
          aria-labelledby="create-opportunity-heading"
          className="mt-10 overflow-hidden rounded-[2rem] border border-white/15 bg-[#0c0c0e] p-6 sm:p-8 lg:p-10"
        >
          <div className="text-center lg:text-left">
            <p className="font-mono text-[0.65rem] font-black tracking-[0.2em] text-white/45 uppercase">
              Start with a blank page
            </p>

            <h2
              className="display-type mt-3 text-4xl text-white sm:text-5xl"
              id="create-opportunity-heading"
            >
              Create A Private Draft.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/50 sm:text-base lg:mx-0">
              Nothing goes live automatically. Complete the draft, review the
              details, and publish it when you are ready for members to respond.
            </p>
          </div>

          <div className="mt-8 text-left">
            <CreateOpportunityForm
              circles={circles}
              interests={interestResult.data ?? []}
              modes={modeResult.data ?? []}
              skills={skillResult.data ?? []}
            />
          </div>
        </section>
      ) : null}

      <section
        aria-labelledby="managed-opportunities-heading"
        className="mt-12 border-t border-white/10 pt-10"
      >
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <FilePenLine aria-hidden="true" className="size-5 text-white/70" />

            <h2
              className="text-3xl font-black text-white"
              id="managed-opportunities-heading"
            >
              Your Opportunities
            </h2>
          </div>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/45 lg:mx-0">
            Return to any draft or published opportunity to update its status,
            review responses, and track completion.
          </p>
        </div>

        {cards.length ? (
          <div className="mt-8 space-y-12">
            {drafts.length ? (
              <section aria-labelledby="draft-opportunities-heading">
                <div className="text-center lg:text-left">
                  <p className="text-xs font-black tracking-[0.16em] text-white/50 uppercase">
                    Private
                  </p>

                  <h3
                    className="mt-2 text-2xl font-black text-white"
                    id="draft-opportunities-heading"
                  >
                    Drafts
                  </h3>

                  <p className="mt-2 text-sm text-white/45">
                    These opportunities are only visible to you and authorized
                    managers.
                  </p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {drafts.map((card) => (
                    <div className="flex flex-col gap-3" key={card.id}>
                      <OpportunityCard item={card} />

                      <ButtonLink
                        className="border-white bg-white text-black hover:bg-neutral-200"
                        href={`/home/commons/manage/${card.id}`}
                      >
                        Manage draft
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {published.length ? (
              <section aria-labelledby="published-opportunities-heading">
                <div className="text-center lg:text-left">
                  <p className="text-xs font-black tracking-[0.16em] text-white/50 uppercase">
                    Live in Creator Commons
                  </p>

                  <h3
                    className="mt-2 text-2xl font-black text-white"
                    id="published-opportunities-heading"
                  >
                    Published
                  </h3>

                  <p className="mt-2 text-sm text-white/45">
                    Review private responses and manage available openings.
                  </p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {published.map((card) => (
                    <div className="flex flex-col gap-3" key={card.id}>
                      <OpportunityCard item={card} />

                      <ButtonLink
                        className="border-white bg-white text-black hover:bg-neutral-200"
                        href={`/home/commons/manage/${card.id}`}
                      >
                        Manage Opportunity
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {history.length ? (
              <section aria-labelledby="opportunity-history-heading">
                <div className="text-center lg:text-left">
                  <p className="text-xs font-black tracking-[0.16em] text-white/50 uppercase">
                    Previous activity
                  </p>

                  <h3
                    className="mt-2 text-2xl font-black text-white"
                    id="opportunity-history-heading"
                  >
                    History
                  </h3>

                  <p className="mt-2 text-sm text-white/45">
                    Closed, completed, and cancelled opportunities stay here for
                    your records.
                  </p>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {history.map((card) => (
                    <div className="flex flex-col gap-3" key={card.id}>
                      <OpportunityCard item={card} />

                      <ButtonLink
                        className="border-neutral-600 bg-neutral-950 text-white hover:border-white"
                        href={`/home/commons/manage/${card.id}`}
                      >
                        View management record
                      </ButtonLink>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <div className="mt-8">
            <PreviewState title="Nothing Here Yet">
              Create your first private draft and it will appear here. It will
              remain private until you choose to publish it.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
