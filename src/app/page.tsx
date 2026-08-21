import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Gamepad2,
  Globe2,
  LockKeyhole,
  PenLine,
  RadioTower,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { PulseLivingBackground } from "@/components/effects/pulse-living-background";
import { PulseHero } from "@/components/hero/pulse-hero";
import { Container } from "@/components/ui/container";

const signalJourney = [
  {
    number: "01",
    title: "Check your Pulse",
    description:
      "Tell SIGNAL what your energy, time, and capacity look like right now.",
    color: "#1800ad",
    icon: Activity,
  },
  {
    number: "02",
    title: "See what fits",
    description:
      "Discover people, plans, and experiences aligned with the way you want to participate.",
    color: "#6c14ce",
    icon: RadioTower,
  },
  {
    number: "03",
    title: "Participate your way",
    description:
      "Join online, meet in person, create with others, or explore independently.",
    color: "#f359d2",
    icon: UsersRound,
  },
  {
    number: "04",
    title: "Build your Passport",
    description:
      "Carry your verified participation, access, and benefits forward as you grow.",
    color: "#7cff00",
    icon: Globe2,
  },
] as const;

const features = [
  {
    number: "01",
    name: "Sessions",
    eyebrow: "Find something worth doing",
    description:
      "Discover curated events, workshops, game nights, gatherings, and experiences that fit your current Pulse.",
    href: "/home/sessions",
    color: "#f359d2",
    icon: CalendarDays,
    layout: "lg:col-span-7 lg:min-h-[15rem]",
  },
  {
    number: "02",
    name: "Circles",
    eyebrow: "Find people to return to",
    description:
      "Connect in smaller communities built around shared interests, identities, goals, and energy.",
    href: "/home/circles",
    color: "#6c14ce",
    icon: UsersRound,
    layout: "lg:col-span-5 lg:min-h-[15rem]",
  },
  {
    number: "03",
    name: "Creator Commons",
    eyebrow: "Make something together",
    description:
      "Find collaborators, opportunities, resources, and creative spaces where ideas can become real work.",
    href: "/home/commons",
    color: "#a855f7",
    icon: PenLine,
    layout: "lg:col-span-5 lg:min-h-[15rem]",
  },
  {
    number: "04",
    name: "Fifth Realm",
    eyebrow: "Enter a shared world",
    description:
      "Step into campaigns and immersive experiences shaped by story, culture, play, and collective imagination.",
    href: "/home/realm",
    color: "#22d3ee",
    icon: Gamepad2,
    layout: "lg:col-span-7 lg:min-h-[15rem]",
  },
  {
    number: "05",
    name: "Passport",
    eyebrow: "Carry your participation forward",
    description:
      "Keep one private, trusted record of the Sessions, opportunities, campaigns, and contributions you complete across SIGNAL.",
    href: "/home/passport",
    color: "#7cff00",
    icon: Globe2,
    layout: "lg:col-span-12 lg:min-h-[15rem]",
  },
] as const;

