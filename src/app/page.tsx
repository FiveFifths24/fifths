import {
  Accessibility,
  Building2,
  Clock3,
  Headphones,
  RadioTower,
  ShieldCheck,
  UsersRound,
  ArrowRight,
  Heart,
  House,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

import { PulseLivingBackground } from "@/components/effects/pulse-living-background";
import { PulseHero } from "@/components/hero/pulse-hero";
import { EcosystemCarousel } from "@/components/modules/ecosystem-carousel";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

const capacitySignals = [
  {
    label: "Time",
    description: "How much room you actually have for something right now.",
    icon: Clock3,
    color: "#2c07ff",
  },
  {
    label: "Format",
    description: "In person, online, hybrid, active, focused, or low-key.",
    icon: RadioTower,
    color: "#3d008f",
  },
  {
    label: "Social Intensity",
    description:
      "A crowd, a small group, one-on-one, or something more independent.",
    icon: UsersRound,
    color: "#f359d2",
  },
  {
    label: "Energy",
    description:
      "What feels realistic for your capacity instead of what you should be doing.",
    icon: Headphones,
    color: "#7cff00",
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#020205] text-white">
      {/* =========================================================
          CURRENT LIVING BACKGROUND
      ========================================================== */}
      <PulseLivingBackground />

      {/* =========================================================
          CURRENT AMBIENT COLOR FIELD
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      >
        <div className="absolute top-[10%] left-[-22rem] hidden size-[46rem] rounded-full bg-[#6c14ce]/8 blur-[190px] sm:block" />

        <div className="absolute top-[20%] right-[-18rem] size-[42rem] rounded-full bg-[#f359d2]/6 blur-[170px]" />

        <div className="absolute top-[48%] left-[-16rem] size-[40rem] rounded-full bg-[#1800ad]/7 blur-[170px]" />

        <div className="absolute top-[72%] right-[-18rem] size-[44rem] rounded-full bg-[#7cff00]/5 blur-[180px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,2,5,0.08)_55%,rgba(2,2,5,0.58)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* =======================================================
            HERO
        ======================================================== */}
        <PulseHero />

        {/* =======================================================
{/* =======================================================
    CAPACITY
======================================================== */}
        <section className="relative py-20 sm:py-28">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 xl:gap-20">
              {/* Left copy */}
              <div className="mx-auto max-w-[42rem] text-center lg:mx-0 lg:text-left">
                <p className="font-mono text-[0.7rem] font-bold tracking-[0.24em] text-white uppercase [text-shadow:0_0_6px_rgba(255,255,255,0.95),0_0_14px_rgba(255,255,255,0.7),0_0_28px_rgba(255,255,255,0.4)] sm:text-[0.62rem]">
                  More Than An Algorithm
                </p>

                <h2 className="display-type mt-5 tracking-[-0.045em] text-[#ffffff]">
                  <span className="block text-[clamp(2.8rem,3vw,3rem)] leading-[0.95]">
                    Your Interests Matter,
                  </span>

                  <span className="block text-[clamp(2.8rem,3vw,3rem)] leading-[0.95] text-white/100">
                    But So Does Your
                  </span>

                  <span className="mt-2 block text-[clamp(6rem,13vw,7rem)] leading-[0.9] text-[#7cff00]">
                    Capacity.
                  </span>
                </h2>

                <p className="mx-auto mt-7 max-w-[34rem] text-sm leading-7 text-white/55 sm:text-base sm:leading-8 lg:mx-0">
                  SIGNAL considers not only your interests, but your available
                  time, preferred format, social intensity, and current energy
                  level.
                </p>

                <p className="mx-auto mt-4 max-w-[32rem] text-sm leading-7 text-white/55 sm:mt-5 sm:text-base lg:mx-0">
                  Because finding something you like is only useful when it
                  actually fits the way you want — or are able — to participate.
                </p>
              </div>

              {/* Capacity cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {capacitySignals.map((item) => {
                  const Icon = item.icon;

                  return (
                    <article
                      className="relative flex min-h-[10.5rem] flex-col items-center overflow-hidden rounded-[1.4rem] border p-4 text-center backdrop-blur-xl sm:min-h-[12rem] sm:rounded-[1.75rem] sm:p-6 lg:min-h-[13.5rem] lg:p-7"
                      data-pulse-signal="medium"
                      key={item.label}
                      style={{
                        borderColor: `${item.color}45`,
                        background: `linear-gradient(145deg, ${item.color}12 0%, rgba(0,0,0,0.38) 48%, rgba(0,0,0,0.55) 100%)`,
                        boxShadow: `inset 0 0 40px ${item.color}08`,
                      }}
                    >
                      <div
                        className="flex size-9 items-center justify-center rounded-xl border bg-black/40 sm:size-10 lg:size-11 lg:rounded-2xl"
                        style={{
                          borderColor: `${item.color}70`,
                          boxShadow: `0 0 18px ${item.color}18`,
                        }}
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-4 sm:size-5"
                          style={{
                            color: item.color,
                          }}
                        />
                      </div>

                      <div className="mt-auto w-full pt-7 text-center sm:pt-8">
                        <h3
                          className="text-lg font-black tracking-[-0.025em] sm:text-xl lg:text-2xl"
                          style={{
                            color: item.color,
                          }}
                        >
                          {item.label}
                        </h3>

                        <p className="mt-.5 mx-auto max-w-[10rem] text-[0.72rem] leading-5 text-white/50 sm:text-sm sm:leading-6">
                          {item.description}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* =======================================================
    ECOSYSTEM
======================================================== */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto w-full">
            {/* Heading */}
            <div className="mx-auto max-w-[70rem] px-5 text-center sm:px-8">
              <p className="font-mono text-[0.6rem] font-bold tracking-[0.26em] text-[#f359d2] uppercase">
                One Connected Ecosystem
              </p>

              <h2 className="display-type mt-5 tracking-[-0.05em] text-[#f2f0ed]">
                <span className="block text-[clamp(3.2rem,5.5vw,6.3rem)] leading-[0.9]">
                  Everything Moves Through
                </span>

                <span className="mt-1 block bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_30%,#f359d2_62%,#7cff00_100%)] bg-clip-text text-[clamp(3.4rem,6vw,6.8rem)] leading-[0.88] text-transparent [-webkit-text-fill-color:transparent]">
                  Your Energy.
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-[46rem] text-sm leading-7 text-white/50 sm:text-base sm:leading-8">
                Check your Pulse, discover Sessions, join Circles, collaborate
                in Commons, enter Realm, and carry your participation forward
                through Passport.
              </p>
            </div>

            {/* Carousel */}
            <div className="mt-14 sm:mt-16">
              <EcosystemCarousel />
            </div>
          </div>
        </section>

        {/* =======================================================
    COMMUNITY / DISCOVERY
======================================================== */}
        <section className="relative py-24 sm:py-32">
          <div className="mx-auto w-full max-w-[112rem] px-5 sm:px-8 lg:px-10 xl:px-12">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,7,14,0.92)_0%,rgba(5,5,10,0.94)_100%)] px-6 py-10 shadow-[0_0_40px_rgba(108,20,206,0.06)] backdrop-blur-xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-16">
                {/* left side */}
                <div className="max-w-[46rem]">
                  <p className="font-mono text-[0.62rem] font-bold tracking-[0.26em] text-[#7cff00] uppercase">
                    Find Your Way In
                  </p>
                  <h2 className="display-type mt-5 max-w-[48rem] tracking-[-0.045em] text-[#f2f0ed]">
                    <span className="block text-[clamp(3rem,4.6vw,5rem)] leading-[0.92]">
                      Find Your Next
                    </span>

                    <span className="block text-[clamp(3rem,4.6vw,5rem)] leading-[0.92]">
                      Good Reason To
                    </span>

                    <span className="block text-[clamp(3rem,4.6vw,5rem)] leading-[0.92]">
                      Leave The House.
                    </span>

                    <span className="mt-5 block text-[clamp(1.75rem,2.5vw,2.8rem)] leading-[1] tracking-[-0.035em] text-white/45">
                      Or stay in - we handle both.
                    </span>
                  </h2>{" "}
                </div>

                {/* right side */}
                <div className="max-w-[34rem] lg:pt-14">
                  <p className="text-base leading-8 text-white/58 sm:text-lg">
                    SIGNAL creates communities around shared interests,
                    identities, goals, experiences, and ways of participating.
                  </p>

                  <p className="mt-6 text-base leading-8 text-white/42 sm:text-lg">
                    Whether you&apos;re into gaming, cosplay, entrepreneurship,
                    tech, storytelling, content creation, something in between,
                    or all of the above — there&apos;s always a path that can
                    meet you where you are.
                  </p>
                </div>
              </div>

              {/* pathway cards */}
              <div className="mt-12 grid gap-5 lg:grid-cols-2">
                <article className="group relative overflow-hidden rounded-[2rem] border border-[#f359d2]/35 bg-[linear-gradient(180deg,rgba(243,89,210,0.08)_0%,rgba(8,7,14,0.86)_100%)] p-6 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(243,89,210,0.16),transparent_45%)]" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-[#f359d2]/55 bg-black/35 text-[#f359d2] shadow-[0_0_24px_rgba(243,89,210,0.18)]">
                        <ArrowRight className="size-6" />
                      </div>

                      <p className="font-mono text-[0.7rem] font-bold tracking-[0.24em] text-[#ff9fe6] uppercase">
                        Step Out
                      </p>
                    </div>

                    <div className="mt-7 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                      <div>
                        <h3 className="display-type text-[clamp(2rem,3.3vw,3.3rem)] leading-[0.95] tracking-[-0.04em] text-white">
                          Show up somewhere.
                        </h3>

                        <div className="mt-6 h-px w-16 bg-[linear-gradient(90deg,#f359d2,transparent)]" />
                      </div>

                      <p className="max-w-md text-sm leading-8 text-white/52 sm:text-base">
                        Tournaments, meetups, workshops, coworking, networking,
                        creator Sessions, game nights, and community events —
                        all the reasons to get out and connect.
                      </p>
                    </div>

                    <div className="mt-8">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f78edd]">
                        Explore events
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </article>

                <article className="group relative overflow-hidden rounded-[2rem] border border-[#8b5cf6]/35 bg-[linear-gradient(180deg,rgba(108,20,206,0.1)_0%,rgba(8,7,14,0.86)_100%)] p-6 sm:p-8">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(139,92,246,0.14),transparent_45%)]" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-[#9d72df]/55 bg-black/35 text-[#b98cff] shadow-[0_0_24px_rgba(108,20,206,0.18)]">
                        <House className="size-6" />
                      </div>

                      <p className="font-mono text-[0.7rem] font-bold tracking-[0.24em] text-[#ca9aff] uppercase">
                        Stay In
                      </p>
                    </div>

                    <div className="mt-7 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                      <div>
                        <h3 className="display-type text-[clamp(2rem,3.3vw,3.3rem)] leading-[0.95] tracking-[-0.04em] text-white">
                          Connect from where you are.
                        </h3>

                        <div className="mt-6 h-px w-16 bg-[linear-gradient(90deg,#9d72df,transparent)]" />
                      </div>

                      <p className="max-w-md text-sm leading-8 text-white/52 sm:text-base">
                        Online communities, remote Sessions, collaborations,
                        campaigns, and conversations — designed for real
                        connection, from anywhere.
                      </p>
                    </div>

                    <div className="mt-8">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#c8a0ff]">
                        Join the community
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </div>

              {/* bottom value strip */}
              <div className="mt-10 grid gap-0 overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/30 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    icon: Users,
                    color: "#7cff00",
                    text: "Communities for every interest and identity",
                  },
                  {
                    icon: Workflow,
                    color: "#9d46ec",
                    text: "Ways to participate on your terms",
                  },
                  {
                    icon: Heart,
                    color: "#f359d2",
                    text: "Connections that feel like home",
                  },
                  {
                    icon: Sparkles,
                    color: "#3b82f6",
                    text: "New reasons to show up — out or in",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="flex items-center gap-4 px-5 py-5 sm:px-6"
                      key={item.text}
                    >
                      <div
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border bg-black/25"
                        style={{
                          borderColor: `${item.color}50`,
                          color: item.color,
                        }}
                      >
                        <Icon className="size-5" />
                      </div>

                      <p className="max-w-[14rem] text-sm leading-6 text-white/70">
                        {item.text}
                      </p>

                      {index !== 3 && (
                        <div className="ml-auto hidden h-8 w-px bg-white/10 xl:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            eHUB
        ======================================================== */}
        <section className="relative py-24 sm:py-32">
          <Container>
            <div className="grid gap-5 lg:grid-cols-[1.65fr_0.85fr]">
              {/* Main eHub feature */}
              <article
                className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-10 lg:p-12"
                data-pulse-signal="strong"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-28 -right-28 size-72 rounded-full bg-[#6c14ce]/15 blur-[110px]"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-32 left-1/4 size-72 rounded-full bg-[#f359d2]/10 blur-[120px]"
                />

                <div className="relative">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-[#f359d2]/25 bg-[#f359d2]/10 shadow-[0_0_30px_rgba(243,89,210,0.1)]">
                    <Building2
                      aria-hidden="true"
                      className="size-5 text-[#f359d2]"
                    />
                  </div>

                  <p className="mt-10 font-mono text-[0.62rem] font-bold tracking-[0.22em] uppercase">
                    <span className="ecosystem-gradient-text">
                      Five Fifths Esports &amp; Innovation Hub
                    </span>
                  </p>

                  <h2 className="display-type mt-5 max-w-[54rem] text-[clamp(3.2rem,5vw,5.8rem)] leading-[0.94] tracking-[-0.045em] text-balance text-[#f2f0ed]">
                    A Physical Home For Our Digital Communities
                  </h2>

                  <p className="mt-7 max-w-[48rem] text-base leading-8 text-white/55 sm:text-lg">
                    Many gamers, cosplayers, creators, professionals, and
                    community members lack a welcoming place to gather outside
                    of home and work.
                  </p>

                  <p className="mt-5 max-w-[48rem] text-base leading-8 text-white/50 sm:text-lg">
                    The Five Fifths eHub is being intentionally designed for
                    different energies, capacities, and nervous systems, giving
                    members flexible ways to connect, create, play, focus, and
                    recharge without the need to conform to one standard.
                  </p>

                  <p className="display-type mt-10 max-w-[46rem] text-3xl leading-tight text-white sm:text-4xl">
                    Eventually, the community gets a front door.
                  </p>

                  <div className="mt-10">
                    <a
                      className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9d46ec]/40 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_42%,#f359d2_100%)] px-7 text-[0.7rem] font-bold tracking-[0.16em] text-white uppercase shadow-[0_0_28px_rgba(108,20,206,0.22)] transition duration-300 hover:scale-[1.02] hover:brightness-110"
                      href="https://fivefifthsnp.com/ehub"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Explore the eHub
                    </a>
                  </div>
                </div>
              </article>

              {/* eHub supporting cards */}
              <div className="grid gap-5">
                <article
                  className="group relative overflow-hidden rounded-[2rem] border border-[#6c14ce]/20 bg-[#6c14ce]/[0.06] p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 sm:p-8"
                  data-pulse-signal="medium"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-[#9d46ec]/25 bg-[#6c14ce]/10">
                    <Accessibility
                      aria-hidden="true"
                      className="size-5 text-[#ca9aff]"
                    />
                  </div>

                  <p className="mt-8 font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#ca9aff] uppercase">
                    Learn. Create. Build.
                  </p>

                  <h3 className="mt-3 text-2xl font-black tracking-[-0.025em] text-white">
                    Turn access into opportunity.
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/55">
                    Digital skills, content creation, gaming, technology,
                    entrepreneurship, mentorship, and hands-on learning can all
                    become pathways to confidence, creativity, and real-world
                    experience.
                  </p>
                </article>

                <article
                  className="group relative overflow-hidden rounded-[2rem] border border-[#7cff00]/15 bg-[#7cff00]/[0.035] p-7 backdrop-blur-xl transition duration-500 hover:-translate-y-1 sm:p-8"
                  data-pulse-signal="medium"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl border border-[#7cff00]/20 bg-[#7cff00]/10">
                    <ShieldCheck
                      aria-hidden="true"
                      className="size-5 text-[#b8ff76]"
                    />
                  </div>

                  <p className="mt-8 font-mono text-[0.62rem] font-bold tracking-[0.18em] text-[#b8ff76] uppercase">
                    Gather In Real Life
                  </p>

                  <h3 className="mt-3 text-2xl font-black tracking-[-0.025em] text-white">
                    Bring the community together.
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/55">
                    Tournaments, screenings, creator Sessions, community
                    meetups, launch events, workshops, coworking, and member-led
                    experiences will give digital connections somewhere real to
                    go.
                  </p>
                </article>
              </div>
            </div>
          </Container>
        </section>

        {/* =======================================================
            FINAL CTA
        ======================================================== */}
        <section className="relative py-24 text-white sm:py-32">
          <Container>
            <div
              className="relative overflow-hidden rounded-[2.5rem] border border-[#9d46ec]/20 bg-black/35 px-6 py-16 text-center backdrop-blur-xl sm:px-10 sm:py-20 lg:px-16"
              data-pulse-signal="strong"
            >
              <p className="font-mono text-[0.90rem] font-bold tracking-[0.24em] text-[#f359d2] uppercase">
                Your Turn
              </p>

              <h2 className="display-type mx-auto mt-5 max-w-5xl text-[clamp(3.7rem,7vw,7.5rem)] leading-[0.9] tracking-[-0.05em] text-balance text-[#f2f0ed]">
                Send The Signal.
                <span className="block bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_28%,#f359d2_62%,#7cff00_100%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
                  See Who Answers.
                </span>
              </h2>

              <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
                Create your profile, check in, and start discovering what fits.
              </p>

              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <div data-pulse-signal="strong">
                  <ButtonLink href="/signup">Join SIGNAL</ButtonLink>
                </div>

                <div data-pulse-signal="medium">
                  <ButtonLink
                    className="border-white/20 bg-black/40 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10"
                    href="/ecosystem"
                    variant="secondary"
                  >
                    Explore the Ecosystem
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </main>
  );
}
