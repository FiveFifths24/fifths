import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  Gauge,
  HeartHandshake,
  MegaphoneOff,
  CalendarDays,
  Gamepad2,
  Globe2,
  PenLine,
  RadioTower,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { PulseLivingBackground } from "@/components/effects/pulse-living-background";
import { PulseHero } from "@/components/hero/pulse-hero";
import { Container } from "@/components/ui/container";
import { EHubLandingCta } from "@/features/ehub/ehub-landing-cta";

const signalJourney = [
  {
    number: "01",
    title: "Tune Your Signal",
    description:
      "Transmit your current energy, availability, and capacity to the network.",
    color: "#1800ad",
    icon: Activity,
  },
  {
    number: "02",
    title: "Ping The Network",
    description:
      "Detect people, projects, and experiences matching your broadcast.",
    color: "#6c14ce",
    icon: RadioTower,
  },
  {
    number: "03",
    title: "Follow The Frequency",
    description:
      "Engage digitally, meet physically, create with others, or explore on your own terms.",
    color: "#f359d2",
    icon: UsersRound,
  },
  {
    number: "04",
    title: "Log The Connection",
    description:
      "Preserve your verified contributions to access tiers, rewards, and your reputation as you evolve.",
    color: "#7cff00",
    icon: Globe2,
  },
] as const;

const features = [
  {
    number: "01",
    name: "Sessions",
    eyebrow: "Live Broadcasts & Events",
    description:
      "Discover curated events, workshops, game nights, gatherings, and experiences that fit your current Pulse.",
    href: "/home/sessions",
    color: "#6c14ce",
    icon: CalendarDays,
    layout: "lg:col-span-7 lg:min-h-[13.5rem]",
  },
  {
    number: "02",
    name: "Circles",
    eyebrow: "Frequency Clusters",
    description:
      "Connect in smaller communities built around shared interests, identities, goals, and energy.",
    href: "/home/circles",
    color: "#f359d2",
    icon: UsersRound,
    layout: "lg:col-span-5 lg:min-h-[13.5rem]",
  },
  {
    number: "03",
    name: "Creator Commons",
    eyebrow: "Co-Creation Nodes",
    description:
      "Find collaborators, opportunities, resources, and creative spaces where ideas can become real work.",
    href: "/home/commons",
    color: "#a855f7",
    icon: PenLine,
    layout: "lg:col-span-5 lg:min-h-[13.5rem]",
  },
  {
    number: "04",
    name: "Fifth Realm",
    eyebrow: "Simulated Experiences",
    description:
      "Step into campaigns and immersive experiences shaped by story, culture, play, and collective imagination.",
    href: "/home/realm",
    color: "#22d3ee",
    icon: Gamepad2,
    layout: "lg:col-span-7 lg:min-h-[13.5rem]",
  },
  {
    number: "05",
    name: "Passport",
    eyebrow: "Verified Credentials",
    description:
      "Keep one private, trusted record of the Sessions, opportunities, campaigns, and contributions you complete across SIGNAL.",
    href: "/home/passport",
    color: "#7cff00",
    icon: Globe2,
    layout: "lg:col-span-12 lg:min-h-[11.5rem]",
  },
] as const;

