import Link from "next/link";
import { Clock3, Compass, MapPin, ShieldCheck, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RankedRecommendation } from "@/lib/recommendations/types";
import type { CampaignApplication, RealmCampaign } from "@/types/database";

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
  applicationStatus?: CampaignApplication["status"];
  isMember?: boolean;
};

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
  const openings = Math.max(0, item.player_capacity - item.active_player_count);
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-indigo-950 bg-neutral-900 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-indigo-900 bg-indigo-950/50 text-indigo-100">
          {item.modeName}
        </Badge>
        <Badge>{item.genre}</Badge>
        <Badge>
          {item.status === "recruiting"
            ? `${openings} ${openings === 1 ? "seat" : "seats"}`
            : item.status}
        </Badge>
        {item.applicationStatus ? (
          <Badge className="capitalize">
            Application: {item.applicationStatus}
          </Badge>
        ) : null}
        {item.isMember ? <Badge>Campaign member</Badge> : null}
      </div>
      <h2 className="mt-5 text-2xl font-bold text-white">
        <Link
          className="rounded-sm underline decoration-neutral-700 underline-offset-4 hover:decoration-indigo-400"
          href={`/home/realm/${item.id}`}
        >
          {item.title}
        </Link>
      </h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-neutral-400">
        {item.summary}
      </p>
      <p className="mt-4 text-xs font-bold tracking-wide text-neutral-500 uppercase">
        Game master {item.game_master_display_name}
      </p>
      <dl className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
        <div className="flex gap-2">
          <Clock3
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-indigo-300"
          />
          <div>
            <dt className="sr-only">Schedule</dt>
            <dd>{item.schedule_summary}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-indigo-300"
          />
          <div>
            <dt className="sr-only">Format</dt>
            <dd>
              {formatCampaignFormat(item.format)}
              {item.location_label ? ` · ${item.location_label}` : ""}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Compass
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-indigo-300"
          />
          <div>
            <dt className="sr-only">Tone</dt>
            <dd>{item.tone}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Users
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-indigo-300"
          />
          <div>
            <dt className="sr-only">Session length and experience</dt>
            <dd>
              About {item.estimated_session_minutes} min ·{" "}
              {item.experience_level}
            </dd>
          </div>
        </div>
      </dl>
      {item.status === "recruiting" ? (
        <p className="mt-5 flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck aria-hidden="true" className="size-4 text-indigo-300" />{" "}
          Apply by{" "}
          {formatCampaignDeadline(item.application_deadline, item.timezone)}
        </p>
      ) : null}
      {item.reasons?.length ? (
        <div className="mt-5 border-t border-neutral-800 pt-5">
          <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-indigo-200 uppercase">
            <Zap aria-hidden="true" className="size-4" /> Why this may fit
          </p>
          <ul
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Why this matches your Pulse"
          >
            {item.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>
                <Badge className="border-indigo-900 bg-indigo-950/40 text-indigo-100">
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
