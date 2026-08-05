import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PlatformModule } from "@/config/modules";
import { cn } from "@/lib/cn";

const moduleStyles = {
  pulse: {
    border: "border-[#665cff]/55",
    icon: "border-[#665cff]/40 bg-[#1800ad]/15 text-[#8f84ff]",
    glow: "bg-[#1800ad]/35",
    line: "from-[#665cff] to-[#f359d2]",
    arrow: "border-[#665cff]/60 text-[#8f84ff] hover:bg-[#665cff]/15",
  },
  circles: {
    border: "border-[#f359d2]/45",
    icon: "border-[#f359d2]/40 bg-[#f359d2]/10 text-[#ff79dc]",
    glow: "bg-[#f359d2]/25",
    line: "from-[#f359d2] to-[#9d46ec]",
    arrow: "border-[#f359d2]/60 text-[#ff79dc] hover:bg-[#f359d2]/15",
  },
  commons: {
    border: "border-[#22d3ee]/45",
    icon: "border-[#22d3ee]/40 bg-[#22d3ee]/10 text-[#4be8ff]",
    glow: "bg-[#22d3ee]/25",
    line: "from-[#22d3ee] to-[#6c14ce]",
    arrow: "border-[#22d3ee]/60 text-[#4be8ff] hover:bg-[#22d3ee]/15",
  },
  realm: {
    border: "border-[#9d46ec]/50",
    icon: "border-[#9d46ec]/40 bg-[#6c14ce]/15 text-[#bd7cff]",
    glow: "bg-[#6c14ce]/30",
    line: "from-[#6c14ce] to-[#f359d2]",
    arrow: "border-[#9d46ec]/60 text-[#bd7cff] hover:bg-[#6c14ce]/15",
  },
  passport: {
    border: "border-[#7cff00]/35",
    icon: "border-[#7cff00]/35 bg-[#7cff00]/10 text-[#a8ff55]",
    glow: "bg-[#7cff00]/20",
    line: "from-[#7cff00] to-[#22d3ee]",
    arrow: "border-[#7cff00]/55 text-[#a8ff55] hover:bg-[#7cff00]/10",
  },
} satisfies Record<
  PlatformModule["slug"],
  {
    border: string;
    icon: string;
    glow: string;
    line: string;
    arrow: string;
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
        "group relative min-h-[25rem] overflow-hidden rounded-[2rem] border bg-[#08070e] p-7 shadow-[0_18px_60px_rgb(0_0_0/0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgb(108_20_206/0.20)] sm:p-9",
        styles.border,
        module.slug === "passport" &&
          "min-h-[20rem] md:col-span-2 md:grid md:grid-cols-[0.8fr_1.2fr] md:items-center",
      )}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full opacity-50 blur-[90px]",
          styles.glow,
        )}
      />

      {/* Decorative curved lines */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-28 -bottom-32 size-80 rounded-full border opacity-25",
          styles.border,
        )}
      />

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-16 -bottom-24 size-60 rounded-full border opacity-20",
          styles.border,
        )}
      />

      {/* Module artwork */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden transition-transform duration-700 group-hover:scale-[1.03]",
          module.slug === "passport" && "md:left-[35%]",
        )}
      >
        <Image
          alt=""
          className={cn(
            "object-cover opacity-75",
            module.slug === "passport"
              ? "object-center md:object-right"
              : "object-right",
          )}
          fill
          sizes={
            module.slug === "passport"
              ? "(min-width: 768px) 65vw, 100vw"
              : "(min-width: 768px) 50vw, 100vw"
          }
          src={module.artwork}
        />
      </div>

      {/* Dark overlay for readable text */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0",
          module.slug === "passport"
            ? "bg-gradient-to-r from-[#08070e] via-[#08070e]/85 to-transparent"
            : "bg-gradient-to-r from-[#08070e] via-[#08070e]/80 to-[#08070e]/10",
        )}
      />

      {/* Card content */}
      <div className="relative z-10 flex h-full flex-col">
        <div
          className={cn(
            "inline-flex size-16 items-center justify-center rounded-2xl border shadow-[0_0_28px_rgba(108,20,206,0.14)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_38px_rgba(243,89,210,0.24)]",
            styles.icon,
          )}
        >
          <Icon aria-hidden="true" className="size-7" />
        </div>

        <h3 className="display-type mt-8 text-4xl text-white">{module.name}</h3>

        <p className="mt-4 max-w-sm pb-20 text-base leading-7 text-[#b6b1c2]">
          {module.summary}
        </p>

        <Link
          aria-label={`Explore ${module.name}`}
          className={cn(
            "absolute right-7 bottom-7 inline-flex size-12 items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-1 sm:right-9 sm:bottom-9",
            styles.arrow,
          )}
          href={module.memberHref ?? "/ecosystem"}
        >
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </article>
  );
}
