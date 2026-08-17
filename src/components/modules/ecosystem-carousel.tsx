"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Gamepad2,
  HeartHandshake,
  Radio,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const modules = [
  {
    slug: "pulse",
    number: "01",
    name: "Pulse",
    eyebrow: "Start With Your Capacity",
    headline: "Check in before you check out what’s next.",
    description:
      "Tell SIGNAL what kind of participation fits right now, then use that context to shape what the ecosystem brings your way.",
    href: "/home/pulse",
    artwork: "/images/modules/pulse-art.png",
    color: "#2c07ff",
    icon: Radio,
    tags: ["Energy", "Capacity", "Recommendations"],
  },
  {
    slug: "sessions",
    number: "02",
    name: "Sessions",
    eyebrow: "Find Something Worth Showing Up For",
    headline: "Turn an open hour into something worth doing.",
    description:
      "Discover events, workshops, game nights, coworking, meetups, and experiences that fit your interests and the way you want to participate.",
    href: "/home/sessions",
    artwork: "/images/modules/sessions-art.png",
    color: "#992bff",
    icon: CalendarDays,
    tags: ["In Person", "Online", "Hybrid"],
  },
  {
    slug: "circles",
    number: "03",
    name: "Circles",
    eyebrow: "Find Your People",
    headline: "Start with something in common.",
    description:
      "Join communities around shared interests, identities, goals, experiences, and ways of showing up.",
    href: "/home/circles",
    artwork: "/images/modules/circles-art.png",
    color: "#f359d2",
    icon: HeartHandshake,
    tags: ["Community", "Belonging", "Connection"],
  },
  {
    slug: "commons",
    number: "04",
    name: "Creator Commons",
    eyebrow: "Make Something Together",
    headline: "Turn connection into collaboration.",
    description:
      "Find creators, professionals, businesses, collaborators, and opportunities to build something together.",
    href: "/home/commons",
    artwork: "/images/modules/commons-art.png",
    color: "#ffffff",
    icon: Sparkles,
    tags: ["Create", "Collaborate", "Build"],
  },
  {
    slug: "realm",
    number: "05",
    name: "Fifth Realm",
    eyebrow: "Enter The Realm",
    headline: "Every great campaign starts with a party.",
    description:
      "Explore immersive worlds, campaigns, players, storytellers, and game masters looking for the right table.",
    href: "/home/realm",
    artwork: "/images/modules/realm-art.png",
    color: "#22d3ee",
    icon: Gamepad2,
    tags: ["Campaigns", "TTRPG", "Play"],
  },
  {
    slug: "passport",
    number: "06",
    name: "Passport",
    eyebrow: "Carry It Forward",
    headline: "What you do should count for something.",
    description:
      "Keep a credible record of participation, contributions, collaborations, and activity across the SIGNAL ecosystem.",
    href: "/home/passport",
    artwork: "/images/modules/passport-art.png",
    color: "#7cff00",
    icon: BadgeCheck,
    tags: ["Participation", "Contribution", "History"],
  },
] as const;

