import type { Metadata } from "next";
import { Settings2, ShieldAlert } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { assembleCircleCards } from "@/features/circles/circle-data";
import { CircleCard } from "@/features/circles/circle-card";
import { CreateCircleForm } from "@/features/circles/create-circle-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Manage Circles" };
export const dynamic = "force-dynamic";

export default async function ManageCirclesPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

  const [roleResult, membershipResult, modeResult, interestResult] =
    await Promise.all([
      supabase.from("user_roles").select("role"),
      supabase
        .from("circle_members")
        .select("circle_id, role, status")
        .eq("user_id", userData.user.id)
        .eq("status", "active")
        .in("role", ["owner", "host", "moderator"]),
      supabase
        .from("modes")
        .select("id, name")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("interests")
        .select("id, name")
        .eq("active", true)
        .order("name"),
    ]);
  const platformRoles = new Set(
    (roleResult.data ?? []).map((item) => item.role),
  );
  const canCreate =
    platformRoles.has("host") || platformRoles.has("platform_admin");
  const managedMemberships = membershipResult.data ?? [];
  const isPlatformAdmin = platformRoles.has("platform_admin");
  const circlesResult = isPlatformAdmin
    ? await supabase
        .from("circles")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(30)
    : managedMemberships.length
      ? await supabase
          .from("circles")
          .select("*")
          .in(
            "id",
            managedMemberships.map((membership) => membership.circle_id),
          )
          .order("updated_at", { ascending: false })
      : { data: [], error: null };

  if (membershipResult.error || circlesResult.error) {
    return (
      <StatusMessage tone="error">
        Circle management could not load. Confirm the Phase 5 migration.
      </StatusMessage>
    );
  }
  const circles = circlesResult.data ?? [];
  const links = circles.length
    ? ((
        await supabase
          .from("circle_interests")
          .select("circle_id, interest_id")
          .in(
            "circle_id",
            circles.map((circle) => circle.id),
          )
      ).data ?? [])
    : [];
  const cards = assembleCircleCards(
    circles,
    modeResult.data ?? [],
    interestResult.data ?? [],
    links,
    [],
    managedMemberships,
  );

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-rose-300 uppercase">
            <Settings2 aria-hidden="true" className="size-4" /> Circle tools
          </p>
          <h1 className="display-type mt-4 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">
            Build community with boundaries.
          </h1>
        </div>
        <ButtonLink href="/home/circles" variant="secondary">
          Discover Circles
        </ButtonLink>
      </div>

      {canCreate ? (
        <section
          aria-labelledby="create-circle-heading"
          className="mt-10 rounded-[2rem] border border-rose-950/70 bg-neutral-900 p-6 sm:p-9"
        >
          <h2
            className="text-3xl font-bold text-white"
            id="create-circle-heading"
          >
            New Circle draft
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
            Trusted hosts create drafts. Publication, membership roles, and
            moderation stay database-authorized.
          </p>
          <div className="mt-8">
            <CreateCircleForm
              interests={interestResult.data ?? []}
              modes={modeResult.data ?? []}
            />
          </div>
        </section>
      ) : (
        <StatusMessage className="mt-10">
          <span className="flex gap-3">
            <ShieldAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />{" "}
            Creating a Circle requires a centrally assigned host or
            platform-administrator role. Existing local Circle hosts and
            moderators can still use their scoped tools.
          </span>
        </StatusMessage>
      )}

      <section className="mt-12" aria-labelledby="managed-circles-heading">
        <h2
          className="text-3xl font-bold text-white"
          id="managed-circles-heading"
        >
          Circles you manage
        </h2>
        {cards.length ? (
          <ul className="mt-6 grid gap-6 lg:grid-cols-2">
            {cards.map((card) => (
              <li className="space-y-3" key={card.id}>
                <CircleCard item={card} />
                <ButtonLink
                  className="w-full"
                  href={`/home/circles/manage/${card.id}`}
                  variant="secondary"
                >
                  Manage {card.name}
                </ButtonLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6">
            <PreviewState title="No managed Circles">
              A new draft or an assigned Circle role will appear here. No
              placeholder community is created.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
