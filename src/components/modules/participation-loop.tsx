import {
  Activity,
  BadgeCheck,
  Compass,
  HandHeart,
  Sparkles,
} from "lucide-react";

const steps = [
  [
    "Check your Pulse",
    "Name the energy, time, and connection you have room for.",
    Activity,
  ],
  [
    "Receive recommendations",
    "See relevant communities, opportunities, campaigns, and sessions.",
    Compass,
  ],
  [
    "Join an experience",
    "Choose participation that fits instead of forcing the wrong room.",
    Sparkles,
  ],
  [
    "Contribute",
    "Show up, host, volunteer, collaborate, or help a community move.",
    HandHeart,
  ],
  [
    "Build Passport activity",
    "Eligible participation becomes verified community history.",
    BadgeCheck,
  ],
] as const;

export function ParticipationLoop() {
  return (
    <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-800 lg:grid-cols-5">
      {steps.map(([title, description, Icon], index) => (
        <li className="relative bg-neutral-950 p-6 sm:p-7" key={title}>
          <div className="flex items-center justify-between">
            <Icon aria-hidden="true" className="size-5 text-red-400" />
            <span className="text-xs font-bold text-neutral-600">
              0{index + 1}
            </span>
          </div>
          <h3 className="mt-8 text-lg font-bold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {description}
          </p>
        </li>
      ))}
    </ol>
  );
}
