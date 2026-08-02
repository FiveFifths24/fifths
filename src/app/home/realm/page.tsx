import type { Metadata } from "next";
import { BookOpenCheck, ClipboardList, Compass, Settings2 } from "lucide-react";
import { AccountUnavailable } from "@/components/account/account-unavailable";
import { ButtonLink } from "@/components/ui/button-link";
import { PreviewState } from "@/components/ui/preview-state";
import { StatusMessage } from "@/components/ui/status-message";
import { CampaignCard } from "@/features/fifth-realm/campaign-card";
import {
  assembleCampaignCards,
  rankCampaigns,
} from "@/features/fifth-realm/campaign-data";
import type { PulseRecommendationInput } from "@/lib/recommendations/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Fifth Realm" };
export const dynamic = "force-dynamic";

export default async function FifthRealmPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return <AccountUnavailable />;
  }
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return <AccountUnavailable />;

  const [campaignResult, modeResult, interestResult, pulseResult] =
    await Promise.all([
      supabase
        .from("realm_campaigns")
        .select("*")
        .in("status", ["recruiting", "active"])
        .order("application_deadline")
        .limit(50),
      supabase.from("modes").select("id, slug, name").order("sort_order"),
      supabase
        .from("interests")
        .select("id, name")
        .eq("active", true)
        .order("name"),
      supabase
        .from("pulse_check_ins")
        .select("*")
        .gt("expires_at", "now")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
  if (campaignResult.error)
    return (
      <StatusMessage tone="error">
        Fifth Realm needs the Phase 7 migration before live campaigns can load.
      </StatusMessage>
    );
  const campaigns = campaignResult.data ?? [];
  const ids = campaigns.map((campaign) => campaign.id);
  const [linkResult, applicationResult, memberResult, pulseInterestResult] =
    await Promise.all([
      ids.length
        ? supabase
            .from("campaign_interests")
            .select("campaign_id, interest_id")
            .in("campaign_id", ids)
        : Promise.resolve({ data: [], error: null }),
      ids.length
        ? supabase
            .from("campaign_applications")
            .select("campaign_id, status")
            .eq("user_id", userData.user.id)
            .in("campaign_id", ids)
        : Promise.resolve({ data: [], error: null }),
      ids.length
        ? supabase
            .from("campaign_members")
            .select("campaign_id")
            .eq("user_id", userData.user.id)
            .eq("status", "active")
            .in("campaign_id", ids)
        : Promise.resolve({ data: [], error: null }),
      pulseResult.data
        ? supabase
            .from("pulse_check_in_interests")
            .select("interest_id")
            .eq("check_in_id", pulseResult.data.id)
        : Promise.resolve({ data: [], error: null }),
    ]);
  const modes = modeResult.data ?? [];
  const pulseMode = pulseResult.data
    ? modes.find((mode) => mode.id === pulseResult.data?.mode_id)
    : null;
  const pulseInput: PulseRecommendationInput | null =
    pulseResult.data && pulseMode
      ? {
          modeSlug: pulseMode.slug,
          energyLevel: pulseResult.data.energy_level,
          stimulationLevel: pulseResult.data.stimulation_level,
          socialIntensity: pulseResult.data.social_intensity,
          preferredFormat: pulseResult.data.preferred_format,
          availableMinutes: pulseResult.data.available_minutes,
          maximumTravelMiles: pulseResult.data.maximum_travel_miles,
          interestIds: (pulseInterestResult.data ?? []).map(
            (item) => item.interest_id,
          ),
        }
      : null;
  const recommendations = pulseInput
    ? rankCampaigns(pulseInput, campaigns, modes, linkResult.data ?? [])
    : [];
  const order = new Map(
    recommendations.map((item, index) => [item.candidate.id, index]),
  );
  campaigns.sort(
    (left, right) =>
      (order.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(right.id) ?? Number.MAX_SAFE_INTEGER),
  );
  const cards = assembleCampaignCards(
    campaigns,
    modes,
    interestResult.data ?? [],
    linkResult.data ?? [],
    recommendations,
    applicationResult.data ?? [],
    (memberResult.data ?? []).map((item) => item.campaign_id),
  );

  return (
    <div>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Compass aria-hidden="true" className="size-6 text-indigo-300" />
            <p className="text-xs font-bold tracking-[0.2em] text-indigo-300 uppercase">
              Fifth Realm
            </p>
          </div>
          <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
            Enter with intention.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-300">
            Discover original, system-neutral campaigns with clear cadence,
            safety expectations, experience welcome, and transparent Pulse-fit
            reasons.
          </p>
        </div>
        <ButtonLink href="/home/realm/manage">GM workspace</ButtonLink>
      </div>
      <StatusMessage className="mt-8">
        <span>
          <strong>Phase 7 boundary:</strong> Fifth Realm coordinates campaigns
          and uses shared Sessions for meetings. It does not host copyrighted
          rules, virtual tabletop tools, private chat, payments, or Passport
          credit.
        </span>
      </StatusMessage>
      <nav aria-label="Fifth Realm workspace" className="mt-7">
        <ul className="flex flex-wrap gap-3">
          <li>
            <ButtonLink href="/home/realm/applications" variant="secondary">
              <span className="flex items-center gap-2">
                <ClipboardList aria-hidden="true" className="size-4" />{" "}
                Applications & campaigns
              </span>
            </ButtonLink>
          </li>
          <li>
            <ButtonLink href="/home/realm/manage" variant="secondary">
              <span className="flex items-center gap-2">
                <Settings2 aria-hidden="true" className="size-4" /> GM tools
              </span>
            </ButtonLink>
          </li>
        </ul>
      </nav>
      <section className="mt-10" aria-labelledby="campaign-discovery-heading">
        <div className="flex items-center gap-3">
          <BookOpenCheck
            aria-hidden="true"
            className="size-5 text-indigo-300"
          />
          <h2
            className="text-2xl font-bold text-white"
            id="campaign-discovery-heading"
          >
            Eligible campaigns
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
            <PreviewState title="No live campaigns yet">
              Authorized game masters can prepare private drafts. FIFTHS does
              not seed demonstration campaigns or imply that preview content is
              live.
            </PreviewState>
          </div>
        )}
      </section>
    </div>
  );
}
