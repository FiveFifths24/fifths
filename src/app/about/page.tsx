import type { Metadata } from "next";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Gamepad2,
  HeartHandshake,
  Lightbulb,
  Radio,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "About",
};

const audiences = [
  "Gamers",
  "Cosplayers",
  "Creators",
  "Streamers",
  "Esports Players",
  "Tabletop Players",
  "Professionals",
  "Entrepreneurs",
  "Business Owners",
  "Founders",
  "Students",
  "Artists",
  "Podcasters",
  "Community Organizers",
  "Educators",
  "Mentors",
];

const ecosystem = [
  {
    name: "Pulse",
    description:
      "A private check-in that helps surface experiences that fit your current energy, capacity, interests, and availability.",
    icon: Radio,
    color: "#9d46ec",
  },
  {
    name: "Sessions",
    description:
      "Scheduled experiences including events, workshops, game nights, coworking, networking, learning, and community activities.",
    icon: CalendarDays,
    color: "#665cff",
  },
  {
    name: "Circles",
    description:
      "Communities built around shared interests, identities, goals, experiences, and ways of participating.",
    icon: HeartHandshake,
    color: "#f359d2",
  },
  {
    name: "Commons",
    description:
      "A place for creators, professionals, entrepreneurs, and collaborators to find opportunities and build things together.",
    icon: Sparkles,
    color: "#ffffff",
  },
  {
    name: "Realm",
    description:
      "Campaigns, tabletop experiences, games, stories, and immersive shared worlds designed around participation.",
    icon: Gamepad2,
    color: "#22d3ee",
  },
  {
    name: "Passport",
    description:
      "A record of eligible participation, contribution, learning, collaboration, volunteering, and community involvement.",
    icon: BadgeCheck,
    color: "#7cff00",
  },
];

