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
    <article className="group flex h-full max-w-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#992bff]/20 bg-[linear-gradient(145deg,rgba(153,43,255,0.05),rgba(12,12,14,0.96)_42%,rgba(0,0,0,0.96))] p-6 text-center shadow-[0_0_40px_rgba(153,43,255,0.03)] transition hover:border-[#992bff]/40 hover:shadow-[0_0_45px_rgba(153,43,255,0.06)] sm:text-left">
      <div>
        <p className="text-[0.68rem] font-black tracking-[0.2em] text-[#c084fc] uppercase">
          Session
        </p>

        <h2 className="mt-3 min-w-0 text-2xl font-bold [overflow-wrap:anywhere] break-words text-white">
          <Link
            className="rounded-sm underline decoration-[#992bff]/25 underline-offset-4 transition hover:text-[#e9d5ff] hover:decoration-[#992bff]"
            href={`/home/sessions/${item.id}`}
          >
            {item.title}
          </Link>
        </h2>

        <p className="mt-3 min-w-0 text-sm leading-6 break-words text-white/45">
          {item.summary}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <Badge className="border-[#992bff]/30 bg-[#992bff]/10 text-[#d8b4fe]">
          {item.modeName}
        </Badge>

        <Badge className="border-[#992bff]/20 bg-black/30 text-white/60">
          {formatSessionFormat(item.format)}
        </Badge>

        {item.status !== "published" ? (
          <Badge className="capitalize">{item.status.replaceAll("_", " ")}</Badge>
        ) : null}

        <Badge className="border-[#992bff]/20 bg-black/30 text-white/60">
          {remaining === 0 ? "Full" : `${remaining} spots left`}
        </Badge>
      </div>

      <dl className="mt-6 grid min-w-0 grid-cols-1 gap-3 text-sm text-white/60 sm:grid-cols-2">
        <div className="flex justify-center gap-2 text-center sm:justify-start sm:text-left">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#c084fc]"
          />
          <div>
            <dt className="sr-only">Starts</dt>
            <dd>{formatSessionDate(item.starts_at, item.timezone)}</dd>
          </div>
        </div>

        <div className="flex justify-center gap-2 text-center sm:justify-start sm:text-left">
          <Clock3
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#c084fc]"
          />
          <div>
            <dt className="sr-only">Duration</dt>
            <dd>
              {duration >= 60 ? `${duration / 60} hr` : `${duration} min`}
            </dd>
          </div>
        </div>

        <div className="flex justify-center gap-2 text-center sm:justify-start sm:text-left">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#c084fc]"
          />
          <div>
            <dt className="sr-only">Location</dt>
            <dd>
              {item.location_label ??
                (item.format === "online" ? "Online" : "Location shared by host")}
            </dd>
          </div>
        </div>

        <div className="flex justify-center gap-2 text-center sm:justify-start sm:text-left">
          <Users
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#c084fc]"
          />
          <div>
            <dt className="sr-only">Host</dt>
            <dd className="break-words">
              Hosted by {item.host_display_name}
            </dd>
          </div>
        </div>
      </dl>

      {item.interestNames.length > 0 ? (
        <ul
          aria-label="Session interests"
          className="mt-5 flex w-full min-w-0 flex-wrap justify-center gap-2 sm:justify-start"
        >
          {item.interestNames.slice(0, 3).map((interest) => (
            <li key={interest}>
              <Badge className="max-w-full border-[#992bff]/20 bg-[#992bff]/[0.06] text-center break-words whitespace-normal text-[#d8b4fe]">
                {interest}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {item.reasons?.length ? (
        <div className="mt-6 border-t border-[#992bff]/15 pt-5">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.14em] text-[#c084fc] uppercase sm:justify-start">
              <Zap aria-hidden="true" className="size-4" />
              Your Signal Sync
            </p>

            {item.fit ? (
              <p className="mt-2 text-xs font-bold text-white/40 capitalize">
                {item.fit} Match
              </p>
            ) : null}

            <ul
              aria-label="Why This Syncs With Your Pulse"
              className="mt-3 flex w-full min-w-0 flex-wrap justify-center gap-2 sm:justify-start"
            >
              {item.reasons.slice(0, 3).map((reason) => (
                <li key={reason}>
                  <Badge className="max-w-full border-[#992bff]/30 bg-[#992bff]/10 text-center leading-5 break-words whitespace-normal text-[#e9d5ff]">
                    {reason}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </article>
  );
}