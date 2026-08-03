import {
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PassportEntry } from "@/types/database";
import { passportActivityLabels, passportModuleLabels } from "./passport-data";

export function formatPassportDate(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(value));
}

export function PassportEntryCard({
  entry,
  timezone,
}: {
  entry: PassportEntry;
  timezone: string;
}) {
  const verified = entry.status === "verified";
  const StatusIcon = verified ? BadgeCheck : CircleAlert;

  return (
    <article className="h-full rounded-[1.75rem] border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{passportModuleLabels[entry.source_module]}</Badge>
        <Badge
          className={
            verified
              ? "border-emerald-900 bg-emerald-950/30 text-emerald-100"
              : "border-amber-900 bg-amber-950/30 text-amber-100"
          }
        >
          <StatusIcon aria-hidden="true" className="mr-1 size-3" />
          {verified ? "Verified" : "Corrected"}
        </Badge>
      </div>

      <h2 className="mt-5 text-2xl font-bold text-white">
        {passportActivityLabels[entry.activity_kind]}
      </h2>
      <p className="mt-3 text-base leading-7 text-neutral-300">
        {entry.source_title}
      </p>

      <dl className="mt-6 grid gap-3 text-sm text-neutral-400">
        <div className="flex gap-2">
          <CalendarDays
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-emerald-300"
          />
          <div>
            <dt className="sr-only">Activity date</dt>
            <dd>{formatPassportDate(entry.occurred_at, timezone)}</dd>
          </div>
        </div>
        <div className="flex gap-2">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-emerald-300"
          />
          <div>
            <dt className="sr-only">Verification method</dt>
            <dd>
              Issued from an authorized{" "}
              {passportModuleLabels[entry.source_module]} workflow
            </dd>
          </div>
        </div>
      </dl>

      {!verified ? (
        <div className="mt-5 rounded-2xl border border-amber-900/70 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100">
          <p className="font-bold">
            This activity no longer counts as verified.
          </p>
          <p className="mt-1">{entry.revocation_reason}</p>
        </div>
      ) : null}
    </article>
  );
}
