import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PlatformModule } from "@/config/modules";
import { cn } from "@/lib/cn";

const moduleStyles = {
  pulse: {
    border: "border-[#1e00c7]/55",
    icon: "border-[#1e00c7]/40 bg-[#1800ad]/15 text-[#8f84ff]",
    glow: "bg-[#1800ad]/35",
    arrow:
      "border-[#1e00c7]/70 bg-[#08070e]/85 text-[#8f84ff] shadow-[0_0_24px_rgb(102_92_255/0.24)] backdrop-blur-sm hover:bg-[#665cff]/20",
    shadow:
      "shadow-[0_18px_55px_rgb(102_92_255/0.12)] md:shadow-[0_18px_60px_rgb(0_0_0/0.35)] md:hover:shadow-[0_24px_80px_rgb(102_92_255/0.24)]",
    iconShadow:
      "shadow-[0_0_28px_rgb(102_92_255/0.24)] md:shadow-[0_0_28px_rgb(102_92_255/0.18)] md:group-hover:shadow-[0_0_40px_rgb(102_92_255/0.38)]",
  },

  circles: {
    border: "border-[#ff3cac]/45",
    icon: "border-[#ff3cac]/40 bg-[#f359d2]/10 text-[#ff79dc]",
    glow: "bg-[#f359d2]/25",
    arrow:
      "border-[#ff3cac]/70 bg-[#08070e]/85 text-[#ff79dc] shadow-[0_0_24px_rgb(243_89_210/0.24)] backdrop-blur-sm hover:bg-[#f359d2]/20",
    shadow:
      "shadow-[0_18px_55px_rgb(243_89_210/0.12)] md:shadow-[0_18px_60px_rgb(0_0_0/0.35)] md:hover:shadow-[0_24px_80px_rgb(243_89_210/0.24)]",
    iconShadow:
      "shadow-[0_0_28px_rgb(243_89_210/0.24)] md:shadow-[0_0_28px_rgb(243_89_210/0.18)] md:group-hover:shadow-[0_0_40px_rgb(243_89_210/0.38)]",
  },

  commons: {
    border: "border-[#22d3ee]/45",
    icon: "border-[#22d3ee]/40 bg-[#22d3ee]/10 text-[#4be8ff]",
    glow: "bg-[#22d3ee]/25",
    arrow:
      "border-[#22d3ee]/70 bg-[#08070e]/85 text-[#4be8ff] shadow-[0_0_24px_rgb(34_211_238/0.22)] backdrop-blur-sm hover:bg-[#22d3ee]/20",
    shadow:
      "shadow-[0_18px_55px_rgb(34_211_238/0.11)] md:shadow-[0_18px_60px_rgb(0_0_0/0.35)] md:hover:shadow-[0_24px_80px_rgb(34_211_238/0.22)]",
    iconShadow:
      "shadow-[0_0_28px_rgb(34_211_238/0.24)] md:shadow-[0_0_28px_rgb(34_211_238/0.18)] md:group-hover:shadow-[0_0_40px_rgb(34_211_238/0.36)]",
  },

  realm: {
    border: "border-[#9d46ec]/50",
    icon: "border-[#9d46ec]/40 bg-[#6c14ce]/15 text-[#bd7cff]",
    glow: "bg-[#6c14ce]/30",
    arrow:
      "border-[#9d46ec]/70 bg-[#08070e]/85 text-[#bd7cff] shadow-[0_0_24px_rgb(157_70_236/0.24)] backdrop-blur-sm hover:bg-[#6c14ce]/20",
    shadow:
      "shadow-[0_18px_55px_rgb(157_70_236/0.12)] md:shadow-[0_18px_60px_rgb(0_0_0/0.35)] md:hover:shadow-[0_24px_80px_rgb(157_70_236/0.24)]",
    iconShadow:
      "shadow-[0_0_28px_rgb(157_70_236/0.24)] md:shadow-[0_0_28px_rgb(157_70_236/0.18)] md:group-hover:shadow-[0_0_40px_rgb(157_70_236/0.38)]",
  },

  passport: {
    border: "border-[#7cff00]/35",
    icon: "border-[#7cff00]/35 bg-[#7cff00]/10 text-[#a8ff55]",
    glow: "bg-[#7cff00]/20",
    arrow:
      "border-[#7cff00]/65 bg-[#08070e]/85 text-[#a8ff55] shadow-[0_0_24px_rgb(124_255_0/0.22)] backdrop-blur-sm hover:bg-[#7cff00]/15",
    shadow:
      "shadow-[0_18px_55px_rgb(124_255_0/0.10)] md:shadow-[0_18px_60px_rgb(0_0_0/0.35)] md:hover:shadow-[0_24px_80px_rgb(124_255_0/0.20)]",
    iconShadow:
      "shadow-[0_0_28px_rgb(124_255_0/0.22)] md:shadow-[0_0_28px_rgb(124_255_0/0.16)] md:group-hover:shadow-[0_0_40px_rgb(124_255_0/0.34)]",
  },
} satisfies Record<
  PlatformModule["slug"],
  {
    border: string;
    icon: string;
    glow: string;
    arrow: string;
    shadow: string;
    iconShadow: string;
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
"group relative min-h-[10rem] overflow-hidden rounded-[1.5rem] border bg-[#08070e] p-5 transition-all duration-300 md:min-h-[15rem] md:rounded-[2rem] md:p-9 md:hover:-translate-y-1",
        styles.border,
        styles.shadow,
        module.slug === "passport" &&
"min-h-[10rem] md:min-h-[20rem] md:col-span-2 md:grid md:grid-cols-[0.8fr_1.2fr] md:items-center",
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

      {/* Module artwork */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden motion-safe:animate-[pulse_5s_ease-in-out_infinite] transition-transform duration-700 md:group-hover:scale-[1.03]",
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
"inline-flex size-12 items-center justify-center rounded-xl border transition-all duration-300 md:size-16 md:rounded-2xl md:group-hover:scale-105",
            styles.icon,
            styles.iconShadow,
          )}
        >
<Icon aria-hidden="true" className="size-5 md:size-7" />
        </div>

<h3 className="display-type mt-4 text-3xl text-white md:mt-8 md:text-4xl">
            {module.name}
        </h3>

<p className="mt-2 max-w-sm text-sm leading-6 text-[#b6b1c2] md:mt-4 md:pb-20 md:text-base md:leading-7">
              {module.summary}
        </p>
      </div>

<Link
  aria-label={`Explore ${module.name}`}
  className={cn(
    "absolute right-5 top-5 bottom-auto z-20 inline-flex size-10 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 md:top-auto md:right-9 md:bottom-9 md:size-12 md:group-hover:translate-x-1",
    module.slug === "passport" && "md:right-12 md:bottom-12",
    styles.arrow,
  )}
  href={module.memberHref ?? "/ecosystem"}
>
  <ArrowRight aria-hidden="true" className="size-4 md:size-5" />
</Link>
    </article>
  );
}