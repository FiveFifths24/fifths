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
  if (format === "in_person") return "In Person";
  if (format === "online") return "Online";
  return "Hybrid";
}

export function formatJoinPolicy(policy: Circle["join_policy"]) {
  if (policy === "open") return "Open Membership";
  if (policy === "request") return "Request To Join";
  return "Invite Only";
}

export function CircleCard({ item }: { item: CircleCardItem }) {
  const socialLabel =
    item.social_intensity === "solo"
      ? "Solo-Friendly"
      : item.social_intensity === "light"
        ? "Light"
        : "Social";

  return (
    <article className="group relative mx-auto flex h-full w-full max-w-none min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#ee54a7]/15 bg-white/[0.025] text-center transition duration-300 hover:border-[#ee54a7]/30 hover:bg-[#ee54a7]/[0.035] sm:text-left">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-[#ee54a7]/[0.045] blur-[90px] transition group-hover:bg-[#ee54a7]/[0.07]"
      />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        {/* =====================================================
            BADGES
        ====================================================== */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge>Circle</Badge>

          <Badge className="border-[#ee54a7]/30 bg-[#ee54a7]/[0.07] text-[#ffb4dc]">
            {item.modeName}
          </Badge>

          <Badge>{formatJoinPolicy(item.join_policy)}</Badge>

          {item.visibility === "private" ? (
            <Badge className="flex items-center gap-1.5">
              <LockKeyhole aria-hidden="true" className="size-3" />
              Private
            </Badge>
          ) : null}

          {item.status !== "published" ? (
            <Badge className="border-white/15 bg-white/[0.04] text-white/55 capitalize">
              {item.status}
            </Badge>
          ) : null}

          {item.membership ? (
            <Badge className="border-white/15 bg-white/[0.04] text-white/65 capitalize">
              {item.membership.status === "active"
                ? item.membership.role
                : item.membership.status}
            </Badge>
          ) : null}
        </div>

        {/* =====================================================
            IDENTITY
        ====================================================== */}
        <div className="mt-5 text-center">
          <h2 className="min-w-0 text-[1.4rem] font-bold text-white sm:text-2xl">
            <Link
              className="rounded-sm decoration-[#ee54a7]/40 underline-offset-4 transition hover:text-[#ffb4dc] hover:underline"
              href={`/home/circles/${item.id}`}
            >
              {item.name}
            </Link>
          </h2>

          <p className="mx-auto mt-2 max-w-2xl min-w-0 text-sm leading-6 text-white/55">
            {item.summary}
          </p>
        </div>

        {/* =====================================================
            PARTICIPATION SIGNALS
        ====================================================== */}
        <dl className="mx-auto mt-5 grid w-full max-w-none gap-3 sm:grid-cols-2">
          <div className="flex w-full min-w-0 justify-center rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
            <div className="flex flex-col items-center text-center">
              <MapPin aria-hidden="true" className="size-4 text-[#ff8bc9]" />

              <dt className="mt-1.5 text-[0.65rem] font-bold tracking-[0.12em] text-white/30 uppercase">
                Format
              </dt>

              <dd className="mt-1 text-sm leading-5 break-words text-white/75">
                {formatCircleFormat(item.format)}
                {item.location_label ? ` · ${item.location_label}` : ""}
              </dd>
            </div>
          </div>

          <div className="flex w-full min-w-0 justify-center rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
            <div className="flex flex-col items-center text-center">
              <UsersRound
                aria-hidden="true"
                className="size-4 text-[#ff8bc9]"
              />

              <dt className="mt-1.5 text-[0.65rem] font-bold tracking-[0.12em] text-white/30 uppercase">
                Social Pace
              </dt>

              <dd className="mt-1 text-sm leading-5 text-white/75">
                {socialLabel}
              </dd>
            </div>
          </div>

          <div className="flex w-full min-w-0 justify-center rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
            <div className="flex flex-col items-center text-center">
              <Zap aria-hidden="true" className="size-4 text-[#ff8bc9]" />

              <dt className="mt-1.5 text-[0.65rem] font-bold tracking-[0.12em] text-white/30 uppercase">
                Energy
              </dt>

              <dd className="mt-1 text-sm leading-5 text-white/75">
                {item.minimum_energy}–{item.maximum_energy}
                <span className="text-white/30"> · </span>
                <span className="capitalize">
                  {item.stimulation_level} Stimulation
                </span>
              </dd>
            </div>
          </div>

          <div className="flex w-full min-w-0 justify-center rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
            <div className="flex flex-col items-center text-center">
              <HeartHandshake
                aria-hidden="true"
                className="size-4 text-[#ff8bc9]"
              />

              <dt className="mt-1.5 text-[0.65rem] font-bold tracking-[0.12em] text-white/30 uppercase">
                Topic
              </dt>

              <dd className="mt-1 text-sm leading-5 break-words text-white/75">
                {item.interestNames.slice(0, 2).join(" · ") || "Shared Purpose"}
              </dd>
            </div>
          </div>
        </dl>

        {/* =====================================================
            SIGNAL SYNC
        ====================================================== */}
        {item.reasons?.length ? (
          <div className="mt-6 border-t border-[#ee54a7]/15 pt-5">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-[#ee54a7] uppercase">
                  <Zap aria-hidden="true" className="size-4" />
                  Your Signal Sync
                </p>

                {item.fit ? (
                  <span className="text-xs font-bold text-white/35 capitalize">
                    {item.fit} Match
                  </span>
                ) : null}
              </div>

              <ul
                aria-label="Why this syncs with your Pulse"
                className="mt-3 flex w-full flex-wrap justify-center gap-2 sm:justify-start"
              >
                {item.reasons.slice(0, 3).map((reason) => (
                  <li key={reason}>
                    <Badge className="border-[#ee54a7]/35 bg-[#ee54a7]/10 text-[#ffb4dc]">
                      {reason}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
