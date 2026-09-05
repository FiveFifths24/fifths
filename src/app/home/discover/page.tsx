import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Compass,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { StatusMessage } from "@/components/ui/status-message";
import { openDirectConversationAction } from "@/features/messages/actions";
import {
  CampaignResultCard,
  CircleResultCard,
  CommonsResultCard,
} from "@/features/discovery/ecosystem-result-cards";
import { signProfileMedia } from "@/features/profiles/profile-media";
import {
  includesDiscoveryQuery,
  parseDiscoveryQuery,
  type DiscoveryScope,
  type DiscoveryTiming,
} from "@/features/discovery/query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Explore SIGNAL" };
export const dynamic = "force-dynamic";

type DiscoveryKind =
  "all" | "people" | "sessions" | "campaigns" | "circles" | "commons";
type DiscoveryFormat = "all" | "online" | "in_person" | "either";

// Results are finite by design; Explore is intentional discovery, not a feed.

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function nearLocation(
  location: string | null,
  city: string | null,
  region: string | null,
) {
  if (!location) return false;
  const normalized = location.toLocaleLowerCase();
  return Boolean(
    (city && normalized.includes(city.toLocaleLowerCase())) ||
    (region && normalized.includes(region.toLocaleLowerCase())),
  );
}

function SessionResultCard({
  id,
  title,
  summary,
  format,
  location,
  startsAt,
  hostUserId,
  viewerUserId,
}: {
  id: string;
  title: string;
  summary?: string | null;
  format: string;
  location?: string | null;
  startsAt: string;
  hostUserId: string;
  viewerUserId: string;
}) {
  const isHost = hostUserId === viewerUserId;

  return (
    <article className="group relative flex min-h-[16rem] min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#992bff]/20 bg-[radial-gradient(circle_at_top_right,rgba(153,43,255,0.12),transparent_38%),linear-gradient(145deg,rgba(108,20,206,0.07),rgba(0,0,0,0.92))] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#992bff]/45 hover:shadow-[0_20px_55px_rgba(153,43,255,0.08)] focus-within:border-[#992bff]/45 motion-reduce:transform-none">
      {!isHost ? (
        <form
          action={openDirectConversationAction}
          className="absolute top-4 right-4 z-20"
        >
          <input name="targetUserId" type="hidden" value={hostUserId} />

          <button
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#992bff]/25 bg-black/55 px-3 py-1.5 text-xs font-bold text-white/55 backdrop-blur-sm transition hover:border-[#992bff]/55 hover:bg-[#992bff]/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#992bff]"
            type="submit"
          >
            <MessageCircle
              aria-hidden="true"
              className="size-3.5 text-[#c084fc]"
            />
            Message Host
          </button>
        </form>
      ) : null}

      <Link
        className="flex h-full min-w-0 flex-1 flex-col items-center focus-visible:outline-none"
        href={`/home/sessions/${id}`}
      >
        <div className="flex size-10 items-center justify-center rounded-xl border border-[#992bff]/25 bg-[#992bff]/10">
          <Sparkles aria-hidden="true" className="size-5 text-[#c084fc]" />
        </div>

        <p className="mt-3 text-[0.62rem] font-black tracking-[0.18em] text-[#c084fc] uppercase">
          Session
        </p>

        <h3 className="mt-5 max-w-full px-6 text-xl font-bold [overflow-wrap:anywhere] break-words text-white transition group-hover:text-[#ead7ff]">
          {title}
        </h3>

        {summary ? (
          <p className="mt-3 line-clamp-2 max-w-full text-sm leading-6 [overflow-wrap:anywhere] break-words text-white/50">
            {summary}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-[#992bff]/15 bg-[#992bff]/[0.06] px-3 py-1.5 text-xs font-bold text-white/55 capitalize">
            {format.replaceAll("_", " ")}
          </span>

          {location ? (
            <span className="flex max-w-full items-center gap-1.5 rounded-full border border-[#992bff]/15 bg-[#992bff]/[0.06] px-3 py-1.5 text-xs font-bold [overflow-wrap:anywhere] break-words text-white/55">
              <MapPin
                aria-hidden="true"
                className="size-3.5 shrink-0 text-[#c084fc]"
              />
              {location}
            </span>
          ) : null}
        </div>

        <div className="mt-auto w-full pt-5">
          <div className="border-t border-[#992bff]/10 pt-4">
            <p className="flex items-center justify-center gap-2 text-[0.68rem] font-black tracking-[0.14em] text-[#c084fc]/75 uppercase">
              <CalendarDays aria-hidden="true" className="size-3.5" />
              {new Date(startsAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
function PeopleResultCard({
  href,
  displayName,
  username,
  bio,
  city,
  region,
  coverImageUrl,
}: {
  href: string;
  displayName: string | null;
  username: string | null;
  bio?: string | null;
  city?: string | null;
  region?: string | null;
  coverImageUrl?: string | null;
}) {
  const location = [city, region].filter(Boolean).join(", ");

  return (
    <Link
      className="group relative flex min-h-[14rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/70 transition duration-300 hover:-translate-y-1 hover:border-[#f359d2]/40 hover:shadow-[0_20px_60px_rgba(108,20,206,0.15)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f359d2] motion-reduce:transform-none"
      href={href}
    >
      {coverImageUrl ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
          style={{ backgroundImage: `url("${coverImageUrl}")` }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(243,89,210,0.18),transparent_45%),linear-gradient(145deg,rgba(108,20,206,0.18),rgba(0,0,0,0.96))]"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-black/90"
      />

      <div className="relative z-10 flex w-full flex-col items-center justify-center px-5 py-6 text-center">
        <ArrowUpRight
          aria-hidden="true"
          className="absolute top-5 right-5 size-4 text-white/45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#f359d2]"
        />

        <p className="text-2xl font-bold text-white drop-shadow-sm transition group-hover:text-[#f6aee7]">
          {displayName || username || "SIGNAL Member"}
        </p>

        {username ? (
          <p className="mt-1 text-sm font-semibold text-[#e2b8ff]/85">
            @{username}
          </p>
        ) : null}

        {location ? (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/65">
            <MapPin aria-hidden="true" className="size-3.5 text-[#f359d2]" />
            {location}
          </p>
        ) : null}

        {bio ? (
          <p className="mt-5 line-clamp-2 max-w-md text-sm leading-6 text-white/75">
            {bio}
          </p>
        ) : (
          <p className="mt-5 text-sm text-white/55">Explore their Signal.</p>
        )}

        <div className="mt-6 border-t border-white/15 pt-4">
          <span className="text-[0.68rem] font-black tracking-[0.16em] text-[#f359d2] uppercase">
            View Signal
          </span>
        </div>
      </div>
    </Link>
  );
}
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    kind?: string;
    format?: string;
    interest?: string;
    scope?: string;
    timing?: string;
  }>;
}) {
  const parameters = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login?next=/home/discover");

  const kind = oneOf<DiscoveryKind>(
    parameters?.kind,
    ["all", "people", "sessions", "campaigns", "circles", "commons"],
    "all",
  );
  const format = oneOf<DiscoveryFormat>(
    parameters?.format,
    ["all", "online", "in_person", "either"],
    "all",
  );
  const explicitScope = oneOf<DiscoveryScope>(
    parameters?.scope,
    ["across", "near"],
    "across",
  );
  const explicitTiming = oneOf<DiscoveryTiming>(
    parameters?.timing,
    ["all", "soon"],
    "all",
  );
  const parsed = parseDiscoveryQuery(
    parameters?.q ?? "",
    explicitScope,
    explicitTiming,
  );
  const selectedInterest = parameters?.interest ?? "";
  const now = new Date();
  const soonCutoff = new Date(now.getTime() + 7 * 86_400_000).toISOString();

  const [
    viewerResult,
    peopleResult,
    sessionsResult,
    campaignsResult,
    circlesResult,
    commonsResult,
    interestsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("city, region")
      .eq("id", userData.user.id)
      .maybeSingle(),
    kind === "all" || kind === "people"
      ? supabase
          .rpc("get_member_profiles", {
            p_discoverable_only: true,
            p_username: null,
          })
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    kind === "all" || kind === "sessions"
      ? supabase
          .from("sessions")
          .select("*")
          .eq("status", "published")
          .gt("starts_at", now.toISOString())
          .order("starts_at")
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    kind === "all" || kind === "campaigns"
      ? supabase
          .from("realm_campaigns")
          .select("*")
          .in("status", ["recruiting", "active"])
          .order("application_deadline")
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    kind === "all" || kind === "circles"
      ? supabase
          .from("circles")
          .select("*")
          .eq("status", "published")
          .order("name")
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    kind === "all" || kind === "commons"
      ? supabase
          .from("creator_opportunities")
          .select("*")
          .eq("status", "published")
          .gt("response_deadline", now.toISOString())
          .order("response_deadline")
          .limit(50)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("interests")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  const [profileLinks, sessionLinks, campaignLinks, circleLinks, commonsLinks] =
    await Promise.all([
      selectedInterest
        ? supabase
            .from("profile_interests")
            .select("user_id")
            .eq("interest_id", selectedInterest)
        : Promise.resolve({ data: [], error: null }),
      selectedInterest
        ? supabase
            .from("session_interests")
            .select("session_id")
            .eq("interest_id", selectedInterest)
        : Promise.resolve({ data: [], error: null }),
      selectedInterest
        ? supabase
            .from("campaign_interests")
            .select("campaign_id")
            .eq("interest_id", selectedInterest)
        : Promise.resolve({ data: [], error: null }),
      selectedInterest
        ? supabase
            .from("circle_interests")
            .select("circle_id")
            .eq("interest_id", selectedInterest)
        : Promise.resolve({ data: [], error: null }),
      selectedInterest
        ? supabase
            .from("opportunity_interests")
            .select("opportunity_id")
            .eq("interest_id", selectedInterest)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const allowedProfileIds = new Set(
    (profileLinks.data ?? []).map((item) => item.user_id),
  );
  const allowedSessionIds = new Set(
    (sessionLinks.data ?? []).map((item) => item.session_id),
  );
  const allowedCampaignIds = new Set(
    (campaignLinks.data ?? []).map((item) => item.campaign_id),
  );
  const allowedCircleIds = new Set(
    (circleLinks.data ?? []).map((item) => item.circle_id),
  );
  const allowedCommonsIds = new Set(
    (commonsLinks.data ?? []).map((item) => item.opportunity_id),
  );
  const city = viewerResult.data?.city ?? null;
  const region = viewerResult.data?.region ?? null;
  const matchesFormat = (value: string) =>
    format === "all" || value === format || value === "either";

  const people = (peopleResult.data ?? [])
    .filter(
      (item) =>
        item.id !== userData.user.id &&
        (!selectedInterest || allowedProfileIds.has(item.id)) &&
        includesDiscoveryQuery(
          parsed.query,
          item.display_name,
          item.username,
          item.bio,
        ) &&
        (parsed.scope === "across" ||
          Boolean(
            (city &&
              item.city?.toLocaleLowerCase() === city.toLocaleLowerCase()) ||
            (region &&
              item.region?.toLocaleLowerCase() === region.toLocaleLowerCase()),
          )),
    )
    .slice(0, 24);
  const peopleWithMedia = await Promise.all(
    people.map(async (item) => ({
      ...item,
      signedCoverImageUrl: await signProfileMedia(
        supabase,
        item.cover_image_url,
      ),
    })),
  );
  const sessions = (sessionsResult.data ?? []).filter(
    (item) =>
      (!selectedInterest || allowedSessionIds.has(item.id)) &&
      matchesFormat(item.format) &&
      includesDiscoveryQuery(
        parsed.query,
        item.title,
        item.summary,
        item.description,
      ) &&
      (parsed.scope === "across" ||
        item.format === "online" ||
        nearLocation(item.location_label, city, region)) &&
      (parsed.timing === "all" || item.starts_at <= soonCutoff),
  );
  const campaigns = (campaignsResult.data ?? [])
    .filter(
      (item) =>
        (!selectedInterest || allowedCampaignIds.has(item.id)) &&
        matchesFormat(item.format) &&
        includesDiscoveryQuery(
          parsed.query,
          item.title,
          item.summary,
          item.premise,
          item.genre,
          item.tone,
        ) &&
        (parsed.scope === "across" ||
          item.format === "online" ||
          nearLocation(item.location_label, city, region)) &&
        (parsed.timing === "all" || item.application_deadline <= soonCutoff),
    )
    .slice(0, 24);
  const circles = (circlesResult.data ?? [])
    .filter(
      (item) =>
        (!selectedInterest || allowedCircleIds.has(item.id)) &&
        matchesFormat(item.format) &&
        includesDiscoveryQuery(
          parsed.query,
          item.name,
          item.summary,
          item.description,
        ) &&
        (parsed.scope === "across" ||
          item.format === "online" ||
          nearLocation(item.location_label, city, region)),
    )
    .slice(0, 24);
  const commons = (commonsResult.data ?? [])
    .filter(
      (item) =>
        (!selectedInterest || allowedCommonsIds.has(item.id)) &&
        matchesFormat(item.format) &&
        includesDiscoveryQuery(
          parsed.query,
          item.title,
          item.summary,
          item.description,
        ) &&
        (parsed.scope === "across" ||
          item.format === "online" ||
          nearLocation(item.location_label, city, region)) &&
        (parsed.timing === "all" || item.response_deadline <= soonCutoff),
    )
    .slice(0, 24);
  const unavailable = [
    peopleResult.error,
    sessionsResult.error,
    campaignsResult.error,
    circlesResult.error,
    commonsResult.error,
  ].some(Boolean);
  const total =
    people.length +
    sessions.length +
    campaigns.length +
    circles.length +
    commons.length;

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <header className="text-center">
        <p className="text-xs font-black tracking-[0.22em] text-[#f359d2] uppercase">
          Intentional discovery
        </p>
        <h1 className="display-type mt-4 text-5xl text-white sm:text-7xl">
          Explore Beyond Your Circle
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/50">
          Search people, Sessions, Fifth Realm campaigns, spaces, and
          opportunities deliberately.
        </p>
      </header>

      <form
        className="mt-10 rounded-[2rem] border border-white/10 bg-black/40 p-5 sm:p-7"
        method="get"
      >
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-5 size-5 -translate-y-1/2 text-white/30"
          />
          <label className="sr-only" htmlFor="signal-search">
            Search SIGNAL
          </label>
          <input
            className="min-h-14 w-full rounded-full border border-white/10 bg-black/45 pr-5 pl-13 text-white outline-none placeholder:text-white/25 focus:border-[#ca9aff]/70"
            defaultValue={parameters?.q}
            id="signal-search"
            name="q"
            placeholder="Try “D&D Sessions near me this weekend”"
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            aria-label="Result type"
            className="min-h-12 rounded-full border border-white/10 bg-neutral-950 px-4 text-sm text-white"
            defaultValue={kind}
            name="kind"
          >
            <option value="all">Everything</option>
            <option value="people">People</option>
            <option value="sessions">Sessions</option>
            <option value="campaigns">Fifth Realm Campaigns</option>
            <option value="circles">Circles</option>
            <option value="commons">Commons</option>
          </select>
          <select
            aria-label="Discovery scope"
            className="min-h-12 rounded-full border border-white/10 bg-neutral-950 px-4 text-sm text-white"
            defaultValue={parsed.scope}
            name="scope"
          >
            <option value="across">Across SIGNAL</option>
            <option value="near">Near Me</option>
          </select>
          <select
            aria-label="Participation format"
            className="min-h-12 rounded-full border border-white/10 bg-neutral-950 px-4 text-sm text-white"
            defaultValue={format}
            name="format"
          >
            <option value="all">Any Format</option>
            <option value="online">Online</option>
            <option value="in_person">In Person</option>
            <option value="either">Either</option>
          </select>
          <select
            aria-label="Interest"
            className="min-h-12 rounded-full border border-white/10 bg-neutral-950 px-4 text-sm text-white"
            defaultValue={selectedInterest}
            name="interest"
          >
            <option value="">Any Interest</option>
            {(interestsResult.data ?? []).map((interest) => (
              <option key={interest.id} value={interest.id}>
                {interest.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Timing"
            className="min-h-12 rounded-full border border-white/10 bg-neutral-950 px-4 text-sm text-white"
            defaultValue={parsed.timing}
            name="timing"
          >
            <option value="all">Any Time</option>
            <option value="soon">Happening Soon</option>
          </select>
        </div>
        <button
          className="mx-auto mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6c14ce] to-[#f359d2] px-6 font-bold text-white sm:w-fit"
          type="submit"
        >
          <Compass aria-hidden="true" className="size-4" />
          Explore SIGNAL
        </button>
      </form>

      {parsed.scope === "near" && !city && !region ? (
        <StatusMessage className="mt-6">
          Near Me needs a broad city or region in your profile. No precise
          address is requested or exposed.
        </StatusMessage>
      ) : null}
      {unavailable ? (
        <StatusMessage className="mt-6" tone="error">
          Some discovery sources are temporarily unavailable.
        </StatusMessage>
      ) : null}

      <div className="mt-10 space-y-12">
        {people.length ? (
          <section aria-labelledby="people-results">
            <h2
              className="flex items-center gap-2 text-2xl font-bold text-white"
              id="people-results"
            >
              <Sparkles aria-hidden="true" className="size-5 text-[#f359d2]" />
              People
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {peopleWithMedia.map((item) => (
                <PeopleResultCard
                  bio={item.bio}
                  city={item.city}
                  coverImageUrl={item.signedCoverImageUrl}
                  displayName={item.display_name}
                  href={`/home/profiles/${item.username}`}
                  key={item.id}
                  region={item.region}
                  username={item.username}
                />
              ))}
            </div>
          </section>
        ) : null}
        {sessions.length ? (
          <section aria-labelledby="session-results">
<div className="flex items-center gap-3">
  <div className="flex size-9 items-center justify-center rounded-xl border border-[#992bff]/25 bg-[#992bff]/[0.06]">
    <Sparkles aria-hidden="true" className="size-4 text-[#992bff]" />
  </div>

  <div>
    <p className="text-[0.65rem] font-black tracking-[0.18em] text-[#992bff]/65 uppercase">
      Community Activity
    </p>

    <h2
      className="text-2xl font-bold text-white"
      id="session-results"
    >
      Sessions
    </h2>
  </div>
</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
{sessions.map((item) => (
  <SessionResultCard
    format={item.format}
    hostUserId={item.host_user_id}
    id={item.id}
    key={item.id}
    location={item.location_label}
    startsAt={item.starts_at}
    summary={item.summary}
    title={item.title}
    viewerUserId={userData.user.id}
  />
))}
            </div>
          </section>
        ) : null}
        {campaigns.length ? (
          <section aria-labelledby="campaign-results">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/[0.06]">
                <Sparkles
                  aria-hidden="true"
                  className="size-4 text-[#22d3ee]"
                />
              </div>

              <div>
                <p className="text-[0.65rem] font-black tracking-[0.18em] text-[#22d3ee]/65 uppercase">
                  Fifth Realm
                </p>

                <h2
                  className="text-2xl font-bold text-white"
                  id="campaign-results"
                >
                  Campaigns
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((item) => (
                <CampaignResultCard
                  activePlayers={item.active_player_count}
                  capacity={item.player_capacity}
                  deadline={item.application_deadline}
                  experienceLevel={item.experience_level}
                  format={item.format}
                  genre={item.genre}
                  href={`/home/realm/${item.id}`}
                  key={item.id}
                  location={item.location_label}
                  schedule={item.schedule_summary}
                  summary={item.summary}
                  title={item.title}
                />
              ))}
            </div>
          </section>
        ) : null}
        {circles.length ? (
          <section aria-labelledby="circle-results">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-[#ee54a7]/25 bg-[#ee54a7]/[0.06]">
                <MessagesSquare
                  aria-hidden="true"
                  className="size-4 text-[#ee54a7]"
                />
              </div>

              <div>
                <p className="text-[0.65rem] font-black tracking-[0.18em] text-[#ee54a7]/65 uppercase">
                  Communities
                </p>

                <h2
                  className="text-2xl font-bold text-white"
                  id="circle-results"
                >
                  Circles
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {circles.map((item) => (
                <CircleResultCard
                  format={item.format}
                  href={`/home/circles/${item.id}`}
                  joinPolicy={item.join_policy}
                  key={item.id}
                  location={item.location_label}
                  name={item.name}
                  summary={item.summary}
                />
              ))}
            </div>
          </section>
        ) : null}
        {commons.length ? (
          <section aria-labelledby="commons-results">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-[#ca9aff]/25 bg-[#ca9aff]/[0.06]">
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="size-4 text-[#ca9aff]"
                />
              </div>

              <div>
                <p className="text-[0.65rem] font-black tracking-[0.18em] text-[#ca9aff]/65 uppercase">
                  Opportunities
                </p>

                <h2
                  className="text-2xl font-bold text-white"
                  id="commons-results"
                >
                  Creator Commons
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commons.map((item) => (
                <CommonsResultCard
                  acceptedCount={item.accepted_count}
                  creatorName={item.creator_display_name}
                  deadline={item.response_deadline}
                  format={item.format}
                  href={`/home/commons/${item.id}`}
                  isPaid={item.is_paid}
                  key={item.id}
                  kind={item.kind}
                  location={item.location_label}
                  positions={item.positions}
                  summary={item.summary}
                  title={item.title}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {!total ? (
        <div className="mt-12 rounded-[2rem] border border-white/10 bg-black/35 p-10 text-center">
          <MapPin
            aria-hidden="true"
            className="mx-auto size-7 text-[#ca9aff]"
          />
          <h2 className="mt-4 text-xl font-bold text-white">
            No matching Signals yet.
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/45">
            Try a broader term, another interest, or Across SIGNAL. Private and
            blocked content is never included.
          </p>
        </div>
      ) : null}
    </div>
  );
}
