import type { ReactNode } from "react";
import { FileWarning } from "lucide-react";
import { Container } from "@/components/ui/container";
import { StatusMessage } from "@/components/ui/status-message";

export function LegalPage({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <article>
      <header className="border-b border-neutral-800 py-16 sm:py-24">
        <Container>
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-red-400 uppercase">
            <FileWarning aria-hidden="true" className="size-4" />
            {eyebrow}
          </div>
          <h1 className="display-type mt-5 max-w-4xl text-5xl leading-[0.95] text-balance text-white sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            {summary}
          </p>
          <p className="mt-5 text-xs text-neutral-400">
            Draft updated September 18, 2026
          </p>
        </Container>
      </header>
      <Container className="grid gap-10 py-14 lg:grid-cols-[0.7fr_2fr] lg:py-20">
        <aside>
          <StatusMessage>
            This is a launch-readiness draft. It is not legal advice or an
            attorney-approved policy. Professional legal review is required
            before public launch. SIGNAL is intended for adults 18 and older.
          </StatusMessage>
        </aside>
        <div className="document-content max-w-3xl">{children}</div>
      </Container>
    </article>
  );
}