export function EcosystemCarousel() {
const [activeIndex, setActiveIndex] = useState(0);

const activeModule = modules[activeIndex];
const Icon = activeModule.icon;

useEffect(() => {
  const interval = window.setInterval(() => {
    setActiveIndex((current) =>
      current === modules.length - 1 ? 0 : current + 1,
    );
  }, 6000);

  return () => {
    window.clearInterval(interval);
  };
}, []);

  function goPrevious() {
    setActiveIndex((current) =>
      current === 0 ? modules.length - 1 : current - 1,
    );
  }

  function goNext() {
    setActiveIndex((current) =>
      current === modules.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <div className="mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-10">
      {/* Top controls */}
      <div className="mb-6 flex items-center justify-between">
        <div className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/35">
          <span style={{ color: activeModule.color }}>
            {activeModule.number}
          </span>

          <span className="mx-2 text-white/15">/</span>

          <span>06</span>
        </div>

        <div className="flex gap-2">
          <button
            aria-label="Previous ecosystem module"
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/60 transition hover:border-white/30 hover:text-white"
            onClick={goPrevious}
            type="button"
          >
            <ArrowLeft className="size-4" />
          </button>

          <button
            aria-label="Next ecosystem module"
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/60 transition hover:border-white/30 hover:text-white"
            onClick={goNext}
            type="button"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Active card */}
      <article
        className="relative overflow-hidden rounded-[2rem] border bg-[#0d0c14]/95"
        style={{
          borderColor: `${activeModule.color}65`,
          boxShadow: `0 28px 100px ${activeModule.color}14`,
        }}
      >
        {/* Artwork */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 right-0 w-[65%] sm:w-[55%]">
            <Image
              alt=""
              className="object-cover object-center opacity-70 sm:object-right"
              fill
              priority={activeIndex === 0}
              sizes="(min-width: 1024px) 48rem, 70vw"
              src={activeModule.artwork}
            />
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(90deg,#0d0c14_0%,rgba(13,12,20,0.94)_38%,rgba(13,12,20,0.58)_62%,rgba(13,12,20,0.10)_100%)]" />

          <div
            className="absolute -right-32 -top-32 size-[28rem] rounded-full blur-[150px]"
            style={{
              backgroundColor: `${activeModule.color}14`,
            }}
          />
        </div>

        {/* Content */}
<div className="relative z-10 grid min-h-[25rem] gap-10 p-6 text-center sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:p-12 lg:text-left">
  <div className="mx-auto flex max-w-[43rem] flex-col items-center lg:mx-0 lg:items-start">
                <div className="flex items-center justify-center gap-4 lg:justify-start">
              <div
                className="inline-flex size-12 items-center justify-center rounded-2xl border bg-black/45"
                style={{
                  borderColor: `${activeModule.color}55`,
                  color: activeModule.color,
                }}
              >
                <Icon className="size-5" />
              </div>

              <p
                className="font-mono text-[0.58rem] font-bold uppercase tracking-[0.22em]"
                style={{
                  color: activeModule.color,
                }}
              >
                {activeModule.eyebrow}
              </p>
            </div>

            <h3 className="display-type mx-auto mt-8 max-w-[42rem] text-[clamp(2.8rem,5vw,5.2rem)] leading-[0.9] tracking-[-0.045em] text-white lg:mx-0">
              {activeModule.headline}
            </h3>

            <p className="mx-auto mt-6 max-w-[37rem] text-sm leading-7 text-white/68 sm:text-base sm:leading-8 lg:mx-0">
              {activeModule.description}
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              {activeModule.tags.map((tag) => (
<span
  className="rounded-full border bg-black/40 px-4 py-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.14em] sm:text-[0.65rem]"
  key={tag}
  style={{
    borderColor: `${activeModule.color}45`,
    color: activeModule.color,
  }}
>
  {tag}
</span>
              ))}
            </div>

<div className="mt-auto pt-10">
  {/* Mobile: feature name is the link */}
  <Link
    className="display-type inline-block text-2xl sm:hidden"
    href={activeModule.href}
    style={{
      color: activeModule.color,
    }}
  >
    {activeModule.name}
  </Link>

  {/* Desktop: feature name stays plain text */}
  <p
    className="display-type hidden text-2xl sm:block sm:text-3xl"
    style={{
      color: activeModule.color,
    }}
  >
    {activeModule.name}
  </p>
</div>

{/* Desktop-only arrow */}
<Link
  aria-label={`Explore ${activeModule.name}`}
  className="absolute bottom-9 right-9 z-20 hidden size-12 items-center justify-center rounded-full border bg-black/50 transition hover:translate-x-1 sm:inline-flex"
  href={activeModule.href}
  style={{
    borderColor: `${activeModule.color}65`,
    color: activeModule.color,
    boxShadow: `0 0 22px ${activeModule.color}15`,
  }}
>
  <ArrowRight className="size-5" />
</Link>
  </div>
        </div>
      </article>

      {/* Module selector */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {modules.map((module, index) => {
          const ModuleIcon = module.icon;
          const isActive = index === activeIndex;

          return (
            <button
              className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border bg-black/30 px-3 transition"
              key={module.slug}
              onClick={() => setActiveIndex(index)}
              style={{
                borderColor: isActive
                  ? `${module.color}65`
                  : "rgba(255,255,255,0.16)",
                backgroundColor: isActive
                  ? `${module.color}0d`
                  : "rgba(0,0,0,0.25)",
                color: isActive
                  ? module.color
                  : "rgba(255,255,255,0.52)",
              }}
              type="button"
            >
              <ModuleIcon className="size-4 shrink-0" />

              <span className="hidden font-mono text-[0.52rem] font-bold uppercase tracking-[0.12em] md:block">
                {module.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}