const principles = [
  {
    title: "Capacity First",
    description:
      "What you see is shaped by your current capacity and preferences—not what generates the most clicks.",
    icon: Gauge,
    color: "#6c14ce",
  },
  {
    title: "Nothing Is Paid To Reach You",
    description:
      "No advertisements, sponsored posts, or paid placement competing for your attention.",
    icon: MegaphoneOff,
    color: "#f359d2",
  },
  {
    title: "Participation Over Popularity",
    description:
      "SIGNAL is designed to help people connect, create, and contribute—not perform for numbers.",
    icon: HeartHandshake,
    color: "#7cff00",
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#020205] text-white">
      <PulseLivingBackground />
      <EHubLandingCta />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      >
        <div className="absolute top-[8%] left-[-20rem] size-[42rem] rounded-full bg-[#1800ad]/10 blur-[190px]" />
        <div className="absolute top-[30%] right-[-18rem] size-[42rem] rounded-full bg-[#6c14ce]/8 blur-[190px]" />
        <div className="absolute top-[58%] left-[-18rem] size-[40rem] rounded-full bg-[#f359d2]/7 blur-[190px]" />
        <div className="absolute right-[-18rem] bottom-[5%] size-[42rem] rounded-full bg-[#7cff00]/5 blur-[190px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,2,5,0.08)_58%,rgba(2,2,5,0.7)_100%)]" />
      </div>

      <div className="relative z-10">
        <PulseHero />

        <section className="relative py-12 sm:py-14 lg:pt-32 lg:pb-16">
          <Container className="!max-w-[76rem]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="bg-[linear-gradient(90deg,#1800ad_40%,#6c14ce_45%,#f359d2_50%,#7cff00_60%)] bg-clip-text font-mono text-[0.65rem] font-bold tracking-[0.24em] text-transparent uppercase [-webkit-text-fill-color:transparent]">
                Your Signal Ignites The Network
              </p>

              <h2 className="mt-1 text-[clamp(2.3rem,3.6vw,3.75rem)] leading-[0.95] font-black tracking-[-0.05em] text-white [text-shadow:0_0_3px_rgba(255,255,255,0.75),0_0_8px_rgba(255,255,255,0.32),0_0_16px_rgba(255,255,255,0.14)]">
                How It Works
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base"></p>
            </div>

            <div className="relative mt-12">
              <div
                aria-hidden="true"
                className="absolute top-8 right-[12.5%] left-[12.5%] hidden h-px bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)] opacity-55 lg:block"
              />

              <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                {signalJourney.map((step) => {
                  const Icon = step.icon;

                  return (
                    <article
                      className="group relative flex flex-col items-center text-center"
                      key={step.title}
                    >
                      <div
                        className="relative z-10 flex size-16 items-center justify-center rounded-2xl border bg-[#020205]"
                        style={{
                          borderColor: `${step.color}75`,
                          color: step.color,
                          boxShadow: `0 0 28px ${step.color}18`,
                        }}
                      >
                        <Icon aria-hidden="true" className="size-7" />
                      </div>

                      <div className="mt-6">
                        <p
                          className="font-mono text-xs font-black tracking-[0.18em] uppercase sm:text-sm"
                          style={{ color: step.color }}
                        >
                          Signal {step.number}
                        </p>

                        <h3 className="mx-auto mt-3 max-w-[13rem] text-xl leading-[1.15] font-black text-white sm:text-2xl lg:min-h-[3.5rem]">
                          {step.title}
                        </h3>

                        <p className="mx-auto mt-3 max-w-[17rem] text-[0.95rem] leading-7 text-white/65 sm:text-base">
                          {step.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>

        <section
          className="relative scroll-mt-24 py-12 sm:py-14 lg:py-20"
          id="ecosystem"
        >
          <Container className="!max-w-[76rem]">
            <div className="mx-auto max-w-4xl text-center">
              <p className="bg-[linear-gradient(90deg,#1800ad_40%,#6c14ce_45%,#f359d2_50%,#7cff00_60%)] bg-clip-text font-mono text-xs font-bold tracking-[0.22em] text-transparent uppercase [-webkit-text-fill-color:transparent] sm:text-sm">
                The SIGNAL Ecosystem
              </p>

              <h2 className="mt-3 text-[clamp(2.5rem,4vw,3.9rem)] leading-[0.94] font-black tracking-[-0.05em] text-white [text-shadow:0_0_3px_rgba(255,255,255,0.7),0_0_8px_rgba(255,255,255,0.28),0_0_16px_rgba(255,255,255,0.12)]">
                Five Paths.
                <span className="block">One Connected Ecosystem.</span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-7 text-white/65 sm:text-base sm:leading-8">
                Start where you are. Join what fits. Move through SIGNAL your
                way.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                const layout = index < 3 ? "xl:col-span-2" : "xl:col-span-3";

                return (
                  <Link
                    className={`group relative flex min-h-[16rem] flex-col overflow-hidden rounded-[1.75rem] border bg-black/20 p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-black/30 sm:p-8 ${layout}`}
                    href={feature.href}
                    key={feature.name}
                    style={{
                      borderColor: `${feature.color}40`,
                      boxShadow: `inset 0 0 40px ${feature.color}08`,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-8 top-0 h-px"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                      }}
                    />

                    <div className="flex items-start justify-between gap-5">
                      <div
                        className="flex size-14 items-center justify-center rounded-2xl border bg-[#020205]/80"
                        style={{
                          borderColor: `${feature.color}70`,
                          color: feature.color,
                          boxShadow: `0 0 24px ${feature.color}18`,
                        }}
                      >
                        <Icon aria-hidden="true" className="size-6" />
                      </div>

                      <span
                        className="font-mono text-xs font-black tracking-[0.16em]"
                        style={{ color: feature.color }}
                      >
                        {feature.number}
                      </span>
                    </div>

                    <div className="mt-8">
                      <p
                        className="text-xs font-black tracking-[0.14em] uppercase sm:text-sm"
                        style={{ color: feature.color }}
                      >
                        {feature.eyebrow}
                      </p>

                      <h3 className="mt-2 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                        {feature.name}
                      </h3>

                      <p className="mt-4 max-w-xl text-[0.95rem] leading-7 text-white/65 sm:text-base">
                        {feature.description}
                      </p>
                    </div>

                    <div className="mt-auto flex justify-end pt-7">
                      <span
                        className="flex size-10 items-center justify-center rounded-full border bg-black/30 transition duration-300 group-hover:translate-x-1"
                        style={{
                          borderColor: `${feature.color}45`,
                          color: feature.color,
                        }}
                      >
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="relative py-12 sm:py-14 lg:py-16">
          <Container className="!max-w-[76rem]">
            <div className="px-2 py-6 sm:px-4 sm:py-8 lg:px-0 lg:py-10">
              {" "}
              <div className="grid items-center gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
                <div className="mx-auto max-w-lg text-center lg:mx-0 lg:text-left">
                  <p className="bg-[linear-gradient(90deg,#1800ad_5%,#6c14ce_15%,#f359d2_40%,#7cff00_50%)] bg-clip-text font-mono text-xs font-bold tracking-[0.22em] text-transparent uppercase [-webkit-text-fill-color:transparent] sm:text-sm">
                    Designed Differently
                  </p>

                  <h2 className="mt-4 text-[clamp(2.7rem,9vw,3.85rem)] leading-[0.9] font-black tracking-[-0.05em] text-white">
                    <span className="[text-shadow:0_0_3px_rgba(255,255,255,0.75),0_0_8px_rgba(255,255,255,0.32),0_0_16px_rgba(255,255,255,0.14)]">
                      No Ads.
                    </span>

                    <span className="mx-auto block w-fit bg-[linear-gradient(90deg,#1800ad_10%,#6c14ce_25%,#f359d2_40%,#7cff00_60%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] lg:mx-0">
                      No Algorithmic Feed.
                    </span>
                  </h2>

                  <p className="mx-auto mt-5 max-w-md text-[0.95rem] leading-7 text-white/65 sm:text-base sm:leading-7 lg:mx-0">
                    SIGNAL uses the Pulse you choose to share to help you find
                    what fits—not paid placement, follower counts, endless
                    scrolling, or engagement bait.
                  </p>
                </div>

                <div className="grid gap-3.5">
                  {principles.map((principle) => {
                    const Icon = principle.icon;

                    return (
                      <article
                        className="grid min-h-[7.5rem] grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-4 rounded-[1.35rem] border bg-black/25 p-5 text-left backdrop-blur-sm sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5 sm:px-6"
                        key={principle.title}
                        style={{
                          borderColor: `${principle.color}35`,
                          background: `linear-gradient(110deg, ${principle.color}0a, rgba(0,0,0,0.18) 45%)`,
                        }}
                      >
                        <div
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-black/40 sm:size-12"
                          style={{
                            borderColor: `${principle.color}65`,
                            color: principle.color,
                          }}
                        >
                          <Icon aria-hidden="true" className="size-5" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg leading-6 font-black text-white sm:text-xl">
                            {principle.title}
                          </h3>

                          <p className="mt-2 text-[0.95rem] leading-7 text-white/65 sm:text-base sm:leading-7">
                            {principle.description}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="relative py-12 sm:py-14 lg:py-20">
          <Container className="!max-w-[76rem]">
            <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-black/15 p-7 sm:p-10 lg:p-12">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#1800ad_40%,#6c14ce_45%,#f359d2_50%,#7cff00_60%)]"
              />

              <div className="mx-auto max-w-4xl text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-[#7cff00]/45 bg-black/30">
                  <Building2
                    aria-hidden="true"
                    className="size-6 text-[#7cff00]"
                  />
                </div>

                <p className="mt-6 font-mono text-xs font-bold tracking-[0.22em] text-[#7cff00] uppercase sm:text-sm">
                  The Five Fifths eHub
                </p>

                <h2 className="mt-3 text-[clamp(2.3rem,4vw,3.7rem)] leading-[0.94] font-black tracking-[-0.05em] text-white [text-shadow:0_0_3px_rgba(255,255,255,0.75),0_0_8px_rgba(255,255,255,0.32),0_0_16px_rgba(255,255,255,0.14)]">
                  SIGNAL Has A Physical Home.
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-7 text-white/65 sm:text-base sm:leading-8">
                  The Five Fifths eHub brings gaming, creation, work, learning,
                  events, and community into one physical extension of the
                  SIGNAL ecosystem.
                </p>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [
                    "PLAY",
                    "Gaming, tournaments, and immersive experiences.",
                    "#1800ad",
                  ],
                  [
                    "CREATE",
                    "Studios, production, content, and collaboration.",
                    "#f359d2",
                  ],
                  [
                    "BUILD",
                    "Work, entrepreneurship, learning, and opportunity.",
                    "#6c14ce",
                  ],
                  [
                    "CONNECT",
                    "Events, community, and real-world participation.",
                    "#7cff00",
                  ],
                ].map(([label, description, accent]) => (
                  <div
                    className="rounded-[1.35rem] border bg-black/20 p-5 text-center sm:p-6"
                    key={label}
                    style={{
                      borderColor: `${accent}40`,
                      boxShadow: `inset 0 0 32px ${accent}08`,
                    }}
                  >
                    <p
                      className="text-sm font-black tracking-[0.15em] uppercase"
                      style={{ color: accent }}
                    >
                      {label}
                    </p>

                    <p className="mt-3 text-[0.95rem] leading-7 text-white/65">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-9 flex justify-center">
                <Link
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#7cff00]/55 bg-black/25 px-7 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-[#f359d2]/70 hover:bg-white/[0.04]"
                  href="/ehub"
                >
                  Explore The eHub
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <section className="relative px-5 pt-12 pb-16 text-center sm:pt-14 sm:pb-20">
          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
              <Sparkles className="size-5 text-[#f359d2]" />
            </div>

            <p className="mt-6 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_33%,#f359d2_66%,#7cff00_100%)] bg-clip-text font-mono text-xs font-bold tracking-[0.22em] text-transparent uppercase [-webkit-text-fill-color:transparent] sm:text-sm lg:bg-[linear-gradient(90deg,#1800ad_40%,#6c14ce_45%,#f359d2_50%,#7cff00_60%)]">
              Your Signal Starts Here
            </p>

            <h2 className="mt-3 text-[clamp(2.4rem,4vw,3.9rem)] leading-[0.94] font-black tracking-[-0.05em] text-white [text-shadow:0_0_3px_rgba(255,255,255,0.75),0_0_8px_rgba(255,255,255,0.32),0_0_16px_rgba(255,255,255,0.14)]">
              Find What Fits.
              <span className="block text-white/80">Show Up Your Way.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-7 text-white/65 sm:text-base">
              Your energy is already sending a signal. Let it lead you somewhere
              worth going.
            </p>

            <Link
              className="mx-auto mt-8 inline-flex min-h-14 w-full max-w-md items-center justify-center gap-4 rounded-full bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_32%,#f359d2_68%,#7cff00_100%)] px-10 text-sm font-black tracking-[0.1em] text-white uppercase shadow-[0_0_40px_rgba(108,20,206,0.28)] transition hover:scale-[1.02] hover:brightness-110 sm:w-auto sm:min-w-80"
              href="/signup"
            >
              Join SIGNAL
              <ArrowRight className="size-5" />
            </Link>

            <div className="mx-auto mt-8 flex items-center justify-center gap-2 text-sm text-white/50">
              <BadgeCheck className="size-4 text-[#7cff00]" />
              Built for participation, not popularity.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
