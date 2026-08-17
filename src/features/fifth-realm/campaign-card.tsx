import Link from "next/link";
import {
  Clock3,
  Compass,
  MapPin,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RankedRecommendation } from "@/lib/recommendations/types";
import type {
  CampaignApplication,
  RealmCampaign,
} from "@/types/database";

export type CampaignCardItem = Pick<
  RealmCampaign,
  | "id"
  | "title"
  | "summary"
  | "game_master_display_name"
  | "genre"
  | "tone"
  | "status"
  | "format"
  | "location_label"
  | "schedule_summary"
  | "timezone"
  | "estimated_session_minutes"
  | "application_deadline"
  | "player_capacity"
  | "active_player_count"
  | "experience_level"
  | "minimum_energy"
  | "maximum_energy"
  | "stimulation_level"
  | "social_intensity"
> & {
  modeName: string;
  interestNames: string[];
  reasons?: RankedRecommendation["reasons"];
  fit?: RankedRecommendation["fit"];
  applicationStatus?: CampaignApplication["status"];
  isMember?: boolean;
};

const realmBadge =
  "border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#a5f3fc] shadow-[0_0_16px_rgba(34,211,238,0.06)]";

export function formatCampaignFormat(format: RealmCampaign["format"]) {
  if (format === "in_person") return "In person";
  if (format === "online") return "Online";
  return "Hybrid";
}

export function formatCampaignDeadline(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(new Date(value));
}

export function CampaignCard({ item }: { item: CampaignCardItem }) {
  const openings = Math.max(
    0,
    item.player_capacity - item.active_player_count,
  );

  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-[#22d3ee]/20 bg-[linear-gradient(145deg,rgba(34,211,238,0.04),rgba(12,12,14,0.96)_40%,rgba(0,0,0,0.96))] p-6 shadow-[0_0_40px_rgba(34,211,238,0.025)] transition hover:border-[#22d3ee]/40 hover:shadow-[0_0_45px_rgba(34,211,238,0.055)]">
<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <Badge className={realmBadge}>
          Fifth Realm
        </Badge>

        <Badge className={realmBadge}>
          {item.modeName}
        </Badge>

        <Badge className={`${realmBadge} capitalize`}>
          {item.genre.replaceAll("_", " ")}
        </Badge>

        <Badge className={`${realmBadge} capitalize`}>
          {item.status === "recruiting"
            ? `${openings} ${openings === 1 ? "seat" : "seats"}`
            : item.status}
        </Badge>

        {item.applicationStatus ? (
          <Badge className={`${realmBadge} capitalize`}>
            Application: {item.applicationStatus}
          </Badge>
        ) : null}

        {item.isMember ? (
          <Badge className={realmBadge}>
            Campaign member
          </Badge>
        ) : null}
      </div>

<h2 className="mt-5 text-center text-2xl font-bold text-white sm:text-left">
          <Link
          className="rounded-sm underline decoration-[#22d3ee]/25 underline-offset-4 transition hover:text-[#cffafe] hover:decoration-[#22d3ee]"
          href={`/home/realm/${item.id}`}
        >
          {item.title}
        </Link>
      </h2>

<p className="mt-3 flex-1 text-center text-sm leading-6 text-white/45 sm:text-left">
        {item.summary}
      </p>

<p className="mt-4 text-center text-xs font-bold uppercase tracking-wide text-[#22d3ee]/45 sm:text-left">
        Game master {item.game_master_display_name}
      </p>

      <dl className="mt-6 grid gap-3 text-sm text-white/60 sm:grid-cols-2">
<div className="flex justify-center gap-2 text-left sm:justify-start">
            <Clock3
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#22d3ee]/75"
          />

          <div>
            <dt className="sr-only">
              Schedule
            </dt>

            <dd>
              {item.schedule_summary}
            </dd>
          </div>
        </div>

<div className="flex justify-center gap-2 text-left sm:justify-start">
            <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#22d3ee]/75"
          />

          <div>
            <dt className="sr-only">
              Format
            </dt>

            <dd>
              {formatCampaignFormat(item.format)}
              {item.location_label
                ? ` · ${item.location_label}`
                : ""}
            </dd>
          </div>
        </div>

<div className="flex justify-center gap-2 text-left sm:justify-start">
            <Compass
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#22d3ee]/75"
          />

          <div>
            <dt className="sr-only">
              Tone
            </dt>

            <dd>
              {item.tone}
            </dd>
          </div>
        </div>

<div className="flex justify-center gap-2 text-left sm:justify-start">
            <Users
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#22d3ee]/75"
          />

          <div>
            <dt className="sr-only">
              Session length and experience
            </dt>

            <dd>
              About {item.estimated_session_minutes} min ·{" "}
              {item.experience_level}
            </dd>
          </div>
        </div>
      </dl>

      {item.status === "recruiting" ? (
<p className="mt-5 flex items-center justify-center gap-2 text-xs text-white/45 sm:justify-start">
          <ShieldCheck
            aria-hidden="true"
            className="size-4 text-[#22d3ee]/75"
          />

          Apply by{" "}
          {formatCampaignDeadline(
            item.application_deadline,
            item.timezone,
          )}
        </p>
      ) : null}

      {item.reasons?.length ? (
        <div className="mt-5 border-t border-[#22d3ee]/12 pt-5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#a5f3fc]/80">
            <Zap
              aria-hidden="true"
              className="size-4 text-[#22d3ee]"
            />

            {item.fit
              ? `${item.fit} fit · `
              : ""}
            Why this may fit
          </p>

          <ul
            aria-label="Why This Matches Your Pulse"
            className="mt-3 flex flex-wrap gap-2"
          >
            {item.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>
                <Badge className={realmBadge}>
                  {reason}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}