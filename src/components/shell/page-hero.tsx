import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-neutral-800 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="surface-grid absolute inset-0 opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 right-[-10rem] size-[30rem] rounded-full bg-red-950/40 blur-3xl"
      />
      <Container className="relative">
        <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
          {eyebrow}
        </p>
        <h1 className="display-type mt-5 max-w-5xl text-5xl leading-[0.96] text-balance text-white sm:text-7xl lg:text-8xl">
          {title}
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-300 sm:text-xl">
          {description}
        </p>
        {actions ? (
          <div className="mt-9 flex flex-wrap gap-3">{actions}</div>
        ) : null}
      </Container>
    </section>
  );
}
