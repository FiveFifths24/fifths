import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PlatformModule } from "@/config/modules";
import { cn } from "@/lib/cn";

const moduleStyles = {
  pulse: {
    color: "#1800ad",
    border: "border-[#1800ad]/70",
    icon: "border-[#1800ad]/65 bg-[#1800ad]/10 text-[#695cff]",
    glow: "bg-[#1800ad]/30",
    arrow:
      "border-[#1800ad]/70 bg-black/65 text-[#695cff] shadow-[0_0_22px_rgba(24,0,173,0.35)] hover:bg-[#1800ad]/20",
    shadow:
      "shadow-[0_18px_55px_rgba(24,0,173,0.12)] md:hover:shadow-[0_24px_75px_rgba(24,0,173,0.25)]",
  },

  sessions: {
    color: "#4c1e92",
    border: "border-[#4c1e92]/70",
    icon: "border-[#4c1e92]/65 bg-[#4c1e92]/10 text-[#9d72df]",
    glow: "bg-[#4c1e92]/30",
    arrow:
      "border-[#4c1e92]/70 bg-black/65 text-[#9d72df] shadow-[0_0_22px_rgba(76,30,146,0.35)] hover:bg-[#4c1e92]/20",
    shadow:
      "shadow-[0_18px_55px_rgba(76,30,146,0.12)] md:hover:shadow-[0_24px_75px_rgba(76,30,146,0.25)]",
  },

  circles: {
    color: "#f359d2",
    border: "border-[#f359d2]/65",
    icon: "border-[#f359d2]/60 bg-[#f359d2]/10 text-[#f359d2]",
    glow: "bg-[#f359d2]/25",
    arrow:
      "border-[#f359d2]/70 bg-black/65 text-[#f359d2] shadow-[0_0_22px_rgba(243,89,210,0.32)] hover:bg-[#f359d2]/15",
    shadow:
      "shadow-[0_18px_55px_rgba(243,89,210,0.12)] md:hover:shadow-[0_24px_75px_rgba(243,89,210,0.24)]",
  },

  commons: {
    color: "#ffffff",
    border: "border-white/35",
    icon: "border-white/35 bg-white/[0.06] text-white",
    glow: "bg-white/10",
    arrow:
      "border-white/40 bg-black/65 text-white shadow-[0_0_22px_rgba(255,255,255,0.18)] hover:bg-white/10",
    shadow:
      "shadow-[0_18px_55px_rgba(255,255,255,0.05)] md:hover:shadow-[0_24px_75px_rgba(255,255,255,0.12)]",
  },

  realm: {
    color: "#22d3ee",
    border: "border-[#22d3ee]/60",
    icon: "border-[#22d3ee]/55 bg-[#22d3ee]/10 text-[#22d3ee]",
    glow: "bg-[#22d3ee]/22",
    arrow:
      "border-[#22d3ee]/65 bg-black/65 text-[#22d3ee] shadow-[0_0_22px_rgba(34,211,238,0.28)] hover:bg-[#22d3ee]/15",
    shadow:
      "shadow-[0_18px_55px_rgba(34,211,238,0.10)] md:hover:shadow-[0_24px_75px_rgba(34,211,238,0.22)]",
  },

  passport: {
    color: "#7cff00",
    border: "border-[#7cff00]/55",
    icon: "border-[#7cff00]/50 bg-[#7cff00]/10 text-[#7cff00]",
    glow: "bg-[#7cff00]/18",
    arrow:
      "border-[#7cff00]/60 bg-black/65 text-[#7cff00] shadow-[0_0_22px_rgba(124,255,0,0.25)] hover:bg-[#7cff00]/15",
    shadow:
      "shadow-[0_18px_55px_rgba(124,255,0,0.10)] md:hover:shadow-[0_24px_75px_rgba(124,255,0,0.20)]",
  },
} satisfies Record<
  PlatformModule["slug"],
  {
    color: string;
    border: string;
    icon: string;
    glow: string;
    arrow: string;
    shadow: string;
  }
>;

export function ModuleCard({
  module,
}: {
  module: PlatformModule;
  index: number;
}) {
  const Icon = module.icon;
  const styles = moduleStyles[module.slug];

  return (
    <article
      className={cn(
        "group relative min-h-[12.5rem] overflow-hidden rounded-[2rem] border bg-[#08070e]/90 p-6 transition-all duration-300 md:min-h-[14rem] md:p-8 md:hover:-translate-y-1",
        styles.border,
        styles.shadow,
      )}
    >
      {/* Background color glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-28 -bottom-28 size-80 rounded-full opacity-45 blur-[100px]",
          styles.glow,
        )}
      />

      {/* Module artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden transition-transform duration-700 md:group-hover:scale-[1.025]"
      >
        <Image
          alt=""
          className="object-cover object-right opacity-55"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          src={module.artwork}
        />
      </div>

      {/* Dark overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08070e] via-[#08070e]/90 to-[#08070e]/20"
      />

      {/* Card content */}
      <div className="relative z-10 flex h-full flex-col">
        <div
          className={cn(
            "inline-flex size-12 items-center justify-center rounded-xl border md:size-14 md:rounded-2xl",
            styles.icon,
          )}
        >
          <Icon aria-hidden="true" className="size-5 md:size-6" />
        </div>

        <h3
          className="display-type mt-6 text-3xl md:text-4xl"
          style={{
            color: styles.color,
          }}
        >
          {module.name}
        </h3>

        <p className="mt-3 max-w-sm text-sm leading-7 text-white/50 md:text-base">
          {module.summary}
        </p>
      </div>

      <Link
        aria-label={`Explore ${module.name}`}
        className={cn(
          "absolute top-5 right-5 z-20 inline-flex size-10 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 md:top-8 md:right-8 md:size-11 md:group-hover:translate-x-1",
          styles.arrow,
        )}
        href={module.memberHref ?? "/ecosystem"}
      >
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}
