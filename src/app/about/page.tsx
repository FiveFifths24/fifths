import type { Metadata } from "next";
import { Building2, Layers3, UsersRound } from "lucide-react";
import { PageHero } from "@/components/shell/page-hero";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About FIFTHS"
        title="A platform built around how people actually participate."
        description="FIFTHS is a connected digital ecosystem for people who play, create, connect, focus, reset, and contribute in different ways on different days."
        actions={
          <ButtonLink href="/ecosystem">Explore the Ecosystem</ButtonLink>
        }
      />
      <section className="py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <SectionHeading
            eyebrow="Why it exists"
            title="Community platforms ask what you like. FIFTHS will also ask what you have room for."
          />
          <div className="space-y-6 text-lg leading-8 text-neutral-300">
            <p>
              Interest is only part of compatibility. Time, stimulation, social
              intensity, format, access needs, and present energy all shape
              whether an experience feels possible.
            </p>
            <p>
              FIFTHS is being built to make those signals useful without turning
              them into diagnoses, popularity scores, or opaque algorithms.
            </p>
          </div>
        </Container>
      </section>
      <section className="border-y border-neutral-800 bg-neutral-950 py-20 sm:py-24">
        <Container className="grid gap-5 md:grid-cols-3">
          {[
            [
              Layers3,
              "Connected by design",
              "Five modules share one account, profile, recommendation foundation, and participation identity.",
            ],
            [
              UsersRound,
              "Community-centered",
              "Clear purpose, expectations, moderation, and contribution matter more than endless engagement.",
            ],
            [
              Building2,
              "Digital to physical",
              "The future Five Fifths eHub will become the flagship venue powered by this platform.",
            ],
          ].map(([Icon, title, copy]) => {
            const ItemIcon = Icon as typeof Layers3;
            return (
              <article
                className="rounded-3xl border border-neutral-800 bg-black p-7"
                key={title as string}
              >
                <ItemIcon aria-hidden="true" className="size-6 text-red-400" />
                <h2 className="mt-9 text-xl font-black text-white">
                  {title as string}
                </h2>
                <p className="mt-3 text-sm leading-7 text-neutral-400">
                  {copy as string}
                </p>
              </article>
            );
          })}
        </Container>
      </section>
      <section className="py-20 sm:py-28">
        <Container className="rounded-[2rem] border border-red-900/60 bg-red-950/20 p-8 sm:p-12">
          <p className="text-xs font-bold tracking-[0.18em] text-red-300 uppercase">
            Built in phases
          </p>
          <h2 className="display-type mt-4 max-w-3xl text-4xl leading-tight text-white sm:text-6xl">
            The public and personal foundations are in place. Participation
            comes next.
          </h2>
          <p className="mt-6 max-w-2xl leading-7 text-neutral-300">
            Phase 1 established the public design system, Phase 2 added secure
            identity, and Phase 3 adds private Pulse and personal Home. Sessions
            and participation remain intentionally deferred.
          </p>
        </Container>
      </section>
    </>
  );
}
