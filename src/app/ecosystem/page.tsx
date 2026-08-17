import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Aperture,
  AudioLines,
  BadgeCheck,
  CalendarDays,
  Gamepad2,
  HeartHandshake,
} from "lucide-react";

import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Ecosystem" };

type GlitterStyle = CSSProperties & {
  "--glitter-x": string;
  "--glitter-y": string;
  "--glitter-duration": string;
  "--glitter-delay": string;
};

type NodeStyle = CSSProperties & {
  "--node-float": string;
  "--node-duration": string;
  "--node-delay": string;
};

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const glitterColors = ["#ffffff", "#8b5cf6", "#f359d2", "#7cff00"];

const ecosystemGlitter = Array.from({ length: 220 }, (_, index) => ({
  left: `${(pseudoRandom(index * 2 + 1) * 100).toFixed(2)}%`,
  top: `${(pseudoRandom(index * 3 + 2) * 100).toFixed(2)}%`,
  size: 0.8 + pseudoRandom(index * 5 + 3) * 2.2,
  color: glitterColors[index % glitterColors.length],
  opacity: 0.12 + pseudoRandom(index * 7 + 4) * 0.42,
  driftX: `${(pseudoRandom(index * 11 + 5) * 80 - 40).toFixed(0)}px`,
  driftY: `${(pseudoRandom(index * 13 + 6) * 60 - 30).toFixed(0)}px`,
  duration: `${(10 + pseudoRandom(index * 17 + 7) * 12).toFixed(2)}s`,
  delay: `${(-pseudoRandom(index * 19 + 8) * 20).toFixed(2)}s`,
}));

const spaces = [
  {
    name: "Sessions",
    tagline: "Things To Do.",
    description:
      "Discover events, workshops, meetups, classes, and experiences that fit how you want to participate.",
    icon: CalendarDays,
    href: "/home/sessions",
    accent: "#665cff",
    glow: "rgba(102,92,255,0.36)",
    border: "rgba(102,92,255,0.50)",
    position: "left-[48%] top-[7%]",
    float: "-10px",
    duration: "7.2s",
    delay: "-1.4s",
motion: "sessions-rise",
  },
  {
    name: "Circles",
    tagline: "People To Connect With.",
    description:
      "Find communities that match your interests, values, energy, and participation style.",
    icon: HeartHandshake,
    href: "/home/circles",
    accent: "#ff79dc",
    glow: "rgba(243,89,210,0.34)",
    border: "rgba(243,89,210,0.48)",
    position: "left-[12%] top-[31%]",
    float: "-8px",
    duration: "6.4s",
delay: "-3.2s",
motion: "circles-connect",
  },
  {
    name: "Commons",
    tagline: "Things To Create.",
    description:
      "Find opportunities to collaborate, contribute skills, create, and build meaningful things with others.",
    icon: Aperture,
    href: "/home/commons",
    accent: "#4be8ff",
    glow: "rgba(34,211,238,0.32)",
    border: "rgba(34,211,238,0.48)",
    position: "right-[10%] top-[31%]",
    float: "-12px",
    duration: "8s",
delay: "-4.6s",
motion: "commons-create",
  },
  {
    name: "Realm",
    tagline: "Worlds To Enter.",
    description:
      "Explore campaigns, games, stories, and immersive experiences built around shared participation.",
    icon: Gamepad2,
    href: "/home/realm",
    accent: "#bd7cff",
    glow: "rgba(157,70,236,0.34)",
    border: "rgba(157,70,236,0.50)",
    position: "left-[20%] bottom-[10%]",
    float: "-9px",
    duration: "7.5s",
delay: "-2.5s",
motion: "realm-enter",
  },
  {
    name: "Passport",
    tagline: "Your Path Of Participation.",
    description:
      "See eligible verified participation and contributions across the SIGNAL ecosystem.",
    icon: BadgeCheck,
    href: "/home/passport",
    accent: "#a8ff55",
    glow: "rgba(124,255,0,0.28)",
    border: "rgba(124,255,0,0.38)",
    position: "right-[17%] bottom-[9%]",
    float: "-11px",
    duration: "6.8s",
delay: "-5.1s",
motion: "passport-verify",
  },
] as const;

