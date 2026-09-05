"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, X } from "lucide-react";

const DONATION_URL =
  "https://www.paypal.com/donate/?hosted_button_id=2DW3JU6Q4BF4C";

const DISMISS_KEY = "ehub-donation-popup-dismissed";
const DISMISS_DURATION = 6 * 60 * 60 * 1000;

export function EHubDonationPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dismissedAt = window.localStorage.getItem(DISMISS_KEY);

    if (dismissedAt) {
      const dismissedTime = Number(dismissedAt);
      const timeSinceDismissal = Date.now() - dismissedTime;

      if (
        Number.isFinite(dismissedTime) &&
        timeSinceDismissal < DISMISS_DURATION
      ) {
        return;
      }

      window.localStorage.removeItem(DISMISS_KEY);
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 9000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function dismissPopup() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsOpen(false);
  }

  function handleDonate() {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsOpen(false);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 backdrop-blur-md">
      <div className="relative w-[520px] max-w-[calc(100vw-2rem)] rounded-[1.75rem] bg-[linear-gradient(135deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] p-px shadow-[0_0_65px_rgba(139,92,246,0.24)]">
        <div
          aria-labelledby="ehub-donation-title"
          className="relative rounded-[calc(1.75rem-1px)] bg-[#020205]/95 px-8 py-9 text-center backdrop-blur-xl sm:px-10 sm:py-10"
          role="dialog"
        >
          <button
            aria-label="Close donation message"
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white/45 transition hover:border-white/25 hover:text-white"
            onClick={dismissPopup}
            type="button"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>

          <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-[#ef4fb5]/30 bg-[#ef4fb5]/10">
            <HeartHandshake
              aria-hidden="true"
              className="size-4 text-[#ef4fb5]"
            />
          </div>

          <p className="mt-4 inline-block bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] bg-clip-text text-[0.62rem] font-black tracking-[0.22em] text-transparent uppercase">
            Help Us Build It
          </p>

          <h2
            className="mt-3 text-3xl font-black text-white [text-shadow:0_0_4px_rgba(255,255,255,0.9),0_0_10px_rgba(255,255,255,0.45)]"
            id="ehub-donation-title"
          >
            Help Bring The eHub To Life.
          </h2>

          <p className="mt-3 text-lg leading-6 text-white/48">
            Help us create access to gaming, technology, creativity, workforce
            development, and real career pathways.
          </p>

          <p className="mt-2 text-sm leading-5 text-white/32">
            Every contribution moves us closer to opening the doors.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <a
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] px-6 text-sm font-black text-white transition hover:brightness-110"
              href={DONATION_URL}
              onClick={handleDonate}
              rel="noopener noreferrer"
              target="_blank"
            >
              Support The Build
            </a>

            <button
              className="inline-flex min-h-10 items-center justify-center text-xs font-black text-[#7cff00] transition hover:text-white"
              onClick={dismissPopup}
              type="button"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
