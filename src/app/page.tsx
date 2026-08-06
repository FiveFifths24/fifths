import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Accessibility,
  Building2,
  CircleDot,
  Gamepad2,
  Leaf,
  Pencil,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { ModuleCard } from "@/components/modules/module-card";
import { ParticipationLoop } from "@/components/modules/participation-loop";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { PulseHeartbeat } from "@/components/visuals/pulse-heartbeat";
import { platformModules } from "@/config/modules";

const energyOptions = [
  {
    label: "Play",
    icon: Gamepad2,
    color:
      "border-[#ffffff]/75 text-[#ffffff] hover:border-[#4f3cff] hover:bg-[#1800ad]/15",
  },
  {
    label: "Create",
    icon: Pencil,
    color:
      "border-[#ffffff]/75 text-[#ffffff] hover:border-[#9d46ec] hover:bg-[#6c14ce]/15",
  },
  {
    label: "Connect",
    icon: UsersRound,
    color:
      "border-[#ffffff]/60 text-[#ffffff] hover:border-cyan-400 hover:bg-cyan-500/10",
  },
  {
    label: "Focus",
    icon: CircleDot,
    color:
      "border-[#ffffff]/70 text-[#ffffff] hover:border-[#f359d2] hover:bg-[#f359d2]/15",
  },
  {
    label: "Reset",
    icon: Leaf,
    color:
      "border-[#ffffff]/70 text-[#ffffff] hover:border-[#7cff00] hover:bg-[#7cff00]/15",
  },
];

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