export default function EcosystemPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#020205] text-white">
<style>{`
  @keyframes ecosystem-glitter-float {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(0.8);
    }

    50% {
      transform: translate3d(
        var(--glitter-x),
        var(--glitter-y),
        0
      ) scale(1.2);
    }
  }

  @keyframes star-flicker {
    0%,
    100% {
      opacity: 0.24;
      filter: brightness(0.75);
    }

    34% {
      opacity: 0.95;
      filter: brightness(1.55);
    }

    68% {
      opacity: 0.42;
      filter: brightness(1);
    }
  }

@keyframes sessions-rise {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }

  50% {
    transform: translateY(-5px);
    opacity: 0.9;
  }
}

@keyframes circles-connect {
  0%,
  100% {
    transform: translateX(-2px) rotate(-2deg);
    opacity: 0.45;
  }

  50% {
    transform: translateX(2px) rotate(2deg);
    opacity: 0.85;
  }
}

@keyframes commons-create {
  from {
    transform: rotate(0deg);
    opacity: 0.4;
  }

  to {
    transform: rotate(360deg);
    opacity: 0.75;
  }
}

@keyframes realm-enter {
  0%,
  100% {
    transform: scale(0.96);
    opacity: 0.35;
  }

  50% {
    transform: scale(1.08);
    opacity: 0.8;
  }
}

@keyframes passport-verify {
  0% {
    transform: rotate(0deg);
    opacity: 0.25;
  }

  35% {
    opacity: 0.8;
  }

  100% {
    transform: rotate(360deg);
    opacity: 0.25;
  }
}

.sessions-rise {
  animation: sessions-rise 4.8s ease-in-out infinite;
}

.circles-connect {
  animation: circles-connect 5.5s ease-in-out infinite;
}

.commons-create {
  animation: commons-create 14s linear infinite;
}

.realm-enter {
  animation: realm-enter 6s ease-in-out infinite;
}

.passport-verify {
  animation: passport-verify 10s linear infinite;
}

  @keyframes node-float {
    0%,
    100% {
      transform: translate3d(0, 0, 0);
    }

    50% {
      transform: translate3d(0, var(--node-float), 0);
    }
  }

@keyframes pulse-core {
  0%,
  100% {
    transform: scale(1);
    filter: brightness(1);
  }

  8% {
    transform: scale(1.06);
    filter: brightness(1.14);
  }

  14% {
    transform: scale(0.985);
    filter: brightness(1.02);
  }

  20% {
    transform: scale(1.035);
    filter: brightness(1.1);
  }

  28% {
    transform: scale(1);
    filter: brightness(1);
  }

  72% {
    transform: scale(1);
    filter: brightness(1);
  }
}

  .ecosystem-glitter {
    animation:
      ecosystem-glitter-float
      var(--glitter-duration)
      ease-in-out
      var(--glitter-delay)
      infinite;
    will-change: transform;
  }

  .ecosystem-star-light {
    animation: star-flicker 4.6s ease-in-out infinite;
  }

  .ecosystem-node {
    animation:
      node-float
      var(--node-duration)
      ease-in-out
      var(--node-delay)
      infinite;
    will-change: transform;
  }

.pulse-node {
  animation: pulse-core 2.4s ease-in-out infinite;
  transform-origin: center;
  will-change: transform, filter;
}

  @media (prefers-reduced-motion: reduce) {
    .ecosystem-glitter,
    .ecosystem-star-light,
    .ecosystem-node,
    .pulse-node {
    .sessions-rise,
.circles-connect,
.commons-create,
.realm-enter,
.passport-verify,
      animation: none;
    }
  }
`}</style>

      {/* Shared landing-page glitter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute left-[-18rem] top-[18%] size-[42rem] rounded-full bg-[#1800ad]/8 blur-[180px]" />
        <div className="absolute right-[-16rem] top-[24%] size-[38rem] rounded-full bg-[#f359d2]/6 blur-[170px]" />
        <div className="absolute bottom-[-18rem] left-[35%] size-[46rem] rounded-full bg-[#6c14ce]/8 blur-[190px]" />

        {ecosystemGlitter.map((particle, index) => {
          const style: GlitterStyle = {
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            color: particle.color,
            opacity: particle.opacity,
            "--glitter-x": particle.driftX,
            "--glitter-y": particle.driftY,
            "--glitter-duration": particle.duration,
            "--glitter-delay": particle.delay,
          };

          return (
            <span
              className="ecosystem-glitter absolute rounded-full mix-blend-screen"
              key={index}
              style={style}
            >
              <span
                className="ecosystem-star-light block h-full w-full rounded-full bg-current shadow-[0_0_10px_currentColor]"
                style={{
                  animationDelay: `${-(index % 9) * 0.47}s`,
                  animationDuration: `${3.2 + (index % 7) * 0.55}s`,
                }}
              />
            </span>
          );
        })}
      </div>

      <Container className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl">

          {/* Desktop interactive starfield */}
          <section className="relative mt-8 hidden min-h-[780px] lg:block">
            {/* Atmospheric center glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6c14ce]/8 blur-[150px]"
            />


            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 size-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f359d2]/5 blur-[110px]"
            />


            {/* Pulse */}
            <Link
              className="group absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              href="/home/pulse"
            >
