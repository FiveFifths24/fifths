import { Clock3, Gauge, MapPin, Users } from "lucide-react";
import type { PulseCheckIn } from "@/types/database";

export type PulseHistoryItem = Pick<
  PulseCheckIn,
  | "id"
  | "energy_level"
  | "stimulation_level"
  | "social_intensity"
  | "preferred_format"
  | "available_minutes"
  | "maximum_travel_miles"
  | "created_at"
  | "expires_at"
> & { modeName: string };

function readable(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PulseHistoryList({ items }: { items: PulseHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-700 bg-neutral-950/70 p-7 text-center sm:p-10">
        <h2 className="text-xl font-bold text-white">No Pulse history yet</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-400">
          Your private timeline will begin after your first check-in. No sample
          activity is shown here.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-4" aria-label="Private Pulse history">
      {items.map((item) => {
        return (
          <li
            className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6"
            key={item.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">
                    {item.modeName}
                  </h2>
                  <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-bold text-neutral-300">
                    Matching until {formatDate(item.expires_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-neutral-500">
                  Checked in {formatDate(item.created_at)}
                </p>
              </div>
              <div className="rounded-full bg-red-950/50 px-4 py-2 text-sm font-bold text-red-200">
                Energy {item.energy_level}/5
              </div>
            </div>

            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-neutral-950 p-4">
                <dt className="flex items-center gap-2 text-neutral-500">
                  <Gauge aria-hidden="true" className="size-4" /> Stimulation
                </dt>
                <dd className="mt-2 font-bold text-white capitalize">
                  {readable(item.stimulation_level)}
                </dd>
              </div>
              <div className="rounded-2xl bg-neutral-950 p-4">
                <dt className="flex items-center gap-2 text-neutral-500">
                  <Users aria-hidden="true" className="size-4" /> Social
                </dt>
                <dd className="mt-2 font-bold text-white capitalize">
                  {readable(item.social_intensity)}
                </dd>
              </div>
              <div className="rounded-2xl bg-neutral-950 p-4">
                <dt className="flex items-center gap-2 text-neutral-500">
                  <Clock3 aria-hidden="true" className="size-4" /> Time
                </dt>
                <dd className="mt-2 font-bold text-white">
                  {item.available_minutes >= 60
                    ? `${item.available_minutes / 60} hr`
                    : `${item.available_minutes} min`}
                </dd>
              </div>
              <div className="rounded-2xl bg-neutral-950 p-4">
                <dt className="flex items-center gap-2 text-neutral-500">
                  <MapPin aria-hidden="true" className="size-4" /> Format
                </dt>
                <dd className="mt-2 font-bold text-white capitalize">
                  {readable(item.preferred_format)}
                  {item.maximum_travel_miles
                    ? ` · ${item.maximum_travel_miles} mi`
                    : ""}
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ol>
  );
}
