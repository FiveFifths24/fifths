import Link from "next/link";
import {
  Accessibility,
  Building2,
  ShieldCheck,
  Sparkles,
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
    color:
      "border-violet-500/50 text-violet-200 hover:border-violet-400 hover:bg-violet-500/10",
  },
  {
    label: "Create",
    color:
      "border-pink-500/50 text-pink-200 hover:border-pink-400 hover:bg-pink-500/10",
  },
  {
    label: "Connect",
    color:
      "border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:bg-cyan-500/10",
  },
  {
    label: "Focus",
    color:
      "border-emerald-500/50 text-emerald-200 hover:border-emerald-400 hover:bg-emerald-500/10",
  },
  {
    label: "Reset",
    color:
      "border-lime-500/50 text-lime-200 hover:border-lime-400 hover:bg-lime-500/10",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-svh overflow-hidden border-b border-white/10 bg-[#020205]">
        <PulseHeartbeat />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_68%_51%,rgba(76,29,149,0.19),transparent_46%)]"
        />

        <Container className="relative !mx-0 flex min-h-svh !max-w-none flex-col items-start justify-center px-5 py-24 sm:px-8 lg:px-16">
          <div className="relative z-10 w-full max-w-[48rem] text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/35 bg-violet-950/10 px-4 py-2 text-xs font-bold tracking-[0.16em] text-violet-200 uppercase shadow-[0_0_20px_rgba(124,58,237,0.08)]">
              <Sparkles aria-hidden="true" className="size-4" />
              The operating system for modern community
            </p>

            <h1 className="display-type mt-10 max-w-[46rem] text-[clamp(3.6rem,4.65vw,5.7rem)] leading-[0.93] tracking-[-0.04em]">
              <span className="block text-[0.92em] text-[#f2f0ed]">
                Find Your Space.
              </span>

              <span className="block bg-gradient-to-r from-[#3214d4] via-[#6d28d9] to-[#d946ef] bg-clip-text text-[1.04em] text-transparent">
                Match Your Energy.
              </span>
            </h1>

            <p className="mt-8 max-w-[34rem] text-lg leading-8 text-neutral-300">
              PULSE connects your daily capacity with communities, creator
              opportunities, immersive worlds, and meaningful experiences.
            </p>

            <div
              aria-label="Explore Pulse by energy"
              className="mt-7 flex flex-wrap gap-2.5"
            >
              {energyOptions.map((option) => (
                <Link
                  className={`inline-flex min-h-10 items-center justify-center rounded-full border px-5 text-[0.68rem] font-bold tracking-[0.18em] uppercase transition-all duration-300 ${option.color}`}
                  href="/pulse"
                  key={option.label}
                >
                  {option.label}
                </Link>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                className="border-0 bg-[linear-gradient(100deg,#5537ff_0%,#d946ef_58%,#a3e635_100%)] text-white shadow-[0_0_22px_rgba(124,58,237,0.35)] hover:brightness-110 sm:min-w-40"
                href="/signup"
              >
                Join PULSE
              </ButtonLink>

              <ButtonLink
                arrow
                className="border-violet-400/40 bg-black/20 text-white hover:border-violet-300 hover:bg-violet-950/20 sm:min-w-48"
                href="/ecosystem"
                variant="secondary"
              >
                Explore the Ecosystem
              </ButtonLink>
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

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Five connected products"
            title="Different doors. One community identity."
            description="Each product has a distinct purpose, but they share the same profile, interests, participation context, and trust foundation."
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
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