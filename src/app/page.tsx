import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Accessibility,
  Building2,
  CircleDot,
  Gamepad2,
  Leaf,
  Pencil,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { ModuleCard } from "@/components/modules/module-card";
import { ParticipationLoop } from "@/components/modules/participation-loop";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { PulseHeartbeat } from "@/components/visuals/pulse-heartbeat";
import { platformModules } from "@/config/modules";

const energyOptions = [
  {
    label: "Play",
    icon: Gamepad2,
    color:
      "border-[#ffffff]/75 text-[#ffffff] hover:border-[#4f3cff] hover:bg-[#1800ad]/15",
  },
  {
    label: "Create",
    icon: Pencil,
    color:
      "border-[#ffffff]/75 text-[#ffffff] hover:border-[#9d46ec] hover:bg-[#6c14ce]/15",
  },
  {
    label: "Connect",
    icon: UsersRound,
    color:
      "border-[#ffffff]/60 text-[#ffffff] hover:border-cyan-400 hover:bg-cyan-500/10",
  },
  {
    label: "Focus",
    icon: CircleDot,
    color:
      "border-[#ffffff]/70 text-[#ffffff] hover:border-[#f359d2] hover:bg-[#f359d2]/15",
  },
  {
    label: "Reset",
    icon: Leaf,
    color:
      "border-[#ffffff]/70 text-[#ffffff] hover:border-[#7cff00] hover:bg-[#7cff00]/15",
  },
];

type GlitterStyle = CSSProperties & {
  "--glitter-x": string;
  "--glitter-y": string;
  "--glitter-duration": string;
  "--glitter-delay": string;
};

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const glitterColors = ["#ffffff", "#8b5cf6", "#f359d2", "#7cff00"];

