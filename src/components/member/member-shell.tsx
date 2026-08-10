import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/ui/container";

type GlitterStyle = CSSProperties & {
  "--glitter-x": string;
  "--glitter-y": string;
  "--glitter-duration": string;
  "--glitter-delay": string;
};

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const glitterColors = ["#ffffff", "#8b5cf6", "#f359d2", "#7cff00"];

const memberGlitter = Array.from({ length: 120 }, (_, index) => ({
  left: `${(pseudoRandom(index * 2 + 1) * 100).toFixed(2)}%`,
  top: `${(pseudoRandom(index * 3 + 2) * 100).toFixed(2)}%`,
  size: 1 + pseudoRandom(index * 5 + 3) * 1.8,
  color: glitterColors[index % glitterColors.length],
  opacity: 0.12 + pseudoRandom(index * 7 + 4) * 0.28,
  driftX: `${(pseudoRandom(index * 11 + 5) * 80 - 40).toFixed(0)}px`,
  driftY: `${(pseudoRandom(index * 13 + 6) * 60 - 30).toFixed(0)}px`,
  duration: `${(10 + pseudoRandom(index * 17 + 7) * 12).toFixed(2)}s`,
  delay: `${(-pseudoRandom(index * 19 + 8) * 20).toFixed(2)}s`,
}));

export function MemberShell({
  displayName,
  children,
}: {
  displayName: string;
  children: ReactNode;
}) {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#020205] pt-8 pb-16 text-white sm:pt-10 sm:pb-24">
      <style>{`
        @keyframes member-glitter-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(0.85);
          }

          50% {
            transform: translate3d(
              var(--glitter-x),
              var(--glitter-y),
              0
            ) scale(1.15);
          }
        }

        .member-glitter {
          animation: member-glitter-float
            var(--glitter-duration)
            ease-in-out
            var(--glitter-delay)
            infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .member-glitter {
            animation: none;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute top-[10%] left-[-22rem] size-[46rem] rounded-full bg-[#6c14ce]/10 blur-[190px]" />
        <div className="absolute top-[30%] right-[-18rem] size-[42rem] rounded-full bg-[#f359d2]/8 blur-[170px]" />
        <div className="absolute top-[58%] left-[-16rem] size-[40rem] rounded-full bg-[#1800ad]/8 blur-[170px]" />
        <div className="absolute top-[78%] right-[-18rem] size-[44rem] rounded-full bg-[#7cff00]/5 blur-[180px]" />

        {memberGlitter.map((particle, index) => {
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
              className="member-glitter absolute rounded-full mix-blend-screen"
              key={index}
              style={style}
            >
              <span className="block h-full w-full rounded-full bg-current shadow-[0_0_10px_currentColor] motion-safe:animate-pulse" />
            </span>
          );
        })}
      </div>

      <Container className="relative z-10">
        <div>{children}</div>
      </Container>
    </section>
  );
}