const principles = [
  {
    title: "Your capacity matters",
    description:
      "SIGNAL considers your energy, time, format, and social intensity—not only your interests.",
    icon: Activity,
    color: "#6c14ce",
  },
  {
    title: "You control how you participate",
    description:
      "Show up online, in person, with a group, or independently. Your preferences lead the experience.",
    icon: SlidersHorizontal,
    color: "#f359d2",
  },
  {
    title: "Your information remains yours",
    description:
      "Private responses and verified participation replace popularity scores and public performance.",
    icon: LockKeyhole,
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

        <section className="relative py-14 sm:py-18 lg:py-24">
          <Container className="max-w-[84rem]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono text-[0.65rem] font-bold tracking-[0.24em] text-[#f359d2] uppercase">
                How SIGNAL Moves
              </p>

              <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.8rem)] leading-[0.95] font-black tracking-[-0.05em] text-white">
                One Signal Becomes A Path Forward.
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                SIGNAL turns what you have capacity for right now into clearer
                ways to connect, create, and participate.
              </p>
            </div>

            <div className="relative mt-12 overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:p-6 lg:p-0">
              <div
                aria-hidden="true"
                className="absolute top-1/2 right-[10%] left-[10%] hidden h-px -translate-y-1/2 bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)] opacity-70 lg:block"
              />

              <div className="relative grid gap-3 lg:grid-cols-4 lg:gap-0">
                {signalJourney.map((step) => {
                  const Icon = step.icon;

                  return (
                    <article
                      className="group relative flex min-h-48 flex-col rounded-[1.4rem] border border-white/10 bg-[#07070b]/95 p-6 lg:min-h-64 lg:rounded-none lg:border-y-0 lg:border-r lg:border-l-0 lg:last:border-r-0"
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

                        <span
                          className="font-mono text-xs font-black"
                          style={{ color: step.color }}
                        >
                          {step.number}
                        </span>
                      </div>

                      <div className="mt-auto pt-9">
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
          className="relative scroll-mt-24 py-14 sm:py-18 lg:py-24"
          id="ecosystem"
        >
          <Container className="max-w-[84rem]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-[0.65rem] font-bold tracking-[0.24em] text-[#7cff00] uppercase">
                  The SIGNAL Ecosystem
                </p>

                <h2 className="mt-5 text-[clamp(2.7rem,5vw,5rem)] leading-[0.92] font-black tracking-[-0.05em] text-white">
                  Five Ways To Find Your Way In.
                </h2>
              </div>

              <p className="max-w-md text-sm leading-7 text-white/55 sm:text-base">
                Each feature serves a different kind of participation. Together,
                they create one connected community experience.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
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

        <section className="relative py-14 sm:py-18 lg:py-24">
          <Container className="max-w-[84rem]">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(145deg,rgba(24,0,173,0.14),rgba(4,4,8,0.94)_42%,rgba(243,89,210,0.08))] p-7 backdrop-blur-xl sm:p-10 lg:p-14">
              <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
                <div>
                  <p className="font-mono text-[0.65rem] font-bold tracking-[0.24em] text-[#f359d2] uppercase">
                    Designed Differently
                  </p>

                  <h2 className="mt-5 text-[clamp(2.8rem,5vw,5.2rem)] leading-[0.92] font-black tracking-[-0.05em] text-white">
                    Built Around People.
                    <span className="block bg-[linear-gradient(90deg,#6c14ce,#f359d2,#7cff00)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
                      Not Popularity.
                    </span>
                  </h2>

                  <p className="mt-7 max-w-lg text-sm leading-7 text-white/55 sm:text-base">
                    SIGNAL is designed to help people find meaningful ways to
                    participate—not compete for attention.
                  </p>
                </div>

                <div className="grid gap-3">
                  {principles.map((principle) => {
                    const Icon = principle.icon;

                    return (
                      <article
                        className="flex gap-5 rounded-[1.4rem] border border-white/10 bg-black/30 p-5 sm:p-6"
                        key={principle.title}
                      >
                        <div
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-black/40"
                          style={{
                            borderColor: `${principle.color}65`,
                            color: principle.color,
                          }}
                        >
                          <Icon className="size-5" />
                        </div>

                        <div>
                          <h3 className="text-base font-black text-white">
                            {principle.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-white/55">
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

        <section className="relative py-14 sm:py-18 lg:py-24">
          <Container className="max-w-[84rem]">
            <div className="relative overflow-hidden rounded-[2.4rem] border border-[#f359d2]/35 bg-[linear-gradient(110deg,rgba(24,0,173,0.34),rgba(108,20,206,0.25)_34%,rgba(243,89,210,0.2)_68%,rgba(124,255,0,0.1))] p-7 sm:p-10 lg:p-14">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)]"
              />

              <div className="relative grid gap-10 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-[#f359d2]/60 bg-black/30 text-[#f359d2] shadow-[0_0_34px_rgba(243,89,210,0.2)]">
                  <Building2 className="size-8" />
                </div>

                <div>
                  <p className="font-mono text-[0.65rem] font-bold tracking-[0.2em] text-[#7cff00] uppercase">
                    The Five Fifths eHub
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    Digital connection gets a physical home.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                    SIGNAL will connect members to eHub bookings, events,
                    programs, memberships, and real-world ways to meet, work,
                    create, and play.
                  </p>
                </div>

                <a
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/25 bg-black/30 px-7 text-sm font-black text-white transition hover:border-[#7cff00]/60 hover:bg-white/[0.06]"
                  href="https://fivefifthsnp.com/ehub"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Explore the eHub
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>
          </Container>
        </section>

        <section className="relative px-5 pt-14 pb-24 text-center sm:pt-20 sm:pb-32">
          <div
            aria-hidden="true"
            className="absolute right-0 bottom-0 left-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(108,20,206,0.2),rgba(243,89,210,0.1)_42%,transparent_72%)]"
          />

          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[#f359d2]/40 bg-black/30">
              <Sparkles className="size-5 text-[#f359d2]" />
            </div>

            <h2 className="mt-7 text-[clamp(3rem,6vw,6rem)] leading-[0.9] font-black tracking-[-0.055em] text-white">
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
              className="mx-auto mt-9 inline-flex min-h-14 w-full max-w-md items-center justify-center gap-4 rounded-full bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_32%,#f359d2_68%,#7cff00_115%)] px-10 text-sm font-black tracking-[0.1em] text-white uppercase shadow-[0_0_40px_rgba(108,20,206,0.28)] transition hover:scale-[1.02] hover:brightness-110 sm:w-auto sm:min-w-80"
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
