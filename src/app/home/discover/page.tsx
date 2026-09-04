import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, MapPin, Search, Sparkles } from "lucide-react";
import { StatusMessage } from "@/components/ui/status-message";
import {
  includesDiscoveryQuery,
  parseDiscoveryQuery,
  type DiscoveryScope,
  type DiscoveryTiming,
} from "@/features/discovery/query";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Explore SIGNAL" };
export const dynamic = "force-dynamic";

type DiscoveryKind = "all" | "people" | "sessions" | "circles" | "commons";
type DiscoveryFormat = "all" | "online" | "in_person" | "either";

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

function ResultCard({
  href,
  eyebrow,
  title,
  summary,
  meta,
}: {
  href: string;
  eyebrow: string;
  title: string;
  summary?: string | null;
  meta?: string | null;
}) {
  return (
    <Link
      className="group rounded-[1.5rem] border border-white/10 bg-black/40 p-5 transition hover:-translate-y-0.5 hover:border-[#ca9aff]/40 hover:bg-[#6c14ce]/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f359d2] motion-reduce:transform-none"
      href={href}
    >
      <p className="text-[0.65rem] font-black tracking-[0.18em] text-[#ca9aff] uppercase">
        {eyebrow}
      </p>
      <h3 className="mt-2 text-lg font-bold text-white group-hover:text-[#f6aee7]">
        {title}
      </h3>
      {summary ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">
          {summary}
        </p>
      ) : null}
      {meta ? (
        <p className="mt-4 text-xs font-bold text-white/30">{meta}</p>
      ) : null}
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
    ["all", "people", "sessions", "circles", "commons"],
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

  const [profileLinks, sessionLinks, circleLinks, commonsLinks] =
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
  const sessions = (sessionsResult.data ?? [])
    .filter(
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
    circlesResult.error,
    commonsResult.error,
  ].some(Boolean);
  const total =
    people.length + sessions.length + circles.length + commons.length;

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
          Search people, spaces, Sessions, and opportunities deliberately.
          Results are finite, filter-driven, and never become an endless feed.
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
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6c14ce] to-[#f359d2] px-6 font-bold text-white sm:w-auto"
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
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((item) => (
                <ResultCard
                  eyebrow={
                    item.city || item.region
                      ? [item.city, item.region].filter(Boolean).join(", ")
                      : "Member"
                  }
                  href={`/home/profiles/${item.username}`}
                  key={item.id}
                  summary={item.bio}
                  title={item.display_name}
                />
              ))}
            </div>
          </section>
        ) : null}
        {sessions.length ? (
          <section aria-labelledby="session-results">
            <h2 className="text-2xl font-bold text-white" id="session-results">
              Sessions
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((item) => (
                <ResultCard
                  eyebrow="Session"
                  href={`/home/sessions/${item.id}`}
                  key={item.id}
                  meta={`${item.format.replaceAll("_", " ")} · ${new Date(item.starts_at).toLocaleDateString()}`}
                  summary={item.summary}
                  title={item.title}
                />
              ))}
            </div>
          </section>
        ) : null}
        {circles.length ? (
          <section aria-labelledby="circle-results">
            <h2 className="text-2xl font-bold text-white" id="circle-results">
              Circles
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {circles.map((item) => (
                <ResultCard
                  eyebrow="Circle"
                  href={`/home/circles/${item.id}`}
                  key={item.id}
                  meta={item.location_label || item.format.replaceAll("_", " ")}
                  summary={item.summary}
                  title={item.name}
                />
              ))}
            </div>
          </section>
        ) : null}
        {commons.length ? (
          <section aria-labelledby="commons-results">
            <h2 className="text-2xl font-bold text-white" id="commons-results">
              Creator Commons
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {commons.map((item) => (
                <ResultCard
                  eyebrow="Opportunity"
                  href={`/home/commons/${item.id}`}
                  key={item.id}
                  meta={`Respond by ${new Date(item.response_deadline).toLocaleDateString()}`}
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
