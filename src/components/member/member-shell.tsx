import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { MemberNavigation } from "./member-navigation";

export function MemberShell({
  displayName,
  children,
}: {
  displayName: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16">
      <div
        aria-hidden="true"
        className="surface-grid absolute inset-0 opacity-40"
      />
      <Container className="relative">
        <div className="border-b border-neutral-800 pb-8">
          <p className="text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            Your FIFTHS space
          </p>
          <p className="mt-3 text-sm text-neutral-400">
            Signed in as{" "}
            <span className="font-bold text-white">{displayName}</span>
          </p>
          <MemberNavigation />
        </div>
        <div className="pt-10">{children}</div>
      </Container>
    </section>
  );
}
