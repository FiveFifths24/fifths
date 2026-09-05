import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  Gamepad2,
  HeartHandshake,
  MapPin,
  MessagesSquare,
  Users,
} from "lucide-react";

export type CampaignResultCardProps = {
  href: string;
  title: string;
  summary?: string | null;
  genre: string;
  format: string;
  location?: string | null;
  schedule: string;
  deadline: string;
  capacity: number;
  activePlayers: number;
  experienceLevel: string;
};

export function CampaignResultCard({
  href,
  title,
  summary,
  genre,
  format,
  location,
  schedule,
  deadline,
  capacity,
  activePlayers,
  experienceLevel,
}: CampaignResultCardProps) {
  const openings = Math.max(0, capacity - activePlayers);

  return (
    <Link
      className="group relative flex h-full min-h-[16rem] max-w-full min-w-0 flex-col items-center overflow-hidden rounded-[1.5rem] border border-[#22d3ee]/20 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_36%),linear-gradient(145deg,rgba(8,145,178,0.06),rgba(0,0,0,0.92))] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#22d3ee]/45 hover:shadow-[0_20px_55px_rgba(34,211,238,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22d3ee] motion-reduce:transform-none"
      href={href}
    >
      <ArrowUpRight
        aria-hidden="true"
        className="absolute top-5 right-5 size-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#22d3ee]"
      />

      <div className="flex items-center justify-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-xl border border-[#22d3ee]/25 bg-[#22d3ee]/10">
          <Gamepad2 aria-hidden="true" className="size-4 text-[#67e8f9]" />
        </div>

        <div>
          <p className="text-[0.62rem] font-black tracking-[0.18em] text-[#22d3ee] uppercase">
            Fifth Realm
          </p>
          <p className="text-xs font-bold text-white/35 capitalize">
            {genre.replaceAll("_", " ")}
          </p>
        </div>
      </div>

      <h3 className="mt-5 max-w-full px-6 text-xl font-bold [overflow-wrap:anywhere] break-words text-white transition group-hover:text-[#cffafe]">
        {title}
      </h3>

      {summary ? (
        <p className="mt-2 line-clamp-2 max-w-full text-sm leading-6 [overflow-wrap:anywhere] break-words text-white/50">
          {summary}
        </p>
      ) : null}

      <div className="mt-5 grid justify-items-center gap-2 text-xs text-white/50">
        <p className="flex items-center justify-center gap-2 text-center">
          <Clock3
            aria-hidden="true"
            className="size-3.5 shrink-0 text-[#22d3ee]"
          />
          <span className="line-clamp-1">{schedule}</span>
        </p>

        <p className="flex items-center justify-center gap-2 text-center">
          <MapPin
            aria-hidden="true"
            className="size-3.5 shrink-0 text-[#22d3ee]"
          />
          <span className="max-w-full [overflow-wrap:anywhere] break-words capitalize">
            {format.replaceAll("_", " ")}
            {location ? ` · ${location}` : ""}
          </span>
        </p>

        <p className="flex items-center justify-center gap-2 text-center">
          <Users
            aria-hidden="true"
            className="size-3.5 shrink-0 text-[#22d3ee]"
          />
          <span>
            {openings} {openings === 1 ? "seat" : "seats"} open ·{" "}
            <span className="capitalize">
              {experienceLevel.replaceAll("_", " ")}
            </span>
          </span>
        </p>
      </div>

      <div className="mt-auto w-full pt-5 text-center">
        <div className="border-t border-[#22d3ee]/10 pt-4">
          <p className="text-[0.68rem] font-black tracking-[0.14em] text-[#22d3ee]/70 uppercase">
            Apply by {new Date(deadline).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
export type CircleResultCardProps = {
  href: string;
  name: string;
  summary?: string | null;
  format: string;
  location?: string | null;
  joinPolicy: string;
};

export function CircleResultCard({
  href,
  name,
  summary,
  format,
  location,
  joinPolicy,
}: CircleResultCardProps) {
  const membershipLabel =
    joinPolicy === "open"
      ? "Open Membership"
      : joinPolicy === "request"
        ? "Request To Join"
        : "Invite Only";

  return (
    <Link
      className="group relative flex h-full min-h-[16rem] max-w-full min-w-0 flex-col items-center overflow-hidden rounded-[1.5rem] border border-[#ee54a7]/20 bg-[radial-gradient(circle_at_top_right,rgba(238,84,167,0.11),transparent_38%),linear-gradient(145deg,rgba(108,20,206,0.07),rgba(0,0,0,0.92))] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#ee54a7]/45 hover:shadow-[0_20px_55px_rgba(238,84,167,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ee54a7] motion-reduce:transform-none"
      href={href}
    >
      <ArrowUpRight
        aria-hidden="true"
        className="absolute top-5 right-5 size-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ee54a7]"
      />

      <div className="flex size-10 items-center justify-center rounded-xl border border-[#ee54a7]/25 bg-[#ee54a7]/10">
        <MessagesSquare aria-hidden="true" className="size-5 text-[#ee54a7]" />
      </div>

      <p className="mt-3 text-[0.62rem] font-black tracking-[0.18em] text-[#ee54a7] uppercase">
        Circle
      </p>

      <h3 className="mt-5 max-w-full px-6 text-xl font-bold [overflow-wrap:anywhere] break-words text-white transition group-hover:text-[#ffd0eb]">
        {name}
      </h3>

      {summary ? (
        <p className="mt-3 line-clamp-2 max-w-full text-sm leading-6 [overflow-wrap:anywhere] break-words text-white/50">
          {summary}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="rounded-full border border-[#ee54a7]/15 bg-[#ee54a7]/[0.06] px-3 py-1.5 text-xs font-bold text-white/55 capitalize">
          {format.replaceAll("_", " ")}
        </span>

        <span className="rounded-full border border-[#ee54a7]/15 bg-[#ee54a7]/[0.06] px-3 py-1.5 text-xs font-bold text-white/55">
          {membershipLabel}
        </span>

        {location ? (
          <span className="max-w-full rounded-full border border-[#ee54a7]/15 bg-[#ee54a7]/[0.06] px-3 py-1.5 text-xs font-bold [overflow-wrap:anywhere] break-words text-white/55">
            {location}
          </span>
        ) : null}
      </div>

      <div className="mt-auto w-full pt-5">
        <div className="border-t border-[#ee54a7]/10 pt-4">
          <span className="text-[0.68rem] font-black tracking-[0.15em] text-[#ee54a7]/75 uppercase transition group-hover:text-[#ee54a7]">
            Enter Circle
          </span>
        </div>
      </div>
    </Link>
  );
}
export type CommonsResultCardProps = {
  href: string;
  title: string;
  summary?: string | null;
  creatorName: string;
  kind: string;
  isPaid: boolean;
  format: string;
  location?: string | null;
  deadline: string;
  positions: number;
  acceptedCount: number;
};

export function CommonsResultCard({
  href,
  title,
  summary,
  creatorName,
  kind,
  isPaid,
  format,
  location,
  deadline,
  positions,
  acceptedCount,
}: CommonsResultCardProps) {
  const openings = Math.max(0, positions - acceptedCount);

  return (
    <Link
      className="group relative flex h-full min-h-[16rem] max-w-full min-w-0 flex-col items-center overflow-hidden rounded-[1.5rem] border border-[#ca9aff]/20 bg-[radial-gradient(circle_at_top_right,rgba(202,154,255,0.12),transparent_38%),linear-gradient(145deg,rgba(108,20,206,0.08),rgba(0,0,0,0.92))] p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-[#ca9aff]/45 hover:shadow-[0_20px_55px_rgba(202,154,255,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ca9aff] motion-reduce:transform-none"
      href={href}
    >
      <ArrowUpRight
        aria-hidden="true"
        className="absolute top-5 right-5 size-4 text-white/25 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ca9aff]"
      />

      <div className="flex size-10 items-center justify-center rounded-xl border border-[#ca9aff]/25 bg-[#ca9aff]/10">
        <BriefcaseBusiness
          aria-hidden="true"
          className="size-5 text-[#ca9aff]"
        />
      </div>

      <p className="mt-3 text-[0.62rem] font-black tracking-[0.18em] text-[#ca9aff] uppercase">
        Creator Commons
      </p>

      <p className="mt-1 text-xs font-bold text-white/35 capitalize">
        {kind.replaceAll("_", " ")}
      </p>

      <h3 className="mt-4 max-w-full px-6 text-xl font-bold [overflow-wrap:anywhere] break-words text-white transition group-hover:text-[#ead7ff]">
        {title}
      </h3>

      {summary ? (
        <p className="mt-3 line-clamp-2 max-w-full text-sm leading-6 [overflow-wrap:anywhere] break-words text-white/50">
          {summary}
        </p>
      ) : null}

      <p className="mt-3 max-w-full text-xs font-bold [overflow-wrap:anywhere] break-words text-white/30">
        Created by {creatorName}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <span className="rounded-full border border-[#ca9aff]/15 bg-[#ca9aff]/[0.06] px-3 py-1.5 text-xs font-bold text-white/55 capitalize">
          {format.replaceAll("_", " ")}
          {location ? ` · ${location}` : ""}
        </span>

        <span className="flex items-center gap-1.5 rounded-full border border-[#ca9aff]/15 bg-[#ca9aff]/[0.06] px-3 py-1.5 text-xs font-bold text-white/55">
          {isPaid ? (
            <CircleDollarSign
              aria-hidden="true"
              className="size-3.5 text-[#ca9aff]"
            />
          ) : (
            <HeartHandshake
              aria-hidden="true"
              className="size-3.5 text-[#ca9aff]"
            />
          )}
          {isPaid ? "Paid" : "Community"}
        </span>

        <span className="rounded-full border border-[#ca9aff]/15 bg-[#ca9aff]/[0.06] px-3 py-1.5 text-xs font-bold text-white/55">
          {openings} {openings === 1 ? "opening" : "openings"}
        </span>
      </div>

      <div className="mt-auto w-full pt-5">
        <div className="border-t border-[#ca9aff]/10 pt-4">
          <p className="text-[0.68rem] font-black tracking-[0.14em] text-[#ca9aff]/75 uppercase">
            Respond by {new Date(deadline).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
