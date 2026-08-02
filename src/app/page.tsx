import Link from "next/link";
import {
  ArrowDown,
  Building2,
  ShieldCheck,
  Sparkles,
  Accessibility,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ModuleCard } from "@/components/modules/module-card";
import { ParticipationLoop } from "@/components/modules/participation-loop";
import { platformModules } from "@/config/modules";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden border-b border-neutral-800">
        <div aria-hidden="true" className="surface-grid absolute inset-0" />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-900/30"
        />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-neutral-800"
        />
        <Container className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-center py-20">
          <div className="max-w-5xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-red-900/60 bg-red-950/30 px-4 py-2 text-xs font-bold tracking-[0.16em] text-red-200 uppercase">
              <Sparkles aria-hidden="true" className="size-4" /> The operating
              system for modern community
            </p>
            <h1 className="display-type mt-8 text-[clamp(4rem,10vw,8.8rem)] leading-[0.82] text-balance text-white">
              Find your space.
              <br />
              <span className="text-neutral-500">Match your energy.</span>
            </h1>
            <p className="mt-9 max-w-2xl text-lg leading-8 text-neutral-300 sm:text-xl">
              FIFTHS connects your daily capacity with communities, creator
              opportunities, immersive worlds, and meaningful experiences.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink className="sm:min-w-40" href="/signup">
                Join FIFTHS
              </ButtonLink>
              <ButtonLink
                arrow
                className="sm:min-w-48"
                href="/ecosystem"
                variant="secondary"
              >
                Explore the Ecosystem
              </ButtonLink>
            </div>
            <p className="mt-5 text-xs text-neutral-500">
              The account and private Pulse foundations are built. Live access
              depends on founder deployment setup; participation is still being
              built.
            </p>
          </div>
          <Link
            className="absolute right-5 bottom-7 hidden min-h-12 items-center gap-2 text-xs font-bold tracking-[0.14em] text-neutral-500 uppercase hover:text-white sm:flex lg:right-10"
            href="#vision"
          >
            See the vision <ArrowDown aria-hidden="true" className="size-4" />
          </Link>
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
            <p className="text-neutral-500">
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