<div className="pulse-node relative flex size-48 items-center justify-center">
  {/* large atmospheric glow */}
  <div
    aria-hidden="true"
    className="absolute inset-[-4rem] rounded-full bg-[radial-gradient(circle,rgba(108,20,206,0.20)_0%,rgba(243,89,210,0.08)_38%,transparent_70%)] blur-[30px]"
  />

  {/* outer signal ring */}
  <div
 aria-hidden="true"
  className="absolute inset-0 rounded-full border opacity-30 transition-all duration-500 group-hover:scale-125 group-hover:opacity-70"  /
  >

  {/* middle gradient ring */}
  <div
    aria-hidden="true"
    className="absolute inset-[0.55rem] rounded-full bg-[linear-gradient(135deg,#1800ad,#6c14ce,#f359d2)] p-px"
  >
    <div className="size-full rounded-full bg-[#020205]/95" />
  </div>

  {/* inner signal ring */}
  <div
    aria-hidden="true"
    className="absolute inset-[1.35rem] rounded-full border border-[#ca9aff]/20"
  />

  {/* pulse core */}
<div className="relative z-10 flex size-36 flex-col items-center justify-center rounded-full bg-black/80 text-center backdrop-blur-xl">
  <div className="relative flex size- items-center justify-center">
    <div
      aria-hidden="true"
      className="absolute inset-[-0.5rem] rounded-full bg-[#6c14ce]/25 blur-2xl"
    />

<svg
  aria-hidden="true"
  className="size-10 text-[#ca9aff]"
  viewBox="0 0 64 40"
  fill="none"
>
  <path
    d="M2 22H14L19 12L25 32L32 5L39 28L44 18L49 22H62"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
  </div>

  <p className="mt-1 text-2xl font-bold tracking-tight text-white">
    Pulse
  </p>