const beliefs = [
  {
    title: "Community should have more than one doorway.",
    copy: "People should be able to participate online or in person, socially or quietly, as beginners or experts, and at a pace that works for them.",
  },
  {
    title: "Interests can become opportunities.",
    copy: "Gaming, creativity, technology, storytelling, entrepreneurship, learning, and community participation can lead to skills, relationships, collaborations, and careers.",
  },
  {
    title: "Participation matters.",
    copy: "Showing up, helping, creating, teaching, hosting, collaborating, volunteering, and learning are all meaningful ways to contribute.",
  },
  {
    title: "Digital should lead somewhere real.",
    copy: "The goal is not to keep people scrolling forever. The goal is to help people find experiences worth joining and people worth meeting.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#020205] text-white">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute top-10 -left-48 h-[34rem] w-[34rem] rounded-full bg-[#6c14ce]/10 blur-[170px]" />

          <div className="absolute top-[20%] right-[-14rem] h-[36rem] w-[36rem] rounded-full bg-[#f359d2]/[0.06] blur-[180px]" />
        </div>

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-5xl">
            <p className="font-mono text-[0.65rem] font-bold tracking-[0.24em] text-[#ca9aff] uppercase">
              About PULSE // Built By Five Fifths
            </p>

            <h1 className="display-type mt-7 max-w-5xl text-[clamp(3.8rem,8vw,8rem)] leading-[0.9] tracking-[-0.055em] text-[#f2f0ed]">
              Built for people whose interests don&apos;t fit neatly into one
              box.
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-8 text-white/60 sm:text-xl sm:leading-9">
              is a connected community platform being built by Five Fifths to
              help people find experiences, communities, opportunities, and ways
              to participate that actually fit who they are and what they have
              room for.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/ecosystem">Explore the Ecosystem</ButtonLink>

              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-black/30 px-7 text-sm font-bold text-white/85 transition hover:border-white/30 hover:bg-white/[0.05]"
                href="https://fivefifthsnp.com/ehub"
                rel="noopener noreferrer"
                target="_blank"
              >
                Explore the eHub
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          WHY WE BUILT IT
      ========================================================== */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#f359d2] uppercase">
                Why We Built It
              </p>

              <h2 className="display-type mt-5 text-[clamp(3rem,5vw,5.5rem)] leading-[0.94] tracking-[-0.045em] text-[#f2f0ed]">
                Community is usually organized around labels.
              </h2>

              <p className="display-type mt-3 text-[clamp(2.5rem,4vw,4.6rem)] leading-[0.96] tracking-[-0.04em] text-white/35">
                We wanted to organize it around people.
              </p>
            </div>

            <div className="space-y-7 text-lg leading-8 text-white/60">
              <p>
                Most platforms begin by asking what you like, who you follow, or
                what category you belong to. But real participation is more
                complicated than that.
              </p>

              <p>
                You might be a gamer and a business owner. A cosplayer and a
                designer. A student and a creator. A professional looking for
                people who share your interests outside of work.
              </p>

              <p>
                And what you want can change from one day to the next. Sometimes
                you want a tournament. Sometimes you want a quiet coworking
                session. Sometimes you want to meet another creator, learn
                something new, find a tabletop campaign, volunteer, network,
                collaborate, or simply be around people without needing to
                perform socially.
              </p>

              <p className="font-semibold text-white/85">
                PULSE is being built so those different versions of
                participation can exist inside one connected ecosystem.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          WHO IT IS FOR
      ========================================================== */}
      <section className="border-y border-white/10 bg-white/[0.015] py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
            <div>
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#7cff00] uppercase">
                Who It&apos;s For
              </p>

              <h2 className="display-type mt-5 max-w-3xl text-[clamp(3.2rem,5vw,5.8rem)] leading-[0.92] tracking-[-0.045em] text-[#f2f0ed]">
                You don&apos;t have to choose one version of yourself.
              </h2>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/55">
                PULSE is being built for people whose interests, identities,
                goals, careers, creative lives, and communities overlap.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {audiences.map((audience) => (
                <span
                  className="rounded-full border border-white/15 bg-black/35 px-5 py-3 text-sm font-semibold text-white/75"
                  key={audience}
                >
                  {audience}
                </span>
              ))}

              <span className="rounded-full border border-[#9d46ec]/35 bg-[#6c14ce]/10 px-5 py-3 text-sm font-semibold text-[#d9b4ff]">
                People looking for their people
              </span>

              <span className="rounded-full border border-[#22d3ee]/30 bg-[#22d3ee]/5 px-5 py-3 text-sm font-semibold text-[#92efff]">
                People seeking lower-stimulation ways to participate
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          ECOSYSTEM
      ========================================================== */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="max-w-4xl">
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#ca9aff] uppercase">
              One Ecosystem // Different Ways In
            </p>

            <h2 className="display-type mt-5 text-[clamp(3rem,5vw,5.6rem)] leading-[0.94] tracking-[-0.045em] text-[#f2f0ed]">
              Community, creativity, opportunity, and participation
              shouldn&apos;t need six different platforms.
            </h2>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/55">
              PULSE connects several different kinds of participation under one
              account and one community identity.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ecosystem.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-7"
                  key={item.name}
                >
                  <div
                    className="flex size-11 items-center justify-center rounded-2xl border bg-black/30"
                    style={{
                      borderColor: `${item.color}45`,
                    }}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-5"
                      style={{
                        color: item.color,
                      }}
                    />
                  </div>

                  <h3
                    className="mt-7 text-2xl font-black"
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.name}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/50">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* =========================================================
          eHUB
      ========================================================== */}
      <section className="border-y border-white/10 bg-white/[0.015] py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div>
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#22d3ee] uppercase">
                The Five Fifths eHub
              </p>

              <h2 className="display-type mt-5 text-[clamp(3.2rem,5vw,6rem)] leading-[0.92] tracking-[-0.045em] text-[#f2f0ed]">
                The digital community is only the beginning.
              </h2>

              <div className="mt-8 max-w-3xl space-y-6 text-lg leading-8 text-white/60">
                <p>
                  PULSE is also being built as the digital community layer for
                  the future Five Fifths Esports &amp; Innovation Hub.
                </p>

                <p>
                  The eHub is an ambitious physical destination centered on
                  gaming, creativity, technology, entertainment, learning,
                  entrepreneurship, professional development, and community.
                </p>

                <p>
                  When it is open and operating, members will use the platform
                  to discover activities, join communities, register for
                  Sessions, find collaborators, explore opportunities, and carry
                  eligible participation forward through their Passport.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-[1.75rem] border border-[#6c14ce]/20 bg-[#6c14ce]/[0.06] p-7">
                <Lightbulb
                  aria-hidden="true"
                  className="size-5 text-[#ca9aff]"
                />

                <h3 className="mt-6 text-xl font-black text-white">
                  Learn, create, and build
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/50">
                  Digital skills, creator education, technology, media,
                  entrepreneurship, mentorship, workforce readiness, and
                  hands-on learning will all have a place in the eHub.
                </p>
              </article>

              <article className="rounded-[1.75rem] border border-[#f359d2]/20 bg-[#f359d2]/[0.05] p-7">
                <UsersRound
                  aria-hidden="true"
                  className="size-5 text-[#ff9fe6]"
                />

                <h3 className="mt-6 text-xl font-black text-white">
                  Gather in real life
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/50">
                  Tournaments, workshops, screenings, creator sessions, meetups,
                  coworking, community events, and member-led experiences can
                  move from digital discovery into physical participation.
                </p>
              </article>

              <article className="rounded-[1.75rem] border border-[#7cff00]/15 bg-[#7cff00]/[0.035] p-7">
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="size-5 text-[#b8ff76]"
                />

                <h3 className="mt-6 text-xl font-black text-white">
                  Create opportunity
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/50">
                  The eHub will connect community members with creators,
                  entrepreneurs, educators, employers, organizations,
                  businesses, and industry partners.
                </p>
              </article>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          COMMUNITY SUPPORT
      ========================================================== */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-[#9d46ec]/25 bg-[linear-gradient(135deg,rgba(108,20,206,0.12),rgba(243,89,210,0.05),rgba(124,255,0,0.025))] p-8 sm:p-12 lg:p-16">
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-24 size-80 rounded-full bg-[#6c14ce]/15 blur-[120px]"
            />

            <div className="relative max-w-5xl">
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#ca9aff] uppercase">
                Built With Community
              </p>

              <h2 className="display-type mt-5 text-[clamp(3.2rem,5vw,6rem)] leading-[0.94] tracking-[-0.045em] text-[#f2f0ed]">
                A project this ambitious takes more than a building.
              </h2>

              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/60">
                It takes people who believe gaming, creativity, technology,
                entrepreneurship, education, and community can exist under one
                roof.
              </p>

              <div className="mt-10 grid gap-8 md:grid-cols-2">
                <p className="text-base leading-8 text-white/55">
                  We are building relationships with community members,
                  creators, educators, local businesses, organizations,
                  sponsors, mentors, entrepreneurs, industry partners, and
                  people who simply want to help create something meaningful.
                </p>

                <p className="text-base leading-8 text-white/55">
                  Some people will participate. Some will teach. Some will
                  mentor. Some will host. Some will create opportunities. Some
                  will sponsor programs. Some will help us open the doors.
                </p>
              </div>

              <p className="display-type mt-12 text-4xl text-white sm:text-5xl">
                Every contribution creates another ripple.
              </p>

              <div className="mt-9">
                <a
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#9d46ec]/45 bg-[#6c14ce]/15 px-7 text-sm font-bold text-white transition hover:bg-[#6c14ce]/25"
                  href="https://fivefifthsnp.com/ehub"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Learn About the eHub
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          BELIEFS
      ========================================================== */}
      <section className="border-y border-white/10 bg-white/[0.015] py-24 sm:py-32">
        <Container>
          <div className="max-w-4xl">
            <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#7cff00] uppercase">
              What We Believe
            </p>

            <h2 className="display-type mt-5 text-[clamp(3rem,5vw,5.5rem)] leading-[0.94] tracking-[-0.045em] text-[#f2f0ed]">
              Build technology around real life, not the other way around.
            </h2>
          </div>

          <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
            {beliefs.map((belief, index) => (
              <article
                className="grid gap-5 py-8 md:grid-cols-[5rem_0.9fr_1.1fr] md:items-start md:gap-10"
                key={belief.title}
              >
                <span className="font-mono text-xs font-bold text-white/25">
                  0{index + 1}
                </span>

                <h3 className="text-2xl leading-tight font-black text-white">
                  {belief.title}
                </h3>

                <p className="text-base leading-7 text-white/50">
                  {belief.copy}
                </p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================
          PEOPLE / TEAM
      ========================================================== */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#f359d2] uppercase">
                Built By Five Fifths
              </p>

              <h2 className="display-type mt-5 text-[clamp(3rem,5vw,5.4rem)] leading-[0.94] tracking-[-0.045em] text-[#f2f0ed]">
                The people building the platform are part of the community too.
              </h2>
            </div>

            <div className="space-y-6 text-lg leading-8 text-white/60">
              <p>
                Five Fifths is building PULSE and the eHub around a belief that
                gaming, creativity, technology, entrepreneurship, professional
                development, and community belong in the same conversation.
              </p>

              <p>
                What started as a vision for a physical community destination
                has grown into a connected digital and physical ecosystem
                designed to help people find one another, participate in ways
                that fit, and create opportunities together.
              </p>

              <p className="text-sm leading-7 text-white/35">
                As the team and community grow, this section can become the
                place to introduce the people, collaborators, advisors, and
                partners helping bring the vision to life.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="border-t border-white/10 py-20 sm:py-28">
        <Container className="text-center">
          <p className="font-mono text-[0.62rem] font-bold tracking-[0.22em] text-[#ca9aff] uppercase">
            Find Your Way In
          </p>

          <h2 className="display-type mx-auto mt-5 max-w-4xl text-[clamp(3.2rem,6vw,6.5rem)] leading-[0.92] tracking-[-0.045em] text-[#f2f0ed]">
            Different people. Different energy. One connected community.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/55">
            Explore the ecosystem now, and follow the eHub as the physical side
            of the Five Fifths community takes shape.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/ecosystem">Explore PULSE</ButtonLink>

            <a
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-black/30 px-7 text-sm font-bold text-white/85 transition hover:border-white/30 hover:bg-white/[0.05]"
              href="https://fivefifthsnp.com/ehub"
              rel="noopener noreferrer"
              target="_blank"
            >
              Explore the eHub
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
