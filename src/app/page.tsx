import Link from "next/link";
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
      "border-[#1800ad]/75 text-[#7f74ff] hover:border-[#4f3cff] hover:bg-[#1800ad]/15",
  },
  {
    label: "Create",
    icon: Pencil,
    color:
      "border-[#6c14ce]/75 text-[#c18cff] hover:border-[#9d46ec] hover:bg-[#6c14ce]/15",
  },
  {
    label: "Connect",
    icon: UsersRound,
    color:
      "border-cyan-500/60 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-500/10",
  },
  {
    label: "Focus",
    icon: CircleDot,
    color:
      "border-[#f359d2]/70 text-[#ff9be8] hover:border-[#f359d2] hover:bg-[#f359d2]/15",
  },
  {
    label: "Reset",
    icon: Leaf,
    color:
      "border-[#7cff00]/70 text-[#b8ff73] hover:border-[#7cff00] hover:bg-[#7cff00]/15",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-[#020205] sm:min-h-screen">
        {/* Full heartbeat remains on tablet and desktop only */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <PulseHeartbeat />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(61,0,143,0.16),transparent_48%)] sm:bg-[radial-gradient(circle_at_70%_50%,rgba(55,20,110,0.16),transparent_48%)]"
        />

        <Container className="relative !mx-0 flex !max-w-none flex-col items-center justify-start px-5 pt-32 pb-20 sm:min-h-screen sm:items-start sm:justify-center sm:px-8 sm:py-20 lg:px-16">
          <div className="relative z-10 w-full max-w-[48rem] text-center sm:text-left">
            {/* Badge */}
            <p className="mx-auto inline-flex max-w-[22rem] items-center justify-center gap-2 rounded-full border border-[#6c14ce]/35 bg-black/55 px-4 py-2 text-[0.56rem] leading-4 font-bold tracking-[0.14em] text-white/75 uppercase shadow-[0_0_24px_rgba(108,20,206,0.14)] backdrop-blur-md sm:mx-0 sm:max-w-none sm:justify-start sm:gap-2.5 sm:text-[0.66rem] sm:tracking-[0.18em]">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-[#b146ff] shadow-[0_0_12px_rgba(177,70,255,0.9)] sm:size-2"
              />
              The social operating system for modern community
            </p>

            {/* Hero title */}
            <h1 className="display-type mx-auto mt-8 max-w-[46rem] text-[clamp(3rem,14vw,4.5rem)] leading-[0.88] tracking-[-0.045em] sm:mx-0 sm:mt-10 sm:text-[clamp(3.6rem,4.65vw,5.7rem)] sm:leading-[0.93] sm:tracking-[-0.04em]">
              <span className="block text-[0.88em] text-[#f2f0ed] sm:text-[0.92em]">
                Find Your Space.
              </span>

              <span className="mt-1 block bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_50%,#f359d2_100%)] bg-clip-text text-[0.98em] text-transparent sm:mt-0 sm:text-[1.04em]">
                Match Your Energy.
              </span>
            </h1>

            {/* Dedicated mobile heartbeat divider */}
            <div
              aria-hidden="true"
              className="mx-auto mt-7 h-20 w-full max-w-[22rem] sm:hidden"
            >
              <svg
                className="h-full w-full overflow-visible"
                viewBox="0 0 360 80"
                fill="none"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="mobile-pulse-gradient"
                    x1="0"
                    y1="0"
                    x2="360"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#1800ad" />
                    <stop offset="34%" stopColor="#6c14ce" />
                    <stop offset="68%" stopColor="#f359d2" />
                    <stop offset="100%" stopColor="#7cff00" />
                  </linearGradient>

                  <filter
                    id="mobile-pulse-glow"
                    x="-20%"
                    y="-100%"
                    width="140%"
                    height="300%"
                  >
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <path
                  d="M0 42H82L96 42L108 28L121 58L137 42H184L200 42L216 7L233 72L249 42H285L299 42L310 31L322 50L337 42H360"
                  stroke="url(#mobile-pulse-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.65"
                />

                <path
                  d="M0 42H82L96 42L108 28L121 58L137 42H184L200 42L216 7L233 72L249 42H285L299 42L310 31L322 50L337 42H360"
                  stroke="url(#mobile-pulse-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="70 500"
                  filter="url(#mobile-pulse-glow)"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="570"
                    to="0"
                    dur="4.2s"
                    repeatCount="indefinite"
                  />
                </path>

                <circle
                  cx="356"
                  cy="42"
                  r="3.5"
                  fill="#7cff00"
                  className="motion-safe:animate-pulse"
                />
              </svg>
            </div>

            {/* Energy options */}
            <div
              aria-label="Explore PULSE by energy"
              className="mx-auto mt-5 grid w-full max-w-[22rem] grid-cols-2 gap-3 sm:mx-0 sm:mt-7 sm:flex sm:max-w-none sm:flex-wrap sm:gap-2.5"
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
            {/* Main actions */}
            <div className="mx-auto mt-8 flex w-full max-w-[22rem] flex-col gap-3 sm:mx-0 sm:mt-7 sm:max-w-none sm:flex-row">
              {/* Static on mobile; pulsing ring appears on desktop only */}
              <div className="join-pulse-wrapper w-full sm:w-auto">
                <ButtonLink
                  className="relative z-10 w-full overflow-hidden border-0 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_36%,#f359d2_70%,#7cff00_100%)] text-white shadow-[0_0_24px_rgba(108,20,206,0.22)] hover:brightness-110 sm:min-w-40"
                  href="/signup"
                >
                  Join PULSE
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
                  className="min-w-48 border border-white/20 bg-black/45 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10"
                  href="/ecosystem"
                  variant="secondary"
                >
                  Explore the Ecosystem
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        className="border-b border-neutral-800 py-20 sm:py-28"
        id="vision"
      >
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeading
            eyebrow="One ecosystem"
            title="Community should meet people where they are."
          />

          <div className="space-y-5 text-lg leading-8 text-neutral-300">
            <p>
              Most platforms begin with content. FIFTHS begins with capacity:
              what kind of room, energy, and participation actually fits today.
            </p>

            <p className="text-neutral-400">
              One identity connects discovery, collaboration, play,
              contribution, and a credible record of showing up.
            </p>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden border-y border-white/10 bg-[#020205] py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 h-[28rem] w-[48rem] -translate-x-1/2 rounded-full bg-[#6c14ce]/10 blur-[140px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[-10rem] bottom-[-12rem] size-[30rem] rounded-full bg-[#22d3ee]/5 blur-[130px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] size-[30rem] rounded-full bg-[#f359d2]/5 blur-[130px]"
        />
        <Container className="relative">
          <SectionHeading
            align="center"
            eyebrow="One connected ecosystem"
            title="Your ecosystem, your way."
            description="Five experiences. One seamless flow."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {platformModules.map((module, index) => (
              <ModuleCard index={index} key={module.slug} module={module} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-950 py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="The participation loop"
            title="From today’s capacity to lasting contribution."
            description="FIFTHS is designed around a clear, repeatable path—not an endless feed."
          />

          <ParticipationLoop />
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-950 p-7 sm:p-9 lg:col-span-2">
            <Building2 aria-hidden="true" className="size-7 text-red-400" />

            <p className="mt-10 text-xs font-bold tracking-[0.18em] text-red-400 uppercase">
              A digital layer for a physical future
            </p>

            <h2 className="display-type mt-4 text-4xl leading-tight text-balance text-white sm:text-6xl">
              The Five Fifths eHub will become the flagship FIFTHS-powered
              venue.
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-400">
              The platform is being designed to eventually connect digital
              discovery with physical zones for play, creation, focus,
              connection, and reset. Venue access and equipment controls are not
              part of this MVP.
            </p>
          </article>

          <div className="grid gap-6">
            <article className="rounded-3xl border border-neutral-800 bg-white p-7 text-black">
              <Accessibility
                aria-hidden="true"
                className="size-7 text-red-700"
              />

              <h2 className="mt-8 text-xl font-black">Access is structural.</h2>

              <p className="mt-3 text-sm leading-6 text-neutral-700">
                Clear expectations, stimulation context, keyboard access,
                readable contrast, and multiple ways to participate belong in
                the foundation.
              </p>
            </article>

            <article className="rounded-3xl border border-red-900/70 bg-red-950/30 p-7">
              <ShieldCheck aria-hidden="true" className="size-7 text-red-300" />

              <h2 className="mt-8 text-xl font-black text-white">
                Trust is designed in.
              </h2>

              <p className="mt-3 text-sm leading-6 text-red-100/70">
                18+ beta boundaries, visible community expectations, reporting,
                privacy controls, and verified contribution workflows are being
                planned before launch.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="border-t border-neutral-800 bg-white py-20 text-black sm:py-28">
        <Container className="text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-red-700 uppercase">
            A better way into community is being built
          </p>

          <h2 className="display-type mx-auto mt-5 max-w-4xl text-5xl leading-[0.94] text-balance sm:text-7xl">
            Your energy should help you find the room—not keep you out of it.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
            Explore how the ecosystem connects, then join the future beta list
            when you’re ready.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/signup">Join FIFTHS</ButtonLink>

            <ButtonLink
              className="border-neutral-400 bg-white text-black hover:bg-neutral-100"
              href="/ecosystem"
              variant="secondary"
            >
              Explore the Ecosystem
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
