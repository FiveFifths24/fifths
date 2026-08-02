import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
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
          <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            {eyebrow}
          </p>
          <h1 className="display-type mt-5 text-5xl leading-[0.94] text-balance text-white sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-300">
            {description}
          </p>
          <div className="mt-8 flex items-start gap-3 text-sm leading-6 text-neutral-500">
            <LockKeyhole
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />
            <p>
              FIFTHS uses secure, server-validated sessions. Your password is
              handled by Supabase Auth and is never stored in the FIFTHS
              application database.
            </p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl shadow-black sm:p-9">
          {children}
          <div className="mt-7 border-t border-neutral-800 pt-6 text-center text-sm text-neutral-400">
            {footer}
          </div>
        </div>
      </Container>
    </section>
  );
}
