import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PlatformModule } from "@/config/modules";
import { cn } from "@/lib/cn";

export function ModuleCard({
  module,
  index,
}: {
  module: PlatformModule;
  index: number;
}) {
  const Icon = module.icon;
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br p-6 shadow-2xl sm:p-8",
        module.glow,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute top-3 right-5 text-7xl font-black text-white/[0.035] sm:text-8xl"
      >
        0{index + 1}
      </div>
      <div className="relative">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30",
              module.accent,
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <span className="text-xs font-bold tracking-[0.14em] text-neutral-400 uppercase">
            Connected product
          </span>
        </div>
        <p className="mt-9 text-xs font-bold tracking-[0.16em] text-neutral-400 uppercase">
          {module.eyebrow}
        </p>
        <h3 className="display-type mt-3 text-4xl text-white">{module.name}</h3>
        <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-300">
          {module.summary}
        </p>
        <Link
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-white hover:text-red-300"
          href={`/${module.slug}`}
        >
          Explore {module.name}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </article>
  );
}