const homepageGlitter = Array.from({ length: 150 }, (_, index) => ({
    left: `${(pseudoRandom(index * 2 + 1) * 100).toFixed(2)}%`,
  top: `${(pseudoRandom(index * 3 + 2) * 100).toFixed(2)}%`,
  size: 1 + pseudoRandom(index * 5 + 3) * 1.8,
  color: glitterColors[index % glitterColors.length],
  opacity: 0.14 + pseudoRandom(index * 7 + 4) * 0.3,
  driftX: `${(pseudoRandom(index * 11 + 5) * 80 - 40).toFixed(0)}px`,
  driftY: `${(pseudoRandom(index * 13 + 6) * 60 - 30).toFixed(0)}px`,
  duration: `${(10 + pseudoRandom(index * 17 + 7) * 12).toFixed(2)}s`,
  delay: `${(-pseudoRandom(index * 19 + 8) * 20).toFixed(2)}s`,
}));

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden bg-[#020205] text-white">
      <style>{`
        @keyframes homepage-glitter-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(0.85);
          }

          50% {
            transform: translate3d(
              var(--glitter-x),
              var(--glitter-y),
              0
            ) scale(1.15);
          }
        }

        .homepage-glitter {
          animation: homepage-glitter-float
            var(--glitter-duration)
            ease-in-out
            var(--glitter-delay)
            infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .homepage-glitter {
            animation: none;
          }
        }
      `}</style>

      {/* One shared background behind the entire homepage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Soft atmospheric color carried through the full page */}
        <div className="absolute left-[-22rem] top-[38%] hidden size-[46rem] rounded-full bg-[#6c14ce]/8 blur-[190px] sm:block" />
        <div className="absolute right-[-18rem] top-[32%] size-[42rem] rounded-full bg-[#f359d2]/6 blur-[170px]" />
        <div className="absolute left-[-16rem] top-[58%] size-[40rem] rounded-full bg-[#1800ad]/7 blur-[170px]" />
        <div className="absolute right-[-18rem] top-[76%] size-[44rem] rounded-full bg-[#7cff00]/5 blur-[180px]" />

        {/* Floating glitter behind every homepage section */}
        {homepageGlitter.map((particle, index) => {
          const style: GlitterStyle = {
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            color: particle.color,
            opacity: particle.opacity,
            "--glitter-x": particle.driftX,
            "--glitter-y": particle.driftY,
            "--glitter-duration": particle.duration,
            "--glitter-delay": particle.delay,
          };

          return (
            <span
              className="homepage-glitter absolute rounded-full mix-blend-screen"
              key={index}
              style={style}
            >
              <span className="block h-full w-full rounded-full bg-current shadow-[0_0_10px_currentColor] motion-safe:animate-pulse" />
            </span>
          );
        })}
      </div>

      {/* All homepage content stays above the shared background */}
      <div className="relative z-10">
        <section className="relative overflow-hidden">
          {/* Desktop heartbeat: begins near the middle and stays on the right */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[90%] overflow-hidden sm:block">
            <div className="absolute inset-0">
              <PulseHeartbeat idPrefix="desktop-signal" />
            </div>
          </div>

          {/* Dark transition keeps the heartbeat from competing with the copy */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[50%] bg-gradient-to-r from-[#020205] via-[#020205] via-75% to-transparent sm:block"
          />

          <Container className="relative !mx-0 flex min-h-[46rem] !max-w-none flex-col items-center justify-start px-5 pt-32 pb-20 sm:min-h-[52rem] sm:items-start sm:justify-center sm:px-8 sm:py-20 lg:min-h-[58rem] lg:px-16">
            <div className="relative z-10 w-full max-w-[62rem] text-center sm:text-left">
              {/* Badge */}
              <p className="mx-auto inline-flex max-w-[22rem] items-center justify-center gap-2 rounded-full border border-[#6c14ce]/35 bg-black/55 px-4 py-2 text-[0.56rem] leading-4 font-bold tracking-[0.14em] uppercase shadow-[0_0_24px_rgba(108,20,206,0.14)] backdrop-blur-md sm:mx-0 sm:max-w-none sm:justify-start sm:gap-2.5 sm:text-[0.66rem] sm:tracking-[0.18em]">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-white shadow-[0_0_12px_rgba(177,70,255,0.9)] sm:size-2"
                />
                <span className="ecosystem-gradient-text">
                  Community That Meets You Where You Are
                </span>
              </p>

              {/* Hero title */}
              <h1 className="display-type mx-auto mt-10 max-w-[48rem] text-center sm:mx-0 sm:mt-10 sm:text-left">
                <span className="block text-[clamp(2.5rem,3vw,3rem)] leading-none tracking-[-0.035em] text-[#f2f0ed]">
                  Find Your Space.
                </span>

                <span className="mt-3 block bg-[linear-gradient(90deg,#1800ad_10%,#6c14ce_30%,#f359d2_50%,#7cff00_70%)] bg-clip-text text-[clamp(5rem,6.5vw,7rem)] leading-[0.88] tracking-[-0.055em] text-transparent [-webkit-text-fill-color:transparent]">
                  Match Your Energy.
                </span>
              </h1>

              <p className="mt-8 max-w-[40rem] text-base leading-7 text-white sm:text-lg">
                Signal helps you find people, places, and plans that match your energy, capacity, and comfort level.
              </p>

              {/* Dedicated mobile signal divider */}
              <div
                aria-hidden="true"
                className="relative mx-auto mt-12 mb-14 h-28 w-full max-w-[28rem] overflow-hidden sm:hidden"
              >
                <PulseHeartbeat mobile idPrefix="mobile-signal" />
              </div>

              {/* Energy options */}
              <div
                aria-label="Explore SIGNAL by energy"
                className="mx-auto mt-5 hidden w-full max-w-[22rem] grid-cols-2 gap-3 sm:mx-0 sm:mt-7 sm:flex sm:max-w-none sm:flex-wrap sm:gap-2.5"
              >
                {energyOptions.map((option, index) => {
                  const Icon = option.icon;

                  return (
                    <Link
                      className={`group inline-flex min-h-14 items-center justify-center gap-3 rounded-full border bg-black/35 px-4 text-[0.68rem] font-bold tracking-[0.16em] uppercase backdrop-blur-sm transition-all duration-300 sm:min-h-10 sm:gap-2 sm:px-5 sm:text-[0.68rem] sm:tracking-[0.18em] ${
                        index === 4 ? "col-span-2 sm:col-auto" : ""
                      } ${option.color}`}
                      href="/pulse"
                      key={option.label}
                    >
                      <Icon
                        aria-hidden="true"
                        className="size-5 transition-transform duration-300 group-hover:scale-110 sm:size-4"
                      />

                      {option.label}
                    </Link>
                  );
                })}
              </div>

              {/* Main actions */}
              <div className="mx-auto mt-8 flex w-full max-w-[22rem] flex-col gap-3 sm:mx-0 sm:mt-7 sm:max-w-none sm:flex-row">
                {/* Static on mobile; pulsing ring appears on desktop only */}
                <div className="join-pulse-wrapper w-full sm:w-auto">
                  <ButtonLink
                    className="relative z-10 w-full overflow-hidden border-0 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_36%,#f359d2_70%,#7cff00_100%)] text-white shadow-[0_0_24px_rgba(108,20,206,0.22)] hover:brightness-110 sm:min-w-40"
                    href="/signup"
                  >
                    Join SIGNAL
                  </ButtonLink>
                </div>

                {/* Mobile-only login button */}
                <div className="w-full sm:hidden">
                  <ButtonLink
                    className="w-full border border-white/20 bg-black/45 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10"
                    href="/login"
                    variant="secondary"
                  >
                    Log in
                  </ButtonLink>
                </div>

                {/* Desktop-only ecosystem button */}
                <div className="hidden sm:block">
                  <ButtonLink
                    arrow
                    className="min-w-48"
                    href="/ecosystem"
                    variant="ecosystem"
                  >
                    <span className="ecosystem-gradient-text">
                      Explore the Ecosystem
                    </span>
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-20 sm:py-28">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="The participation loop"
              title="Five steps. One lasting record."
              description="A clear, repeatable path from today’s capacity to lasting contribution."
            />

            <ParticipationLoop />
          </Container>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-32">
          <Container className="relative">
            <SectionHeading
              align="center"
              eyebrow="One connected ecosystem"
              title="Find Your People, Your Place, Your Pace."
              description="Explore, connect, create, play, and carry your identity across it all."
            />

            <div className="mt-14 grid gap-5 md:grid-cols-2">
              {platformModules.map((module, index) => (
                <ModuleCard index={index} key={module.slug} module={module} />
              ))}
            </div>
          </Container>
        </section>

<section className="relative overflow-hidden py-24 sm:py-32">
  <Container className="relative">
    <div className="grid gap-5 lg:grid-cols-[1.65fr_0.85fr]">
      {/* Main eHub feature */}
      <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-10 lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-[#6c14ce]/15 blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 size-72 rounded-full bg-[#f359d2]/10 blur-[120px]"
        />

<div className="relative flex flex-col items-center text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-[#f359d2]/25 bg-[#f359d2]/10 shadow-[0_0_30px_rgba(243,89,210,0.1)]">
            <Building2
              aria-hidden="true"
              className="size-5 text-[#f359d2]"
            />
          </div>

          <p className="mt-10 text-[0.68rem] font-bold tracking-[0.2em] uppercase">
            <span className="ecosystem-gradient-text">
              Five Fifths Esports & Innovation Hub
            </span>
          </p>

          <h2 className="display-type mt-5 max-w-[48rem] text-[clamp(2.8rem,5vw,5.5rem)] leading-[0.98] tracking-[-0.045em] text-balance text-[#f2f0ed]">
            A Physical Home For Our Digital Communities
          </h2>

          <p className="mt-7 max-w-[42rem] text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
            Many gamers, cosp[layers, creators, professionals, and community members lack a wlecoming place to gather outside of home and work. This eHub is designed for different energies, capacities, and nervous systems, giving members flexible ways to connect, create, play, focus, and recharge without the need to conform to one standard.
          </p>

          <div className="mt-10 flex flex-wrap gap-2.5">
<div className="mt-1">
  <a
    href="https://fivefifthsnp.com/ehub"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9d46ec]/40 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_42%,#f359d2_100%)] px-7 text-[0.7rem] font-bold tracking-[0.16em] text-white uppercase shadow-[0_0_28px_rgba(108,20,206,0.22)] transition duration-300 hover:scale-[1.02] hover:brightness-110"
  >
    Explore the eHub
  </a>
</div>
          </div>
        </div>
      </article>

      {/* Supporting principles */}
      <div className="grid gap-5">
        <article className="group relative overflow-hidden rounded-[2rem] border border-[#6c14ce]/20 bg-[#6c14ce]/[0.06] p-7 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-[#6c14ce]/15 blur-[70px]"
          />

<div className="relative flex flex-col items-center text-center">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-[#9d46ec]/25 bg-[#6c14ce]/10">
              <Accessibility
                aria-hidden="true"
                className="size-5 text-[#ca9aff]"
              />
            </div>

            <p className="mt-8 text-[0.62rem] font-bold tracking-[0.18em] text-[#ca9aff] uppercase">
              Learn. Create. Build.
            </p>

            <h3 className="mt-3 text-2xl font-black tracking-[-0.025em] text-white">
              Turning Access Into Opportunity
            </h3>

            <p className="mt-4 text-sm leading-6 text-white/55">
              Members will be able to take part in digital-skills training, content creation, gaming and technology workshops, entrepreneurship support, and hands-on learning designed to build confidence, creativity, and career-ready experience.
            </p>
          </div>
        </article>

        <article className="group relative overflow-hidden rounded-[2rem] border border-[#7cff00]/15 bg-[#7cff00]/[0.035] p-7 backdrop-blur-xl sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -right-14 size-44 rounded-full bg-[#7cff00]/10 blur-[80px]"
          />

<div className="relative flex flex-col items-center text-center">
              <div className="flex size-11 items-center justify-center rounded-2xl border border-[#7cff00]/20 bg-[#7cff00]/10">
              <ShieldCheck
                aria-hidden="true"
                className="size-5 text-[#b8ff76]"
              />
            </div>

            <p className="mt-8 text-[0.62rem] font-bold tracking-[0.18em] text-[#b8ff76] uppercase">
              Gather In Real Life
            </p>

            <h3 className="mt-3 text-2xl font-black tracking-[-0.025em] text-white">
              Earn Something You Can Carry Forward.
            </h3>

            <p className="mt-4 text-sm leading-6 text-white/55">
              The eHub will host tournaments, screenings, creator sessions, community meetups, launch events, workshops, and member-led experiences that bring people together around shared interests.
            </p>
          </div>
        </article>
      </div>
    </div>
  </Container>
</section>

        <section className="py-20 text-white sm:py-28">
          <Container className="text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-[#f359d2] uppercase">
              A better way into community is being built
            </p>

            <h2 className="display-type mx-auto mt-5 max-w-4xl text-5xl leading-[0.94] text-balance sm:text-7xl">
              Your energy should help you find the room—not keep you out of it.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
              Explore how the ecosystem connects, then join the future beta
              list when you’re ready.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/signup">Join SIGNAL</ButtonLink>

              <ButtonLink
                className="border-white/20 bg-black/40 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10"
                href="/ecosystem"
                variant="secondary"
              >
                Explore the Ecosystem
              </ButtonLink>
            </div>
          </Container>
        </section>
      </div>
    </main>
  );
}