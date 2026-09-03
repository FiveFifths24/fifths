"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
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

const SIGNAL_COLORS = [
  "#3f2cff",
  "#9d46ec",
  "#f359d2",
  "#22d3ee",
  "#7cff00",
] as const;

const SIGNAL_DURATION = 2400;
const SIGNAL_ORIGIN_PX = 22;
const DESKTOP_SIGNAL_SCALE = 2.4;

type PulseDialMode = "mobile" | "desktop";

type SignalShot = {
  id: number;
  angle: number;
  color: string;
  distance: number;
  duration: number;
};

type SignalBurstDetail = {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
  distance: number;
  duration: number;
};

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function chooseNextRotation(currentRotation: number) {
  const currentAngle = normalizeAngle(currentRotation);
  let targetAngle = Math.random() * 360;
  let difference = ((targetAngle - currentAngle + 540) % 360) - 180;

  if (Math.abs(difference) < 42) {
    difference += difference >= 0 ? 62 : -62;
    targetAngle = normalizeAngle(currentAngle + difference);
  }

  return {
    angle: targetAngle,
    rotation: currentRotation + difference,
  };
}

function getSignalDistance(
  x: number,
  y: number,
  angle: number,
  mode: PulseDialMode,
) {
  const radians = (angle * Math.PI) / 180;
  const directionX = Math.cos(radians);
  const directionY = Math.sin(radians);
  const margin = mode === "desktop" ? 72 : 28;
  const limits: number[] = [];

  if (directionX > 0.01) {
    limits.push((window.innerWidth - x - margin) / directionX);
  } else if (directionX < -0.01) {
    limits.push((x - margin) / -directionX);
  }

  if (directionY > 0.01) {
    limits.push((window.innerHeight - y - margin) / directionY);
  } else if (directionY < -0.01) {
    limits.push((y - margin) / -directionY);
  }

  const minimumDistance = mode === "desktop" ? 260 : 90;
  const maximumDistance = mode === "desktop" ? 520 : 190;
  const positiveLimits = limits.filter((limit) => limit > 0);
  const availableDistance = positiveLimits.length
    ? Math.min(...positiveLimits)
    : maximumDistance;
  const availableMaximum = Math.max(
    minimumDistance,
    Math.min(maximumDistance, availableDistance - 20),
  );

  return (
    minimumDistance +
    Math.random() * Math.max(0, availableMaximum - minimumDistance)
  );
}

