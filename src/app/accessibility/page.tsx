import type { Metadata } from "next";
import Link from "next/link";
import { Accessibility, ArrowRight, Wrench } from "lucide-react";
import { Container } from "@/components/ui/container";
import { StatusMessage } from "@/components/ui/status-message";

export const metadata: Metadata = { title: "Accessibility Statement" };

export default function AccessibilityPage() {
  return (
    <article>
      <header className="border-b border-neutral-800 py-16 sm:py-24">
        <Container>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-[#f359d2] uppercase">
            <Accessibility aria-hidden="true" className="size-4" />
            Accessibility Statement
          </p>
          <h1 className="display-type mt-5 max-w-4xl text-5xl leading-[0.95] text-balance text-white sm:text-7xl">
            SIGNAL should make room for people.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-300">
            Five Fifths is committed to identifying and reducing barriers across
            SIGNAL as the product grows.
          </p>
          <p className="mt-5 text-xs text-neutral-400">
            Statement updated September 18, 2026
          </p>
        </Container>
      </header>

      <Container className="grid gap-10 py-14 lg:grid-cols-[0.7fr_2fr] lg:py-20">
        <aside>
          <StatusMessage>
            SIGNAL has not received independent accessibility certification. We
            do not claim that every feature is fully accessible.
          </StatusMessage>
        </aside>

        <div className="document-content max-w-3xl">
          <h2>Our current approach</h2>
          <p>
            We aim to follow modern WCAG-aligned practices through semantic
            structure, keyboard access, visible focus, labeled controls,
            readable contrast, reduced-motion support, responsive layouts,
            accessible status messages, and automated desktop and mobile
            regression checks.
          </p>

          <h2>What the application currently supports</h2>
          <ul>
            <li>A skip link and structured page headings.</li>
            <li>Keyboard-operable navigation and form controls.</li>
            <li>Visible focus states and touch-friendly primary actions.</li>
            <li>Form labels, field-level errors, and status messaging.</li>
            <li>Reduced-motion behavior for major animated experiences.</li>
            <li>
              Mobile layouts designed to avoid horizontal overflow and preserve
              readable content order.
            </li>
            <li>
              Optional onboarding fields for practical accessibility context
              without requiring medical diagnoses.
            </li>
          </ul>

          <h2>Known limitations and active review</h2>
          <p>
            Complex profile customization, realtime Circle chat updates,
            multi-step onboarding, media framing controls, and some dense member
            management screens require continuing keyboard, screen-reader, zoom,
            and mobile testing. Automated tools cannot confirm whether every
            interaction is understandable or usable, so manual review is part of
            launch readiness.
          </p>

          <h2>Feedback and assistance</h2>
          <p>
            If a barrier prevents you from using SIGNAL, tell us what page or
            task you were trying to use, the device or assistive technology if
            you are comfortable sharing it, and what alternative would help. Do
            not include medical information you do not want to disclose.
          </p>
          <p>
            Signed-in members can submit private accessibility feedback through
            the Trust and Safety workspace. People who cannot sign in can use
            the contact path on the official Five Fifths website until a public
            SIGNAL support address is finalized.
          </p>

          <div className="not-prose mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#6c14ce] to-[#f359d2] px-6 py-3 font-bold text-white"
              href="/home/safety"
            >
              Share Accessibility Feedback
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 font-bold text-white"
              href="https://fivefifthsnp.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              Five Fifths Website
              <Wrench aria-hidden="true" className="size-4" />
            </a>
          </div>

          <h2>Ongoing improvement</h2>
          <p>
            Accessibility findings are prioritized alongside safety and core
            functionality. This statement will be updated as barriers are
            resolved, new features are introduced, and independent review
            becomes available.
          </p>
        </div>
      </Container>
    </article>
  );
}