</div>
  {/* signal ticks */}
  <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-[#ca9aff]/70" />
  <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-[#ca9aff]/70" />
  <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-[#f359d2]/70" />
  <span className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2 bg-[#f359d2]/70" />
</div>
            </Link>

            {/* Feature stars */}
            {spaces.map((space) => {
              const Icon = space.icon;

              const nodeStyle: NodeStyle = {
                "--node-float": space.float,
                "--node-duration": space.duration,
                "--node-delay": space.delay,
              };

              return (
                <div
                  className={`ecosystem-node group absolute z-30 ${space.position}`}
                  key={space.name}
                  style={nodeStyle}
                >
                  <Link
                    className="relative block"
                    href={space.href}
                    aria-label={`Explore ${space.name}`}
                  >
                    {/* outer glow */}
                    <div
                      aria-hidden="true"
                      className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[34px] transition duration-500 group-hover:size-36"
                      style={{
                        backgroundColor: space.glow,
                      }}
                    />

                    {/* star */}
                    <div
                      className="relative flex size-20 items-center justify-center rounded-full border bg-black/75 backdrop-blur-xl transition duration-300 group-hover:scale-110"
                      style={{
                        borderColor: space.border,
                        color: space.accent,
                        boxShadow: `0 0 24px ${space.glow}`,
                      }}
                    >
                      <Icon className="size-8" />
                    </div>

                    {/* always-visible label */}
                    <div className="absolute left-1/2 top-[6.8rem] w-44 -translate-x-1/2 text-center">
                      <p
                        className="text-lg font-bold"
                        style={{ color: space.accent }}
                      >
                        {space.name}
                      </p>

                    </div>

{/* SIGNAL transmission */}
<div
  className="pointer-events-none absolute left-1/2 top-[7.2rem] w-72 -translate-x-1/2 translate-y-3 overflow-hidden rounded-[1.4rem] border bg-[#050508]/90 opacity-0 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
  style={{
    borderColor: space.border,
    boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 30px ${space.glow}`,
  }}
>
  {/* module-colored signal edge */}
  <div
    aria-hidden="true"
    className="h-px w-full"
    style={{
      background: `linear-gradient(90deg, transparent, ${space.accent}, transparent)`,
    }}
  />

  <div className="p-5">
    {/* transmission status */}
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span
          className="size-1.5 rounded-full"
          style={{
            backgroundColor: space.accent,
            boxShadow: `0 0 10px ${space.accent}`,
          }}
        />

        <span
          className="text-[0.6rem] font-bold uppercase tracking-[0.2em]"
          style={{ color: space.accent }}
        >
          SIGNAL / {space.name}
        </span>
      </div>

      <span className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/30">
        Active
      </span>
    </div>

    {/* title */}
    <h3 className="mt-4 text-xl font-bold text-white">
      {space.name}
    </h3>

    {/* tagline */}
    <p
      className="mt-1 text-sm font-semibold"
      style={{ color: space.accent }}
    >
      {space.tagline}
    </p>

    {/* description */}
    <p className="mt-3 text-sm leading-6 text-white/50">
      {space.description}
    </p>

    {/* CTA */}
    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
      <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white/30">
        Transmission received
      </span>

      <span
        className="text-xs font-bold uppercase tracking-[0.14em]"
        style={{ color: space.accent }}
      >
        Enter →
      </span>
    </div>
  </div>
</div>
                  </Link>
                </div>
              );
            })}
          </section>

          <section className="relative z-20 mx-auto mt-10 max-w-5xl">
  <div className="overflow-hidden rounded-[2rem] border border-[#6c14ce]/25 bg-black/55 p-6 text-center shadow-[0_20px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8 lg:p-10">
    <div className="inline-flex items-center gap-2 rounded-full border border-[#6c14ce]/30 bg-black/40 px-4 py-2 backdrop-blur-md">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#f359d2] opacity-40" />
        <span className="relative inline-flex size-2 rounded-full bg-[#f359d2] shadow-[0_0_12px_rgba(243,89,210,0.9)]" />
      </span>

      <span className="bg-[linear-gradient(90deg,#ca9aff,#f359d2)] bg-clip-text text-xs font-bold uppercase tracking-[0.22em] text-transparent">
        The Ecosystem
      </span>
    </div>

    <h1 className="display-type mx-auto mt-5 max-w-4xl text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
      <span className="block text-white">
        Everything Moves
      </span>

      <span className="block bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_30%,#f359d2_62%,#7cff00_100%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
        Through Your Signal.
      </span>
    </h1>

    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8">
      Pulse helps shape what rises across Sessions, Circles, Commons,
      Realm, and Passport—creating one connected participation system
      that responds to where you are right now.
    </p>
  </div>
</section>

          {/* Mobile / tablet */}
          <section className="relative mt-12 lg:hidden">
            <Link
              className="mx-auto flex size-40 flex-col items-center justify-center rounded-full border border-[#6c14ce]/40 bg-black/70 text-center shadow-[0_0_50px_rgba(108,20,206,0.20)] backdrop-blur-xl"
              href="/home/pulse"
            >
<AudioLines className="size-8 text-[#ca9aff]" strokeWidth={2.2} />

              <p className="mt-2 text-xl font-bold text-white">Pulse</p>

            </Link>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {spaces.map((space) => {
                const Icon = space.icon;

                return (
                  <Link
                    className="rounded-[1.5rem] border bg-black/60 p-5 backdrop-blur-xl"
                    href={space.href}
                    key={space.name}
                    style={{
                      borderColor: space.border,
                      boxShadow: `0 0 24px ${space.glow}`,
                    }}
                  >
                    <div className="flex items-center gap-4">
{/* SIGNAL beacon */}
<div className="relative flex size-24 items-center justify-center">
  {/* outer signal ring */}
  <div
aria-hidden="true"
  className={`absolute inset-0 rounded-full border opacity-30 transition-all duration-500 group-hover:opacity-70 ${space.motion}`}
      style={{
      borderColor: space.accent,
      boxShadow: `0 0 24px ${space.glow}`,
    }}
  />

  {/* second offset ring */}
  <div
    aria-hidden="true"
    className="absolute inset-[0.45rem] rounded-full border opacity-40 transition-all duration-500 group-hover:scale-110 group-hover:opacity-80"
    style={{
      borderColor: space.border,
    }}
  />

  {/* soft beacon glow */}
  <div
    aria-hidden="true"
    className="absolute inset-[0.6rem] rounded-full blur-xl transition-all duration-500 group-hover:scale-125"
    style={{
      backgroundColor: space.glow,
    }}
  />

  {/* main beacon core */}
  <div
    className="relative z-10 flex size-16 items-center justify-center rounded-full border bg-black/80 backdrop-blur-xl transition-all duration-300 group-hover:scale-110"
    style={{
      borderColor: space.border,
      color: space.accent,
      boxShadow: `0 0 26px ${space.glow}`,
    }}
  >
    <Icon className="size-7" />
  </div>

  {/* signal ticks */}
  <span
    aria-hidden="true"
    className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2"
    style={{ backgroundColor: space.accent }}
  />

  <span
    aria-hidden="true"
    className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2"
    style={{ backgroundColor: space.accent }}
  />

  <span
    aria-hidden="true"
    className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2"
    style={{ backgroundColor: space.accent }}
  />

  <span
    aria-hidden="true"
    className="absolute right-0 top-1/2 h-px w-2 -translate-y-1/2"
    style={{ backgroundColor: space.accent }}
  />
</div>

                      <div>
                        <p
                          className="text-lg font-bold"
                          style={{ color: space.accent }}
                        >
                          {space.name}
                        </p>

                        <p className="mt-1 text-sm text-white/65">
                          {space.tagline}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/45">
                      {space.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

        </div>
      </Container>
    </main>
  );
}