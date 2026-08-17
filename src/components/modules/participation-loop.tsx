import {
  Activity,
  BadgeCheck,
  Compass,
  HandHeart,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    title: "Check your Pulse",
    description: "Name your energy, capacity, and comfort level.",
    icon: Activity,
    accent:
      "border-[#665cff] text-[#8f84ff] shadow-[0_0_24px_rgba(102,92,255,0.28)]",
  },
  {
    title: "See What Fits",
    description:
      "Get recommendations for people, places, circles and plans that match where you are.",
    icon: Compass,
    accent:
      "border-[#9d46ec] text-[#bd7cff] shadow-[0_0_24px_rgba(157,70,236,0.28)]",
  },
  {
    title: "Choose Your Way In",
    description:
      "Join an event, conversation, circle, or experience that feels right for you.",
    icon: Sparkles,
    accent:
      "border-[#f359d2] text-[#ff79dc] shadow-[0_0_24px_rgba(243,89,210,0.28)]",
  },
  {
    title: "Take Part",
    description:
      "Play, connect, create, support, learn, or contribute in the way that works for your capacity.",
    icon: HandHeart,
    accent:
      "border-[#ff7a8a] text-[#ff9aa6] shadow-[0_0_24px_rgba(255,122,138,0.25)]",
  },
  {
    title: "Keep The Record",
    description:
      "Keep a personal record, unlock badges, and earn rewards through your participation and contributions.",
    icon: BadgeCheck,
    accent:
      "border-[#7cff00] text-[#a8ff55] shadow-[0_0_24px_rgba(124,255,0,0.25)]",
  },
] as const;

export function ParticipationLoop() {
  return (
    <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-[#050509] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-8rem] left-1/2 size-72 -translate-x-1/2 rounded-full bg-[#6c14ce]/10 blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8rem] bottom-[-10rem] size-72 rounded-full bg-[#7cff00]/5 blur-[100px]"
      />

      {/* Desktop heartbeat path */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[5.4rem] right-[10%] left-[10%] hidden h-12 lg:block"
      >
        <svg
          className="h-full w-full overflow-visible"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 48"
        >
          <defs>
            <linearGradient
              id="participation-path-gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="1000"
              y1="0"
              y2="0"
            >
              <stop offset="0%" stopColor="#1800ad" />
              <stop offset="36%" stopColor="#6c14ce" />
              <stop offset="70%" stopColor="#f359d2" />
              <stop offset="100%" stopColor="#7cff00" />
            </linearGradient>

            <filter
              id="participation-path-glow"
              height="300%"
              width="120%"
              x="-10%"
              y="-100%"
            >
              <feGaussianBlur result="blur" stdDeviation="3" />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M0 24H130L145 24L155 10L168 39L182 24H330L345 24L355 10L368 39L382 24H530L545 24L555 10L568 39L582 24H730L745 24L755 10L768 39L782 24H930L945 24L955 10L968 39L982 24H1000"
            opacity="0.45"
            stroke="url(#participation-path-gradient)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />

          <path
            d="M0 24H130L145 24L155 10L168 39L182 24H330L345 24L355 10L368 39L382 24H530L545 24L555 10L568 39L582 24H730L745 24L755 10L768 39L782 24H930L945 24L955 10L968 39L982 24H1000"
            filter="url(#participation-path-glow)"
            stroke="url(#participation-path-gradient)"
            strokeDasharray="100 1100"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          >
            <animate
              attributeName="stroke-dashoffset"
              dur="5s"
              from="1200"
              repeatCount="indefinite"
              to="0"
            />
          </path>
        </svg>
      </div>

      <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-0">
        <div
          aria-hidden="true"
          className="absolute top-7 bottom-7 left-7 w-px bg-[linear-gradient(180deg,#1800ad_0%,#6c14ce_36%,#f359d2_70%,#7cff00_100%)] lg:hidden"
        />

        {steps.map(({ title, description, icon: Icon, accent }, index) => (
          <li
            className="relative z-10 grid grid-cols-[3.5rem_1fr] items-center gap-4 lg:block lg:px-4 lg:text-center"
            key={title}
          >
            <span className="mb-3 hidden text-xs font-bold tracking-[0.18em] text-white/60 lg:block">
              0{index + 1}
            </span>

            <div
              className={`relative flex size-14 items-center justify-center rounded-full border bg-[#050509] transition-transform duration-300 hover:scale-105 lg:mx-auto ${accent}`}
            >
              <Icon aria-hidden="true" className="size-5" />
            </div>

            <div>
              <span className="mb-2 block text-xs font-bold tracking-[0.18em] text-white/60 lg:hidden">
                0{index + 1}
              </span>

              <h3 className="text-sm font-bold tracking-[0.08em] text-white uppercase lg:mt-6">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex justify-center lg:mt-14">
        <p className="rounded-full border border-[#992bff]/35 bg-black/40 px-5 py-2.5 text-center text-[0.65rem] font-bold tracking-[0.18em] text-white/75 uppercase backdrop-blur-sm">
          Show up in the way that fits today.
        </p>
      </div>
    </div>
  );
}
