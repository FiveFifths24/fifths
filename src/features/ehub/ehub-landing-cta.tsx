"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";

const DISMISS_KEY = "ehub-landing-cta-dismissed";
const DISMISS_DURATION = 6 * 60 * 60 * 1000;

export function EHubLandingCta() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const dismissedAt = window.localStorage.getItem(DISMISS_KEY);

    if (dismissedAt) {
      const dismissedTime = Number(dismissedAt);

      if (
        Number.isFinite(dismissedTime) &&
        Date.now() - dismissedTime < DISMISS_DURATION
      ) {
        return;
      }

      window.localStorage.removeItem(DISMISS_KEY);
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);

      window.requestAnimationFrame(() => {
        setHasEntered(true);
      });
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setHasEntered(false);

    window.setTimeout(() => {
      setIsVisible(false);
    }, 300);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed right-4 bottom-4 z-[90] w-[360px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out sm:right-6 sm:bottom-6 ${
        hasEntered ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
    >
      <div className="rounded-[1.5rem] bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] p-px shadow-[0_0_45px_rgba(139,92,246,0.2)]">
        <div className="relative rounded-[calc(1.5rem-1px)] bg-[#020205]/95 p-6 backdrop-blur-xl">
          <button
            aria-label="Close eHub message"
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-[#7cff00] bg-black/50 text-[#7cff00] transition hover:border-white/25 hover:text-white"
            onClick={dismiss}
            type="button"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>

          <p className="inline-block bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] bg-clip-text text-[0.65rem] font-black tracking-[0.22em] text-transparent uppercase">
            Five Fifths eHub
          </p>

          <h3 className="mt-3 pr-8 text-2xl font-black text-white">
            We&apos;re Building Something Bigger.
          </h3>

          <p className="mt-3 text-sm leading-6 text-white/48">
            See how Five Fifths is bringing gaming, technology, creativity,
            workforce development, and community together in one physical space.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <a
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:brightness-110"
              href="/home/ehub"
            >
              Explore The eHub
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>

            <a
              className="inline-flex min-h-10 items-center justify-center text-xs font-black text-white/45 transition hover:text-white/70"
              href="https://www.paypal.com/donate/?hosted_button_id=2DW3JU6Q4BF4C"
              rel="noopener noreferrer"
              target="_blank"
            >
              Support The Build
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
