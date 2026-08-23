import type { ReactNode } from "react";

import { PulseLivingBackground } from "@/components/effects/pulse-living-background";
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
    <section className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden bg-[#020205] py-14 sm:py-20">
      <PulseLivingBackground />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      >
        <div className="absolute top-[5%] left-[-18rem] size-[38rem] rounded-full bg-[#1800ad]/10 blur-[170px]" />

        <div className="absolute top-[18%] right-[-16rem] size-[38rem] rounded-full bg-[#6c14ce]/8 blur-[170px]" />

        <div className="absolute bottom-[-18rem] left-[30%] size-[38rem] rounded-full bg-[#f359d2]/7 blur-[180px]" />

        <div className="absolute right-[5%] bottom-[-16rem] size-[32rem] rounded-full bg-[#7cff00]/5 blur-[180px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,2,5,0.12)_58%,rgba(2,2,5,0.72)_100%)]" />
      </div>

      <Container className="relative z-10 grid min-h-[calc(100svh-11rem)] items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <p className="text-xs font-bold tracking-[0.2em] text-[#f359d2] uppercase">
            {eyebrow}
          </p>

          <h1 className="display-type mt-5 text-5xl leading-[0.94] text-balance text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="mt-6 text-base leading-8 text-white/65 sm:text-lg">
            {description}
          </p>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-black/65 p-6 shadow-2xl shadow-[#6c14ce]/10 backdrop-blur-xl sm:p-9">
          {children}

          <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-white/50">
            {footer}
          </div>
        </div>
      </Container>
    </section>
  );
}
