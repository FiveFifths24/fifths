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
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(145deg,rgba(153,43,255,0.07),rgba(10,10,14,0.96)_32%,rgba(5,5,8,0.98))] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#992bff]/40 sm:text-left">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#992bff]/65 to-transparent" />

      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <Badge className="border-[#992bff]/30 bg-[#992bff]/10 text-[#d8b4fe]">
          Session
        </Badge>

        <Badge className="border-white/10 bg-white/[0.035] text-white/55">
          {item.modeName}
        </Badge>

        <Badge className="border-[#f359d2]/20 bg-[#f359d2]/[0.06] text-[#ffc2ef]">
          {remaining === 0 ? "Full" : `${remaining} spots left`}
        </Badge>
      </div>

      <div className="mt-5">
        <p className="text-[0.6rem] font-black tracking-[0.16em] text-white/30 uppercase">
          Hosted by {item.host_display_name}
        </p>

        <h3 className="mt-2 min-w-0 text-xl font-black tracking-tight text-white">
          <Link
            className="block [overflow-wrap:anywhere] break-words transition group-hover:text-[#e7c7ff]"
            href={`/home/sessions/${item.id}`}
          >
            {item.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 min-w-0 text-sm leading-6 text-white/45">
          {item.summary}
        </p>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-start justify-center gap-2 text-white/65 sm:justify-start">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#992bff]"
          />
          <div className="min-w-0">
            <dt className="sr-only">Starts</dt>
            <dd className="leading-5">
              {formatSessionDate(item.starts_at, item.timezone)}
            </dd>
          </div>
        </div>

        <div className="flex items-start justify-center gap-2 text-white/65 sm:justify-start">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#f359d2]"
          />
          <div className="min-w-0">
            <dt className="sr-only">Format and location</dt>
            <dd className="line-clamp-2 leading-5">
              {formatSessionFormat(item.format)}
              {item.location_label ? ` · ${item.location_label}` : ""}
            </dd>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-white/55 sm:justify-start">
            <Clock3
              aria-hidden="true"
              className="size-3.5 shrink-0 text-[#992bff]"
            />
            <div>
              <dt className="sr-only">Duration</dt>
              <dd>
                {duration >= 60 ? `${duration / 60} hr` : `${duration} min`}
              </dd>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5 text-white/55 sm:justify-start">
            <Users
              aria-hidden="true"
              className="size-3.5 shrink-0 text-[#f359d2]"
            />
            <div className="min-w-0">
              <dt className="sr-only">Social pace</dt>
              <dd className="truncate capitalize">
                {item.social_intensity.replaceAll("_", " ")}
              </dd>
            </div>
          </div>
        </div>
      </dl>

      {item.interestNames.length ? (
        <ul
          aria-label="Session interests"
          className="mt-4 flex min-w-0 flex-wrap justify-center gap-2 sm:justify-start"
        >
          {item.interestNames.slice(0, 3).map((interest) => (
            <li key={interest}>
              <Badge className="max-w-full border-[#992bff]/20 bg-[#992bff]/[0.05] text-center break-words whitespace-normal text-[#d8b4fe]">
                {interest}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {item.reasons?.length ? (
        <div className="mt-4 border-t border-[#f359d2]/15 pt-4">
          <p className="flex items-center justify-center gap-2 text-[0.65rem] font-black tracking-[0.14em] text-[#f359d2] uppercase sm:justify-start">
            <Zap aria-hidden="true" className="size-3.5" />
            Your Signal Sync
          </p>

          <ul className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {item.reasons.slice(0, 2).map((reason) => (
              <li key={reason}>
                <Badge className="border-[#f359d2]/20 bg-[#f359d2]/[0.06] text-[#ffc2ef]">
                  {reason}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <Link
          className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[#992bff]/25 bg-[#992bff]/[0.07] px-4 text-sm font-black text-[#e7c7ff] transition hover:border-[#992bff]/50 hover:bg-[#992bff]/15"
          href={`/home/sessions/${item.id}`}
        >
          View Session
        </Link>
      </div>
    </article>
  );
}
