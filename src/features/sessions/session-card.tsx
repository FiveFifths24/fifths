import Link from "next/link";
import { CalendarDays, Clock3, MapPin, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RankedRecommendation } from "@/lib/recommendations/types";
import type { Session } from "@/types/database";

export type SessionCardItem = Pick<
  Session,
  | "id"
  | "title"
  | "summary"
  | "host_display_name"
  | "status"
  | "format"
  | "starts_at"
  | "ends_at"
  | "timezone"
  | "capacity"
  | "confirmed_registration_count"
  | "location_label"
  | "minimum_energy"
  | "maximum_energy"
  | "stimulation_level"
  | "social_intensity"
> & {
  modeName: string;
  interestNames: string[];
  reasons?: RankedRecommendation["reasons"];
  fit?: RankedRecommendation["fit"];
};

export function formatSessionDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(new Date(value));
}

export function formatSessionFormat(format: Session["format"]) {
  if (format === "in_person") return "In person";
  if (format === "online") return "Online";
  return "Hybrid";
}

function durationMinutes(startsAt: string, endsAt: string) {
  return Math.max(
    0,
    Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 60_000),
  );
}

export function SessionCard({ item }: { item: SessionCardItem }) {
  const remaining = Math.max(
    0,
    item.capacity - item.confirmed_registration_count,
  );
  const duration = durationMinutes(item.starts_at, item.ends_at);

  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Session</Badge>
        <Badge className="border-red-900 bg-red-950/40 text-red-200">
          {item.modeName}
        </Badge>
        {item.status !== "published" ? (
          <Badge>{item.status.replaceAll("_", " ")}</Badge>
        ) : null}
        <Badge>{remaining === 0 ? "Full" : `${remaining} spots left`}</Badge>
      </div>

      <h2 className="mt-5 text-2xl font-bold text-white">
        <Link
          className="rounded-sm underline decoration-neutral-700 underline-offset-4 hover:decoration-red-500"
          href={`/home/sessions/${item.id}`}
        >
          {item.title}
        </Link>
      </h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-neutral-400">
        {item.summary}
      </p>
      <p className="mt-4 text-xs font-bold tracking-wide text-neutral-500 uppercase">
        Hosted by {item.host_display_name}
      </p>

      <dl className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
        <div className="flex gap-2">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-red-400"
          />
          <div>
            <dt className="sr-only">Starts</dt>
            <dd>{formatSessionDate(item.starts_at, item.timezone)}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Clock3
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-red-400"
          />
          <div>
            <dt className="sr-only">Duration</dt>
            <dd>
              {duration >= 60 ? `${duration / 60} hr` : `${duration} min`}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-red-400"
          />
          <div>
            <dt className="sr-only">Format and location</dt>
            <dd>
              {formatSessionFormat(item.format)}
              {item.location_label ? ` · ${item.location_label}` : ""}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Users
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-red-400"
          />
          <div>
            <dt className="sr-only">Social pace and energy</dt>
            <dd>
              {item.social_intensity.replaceAll("_", " ")} · energy{" "}
              {item.minimum_energy}–{item.maximum_energy}
            </dd>
          </div>
        </div>
      </dl>

      {item.interestNames.length > 0 ? (
        <ul
          aria-label="Session interests"
          className="mt-5 flex flex-wrap gap-2"
        >
          {item.interestNames.map((interest) => (
            <li key={interest}>
              <Badge>{interest}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {item.reasons?.length ? (
        <div className="mt-5 border-t border-neutral-800 pt-5">
          <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-emerald-300 uppercase">
            <Zap aria-hidden="true" className="size-4" />
            {item.fit ? `${item.fit} fit · ` : ""}Why this may fit
          </p>
          <ul
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Why this matches your Pulse"
          >
            {item.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>
                <Badge className="border-emerald-900 bg-emerald-950/30 text-emerald-100">
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
