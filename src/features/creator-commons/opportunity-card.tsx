import Link from "next/link";
import {
  Bookmark,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RankedRecommendation } from "@/lib/recommendations/types";
import type { CreatorOpportunity, OpportunityResponse } from "@/types/database";

export type OpportunityCardItem = Pick<
  CreatorOpportunity,
  | "id"
  | "title"
  | "summary"
  | "creator_display_name"
  | "kind"
  | "status"
  | "format"
  | "location_label"
  | "response_deadline"
  | "timezone"
  | "estimated_minutes"
  | "positions"
  | "accepted_count"
  | "minimum_energy"
  | "maximum_energy"
  | "stimulation_level"
  | "social_intensity"
> & {
  modeName: string;
  skillNames: string[];
  interestNames: string[];
  reasons?: RankedRecommendation["reasons"];
  fit?: RankedRecommendation["fit"];
  saved?: boolean;
  responseStatus?: OpportunityResponse["status"];
};

export function formatOpportunityKind(kind: CreatorOpportunity["kind"]) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function formatOpportunityFormat(format: CreatorOpportunity["format"]) {
  if (format === "in_person") return "In person";
  if (format === "online") return "Online";
  return "Hybrid";
}

export function formatOpportunityDeadline(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(new Date(value));
}

export function OpportunityCard({ item }: { item: OpportunityCardItem }) {
  const openings = Math.max(0, item.positions - item.accepted_count);

  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-amber-950/80 bg-neutral-900 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Creator Commons</Badge>
        <Badge className="border-amber-900 bg-amber-950/40 text-amber-100">
          {item.modeName}
        </Badge>
        <Badge>{formatOpportunityKind(item.kind)}</Badge>
        <Badge>{openings === 1 ? "1 opening" : `${openings} openings`}</Badge>
        {item.saved ? (
          <Badge className="flex items-center gap-1.5">
            <Bookmark aria-hidden="true" className="size-3" /> Saved
          </Badge>
        ) : null}
        {item.responseStatus ? (
          <Badge className="capitalize">{item.responseStatus}</Badge>
        ) : null}
        {item.status !== "published" ? <Badge>{item.status}</Badge> : null}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-white">
        <Link
          className="rounded-sm underline decoration-neutral-700 underline-offset-4 hover:decoration-amber-400"
          href={`/home/commons/${item.id}`}
        >
          {item.title}
        </Link>
      </h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-neutral-400">
        {item.summary}
      </p>
      <p className="mt-4 text-xs font-bold tracking-wide text-neutral-500 uppercase">
        Created by {item.creator_display_name}
      </p>

      <dl className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
        <div className="flex gap-2">
          <Clock3
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-amber-300"
          />
          <div>
            <dt className="sr-only">Response deadline</dt>
            <dd>
              Respond by{" "}
              {formatOpportunityDeadline(item.response_deadline, item.timezone)}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-amber-300"
          />
          <div>
            <dt className="sr-only">Format and location</dt>
            <dd>
              {formatOpportunityFormat(item.format)}
              {item.location_label ? ` · ${item.location_label}` : ""}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <BriefcaseBusiness
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-amber-300"
          />
          <div>
            <dt className="sr-only">Skills</dt>
            <dd>
              {item.skillNames.slice(0, 2).join(" · ") || "Creator skills"}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Users
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-amber-300"
          />
          <div>
            <dt className="sr-only">Commitment and social pace</dt>
            <dd>
              About {item.estimated_minutes} min ·{" "}
              {item.social_intensity.replaceAll("_", " ")}
            </dd>
          </div>
        </div>
      </dl>

      {item.reasons?.length ? (
        <div className="mt-5 border-t border-neutral-800 pt-5">
          <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-amber-200 uppercase">
            <Zap aria-hidden="true" className="size-4" />
            {item.fit ? `${item.fit} fit · ` : ""}Why this may fit
          </p>
          <ul
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Why this matches your Pulse"
          >
            {item.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>
                <Badge className="border-amber-900 bg-amber-950/30 text-amber-100">
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
