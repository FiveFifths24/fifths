import Link from "next/link";
import {
  HeartHandshake,
  LockKeyhole,
  MapPin,
  UsersRound,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RankedRecommendation } from "@/lib/recommendations/types";
import type { Circle, CircleMember } from "@/types/database";

export type CircleCardItem = Pick<
  Circle,
  | "id"
  | "name"
  | "summary"
  | "status"
  | "visibility"
  | "join_policy"
  | "format"
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
  membership?: Pick<CircleMember, "role" | "status">;
};

export function formatCircleFormat(format: Circle["format"]) {
  if (format === "in_person") return "In person";
  if (format === "online") return "Online";
  return "Hybrid";
}

export function formatJoinPolicy(policy: Circle["join_policy"]) {
  if (policy === "open") return "Open membership";
  if (policy === "request") return "Request to join";
  return "Invite only";
}

export function CircleCard({ item }: { item: CircleCardItem }) {
  return (
    <article className="flex h-full flex-col rounded-[1.75rem] border border-rose-950/70 bg-neutral-900 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>Circle</Badge>
        <Badge className="border-rose-900 bg-rose-950/40 text-rose-100">
          {item.modeName}
        </Badge>
        <Badge>{formatJoinPolicy(item.join_policy)}</Badge>
        {item.visibility === "private" ? (
          <Badge className="flex items-center gap-1.5">
            <LockKeyhole aria-hidden="true" className="size-3" /> Private
          </Badge>
        ) : null}
        {item.status !== "published" ? <Badge>{item.status}</Badge> : null}
        {item.membership ? (
          <Badge className="capitalize">
            {item.membership.status === "active"
              ? item.membership.role
              : item.membership.status}
          </Badge>
        ) : null}
      </div>

      <h2 className="mt-5 text-2xl font-bold text-white">
        <Link
          className="rounded-sm underline decoration-neutral-700 underline-offset-4 hover:decoration-rose-400"
          href={`/home/circles/${item.id}`}
        >
          {item.name}
        </Link>
      </h2>
      <p className="mt-3 flex-1 text-sm leading-6 text-neutral-400">
        {item.summary}
      </p>

      <dl className="mt-6 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
        <div className="flex gap-2">
          <MapPin
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-rose-300"
          />
          <div>
            <dt className="sr-only">Format and location</dt>
            <dd>
              {formatCircleFormat(item.format)}
              {item.location_label ? ` · ${item.location_label}` : ""}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <UsersRound
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-rose-300"
          />
          <div>
            <dt className="sr-only">Social pace</dt>
            <dd className="capitalize">
              {item.social_intensity === "solo"
                ? "Solo-friendly"
                : item.social_intensity}
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <Zap
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-rose-300"
          />
          <div>
            <dt className="sr-only">Energy</dt>
            <dd>
              Energy {item.minimum_energy}–{item.maximum_energy} ·{" "}
              {item.stimulation_level} stimulation
            </dd>
          </div>
        </div>
        <div className="flex gap-2">
          <HeartHandshake
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-rose-300"
          />
          <div>
            <dt className="sr-only">Interests</dt>
            <dd>
              {item.interestNames.slice(0, 2).join(" · ") || "Shared purpose"}
            </dd>
          </div>
        </div>
      </dl>

      {item.reasons?.length ? (
        <div className="mt-6 border-t border-neutral-800 pt-5">
          <p className="text-xs font-bold tracking-[0.14em] text-rose-300 uppercase">
            {item.fit ? `${item.fit} fit · ` : ""}Why it may fit
          </p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-300">
            {item.reasons.slice(0, 3).map((reason) => (
              <li className="flex gap-2" key={reason}>
                <span aria-hidden="true" className="text-rose-300">
                  •
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
