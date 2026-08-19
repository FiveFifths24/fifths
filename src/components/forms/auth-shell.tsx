import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20">
      <div
        aria-hidden="true"
        className="surface-grid absolute inset-0 opacity-50"
      />

      <Container className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="max-w-xl">
<p className="text-center text-xs font-bold tracking-[0.2em] text-[#f359d2] uppercase sm:text-left">
  {eyebrow}
</p>

          <h1 className="display-type mt-5 text-center text-5xl leading-[0.94] text-balance text-white sm:text-left sm:text-7xl">
            {title}
          </h1>

          <p className="mt-6 text-center text-lg leading-8 text-neutral-300 sm:text-left">
            {description}
          </p>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-black/70 p-6 shadow-2xl shadow-[#6c14ce]/10 backdrop-blur-xl sm:p-9">
          {children}

          <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-white/50">
            {footer}
          </div>
        </div>
      </Container>
    </section>
  );
}