const homepageGlitter = Array.from({ length: 150 }, (_, index) => ({
  left: `${(pseudoRandom(index * 2 + 1) * 100).toFixed(2)}%`,
  top: `${(pseudoRandom(index * 3 + 2) * 100).toFixed(2)}%`,
  size: 1 + pseudoRandom(index * 5 + 3) * 1.8,
  color: glitterColors[index % glitterColors.length],
  opacity: 0.14 + pseudoRandom(index * 7 + 4) * 0.3,
  driftX: `${(pseudoRandom(index * 11 + 5) * 80 - 40).toFixed(0)}px`,
  driftY: `${(pseudoRandom(index * 13 + 6) * 60 - 30).toFixed(0)}px`,
  duration: `${(10 + pseudoRandom(index * 17 + 7) * 12).toFixed(2)}s`,
  delay: `${(-pseudoRandom(index * 19 + 8) * 20).toFixed(2)}s`,
}));

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden bg-[#020205] text-white">
      <style>{`
        @keyframes homepage-glitter-float {
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

        .homepage-glitter {
          animation: homepage-glitter-float
            var(--glitter-duration)
            ease-in-out
            var(--glitter-delay)
            infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .homepage-glitter {
            animation: none;
          }
        }
      `}</style>

      {/* One shared background behind the entire homepage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {/* Soft atmospheric color carried through the full page */}
        <div className="absolute left-[-20rem] top-[4%] size-[46rem] rounded-full bg-[#6c14ce]/10 blur-[170px]" />
        <div className="absolute right-[-18rem] top-[32%] size-[42rem] rounded-full bg-[#f359d2]/6 blur-[170px]" />
        <div className="absolute left-[-16rem] top-[58%] size-[40rem] rounded-full bg-[#1800ad]/7 blur-[170px]" />
        <div className="absolute right-[-18rem] top-[76%] size-[44rem] rounded-full bg-[#7cff00]/5 blur-[180px]" />

        {/* Floating glitter behind every homepage section */}
        {homepageGlitter.map((particle, index) => {
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
              className="homepage-glitter absolute rounded-full mix-blend-screen"
              key={index}
              style={style}
            >
              <span className="block h-full w-full rounded-full bg-current shadow-[0_0_10px_currentColor] motion-safe:animate-pulse" />
            </span>
          );
        })}
      </div>

      {/* All homepage content stays above the shared background */}
      <div className="relative z-10">
        <section className="relative overflow-hidden">
          {/* Desktop heartbeat: begins near the middle and stays on the right */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[90%] overflow-hidden sm:block">
            <div className="absolute inset-0">
              <PulseHeartbeat idPrefix="desktop-signal" />
            </div>
          </div>

          {/* Dark transition keeps the heartbeat from competing with the copy */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[50%] bg-gradient-to-r from-[#020205] via-[#020205] via-75% to-transparent sm:block"
          />

          <Container className="relative !mx-0 flex min-h-[46rem] !max-w-none flex-col items-center justify-start px-5 pt-32 pb-20 sm:min-h-[52rem] sm:items-start sm:justify-center sm:px-8 sm:py-20 lg:min-h-[58rem] lg:px-16">
            <div className="relative z-10 w-full max-w-[62rem] text-center sm:text-left">
              {/* Badge */}
              <p className="mx-auto inline-flex max-w-[22rem] items-center justify-center gap-2 rounded-full border border-[#6c14ce]/35 bg-black/55 px-4 py-2 text-[0.56rem] leading-4 font-bold tracking-[0.14em] uppercase shadow-[0_0_24px_rgba(108,20,206,0.14)] backdrop-blur-md sm:mx-0 sm:max-w-none sm:justify-start sm:gap-2.5 sm:text-[0.66rem] sm:tracking-[0.18em]">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-white shadow-[0_0_12px_rgba(177,70,255,0.9)] sm:size-2"
                />
                <span className="ecosystem-gradient-text">
                  Community That Meets You Where You Are
                </span>
              </p>

              {/* Hero title */}
              <h1 className="display-type mx-auto mt-10 max-w-[48rem] text-center sm:mx-0 sm:mt-10 sm:text-left">
                <span className="block text-[clamp(2.5rem,3vw,3rem)] leading-none tracking-[-0.035em] text-[#f2f0ed]">
                  Find Your Space.
                </span>

                <span className="mt-3 block bg-[linear-gradient(90deg,#1800ad_10%,#6c14ce_30%,#f359d2_50%,#7cff00_70%)] bg-clip-text text-[clamp(5rem,6.5vw,7rem)] leading-[0.88] tracking-[-0.055em] text-transparent [-webkit-text-fill-color:transparent]">
                  Match Your Energy.
                </span>
              </h1>

           ²È="25¹¬(€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”õíÉ½ÕÀ¥¹±¥¹”µ™±•àµ¥¸µ ´ÄÐ¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ•¹Ñ•È…À´ÌÉ½Õ¹‘•µ™Õ±°‰½É‘•È‰œµ‰±…¬¼ÌÔÁà´ÐÑ•áÐµlÀ¸ØáÉ•µt™½¹Ðµ‰½±ÑÉ…­¥¹œµlÀ¸ÄÙ•µtÕÁÁ•É…Í”‰…­‘É½Àµ‰±ÕÈµÍ´ÑÉ…¹Í¥Ñ¥½¸µ…±°‘ÕÉ…Ñ¥½¸´ÌÀÀÍ´éµ¥¸µ ´ÄÀÍ´é…À´ÈÍ´éÁà´ÔÍ´éÑ•áÐµlÀ¸ØáÉ•µtÍ´éÑÉ…­¥¹œµlÀ¸Äá•µt€‘ì(€€€€€€€€€€€€€€€€€€€€€€€¥¹‘•à€ôôô€Ð€ü€‰½°µÍÁ…¸´ÈÍ´é½°µ…ÕÑ¼ˆ€è€ˆˆ(€€€€€€€€€€€€€€€€€€€€€ô€‘í½ÁÑ¥½¸¹½±½Éõô(€€€€€€€€€€€€€€€€€€€€€¡É•˜ôˆ½ÁÕ±Í”ˆ(€€€€€€€€€€€€€€€€€€€€€­•äõí½ÁÑ¥½¸¹±…‰•±ô(€€€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€€€ñ%½¸(€€€€€€€€€€€€€€€€€€€€€€€…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ(€€€€€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Í¥é”´ÔÑÉ…¹Í¥Ñ¥½¸µÑÉ…¹Í™½É´‘ÕÉ…Ñ¥½¸´ÌÀÀÉ½ÕÀµ¡½Ù•ÈéÍ…±”´ÄÄÀÍ´éÍ¥é”´Ðˆ(€€€€€€€€€€€€€€€€€€€€€€¼ø((€€€€€€€€€€€€€€€€€€€€€í½ÁÑ¥½¸¹±…‰•±ô(€€€€€€€€€€€€€€€€€€€€ð½1¥¹¬ø(€€€€€€€€€€€€€€€€€€¤ì(€€€€€€€€€€€€€€€ô¥ô(€€€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€€€ì¼¨5…¥¸…Ñ¥½¹Ì€¨½ô(€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µàµ…ÕÑ¼µÐ´à™±•àÜµ™Õ±°µ…àµÜµlÈÉÉ•µt™±•àµ½°…À´ÌÍ´éµà´ÀÍ´éµÐ´ÜÍ´éµ…àµÜµ¹½¹”Í´é™±•àµÉ½Üˆø(€€€€€€€€€€€€€€€ì¼¨MÑ…Ñ¥Œ½¸µ½‰¥±”ìÁÕ±Í¥¹œÉ¥¹œ…ÁÁ•…ÉÌ½¸‘•Í­Ñ½À½¹±ä€¨½ô(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰©½¥¸µÁÕ±Í”µÝÉ…ÁÁ•ÈÜµ™Õ±°Í´éÜµ…ÕÑ¼ˆø(€€€€€€€€€€€€€€€€€€ñ	ÕÑÑ½¹1¥¹¬(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰É•±…Ñ¥Ù”è´ÄÀÜµ™Õ±°½Ù•É™±½Üµ¡¥‘‘•¸‰½É‘•È´À‰œµm±¥¹•…ÈµÉ…‘¥•¹Ð äÁ‘•œ°ŒÄàÀÁ…‘|À”°ŒÙŒÄÑ•|ÌØ”°˜ÌÔåÉ|ÜÀ”°ŒÝ™˜ÀÁ|ÄÀÀ”¥tÑ•áÐµÝ¡¥Ñ”Í¡…‘½ÜµlÁ|Á|ÈÑÁá}É‰„ ÄÀà°ÈÀ°ÈÀØ°À¸ÈÈ¥t¡½Ù•Èé‰É¥¡Ñ¹•ÍÌ´ÄÄÀÍ´éµ¥¸µÜ´ÐÀˆ(€€€€€€€€€€€€€€€€€€€¡É•˜ôˆ½Í¥¹ÕÀˆ(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€)½¥¸M%90(€€€€€€€€€€€€€€€€€€ð½	ÕÑÑ½¹1¥¹¬ø(€€€€€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€€€€€ì¼¨5½‰¥±”µ½¹±ä±½¥¸‰ÕÑÑ½¸€¨½ô(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰Üµ™Õ±°Í´é¡¥‘‘•¸ˆø(€€€€€€€€€€€€€€€€€€ñ	ÕÑÑ½¹1¥¹¬(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Üµ™Õ±°‰½É‘•È‰½É‘•ÈµÝ¡¥Ñ”¼ÈÀ‰œµ‰±…¬¼ÐÔÑ•áÐµÝ¡¥Ñ”‰…­‘É½Àµ‰±ÕÈµÍ´¡½Ù•Èé‰½É‘•ÈµÝ¡¥Ñ”¼ÐÀ¡½Ù•Èé‰œµÝ¡¥Ñ”¼ÄÀˆ(€€€€€€€€€€€€€€€€€€€¡É•˜ôˆ½±½¥¸ˆ(€€€€€€€€€€€€€€€€€€€Ù…É¥…¹Ðô‰Í•½¹‘…Éäˆ(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€1½œ¥¸(€€€€€€€€€€€€€€€€€€ð½	ÕÑÑ½¹1¥¹¬ø(€€€€€€€€€€€€€€€€ð½‘¥Øø((€€€€€€€€€€€€€€€ì¼¨•Í­Ñ½Àµ½¹±ä•½ÍåÍÑ•´‰ÕÑÑ½¸€¨½ô(€€€€€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰¡¥‘‘•¸Í´é‰±½¬ˆø(€€€€€€€€€€€€€€€€€€ñ	ÕÑÑ½¹1¥¹¬(€€€€€€€€€€€€€€€€€€€…ÉÉ½Ü(€€€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰µ¥¸µÜ´Ðàˆ(€€€€€€€€€€€€€€€€€€€¡É•˜ôˆ½•½ÍåÍÑ•´ˆ(€€€€€€€€€€€€€€€€€€€Ù…É¥…¹Ðô‰•½ÍåÍÑ•´ˆ(€€€€€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€€€€€€ñÍÁ…¸±…ÍÍ9…µ”ô‰•½ÍåÍÑ•´µÉ…‘¥•¹ÐµÑ•áÐˆø(€€€€€€€€€€€€€€€€€€€€€áÁ±½É”Ñ¡”½ÍåÍÑ•´(€€€€€€€€€€€€€€€€€€€€ð½ÍÁ…¸ø(€€€€€€€€€€€€€€€€€€ð½	ÕÑÑ½¹1¥¹¬ø(€€€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½½¹Ñ…¥¹•Èø(€€€€€€€€ð½Í•Ñ¥½¸ø((€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰Áä´ÈÀÍ´éÁä´Èàˆø(€€€€€€€€€€ñ½¹Ñ…¥¹•Èø(€€€€€€€€€€€€ñM•Ñ¥½¹!•…‘¥¹œ(€€€€€€€€€€€€€…±¥¸ô‰•¹Ñ•Èˆ(€€€€€€€€€€€€€•å•‰É½Üô‰Q¡”Á…ÉÑ¥¥Á…Ñ¥½¸±½½Àˆ(€€€€€€€€€€€€€Ñ¥Ñ±”ô‰¥Ù”ÍÑ•ÁÌ¸=¹”±…ÍÑ¥¹œÉ•½É¸ˆ(€€€€€€€€€€€€€‘•ÍÉ¥ÁÑ¥½¸ô‰±•…È°É•Á•…Ñ…‰±”Á…Ñ ™É½´Ñ½‘…çŠeÌ…Á…¥ÑäÑ¼±…ÍÑ¥¹œ½¹ÑÉ¥‰ÕÑ¥½¸¸ˆ(€€€€€€€€€€€€¼ø((€€€€€€€€€€€€ñA…ÉÑ¥¥Á…Ñ¥½¹1½½À€¼ø(€€€€€€€€€€ð½½¹Ñ…¥¹•Èø(€€€€€€€€ð½Í•Ñ¥½¸ø((€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰É•±…Ñ¥Ù”½Ù•É™±½Üµ¡¥‘‘•¸Áä´ÈÐÍ´éÁä´ÌÈˆø(€€€€€€€€€€ñ½¹Ñ…¥¹•È±…ÍÍ9…µ”ô‰É•±…Ñ¥Ù”ˆø(€€€€€€€€€€€€ñM•Ñ¥½¹!•…‘¥¹œ(€€€€€€€€€€€€€…±¥¸ô‰•¹Ñ•Èˆ(€€€€€€€€€€€€€•å•‰É½Üô‰=¹”½¹¹•Ñ••½ÍåÍÑ•´ˆ(€€€€€€€€€€€€€Ñ¥Ñ±”ô‰¥¹e½ÕÈA•½Á±”°e½ÕÈA±…”°e½ÕÈA…”¸ˆ(€€€€€€€€€€€€€‘•ÍÉ¥ÁÑ¥½¸ô‰áÁ±½É”°½¹¹•Ð°É•…Ñ”°Á±…ä°…¹…ÉÉäå½ÕÈ¥‘•¹Ñ¥Ñä…É½ÍÌ¥Ð…±°¸ˆ(€€€€€€€€€€€€¼ø((€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´ÄÐÉ¥…À´ÔµéÉ¥µ½±Ì´Èˆø(€€€€€€€€€€€€€íÁ±…Ñ™½Éµ5½‘Õ±•Ì¹µ…À ¡µ½‘Õ±”°¥¹‘•à¤€ôø€ (€€€€€€€€€€€€€€€€ñ5½‘Õ±•…É¥¹‘•àõí¥¹‘•áô­•äõíµ½‘Õ±”¹Í±Õôµ½‘Õ±”õíµ½‘Õ±•ô€¼ø(€€€€€€€€€€€€€€¤¥ô(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½½¹Ñ…¥¹•Èø(€€€€€€€€ð½Í•Ñ¥½¸ø((€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰Áä´ÈÀÍ´éÁä´Èàˆø(€€€€€€€€€€ñ½¹Ñ…¥¹•È±…ÍÍ9…µ”ô‰É¥…À´Ø±œéÉ¥µ½±Ì´Ìˆø(€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É½Õ¹‘•´Íá°‰½É‘•È‰½É‘•Èµ¹•ÕÑÉ…°´àÀÀ‰œµ¹•ÕÑÉ…°´äÔÀ¼àÀÀ´Ü‰…­‘É½Àµ‰±ÕÈµÍ´Í´éÀ´ä±œé½°µÍÁ…¸´Èˆø(€€€€€€€€€€€€€€ñ	Õ¥±‘¥¹œÈ…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ±…ÍÍ9…µ”ô‰Í¥é”´ÜÑ•áÐµÉ•´ÐÀÀˆ€¼ø((€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µÐ´ÄÀÑ•áÐµáÌ™½¹Ðµ‰½±ÑÉ…­¥¹œµlÀ¸Äá•µtÑ•áÐµÉ•´ÐÀÀÕÁÁ•É…Í”ˆø(€€€€€€€€€€€€€€€‘¥¥Ñ…°±…å•È™½È„Á¡åÍ¥…°™ÕÑÕÉ”(€€€€€€€€€€€€€€ð½Àø((€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰‘¥ÍÁ±…äµÑåÁ”µÐ´ÐÑ•áÐ´Ñá°±•…‘¥¹œµÑ¥¡ÐÑ•áÐµ‰…±…¹”Ñ•áÐµÝ¡¥Ñ”Í´éÑ•áÐ´Ùá°ˆø(€€€€€€€€€€€€€€€Q¡”¥Ù”¥™Ñ¡Ì•!ÕˆÝ¥±°‰•½µ”Ñ¡”™±…Í¡¥À%Q!LµÁ½Ý•É•(€€€€€€€€€€€€€€€Ù•¹Õ”¸(€€€€€€€€€€€€€€ð½ Èø((€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µÐ´Øµ…àµÜ´Éá°Ñ•áÐµ‰…Í”±•…‘¥¹œ´ÜÑ•áÐµ¹•ÕÑÉ…°´ÐÀÀˆø(€€€€€€€€€€€€€€€Q¡”Á±…Ñ™½É´¥Ì‰•¥¹œ‘•Í¥¹•Ñ¼•Ù•¹ÑÕ…±±ä½¹¹•Ð‘¥¥Ñ…°(€€€€€€€€€€€€€€€‘¥Í½Ù•ÉäÝ¥Ñ Á¡åÍ¥…°é½¹•Ì™½ÈÁ±…ä°É•…Ñ¥½¸°™½ÕÌ°(€€€€€€€€€€€€€€€½¹¹•Ñ¥½¸°…¹É•Í•Ð¸Y•¹Õ”…•ÍÌ…¹•ÅÕ¥Áµ•¹Ð½¹ÑÉ½±Ì…É”(€€€€€€€€€€€€€€€¹½ÐÁ…ÉÐ½˜Ñ¡¥Ì5Y@¸(€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€ð½…ÉÑ¥±”ø((€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰É¥…À´Øˆø(€€€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É½Õ¹‘•´Íá°‰½É‘•È‰½É‘•Èµ¹•ÕÑÉ…°´àÀÀ‰œµÝ¡¥Ñ”À´ÜÑ•áÐµ‰±…¬ˆø(€€€€€€€€€€€€€€€€ñ•ÍÍ¥‰¥±¥Ñä(€€€€€€€€€€€€€€€€€…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ(€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Í¥é”´ÜÑ•áÐµÉ•´ÜÀÀˆ(€€€€€€€€€€€€€€€€¼ø((€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰µÐ´àÑ•áÐµá°™½¹Ðµ‰±…¬ˆø(€€€€€€€€€€€€€€€€€•ÍÌ¥ÌÍÑÉÕÑÕÉ…°¸(€€€€€€€€€€€€€€€€ð½ Èø((€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µÐ´ÌÑ•áÐµÍ´±•…‘¥¹œ´ØÑ•áÐµ¹•ÕÑÉ…°´ÜÀÀˆø(€€€€€€€€€€€€€€€€€±•…È•áÁ•Ñ…Ñ¥½¹Ì°ÍÑ¥µÕ±…Ñ¥½¸½¹Ñ•áÐ°­•å‰½…É…•ÍÌ°(€€€€€€€€€€€€€€€€€É•…‘…‰±”½¹ÑÉ…ÍÐ°…¹µÕ±Ñ¥Á±”Ý…åÌÑ¼Á…ÉÑ¥¥Á…Ñ”‰•±½¹œ¥¸(€€€€€€€€€€€€€€€€€Ñ¡”™½Õ¹‘…Ñ¥½¸¸(€€€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€€€ð½…ÉÑ¥±”ø((€€€€€€€€€€€€€€ñ…ÉÑ¥±”±…ÍÍ9…µ”ô‰É½Õ¹‘•´Íá°‰½É‘•È‰½É‘•ÈµÉ•´äÀÀ¼ÜÀ‰œµÉ•´äÔÀ¼ÌÔÀ´Ü‰…­‘É½Àµ‰±ÕÈµÍ´ˆø(€€€€€€€€€€€€€€€€ñM¡¥•±‘¡•¬(€€€€€€€€€€€€€€€€€…É¥„µ¡¥‘‘•¸ô‰ÑÉÕ”ˆ(€€€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰Í¥é”´ÜÑ•áÐµÉ•´ÌÀÀˆ(€€€€€€€€€€€€€€€€¼ø((€€€€€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰µÐ´àÑ•áÐµá°™½¹Ðµ‰±…¬Ñ•áÐµÝ¡¥Ñ”ˆø(€€€€€€€€€€€€€€€€€QÉÕÍÐ¥Ì‘•Í¥¹•¥¸¸(€€€€€€€€€€€€€€€€ð½ Èø((€€€€€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µÐ´ÌÑ•áÐµÍ´±•…‘¥¹œ´ØÑ•áÐµÉ•´ÄÀÀ¼ÜÀˆø(€€€€€€€€€€€€€€€€€€Äà¬‰•Ñ„‰½Õ¹‘…É¥•Ì°Ù¥Í¥‰±”½µµÕ¹¥Ñä•áÁ•Ñ…Ñ¥½¹Ì°(€€€€€€€€€€€€€€€€€É•Á½ÉÑ¥¹œ°ÁÉ¥Ù…ä½¹ÑÉ½±Ì°…¹Ù•É¥™¥•½¹ÑÉ¥‰ÕÑ¥½¸(€€€€€€€€€€€€€€€€€Ý½É­™±½ÝÌ…É”‰•¥¹œÁ±…¹¹•‰•™½É”±…Õ¹ ¸(€€€€€€€€€€€€€€€€ð½Àø(€€€€€€€€€€€€€€ð½…ÉÑ¥±”ø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½½¹Ñ…¥¹•Èø(€€€€€€€€ð½Í•Ñ¥½¸ø((€€€€€€€€ñÍ•Ñ¥½¸±…ÍÍ9…µ”ô‰Áä´ÈÀÑ•áÐµÝ¡¥Ñ”Í´éÁä´Èàˆø(€€€€€€€€€€ñ½¹Ñ…¥¹•È±…ÍÍ9…µ”ô‰Ñ•áÐµ•¹Ñ•Èˆø(€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áÐµáÌ™½¹Ðµ‰½±ÑÉ…­¥¹œµlÀ¸É•µtÑ•áÐµl˜ÌÔåÉtÕÁÁ•É…Í”ˆø(€€€€€€€€€€€€€‰•ÑÑ•ÈÝ…ä¥¹Ñ¼½µµÕ¹¥Ñä¥Ì‰•¥¹œ‰Õ¥±Ð(€€€€€€€€€€€€ð½Àø((€€€€€€€€€€€€ñ È±…ÍÍ9…µ”ô‰‘¥ÍÁ±…äµÑåÁ”µàµ…ÕÑ¼µÐ´Ôµ…àµÜ´Ñá°Ñ•áÐ´Õá°±•…‘¥¹œµlÀ¸äÑtÑ•áÐµ‰…±…¹”Í´éÑ•áÐ´Ýá°ˆø(€€€€€€€€€€€€€e½ÕÈ•¹•ÉäÍ¡½Õ±¡•±Àå½Ô™¥¹Ñ¡”É½½·ŠQ¹½Ð­••Àå½Ô½ÕÐ½˜¥Ð¸(€€€€€€€€€€€€ð½ Èø((€€€€€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰µàµ…ÕÑ¼µÐ´Øµ…àµÜ´Éá°Ñ•áÐµ±œ±•…‘¥¹œ´àÑ•áÐµ¹•ÕÑÉ…°´ÌÀÀˆø(€€€€€€€€€€€€€áÁ±½É”¡½ÜÑ¡”•½ÍåÍÑ•´½¹¹•ÑÌ°Ñ¡•¸©½¥¸Ñ¡”™ÕÑÕÉ”‰•Ñ„(€€€€€€€€€€€€€±¥ÍÐÝ¡•¸å½×ŠeÉ”É•…‘ä¸(€€€€€€€€€€€€ð½Àø((€€€€€€€€€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰µÐ´ä™±•à™±•àµ½°©ÕÍÑ¥™äµ•¹Ñ•È…À´ÌÍ´é™±•àµÉ½Üˆø(€€€€€€€€€€€€€€ñ	ÕÑÑ½¹1¥¹¬¡É•˜ôˆ½Í¥¹ÕÀˆù)½¥¸%Q!Lð½	ÕÑÑ½¹1¥¹¬ø((€€€€€€€€€€€€€€ñ	ÕÑÑ½¹1¥¹¬(€€€€€€€€€€€€€€€±…ÍÍ9…µ”ô‰‰½É‘•ÈµÝ¡¥Ñ”¼ÈÀ‰œµ‰±…¬¼ÐÀÑ•áÐµÝ¡¥Ñ”‰…­‘É½Àµ‰±ÕÈµÍ´¡½Ù•Èé‰½É‘•ÈµÝ¡¥Ñ”¼ÐÀ¡½Ù•Èé‰œµÝ¡¥Ñ”¼ÄÀˆ(€€€€€€€€€€€€€€€¡É•˜ôˆ½•½ÍåÍÑ•´ˆ(€€€€€€€€€€€€€€€Ù…É¥…¹Ðô‰Í•½¹‘…Éäˆ(€€€€€€€€€€€€€€ø(€€€€€€€€€€€€€€€áÁ±½É”Ñ¡”½ÍåÍÑ•´(€€€€€€€€€€€€€€ð½	ÕÑÑ½¹1¥¹¬ø(€€€€€€€€€€€€ð½‘¥Øø(€€€€€€€€€€ð½½¹Ñ…¥¹•Èø(€€€€€€€€ð½Í•Ñ¥½¸ø(€€€€€€ð½‘¥Øø(€€€€ð½µ…¥¸ø(€€¤ì)ô