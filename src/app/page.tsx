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
    color: "#f359d2",
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
    color: "#6c14ce",
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

        <section className="relative py-12 sm:py-14 lg:py-16">
          <Container className="!max-w-[76rem]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[0.65rem] font-bold tracking-[0.24em] text-[#f359d2] uppercase">
                Your Signal Ignites The Network
              </p>

              <h2 className="mt-1 text-[clamp(2.3rem,3.6vw,3.75rem)] leading-[0.95] font-black tracking-[-0.05em] text-white">
                How It Works
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base"></p>
            </div>

            <div className="relative mt-9 overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:p-6 lg:p-0">
              <div
                aria-hidden="true"
                className="absolute top-1/2 right-[10%] left-[10%] hidden h-px -translate-y-1/2 bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)] opacity-70 lg:block"
              />

              <div className="relative grid gap-3 lg:grid-cols-4 lg:gap-0">
                {signalJourney.map((step) => {
                  const Icon = step.icon;

                  return (
                    <article
                      className="group relative flex min-h-48 flex-col rounded-[1.4rem] border border-white/10 bg-[#07070b]/95 p-6 lg:min-h-52 lg:rounded-none lg:border-y-0 lg:border-r lg:border-l-0 lg:last:border-r-0"
                      key={step.title}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="flex size-12 items-center justify-center rounded-2xl border bg-black/60"
                          style={{
                            borderColor: `${step.color}70`,
                            color: step.color,
                            boxShadow: `0 0 24px ${step.color}22`,
                          }}
                        >
                          <Icon className="size-5" />
                        </div>

                        <span className="font-mono text-xs font-black text-white/70">
                          {step.number}
                        </span>
                      </div>

                      <div className="mt-auto pt-6">
                        <h3 className="text-lg font-black text-white">
                          {step.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-white/55">
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
          className="relative scroll-mt-24 py-12 sm:py-14 lg:py-16"
          id="ecosystem"
        >
          <Container className="!max-w-[76rem]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[0.65rem] font-bold tracking-[0.24em] text-[#7cff00] uppercase">
                  The SIGNAL Ecosystem
                </p>

                <h2 className="mt-5 text-[clamp(2.4rem,3.8vw,4rem)] leading-[0.92] font-black tracking-[-0.05em] text-white">
                  Five Ways To Find Your Way In.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-white/55 sm:text-base">
                Each feature serves a different kind of participation. Together,
                they create one connected community experience.
              </p>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Link
                    className={`group relative flex min-h-[19rem] flex-col overflow-hidden rounded-[2rem] border p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 sm:p-8 ${feature.layout}`}
                    href={feature.href}
                    key={feature.name}
                    style={{
                      borderColor: `${feature.color}45`,
                      background: `radial-gradient(circle at 85% 15%, ${feature.color}24, transparent 42%), linear-gradient(145deg, ${feature.color}0f, rgba(4,4,8,0.94) 62%)`,
                      boxShadow: `inset 0 0 70px ${feature.color}0a`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div
                        className="flex size-14 items-center justify-center rounded-2xl border bg-black/40"
                        style={{
                          borderColor: `${feature.color}70`,
                          color: feature.color,
                          boxShadow: `0 0 28px ${feature.color}20`,
                        }}
                      >
                        <Icon className="size-7" />
                      </div>

                      <span
                        className="font-mono text-xs font-black"
                        style={{ color: feature.color }}
                      >
                        {feature.number}
                      </span>
                    </div>

                    <div className="mt-auto max-w-2xl pt-8 lg:pt-5">
                      <p
                        className="text-xs font-bold tracking-[0.13em] uppercase"
                        style={{ color: feature.color }}
                      >
                        {feature.eyebrow}
                      </p>

                      <h3 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                        {feature.name}
                      </h3>

                      <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                        {feature.description}
                      </p>
                    </div>

                    <ArrowRight className="absolute right-7 bottom-7 size-5 text-white/60 transition duration-300 group-hover:translate-x-1 group-hover:text-white" />
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>

        <section className="relative py-12 sm:py-14 lg:py-16">
          <Container className="!max-w-[76rem]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(24,0,173,0.14),rgba(4,4,8,0.94)_42%,rgba(243,89,210,0.08))] px-6 py-9 backdrop-blur-xl sm:px-8 sm:py-10 lg:px-10">
              <div className="grid items-center gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
                <div className="mx-auto max-w-lg text-center lg:mx-0 lg:text-left">
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.24em] text-[#f359d2] uppercase sm:text-[0.65rem]">
                    Designed Differently
                  </p>

                  <h2 className="mt-4 text-[clamp(2.7rem,9vw,3.85rem)] leading-[0.9] font-black tracking-[-0.05em] text-white">
                    No Ads.
                    <span className="mx-auto block w-fit bg-[linear-gradient(90deg,#6c14ce,#f359d2,#7cff00)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] lg:mx-0">
                      No Algorithmic Feed.
                    </span>
                  </h2>

                  <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/60 sm:text-base lg:mx-0">
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
                        className="grid min-h-[7.5rem] grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-4 rounded-[1.35rem] border border-white/10 bg-black/30 p-5 text-left sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-5 sm:px-6"
                        key={principle.title}
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
                          <h3 className="text-[0.95rem] leading-6 font-black text-white sm:text-base">
                            {principle.title}
                          </h3>

                          <p className="mt-1.5 text-[0.82rem] leading-5 text-white/60 sm:text-sm sm:leading-6">
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

        <section className="relative py-12 sm:py-14 lg:py-16">
          <Container className="!max-w-[76rem]">
            <div className="relative overflow-hidden rounded-[2.4rem] border border-[#f359d2]/35 bg-[linear-gradient(110deg,rgba(24,0,173,0.34),rgba(108,20,206,0.25)_34%,rgba(243,89,210,0.2)_68%,rgba(124,255,0,0.1))] p-7 sm:p-10 lg:p-10">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)]"
              />

              <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-2xl border border-[#f359d2] bg-black/25">
                  <Building2
                    aria-hidden="true"
                    className="size-7 text-[#f359d2]"
                  />
                </div>

                <div>
                  <p className="font-mono text-[0.65rem] font-bold tracking-[0.2em] text-[#7cff00] uppercase">
                    The Five Fifths eHub
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    Plug Into Our Physical Home
                  </h2>
                  <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/55 sm:text-lg">
                    The Five Fifths eHub will bring SIGNAL’s digital ecosystem
                    into a physical space built for gaming, creation, work,
                    learning, and community. Members will use SIGNAL to discover
                    events, reserve spaces and experiences, manage memberships,
                    and move seamlessly between the virtual network and the
                    physical hub.
                  </p>
                </div>

                <a
                  className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#f359d2] bg-black/30 px-7 text-sm font-black text-white transition hover:border-[#7cff00]/60 hover:bg-white/[0.06] sm:mt-9"
                  href="https://fivefifthsnp.com/ehub"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Explore The eHub
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section className="relative px-5 pt-12 pb-20 text-center sm:pt-16 sm:pb-24">
          <div
            aria-hidden="true"
            className="absolute right-0 bottom-0 left-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(108,20,206,0.2),rgba(243,89,210,0.1)_42%,transparent_72%)]"
          />

          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[#f359d2]/40 bg-black/30">
              <Sparkles className="size-5 text-[#f359d2]" />
            </div>

            <h2 className="mt-7 text-[clamp(2.8rem,4.5vw,4.6rem)] leading-[0.9] font-black tracking-[-0.055em] text-white">
              Find What Fits.
              <span className="block bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_30%,#f359d2_65%,#7cff00_100%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
                Show Up Your Way.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Your energy is already sending a signal. Let it lead you somewhere
              worth going.
            </p>

            <Link
              className="mx-auto mt-9 inline-flex min-h-14 w-full max-w-md items-center justify-center gap-4 rounded-full bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_32%,#f359d2_68%,#7cff00_100%)] px-10 text-sm font-black tracking-[0.1em] text-white uppercase shadow-[0_0_40px_rgba(108,20,206,0.28)] transition hover:scale-[1.02] hover:brightness-110 sm:w-auto sm:min-w-80"
              href="/signup"
            >
              Join SIGNAL
              <ArrowRight className="size-5" />
            </Link>

            <div className="mx-auto mt-10 h-px w-48 bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)]" />

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40">
              <BadgeCheck className="size-4 text-[#7cff00]" />
              Built for participation, not popularity.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
