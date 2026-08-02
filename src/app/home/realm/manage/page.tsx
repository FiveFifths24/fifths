import type { Metadata } from "next";
import { Compass, ShieldAlert } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { CampaignCard } from "@/features/fifth-realm/campaign-card";
import { assembleCampaignCards } from "@/features/fifth-realm/campaign-data";
import { CreateCampaignForm } from "@/features/fifth-realm/create-campaign-form";
import type { RealmCampaign } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Fifth Realm GM workspace" };
export const dynamic = "force-dynamic";

export default async function ManageRealmPage() {
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
        .order("name"),
    ]);
  const roles = (roleResult.data ?? []).map((item) => item.role);
  const isAdmin = roles.includes("platform_admin");
  const authorized = roles.includes("game_master") || isAdmin;
  const circleIds = (membershipResult.data ?? []).map((item) => item.circle_id);
  const circleResult =
    authorized && circleIds.length
      ? await supabase
          .from("circles")
          .select("id, name")
          .in("id", circleIds)
          .neq("status", "archived")
          .order("name")
      : { data: [], error: null };
  let managed: RealmCampaign[] = [];
  if (authorized) {
    const result = isAdmin
      ? await supabase
          .from("realm_campaigns")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(100)
      : await supabase
          .from("realm_campaigns")
          .select("*")
          .eq("created_by", userData.user.id)
          .order("updated_at", { ascending: false });
    managed = result.data ?? [];
  }
  const ids = managed.map((campaign) => campaign.id);
  const links = ids.length
    ? await supabase
        .from("campaign_interests")
        .select("campaign_id, interest_id")
        .in("campaign_id", ids)
    : { data: [], error: null };
  const cards = assembleCampaignCards(
    managed,
    modeResult.data ?? [],
    interestResult.data ?? [],
    links.data ?? [],
  );
  return (
    <div>
      <ButtonLink href="/home/realm" variant="quiet">
        ← Back to Fifth Realm
      </ButtonLink>
      <div className="mt-7 flex items-center gap-3">
        <Compass aria-hidden="true" className="size-6 text-indigo-300" />
        <p className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase">
          Game-master workspace
        </p>
      </div>
      <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
        Shape a clear invitation.
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
        Authorized game masters can prepare private campaign drafts, publish
        recruiting profiles, review private applications, manage players, and
        connect shared Sessions.
      </p>
      {!authorized ? (
        <StatusMessage className="mt-8" tone="error">
          <span>
            <strong>Game-master authority required.</strong> A founder-assigned
            game-master or platform-admin role is required. Circle association
            also requires active owner or host authority in that Circle.
          </span>
        </StatusMessage>
      ) : modeResult.error || interestResult.error ? (
        <StatusMessage className="mt-8" tone="error">
          Realm taxonomies could not load. Confirm the ordered migrations.
        </StatusMessage>
      ) : (
        <section
          className="mt-10 rounded-[2rem] border border-indigo-950 bg-neutral-900 p-6 sm:p-8"
          aria-labelledby="create-campaign-heading"
        >
          <h2
            className="text-3xl font-bold text-white"
            id="create-campaign-heading"
          >
            Create a private draft
          </h2>
          <div className="mt-7">
            <CreateCampaignForm
              circles={circleResult.data ?? []}
              interests={interestResult.data ?? []}
              modes={modeResult.data ?? []}
            />
          </div>
        </section>
      )}
      <section className="mt-10" aria-labelledby="managed-campaigns-heading">
        <div className="flex items-center gap-3">
          <ShieldAlert aria-hidden="true" className="size-5 text-indigo-300" />
          <h2
            className="text-2xl font-bold text-white"
            id="managed-campaigns-heading"
          >
            Managed campaigns
          </h2>
        </div>
        {cards.length ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <CampaignCard item={card} key={card.id} />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <PreviewState title="No managed campaigns">
              An authorized game master can create a private draft above.
              Nothing publishes automatically.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
