import Link from "next/link";

const featureLinks = [
  {
    label: "Pulse",
    href: "/home/pulse",
    color: "#1800ad",
  },
  {
    label: "Sessions",
    href: "/home/sessions",
    color: "#4c1e92",
  },
  {
    label: "Circles",
    href: "/home/circles",
    color: "#f359d2",
  },
  {
    label: "Commons",
    href: "/home/commons",
    color: "#ffffff",
  },
  {
    label: "Realm",
    href: "/home/realm",
    color: "#22d3ee",
  },
  {
    label: "Passport",
    href: "/home/passport",
    color: "#7cff00",
  },
] as const;

export function PulseHero() {
  return (
    <section className="relative min-h-[88svh] overflow-visible">
      <div className="relative z-10 flex min-h-[88svh] w-full items-center px-5 pt-24 pb-12 sm:px-7 lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-[72rem] text-center lg:mx-0 lg:text-left">
          {/* Small signal label */}
          <div className="inline-flex items-center justify-center gap-3 rounded-full border border-[#6c14ce]/45 bg-black/35 px-5 py-2.5 backdrop-blur-xl">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9d46ec] opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-[#9d46ec] shadow-[0_0_12px_#9d46ec]" />
            </span>

            <span className="font-mono text-[0.6rem] font-bold tracking-[0.2em] text-white/80 uppercase sm:text-[0.65rem]">
              Your Energy Is The Frequency
            </span>
          </div>

          {/* Main headline */}
          <h1 className="display-type mx-auto mt-9 max-w-[70rem] tracking-[-0.055em] lg:mx-0">
            <span className="block text-[clamp(3.1rem,11vw,8rem)] leading-[0.88] text-[#f4f2ef]">
              Broadcast Your
            </span>

            <span className="block bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_26%,#f359d2_58%,#7cff00_80%)] bg-clip-text text-[clamp(4.8rem,19vw,12rem)] leading-[0.82] text-transparent [-webkit-text-fill-color:transparent]">
              SIGNAL.
            </span>

            <span className="mt-3 block text-[clamp(2rem,6vw,6rem)] leading-[0.88] text-[#f4f2ef]">
              Find Your People.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-9 max-w-[48rem] text-base leading-7 text-white/55 sm:text-lg sm:leading-8 lg:mx-0">
            Find communities, creators, events, collaborations, and experiences
            worth doing — and people worth doing them with.
          </p>

          {/* Main CTA buttons */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            {/* Full ombre button */}
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_35%,#f359d2_68%,#7cff00_115%)] px-7 text-[0.7rem] font-bold tracking-[0.16em] text-white uppercase shadow-[0_0_30px_rgba(108,20,206,0.24)] transition duration-300 hover:scale-[1.02] hover:brightness-110 sm:w-auto"
              href="/signup"
            >
              Join SIGNAL
            </Link>

            {/* Ombre border + ombre text */}
            <Link
              className="group relative inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_35%,#f359d2_68%,#7cff00_115%)] p-px transition duration-300 hover:scale-[1.02] sm:w-auto"
              href="/ecosystem"
            >
              <span className="flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#020205]/95 px-7 sm:w-auto">
                <span className="bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_35%,#f359d2_68%,#7cff00_115%)] bg-clip-text text-[0.7rem] font-bold tracking-[0.16em] text-transparent uppercase [-webkit-text-fill-color:transparent]">
                  Explore Ecosystem
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop quick-action links only */}
          <nav
            aria-label="SIGNAL features"
            className="mt-9 hidden max-w-[54rem] flex-wrap gap-2.5 lg:flex"
          >
            {featureLinks.map((feature) => (
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-full border bg-black/30 px-5 font-mono text-[0.58rem] font-bold tracking-[0.16em] uppercase backdrop-blur-xl transition duration-300 hover:bg-white/[0.06]"
                href={feature.href}
                key={feature.href}
                style={{
                  borderColor: `${feature.color}80`,
                  color: feature.color,
                }}
              >
                {feature.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
