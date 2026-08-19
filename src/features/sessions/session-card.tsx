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
    <article className="flex h-full max-w-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <Badge>Session</Badge>
        <Badge className="border-[#992bff]/35 bg-[#992bff]/10 text-[#d8b4fe]">
          {item.modeName}
        </Badge>
        {item.status !== "published" ? (
          <Badge>{item.status.replaceAll("_", " ")}</Badge>
        ) : null}
        <Badge>{remaining === 0 ? "Full" : `${remaining} spots left`}</Badge>
      </div>

<h2 className="mt-5 min-w-0 max-w-full text-2xl font-bold text-white break-words">
  <Link
    className="block max-w-full break-all rounded-sm underline decoration-neutral-700 underline-offset-4 hover:decoration-red-500"
    href={`/home/sessions/${item.id}`}
  >
    {item.title}
  </Link>
</h2>

<p className="mt-3 min-w-0 max-w-full flex-1 text-sm leading-6 break-words text-neutral-400">
  {item.summary}
</p>

<p className="mt-4 min-w-0 max-w-full text-xs font-bold tracking-wide break-words text-neutral-500 uppercase">
  Hosted by {item.host_display_name}
</p>

      <dl className="mt-6 grid min-w-0 grid-cols-1 gap-3 text-sm text-neutral-300 sm:grid-cols-2">
        <div className="flex justify-center gap-2 sm:justify-start">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#992bff]"
          />
          <div>
            <dt className="sr-only">Starts</dt>
            <dd>{formatSessionDate(item.starts_at, item.timezone)}</dd>
          </div>
        </div>
        <div className="flex justify-center gap-2 sm:justify-start">
          <Clock3
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#992bff]"
          />
          <div>
            <dt className="sr-only">Duration</dt>
            <dd>
              {duration >= 60 ? `${duration / 60} hr` : `${duration} min`}
            </dd>
          </div>
        </div>
        <div className="flex justify-center gap-2 sm:justify-start">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#992bff]"
          />
          <div>
            <dt className="sr-only">Format and Location</dt>
            <dd>
              {formatSessionFormat(item.format)}
              {item.location_label ? ` · ${item.location_label}` : ""}
            </dd>
          </div>
        </div>
        <div className="flex justify-center gap-2 sm:justify-start">
          <Users
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-[#992bff]"
          />{" "}
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
          className="mt-5 flex w-full min-w-0 flex-wrap justify-center gap-2 sm:justify-start"
        >
          {item.interestNames.map((interest) => (
            <li key={interest}>
              <Badge className="max-w-full text-center break-words whitespace-normal">
                {interest}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {item.reasons?.length ? (
        <div className="mt-5 border-t border-[#f359d2]/15 pt-5">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <p className="flex items-center justify-center gap-2 text-xs font-bold tracking-wide text-[#f359d2] uppercase sm:justify-start">
              <Zap aria-hidden="true" className="size-4 text-[#f359d2]" />
              Your Signal Sync
            </p>

            {item.fit ? (
              <p className="mt-2 text-xs font-bold text-neutral-500 capitalize">
                {item.fit} Match
              </p>
            ) : null}

            <ul
              aria-label="Why This Syncs With Your Pulse"
              className="mt-3 flex w-full min-w-0 flex-wrap justify-center gap-2 sm:justify-start"
            >
              {item.reasons.slice(0, 3).map((reason) => (
                <li key={reason}>
                  <Badge className="max-w-full border-[#f359d2]/30 bg-[#f359d2]/[0.08] text-center leading-5 break-words whitespace-normal text-[#ffc2ef]">
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
