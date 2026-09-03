import Link from "next/link";
import { ArrowRight, Check, Minus, Radio, ShieldCheck } from "lucide-react";
import type { PlatformModule } from "@/config/modules";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { PreviewState } from "@/components/ui/preview-state";
import { SectionHeading } from "@/components/ui/section-heading";

export function ModuleOverview({ module }: { module: PlatformModule }) {
  const Icon = module.icon;
  return (
    <>
      <section
        className={cn(
          "relative overflow-hidden border-b border-neutral-800 bg-gradient-to-br py-20 sm:py-28",
          module.glow,
        )}
      >
        <div
          aria-hidden="true"
          className="surface-grid absolute inset-0 opacity-50"
        />
        <Container className="relative grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <Badge className="border-white/10 bg-black/30">
              <Icon
                aria-hidden="true"
                className={cn("mr-2 size-4", module.accent)}
              />
              {module.memberHref
                ? "Member foundation built"
                : "Coming to FIFTHS"}
            </Badge>
            <p className="mt-8 text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
              {module.eyebrow}
            </p>
            <h1 className="display-type mt-4 text-6xl leading-[0.9] text-white sm:text-8xl">
              {module.name}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-200 sm:text-xl">
              {module.summary}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={module.memberHref ?? "/signup"}>
                {module.memberHref
                  ? `Open ${module.name}`
                  : "Join the future beta"}
              </ButtonLink>
              <ButtonLink href="/#ecosystem" variant="secondary">
                Back to SIGNAL Overview
              </ButtonLink>
            </div>
          </div>
          <PreviewState
            title={
              module.memberHref ? "Implementation status" : "Product preview"
            }
          >
            {module.memberHref
              ? "This feature is available to members, though some functionality may still be limited during setup."
              : "This feature is still in development and will become available in a future update."}
          </PreviewState>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Who It Serves"
            title="Built for participation with context."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {module.audience.map((audience) => (
              <article
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"
                key={audience}
              >
                <p className="text-sm leading-6 font-bold text-white">
                  {audience}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-950 py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="What Members Will Be Able to Do"
            title="Clear actions. Deliberate boundaries."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {module.capabilities.map((capability, index) => (
              <article
                className="rounded-3xl border border-neutral-800 bg-black p-6"
                key={capability}
              >
                <span className={cn("text-sm font-black", module.accent)}>
                  0{index + 1}
                </span>
                <h3 className="mt-8 text-lg leading-7 font-bold text-white">
                  {capability}
                </h3>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-neutral-800 bg-neutral-950 p-7 sm:p-9">
            <h2 className="text-xs font-bold tracking-[0.18em] text-emerald-300 uppercase">
              Included in the MVP
            </h2>
            <ul className="mt-7 space-y-4">
              {module.mvpIncludes.map((item) => (
                <li
                  className="flex gap-3 text-sm leading-6 text-neutral-200"
                  key={item}
                >
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-emerald-300"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-3xl border border-neutral-800 bg-neutral-950 p-7 sm:p-9">
            <h2 className="text-xs font-bold tracking-[0.18em] text-neutral-400 uppercase">
              Intentionally Not Included
            </h2>
            <ul className="mt-7 space-y-4">
              {module.notIncluded.map((item) => (
                <li
                  className="flex gap-3 text-sm leading-6 text-neutral-400"
                  key={item}
                >
                  <Minus
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </Container>
      </section>

      <section className="border-y border-neutral-800 bg-neutral-950 py-20 sm:py-28">
        <Container className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-red-900/50 bg-red-950/20 p-7 sm:p-9">
            <Radio aria-hidden="true" className="size-6 text-red-300" />
            <h2 className="mt-8 text-2xl font-black text-white">
              How Pulse Leads Here
            </h2>
            <p className="mt-4 leading-7 text-neutral-300">
              {module.pulseConnection}
            </p>
          </article>
          <article className="rounded-3xl border border-neutral-800 bg-black p-7 sm:p-9">
            <ShieldCheck
              aria-hidden="true"
              className="size-6 text-emerald-300"
            />
            <h2 className="mt-8 text-2xl font-black text-white">
              How it connects to Passport
            </h2>
            <p className="mt-4 leading-7 text-neutral-300">
              {module.passportConnection}
            </p>
          </article>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="flex flex-col gap-8 rounded-[2rem] border border-neutral-800 bg-white p-8 text-black sm:p-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-red-700 uppercase">
              SIGNAL Is Bigger Than One Feature
            </p>
            <h2 className="display-type mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
              See how {module.name} connects with every way people participate.
            </h2>
          </div>
          <Link
            className="inline-flex min-h-12 shrink-0 items-center gap-2 font-black text-red-800 hover:text-red-600"
            href="/#ecosystem"
          >
            Explore All Five{" "}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Container>
      </section>
    </>
  );
}
