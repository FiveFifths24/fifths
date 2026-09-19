"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import {
  Activity,
  CalendarDays,
  Compass,
  Gamepad2,
  Globe2,
  PenLine,
  UsersRound,
} from "lucide-react";

const featureLinks = [
  {
    label: "Pulse",
    href: "/home/pulse",
    color: "#1800ad",
    icon: Activity,
  },
  {
    label: "Sessions",
    href: "/home/sessions",
    color: "#6c14ce",
    icon: CalendarDays,
  },
  {
    label: "Circles",
    href: "/home/circles",
    color: "#f359d2",
    icon: UsersRound,
  },
  {
    label: "Creator Commons",
    href: "/home/commons",
    color: "#c25cff",
    icon: PenLine,
  },
  {
    label: "Fifth Realm",
    href: "/home/realm",
    color: "#22d3ee",
    icon: Gamepad2,
  },
  {
    label: "Passport",
    href: "/home/passport",
    color: "#7cff00",
    icon: Globe2,
  },
] as const;

const DESKTOP_SIGNAL_SCALE = 2.4;

type PulseDialMode = "mobile" | "desktop";

function SignalSonar({ mode }: { mode: PulseDialMode }) {
  const sonarRef = useRef<HTMLDivElement | null>(null);
  const sweepRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sonar = sonarRef.current;
    const sweep = sweepRef.current;

    if (!sonar || !sweep) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const isCorrectViewport = () =>
      mode === "desktop" ? desktopQuery.matches : !desktopQuery.matches;

    if (reducedMotion.matches) {
      sweep.style.transform = "rotate(0deg)";
      return;
    }

    let animationFrame = 0;
    let startedAt = performance.now();

    const trackSweep = (time: number) => {
      if (!isCorrectViewport()) {
        startedAt = time;
        animationFrame = requestAnimationFrame(trackSweep);
        return;
      }

      const rect = sonar.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        animationFrame = requestAnimationFrame(trackSweep);
        return;
      }

      const angle = (((time - startedAt) / 8000) * 360) % 360;

      // Visual line and star detection now use the exact same angle.
      sweep.style.transform = `rotate(${angle}deg)`;

      window.dispatchEvent(
        new CustomEvent("signal:sonar", {
          detail: {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            angle,
            distance: mode === "desktop" ? 310 : 128,
          },
        }),
      );

      animationFrame = requestAnimationFrame(trackSweep);
    };

    animationFrame = requestAnimationFrame(trackSweep);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [mode]);

  return (
    <div ref={sonarRef} className="signal-robot">
      <div
        ref={sweepRef}
        className="absolute inset-0"
        style={{
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
        <span className="absolute top-1/2 left-1/2 h-px w-32 origin-left bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.35)_42%,transparent_100%)] shadow-[0_0_6px_rgba(255,255,255,0.22)]" />

        <span className="absolute top-1/2 left-1/2 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,0.95),0_0_12px_rgba(255,255,255,0.35)]" />
      </div>
    </div>
  );
}

function PulseDial({ mode }: { mode: PulseDialMode }) {
  const visualScale = mode === "desktop" ? DESKTOP_SIGNAL_SCALE : 1;

  return (
    <div
      aria-hidden="true"
      className="relative flex size-32 shrink-0 items-center justify-center overflow-visible sm:size-40 lg:size-44"
    >
      <div
        className="signal-stage"
        style={{ "--signal-scale": visualScale } as CSSProperties}
      >
        <SignalSonar mode={mode} />
      </div>
    </div>
  );
}

function MobilePulseDial() {
  return (
    <div className="relative flex min-h-56 items-center justify-center py-5 lg:hidden">
      <PulseDial mode="mobile" />
    </div>
  );
}

function DesktopPulseReceiver() {
  return (
    <div className="relative hidden min-h-[28rem] items-center justify-center overflow-visible lg:flex">
      <PulseDial mode="desktop" />
    </div>
  );
}

export function PulseHero() {
  return (
    <section className="relative overflow-visible px-5 pt-28 pb-10 sm:px-7 lg:px-10 lg:pt-32 lg:pb-12 xl:px-12">
      <div
        aria-hidden="true"
        className="absolute top-14 left-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#1800ad]/10 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="absolute top-0 right-0 h-[30rem] w-[30rem] translate-x-1/2 rounded-full bg-[#f359d2]/9 blur-[150px]"
      />

      <div className="relative mx-auto w-full max-w-[86rem]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] xl:gap-14">
          <div className="text-center lg:text-left">
            <p className="mx-auto mb-5 w-fit bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_33%,#f359d2_66%,#7cff00_100%)] bg-clip-text font-mono text-xs font-black tracking-[0.22em] text-transparent uppercase [-webkit-text-fill-color:transparent] sm:text-sm lg:mx-0 lg:bg-[linear-gradient(90deg,#1800ad_40%,#6c14ce_45%,#f359d2_50%,#7cff00_60%)]">
              No Ads. No Algorithmic Feed.
            </p>

            <h1 className="display-type mx-auto max-w-[36rem] text-[clamp(2rem,11vw,5rem)] leading-[0.96] tracking-[-0.045em] text-[#f4f2ef] lg:mx-0 lg:text-[clamp(3rem,3.4vw,4rem)]">
              <span className="block text-white [text-shadow:0_0_3px_rgba(255,255,255,0.75),0_0_8px_rgba(255,255,255,0.32),0_0_16px_rgba(255,255,255,0.14)]">
                Find Your Space.
              </span>

              <span className="mt-1 block bg-[linear-gradient(90deg,#1800ad_10%,#6c14ce_15%,#f359d2_30%,#7cff00_70%)] bg-clip-text text-[4.5rem] leading-[0.9] text-transparent [-webkit-text-fill-color:transparent] sm:text-[5.25rem] lg:text-[7rem] xl:text-[7.5rem]">
                Match Your Energy
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[36rem] text-base leading-7 text-white/65 sm:text-lg sm:leading-8 lg:mx-0">
              SIGNAL converts your real-time mental, emotional, and physical
              capacity into meaningful ways to connect, create, and participate.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_34%,#f359d2_70%,#7cff00_100%)] px-8 text-sm font-black text-white shadow-[0_0_34px_rgba(108,20,206,0.28)] transition hover:scale-[1.02] hover:brightness-110 sm:w-auto sm:min-w-52"
                href="/home/pulse"
              >
                <span className="relative flex size-6 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 animate-ping rounded-full bg-white/20 [animation-duration:1.8s] motion-reduce:animate-none"
                  />

                  <Activity
                    aria-hidden="true"
                    className="relative size-5 [animation:signal-heartbeat_1.8s_ease-in-out_infinite] motion-reduce:animate-none"
                    strokeWidth={2}
                  />
                </span>
                Check Your Pulse
              </Link>

              <Link
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-white/25 bg-black/30 px-8 text-sm font-bold text-white backdrop-blur-xl transition hover:border-[#f359d2]/60 hover:bg-white/[0.06] sm:w-auto sm:min-w-56"
                href="/home/sessions"
              >
                <Compass aria-hidden="true" className="size-5" />
                Explore The Network
              </Link>
            </div>

            <nav
              aria-label="Quick access to SIGNAL features"
              className="mt-7 hidden max-w-[42rem] flex-wrap gap-2 lg:flex"
            >
              {featureLinks.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Link
                    className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full border bg-black/35 px-4 text-[0.68rem] font-bold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06]"
                    href={feature.href}
                    key={feature.href}
                    style={{
                      borderColor: `${feature.color}70`,
                      boxShadow: `inset 0 0 18px ${feature.color}0a`,
                    }}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-3.5 transition group-hover:scale-110"
                      style={{ color: feature.color }}
                    />

                    {feature.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <DesktopPulseReceiver />
        </div>

        <div className="mt-12 lg:hidden">
          <MobilePulseDial />
        </div>
      </div>
    </section>
  );
}