function SignalWave() {
  return (
    <svg className="signal-pulse__shape" fill="none" viewBox="0 0 80 56">
      <path
        d="M6 4 Q18 28 6 52"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function SignalRobot({ rotation }: { rotation: number }) {
  return (
    <div className="signal-robot">
      <div
        className="signal-bot__head absolute inset-0"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-7 w-9 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[linear-gradient(135deg,#1800ad_0%,#6c14ce_30%,#f359d2_65%,#7cff00_100%)] p-px shadow-[0_0_12px_rgba(108,20,206,0.7),0_0_24px_rgba(243,89,210,0.4)]">
          <span className="relative flex size-full items-center rounded-[0.7rem] bg-[#050508]/90">
            <span className="absolute inset-x-2 bottom-1 h-px bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)]" />

            <span className="absolute top-1/2 right-1.5 flex -translate-y-1/2 flex-col gap-1">
              <span className="size-1 rounded-full bg-[#f359d2] shadow-[0_0_6px_#f359d2]" />
              <span className="size-1 rounded-full bg-[#22d3ee] shadow-[0_0_6px_#22d3ee]" />
            </span>
          </span>

          <span className="absolute -top-2 left-1/2 h-2 w-px -translate-x-1/2 bg-[#f359d2]">
            <span className="absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_7px_#f359d2]" />
          </span>

          <span className="absolute top-1/2 -right-1 size-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_#7cff00,0_0_12px_#f359d2]" />
        </span>
      </div>
    </div>
  );
}

function PulseDial({ mode }: { mode: PulseDialMode }) {
  const dialRef = useRef<HTMLDivElement | null>(null);
  const currentRotationRef = useRef(-25);
  const nextShotIdRef = useRef(0);
  const visibleRef = useRef(false);
  const [headRotation, setHeadRotation] = useState(-25);
  const [shots, setShots] = useState<SignalShot[]>([]);

  useEffect(() => {
    const dial = dialRef.current;

    if (!dial) {
      return;
    }

    const desktopQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(min-width: 1024px)")
        : { matches: false };

    const reducedMotionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : { matches: false };
    const timers = new Set<number>();

    const isCorrectViewport = () =>
      mode === "desktop" ? desktopQuery.matches : !desktopQuery.matches;

    const isActive = () =>
      visibleRef.current && isCorrectViewport() && !reducedMotionQuery.matches;

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);

      timers.add(timer);
    };

    const launchSignal = (angle: number) => {
      if (!isActive()) {
        return;
      }

      const rect = dial.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const visualScale = mode === "desktop" ? DESKTOP_SIGNAL_SCALE : 1;
      const visualDistance = getSignalDistance(x, y, angle, mode);
      const internalDistance = visualDistance / visualScale;
      const color =
        SIGNAL_COLORS[Math.floor(Math.random() * SIGNAL_COLORS.length)]!;
      const id = nextShotIdRef.current++;
      const shot = {
        id,
        angle,
        color,
        distance: internalDistance,
        duration: SIGNAL_DURATION,
      };

      setShots((current) => [...current, shot]);

      window.dispatchEvent(
        new CustomEvent<SignalBurstDetail>("signal:burst", {
          detail: {
            id,
            x,
            y,
            angle,
            color,
            distance: visualDistance,
            duration: SIGNAL_DURATION,
          },
        }),
      );

      schedule(() => {
        setShots((current) => current.filter((item) => item.id !== id));
      }, SIGNAL_DURATION + 300);
    };

    const scan = () => {
      if (!isActive()) {
        schedule(scan, 650);
        return;
      }

      const next = chooseNextRotation(currentRotationRef.current);

      currentRotationRef.current = next.rotation;
      setHeadRotation(next.rotation);

      schedule(() => launchSignal(next.rotation), 620);
      schedule(scan, 3000 + Math.random() * 1800);
    };

    let observer: IntersectionObserver | null = null;

    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        ([entry]) => {
          visibleRef.current = Boolean(entry?.isIntersecting);
        },
        { threshold: 0.2 },
      );

      observer.observe(dial);
    } else {
      // Vitest/JSDOM does not provide IntersectionObserver.
      visibleRef.current = true;
    }

    schedule(scan, 500);

    return () => {
      observer?.disconnect();

      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [mode]);

  const visualScale = mode === "desktop" ? DESKTOP_SIGNAL_SCALE : 1;

  return (
    <div
      ref={dialRef}
      aria-hidden="true"
      className="relative flex size-32 shrink-0 items-center justify-center overflow-visible sm:size-40 lg:size-44"
    >
      <div
        className="signal-stage"
        style={{ "--signal-scale": visualScale } as CSSProperties}
      >
        {shots.map((shot) => (
          <div
            className="signal-emission"
            key={shot.id}
            style={
              {
                "--signal-angle": `${shot.angle}deg`,
                "--signal-color": shot.color,
                "--signal-distance": `${shot.distance}px`,
                "--signal-duration": `${shot.duration}ms`,
                "--signal-node-delay": `${Math.round(shot.duration * 0.68)}ms`,
                "--signal-travel-distance": `${Math.max(
                  18,
                  shot.distance - SIGNAL_ORIGIN_PX,
                )}px`,
                color: shot.color,
              } as CSSProperties
            }
          >
            <span className="signal-pulse signal-pulse--one">
              <SignalWave />
            </span>

            <span className="signal-pulse signal-pulse--two">
              <SignalWave />
            </span>

            <span className="signal-pulse signal-pulse--three">
              <SignalWave />
            </span>

            <span className="signal-emission__node" />
          </div>
        ))}

        <SignalRobot rotation={headRotation} />
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
            <p className="mx-auto mb-5 w-fit bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_32%,#f359d2_68%,#7cff00_100%)] bg-clip-text font-mono text-[0.62rem] font-black tracking-[0.24em] text-transparent uppercase drop-shadow-[0_0_12px_rgba(243,89,210,0.25)] [-webkit-text-fill-color:transparent] sm:text-[0.68rem] lg:mx-0">
              No Ads. No Algorithmic Feed.
            </p>

            <h1 className="display-type mx-auto max-w-[36rem] text-[clamp(2rem,11vw,5rem)] leading-[0.96] tracking-[-0.045em] text-[#f4f2ef] lg:mx-0 lg:text-[clamp(3rem,3.4vw,4rem)]">
              <span className="block text-white">Find Your Space.</span>

              <span className="mt-1 block bg-[linear-gradient(30deg,#1800ad,#6c14ce,#f359d2)] bg-clip-text text-[4.5rem] leading-[0.9] text-transparent [-webkit-text-fill-color:transparent] sm:text-[5.25rem] lg:text-[7rem] xl:text-[7.5rem]">
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
