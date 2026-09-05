import type { Metadata } from "next";
import Image from "next/image";
import { EHubDonationPopup } from "@/features/ehub/ehub-donation-popup";
import { Container } from "@/components/ui/container";
import {
  BriefcaseBusiness,
  Gamepad2,
  HeartHandshake,
  Monitor,
  Radio,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Five Fifths eHub",
};

const roles = [
  "Guest Experience",
  "Esports & Gaming Associates",
  "PC & Console Support",
  "VR Associates",
  "Creator Studio Associates",
  "Tournament Operations",
  "Event Operations",
  "Broadcast & Production",
  "Community Program Coordinators",
  "Content & Media",
  "Bar & Lounge",
  "Security",
  "Facilities",
  "Supervisors",
  "Salaried Managers",
];

const pathwayCards = [
  {
    title: "Esports & Event Operations",
    description:
      "Tournament administration, event logistics, competition operations, and live experiences.",
    icon: Gamepad2,
  },
  {
    title: "Digital Media & Production",
    description:
      "Streaming, broadcasting, photography, podcasting, editing, and digital storytelling.",
    icon: Radio,
  },
  {
    title: "Technology",
    description:
      "PC systems, console support, networking, VR, and hands-on exposure to emerging technology.",
    icon: Monitor,
  },
  {
    title: "Entrepreneurship",
    description:
      "Business development, project execution, marketing, community activation, and idea building.",
    icon: BriefcaseBusiness,
  },
];

export default function EHubPage() {
  return (
    <>
    <EHubDonationPopup />
    
<section className="relative left-1/2 w-[96vw] max-w-none -translate-x-1/2 overflow-hidden rounded-[2rem] border border-white/10 bg-black">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(108,20,206,0.24),transparent_32%),radial-gradient(circle_at_75%_15%,rgba(32,93,255,0.18),transparent_28%),radial-gradient(circle_at_88%_55%,rgba(132,255,27,0.08),transparent_24%)]"
        />

        <div className="relative grid min-h-[34rem] items-center gap-10 px-6 py-14 text-center sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-14 lg:text-left">
          <div className="mx-auto max-w-2xl lg:mx-0">
<p className="inline-block bg-[linear-gradient(90deg,#2563eb_0%,#7c3aed_25%,#ec4899_50%,#f97316_75%,#a3e635_100%)] bg-clip-text text-sm font-black tracking-[0.24em] text-transparent uppercase">
  Five Fifths Nonprofit
</p>

            <h1 className="mt-5 text-5xl font-black tracking-tight text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.12)] sm:text-6xl lg:text-7xl">
              Five Fifths Esports & Innovation Hub
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/58 lg:mx-0 lg:text-lg">
              SIGNAL connects people, interests, opportunities, and experiences
              digitally. The Five Fifths eHub brings that ecosystem into the
              physical world through gaming, technology, creativity, workforce
              development, entrepreneurship, and community.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] px-7 text-sm font-black text-white shadow-[0_0_30px_rgba(139,92,246,0.22)] transition hover:-translate-y-0.5 hover:brightness-110"
                href="#inside-the-ehub"
              >
                Explore The eHub
              </a>

<a
  className="inline-flex rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] p-px transition hover:-translate-y-0.5 hover:brightness-110"
  href="https://www.paypal.com/donate/?hosted_button_id=2DW3JU6Q4BF4C"
  rel="noopener noreferrer"
  target="_blank"
>
  <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-black px-7 text-sm font-black text-white">
    Support the Build ↗
  </span>
</a>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
              {["Northern New Jersey", "In Development", "Community Powered"].map(
                (item) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-bold text-white/45"
                    key={item}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

<div className="relative mx-auto min-h-[22rem] w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-black lg:mx-0 lg:min-h-[34rem]">
  <Image
    alt="Five Fifths Esports and Innovation Hub exterior"
    className="object-cover object-center"
    fill
    priority
    sizes="(max-width: 1024px) 100vw, 50vw"
    src="/images/ehub.png"
  />

  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.28),transparent_45%)]"
  />
</div>
        </div>
      </section>

<Container className="!max-w-[120rem] pb-24">
      <section
        className="mt-20 text-center"
        id="inside-the-ehub"
      >


<div className="mt-15">
<div className="relative my-6 overflow-hidden bg-transparent px-5 py-8 sm:px-8 lg:left-1/2 lg:w-[94vw] lg:max-w-[104rem] lg:-translate-x-1/2 lg:px-8 lg:py-12">
        <div className="text-center">
      <p className="inline-block bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] bg-clip-text text-xs font-black tracking-[0.24em] text-transparent uppercase">
        The eHub Ecosystem
      </p>

<h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black text-white text-white [text-shadow:0_0_4px_rgba(255,255,255,0.95),0_0_10px_rgba(255,255,255,0.75),0_0_20px_rgba(139,92,246,0.45)] sm:text-6xl">
  One Hub. Many Ways To Plug In.
</h2>

      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/45">
        Every space inside the eHub is designed to support learning,
        creativity, collaboration, entrepreneurship, and community engagement.
      </p>
    </div>

<div className="mt-12 grid items-center gap-8 lg:grid-cols-[1.35fr_3fr_1.35fr] lg:gap-10">
  <div className="space-y-10 text-center lg:space-y-12 lg:text-right">
    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#2a00ff] uppercase lg:text-base">
        Esports & Training Arena
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        Competitive gaming, tournaments, and digital skill building.
      </p>
    </div>

    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#86f01b] uppercase lg:text-base">
        Console Arena
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        Next-gen console gaming, tournaments, and community play.
      </p>
    </div>

    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#6400c8] uppercase lg:text-base">
        Creator Studios
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        Podcasting, streaming, production, editing, and brand development.
      </p>
    </div>

    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#22d3ee] uppercase lg:text-base">
        Virtual Reality Zone
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        Immersive virtual reality experiences and simulations.
      </p>
    </div>
  </div>

  <div className="relative mx-auto aspect-square w-full max-w-[56rem] bg-transparent">
    <Image
      alt="Five Fifths eHub ecosystem map"
      className="object-contain bg-transparent"
      fill
      sizes="(max-width: 1024px) 90vw, 56rem"
      src="/images/modules/ehub-map-transparent.png"
    />
  </div>

  <div className="space-y-10 text-center lg:space-y-12 lg:text-left">
    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#ff8a1f] uppercase lg:text-base">
        Community Lounge
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        A comfortable space to relax, connect, and build community.
      </p>
    </div>

    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#ff3cac] uppercase lg:text-base">
        Fifth Realm
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        Immersive storytelling, experiential learning, and interactive adventure.
      </p>
    </div>

    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#00bf63] uppercase lg:text-base">
        Workstations
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        Quiet workspaces for remote work, study, and collaboration.
      </p>
    </div>

    <div>
      <p className="text-sm font-black tracking-[0.16em] text-[#ffcf32] uppercase lg:text-base">
        Cafe & Refreshments
      </p>
      <p className="mt-3 text-base leading-7 text-white/55 lg:text-lg lg:leading-8">
        Food and beverage options to fuel your day and night.
      </p>
    </div>
  </div>
</div>

    <div className="mt-15 text-center">
<p className="text-xl font-black text-white sm:text-3xl">
  Every Space. Every Purpose. Every Person.
</p>
    </div>

<div className="mt-15 rounded-[1.6rem] bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] p-px">
  <div className="rounded-[calc(1.6rem-1px)] bg-[#020205] p-7 sm:p-8 lg:p-10">
    <p className="text-center text-sm font-black tracking-[0.18em] text-white [text-shadow:0_0_4px_rgba(255,255,255,0.95),0_0_10px_rgba(255,255,255,0.75),0_0_20px_rgba(139,92,246,0.45)] uppercase sm:text-base lg:text-lg">
      Why The eHub Matters
    </p>

    <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[
        [
          "Access",
          "Removing barriers to technology, learning, and opportunity.",
        ],
        [
          "Skill Development",
          "Helping people build practical, career-ready skills.",
        ],
        [
          "Community",
          "Creating spaces where people connect, create, and grow.",
        ],
        [
          "Pathways",
          "Connecting participants to education, careers, and entrepreneurship.",
        ],
      ].map(([title, description]) => (
        <div
          className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center"
          key={title}
        >
          <p className="text-sm font-black tracking-[0.14em] text-white/80 uppercase lg:text-base">
            {title}
          </p>

          <p className="mt-3 text-sm leading-6 text-white/50 lg:text-base lg:leading-7">
            {description}
          </p>
        </div>
      ))}
    </div>

  </div>
</div>

<div className="mt-10 w-full rounded-[1.75rem] border border-white bg-black/40 px-7 py-10 text-center sm:px-10 lg:px-12 lg:py-12">
  <p className="text-sm font-black tracking-[0.2em] text-white uppercase [text-shadow:0_0_4px_rgba(255,255,255,0.95),0_0_10px_rgba(255,255,255,0.7),0_0_20px_rgba(139,92,246,0.4)] sm:text-base lg:text-lg">
    Designed As One Ecosystem
  </p>

  <p className="mx-auto mt-5 max-w-5xl text-base leading-7 text-white/55 sm:text-lg sm:leading-8 lg:text-xl lg:leading-9">
    Move from competition to creation, from work to play, or step away
    entirely when you need a quieter environment.
  </p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {[
        ["PLAY", "#4169ff"],
        ["CREATE", "#c146ff"],
        ["LEARN", "#ef4fb5"],
        ["CONNECT", "#ff8a1f"],
        ["RECHARGE", "#8ee71d"],
      ].map(([label, accent]) => (
        <span
          className="rounded-full border px-5 py-2.5 text-sm font-black tracking-[0.12em]"
          key={label}
          style={{
            borderColor: `${accent}55`,
            color: accent,
            backgroundColor: `${accent}10`,
          }}
        >
          {label}
        </span>
      ))}
    </div>

</div>

</div>
</div>
      </section>

<section className="mt-28">
  <div className="text-center">
    <p className="inline-block bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] bg-clip-text text-xs font-black tracking-[0.28em] text-transparent uppercase">
      Pathways To Opportunity
    </p>

    <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-black text-white [text-shadow:0_0_4px_rgba(255,255,255,0.9),0_0_12px_rgba(255,255,255,0.45),0_0_24px_rgba(139,92,246,0.22)] sm:text-5xl lg:text-6xl">
      What You Learn Here Will Take You Somewhere.
    </h2>

    <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/50 sm:text-lg">
      Our eHub is designed to move people beyond access. Members can build
      practical skills, create real work, explore careers, launch ideas, and
      connect with resources that help turn interests into opportunity.
    </p>
  </div>

  <div className="mt-12 grid gap-5 lg:grid-cols-12">
    {pathwayCards.map((item, index) => {
      const Icon = item.icon;

      const layout =
        index === 0
          ? "lg:col-span-7"
          : index === 1
            ? "lg:col-span-5"
            : index === 2
              ? "lg:col-span-5"
              : "lg:col-span-7";

      const number = String(index + 1).padStart(2, "0");
const accent =
  index === 0
    ? "#4169ff"
    : index === 1
      ? "#ef4fb5"
      : index === 2
        ? "#22d3ee"
        : "#ff8a1f";
      return (
        <article
        style={{
  borderColor: `${accent}45`,
  boxShadow: `0 0 0 1px ${accent}08`,
}}
          className={`group relative min-h-[15rem] overflow-hidden rounded-[1.75rem] border bg-black/55 p-7 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.02] sm:p-8 ${layout}`}
          key={item.title}
        >
<div
  aria-hidden="true"
  className="pointer-events-none absolute top-0 right-0 h-px w-1/3"
  style={{
    background: `linear-gradient(90deg, transparent, ${accent})`,
  }}
/>

          <div className="flex items-start justify-between gap-5">
<div
  className="flex size-12 items-center justify-center rounded-2xl border bg-black/50"
  style={{
    borderColor: `${accent}55`,
    color: accent,
    backgroundColor: `${accent}10`,
  }}
>
  <Icon aria-hidden="true" className="size-5" />
</div>

            <span className="text-xs font-black tracking-[0.18em] text-white/20">
              {number}
            </span>
          </div>

          <div className="mt-10 text-center lg:text-left">
<p
  className="text-[0.65rem] font-black tracking-[0.18em] uppercase"
  style={{ color: `${accent}cc` }}
>
  Career Pathway
</p>

            <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              {item.title}
            </h3>

<p className="mt-4 max-w-2xl text-base leading-8 text-white/50 sm:text-lg lg:text-xl lg:leading-9">
  {item.description}
</p>
          </div>

<div className="mt-8 flex justify-center lg:justify-start">
  <span
    className="h-px w-16 opacity-80"
    style={{
      background: `linear-gradient(90deg, ${accent}, transparent)`,
    }}
  />
</div>
        </article>
      );
    })}
  </div>

  <div className="mx-auto mt-8 max-w-4xl text-center">
    <p className="text-sm leading-7 text-white/35 sm:text-base">
      Skills developed inside the eHub are designed to connect interest with
      experience — and experience with real pathways forward.
    </p>
  </div>
</section>

<section className="mt-28">
  <div className="text-center">
    <p className="inline-block bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] bg-clip-text text-xs font-black tracking-[0.28em] text-transparent uppercase">
      Real Opportunities
    </p>

    <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black text-white [text-shadow:0_0_4px_rgba(255,255,255,0.9),0_0_12px_rgba(255,255,255,0.45),0_0_24px_rgba(142,231,29,0.15)] sm:text-5xl lg:text-6xl">
      Build The Experience.
      <br />
      Build Your Future.
    </h2>

    <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/50 sm:text-lg">
      The eHub is designed to create opportunities across gaming, technology,
      media, hospitality, events, production, and community operations.
    </p>
  </div>

  <div className="mt-12 overflow-hidden rounded-[2rem] border border-[#8ee71d]/30 bg-[radial-gradient(circle_at_12%_20%,rgba(142,231,29,0.12),transparent_30%),linear-gradient(135deg,rgba(142,231,29,0.035),rgba(0,0,0,0.86)_42%,rgba(0,0,0,0.96))]">
    <div className="grid items-center gap-10 px-7 py-10 text-center sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-12 lg:text-left">
      <div>
<div className="text-center lg:text-left">
  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[#8ee71d]/30 bg-[#8ee71d]/10 lg:mx-0">
    <BriefcaseBusiness
      aria-hidden="true"
      className="size-5 text-[#8ee71d]"
    />
  </div>

  <p className="mt-6 text-sm font-black tracking-[0.18em] text-[#8ee71d] uppercase">
    Planned Starting Pay
  </p>

  <div className="mt-3 flex items-end justify-center gap-3 lg:justify-start">
    <p className="text-6xl font-black tracking-tight text-white [text-shadow:0_0_12px_rgba(255,255,255,0.16)] sm:text-7xl">
      $21<span className="text-[#8ee71d]">+</span>
    </p>

    <p className="pb-2 text-lg font-black text-white/45">
      / hour
    </p>
  </div>

  <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/48 lg:mx-0">
    Entry-level hourly roles are planned to begin at $21+ per hour, with
    additional opportunities across events, technology, media, hospitality,
    and operations.
  </p>

  <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
    {["Entry-Level", "Hourly", "Career Building"].map((item) => (
      <span
        className="rounded-full border border-[#8ee71d]/20 bg-[#8ee71d]/[0.05] px-4 py-2 text-xs font-black tracking-[0.1em] text-[#8ee71d]/80 uppercase"
        key={item}
      >
        {item}
      </span>
    ))}
  </div>
</div>

  </div>

      <div>
        <p className="mx-auto max-w-2xl text-base leading-8 text-white/52 lg:mx-0 lg:text-lg">
          Planned starting compensation for entry-level hourly positions.
          Final pay, schedules, requirements, hiring timelines, and individual
          role structures will be announced before opening.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            "Full-Time",
            "Part-Time",
            "Event Staff",
            "Internships",
          ].map((item) => (
            <div
              className="rounded-2xl border border-[#8ee71d]/15 bg-black/30 px-4 py-4 text-center"
              key={item}
            >
              <p className="text-xs font-black tracking-[0.12em] text-white/65 uppercase">
                {item}
              </p>

              <p className="mt-2 text-sm font-black text-[#8ee71d]/80">
                Planned
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-7 sm:p-9 lg:p-10">
    <div className="text-center">
      <p className="text-xs font-black tracking-[0.2em] text-[#8ee71d] uppercase">
        Future Team
      </p>

      <h3 className="mt-3 text-3xl font-black text-white [text-shadow:0_0_10px_rgba(255,255,255,0.14)] sm:text-4xl">
        Anticipated Opportunities
      </h3>

      <p className="mt-3 text-sm font-bold text-white/35 sm:text-base">
        Hiring is not yet open.
      </p>
    </div>

    <div className="mt-9 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {roles.map((role, index) => {
        const accent =
          index % 5 === 0
            ? "#4169ff"
            : index % 5 === 1
              ? "#8ee71d"
              : index % 5 === 2
                ? "#ef4fb5"
                : index % 5 === 3
                  ? "#22d3ee"
                  : "#ff8a1f";

        return (
          <div
            className="group flex min-h-16 items-center gap-4 rounded-2xl border bg-black/30 px-4 py-3.5 transition hover:bg-white/[0.025]"
            key={role}
            style={{
              borderColor: `${accent}28`,
            }}
          >
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full border text-xs font-black"
              style={{
                borderColor: `${accent}45`,
                color: accent,
                backgroundColor: `${accent}0d`,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="text-sm font-black text-white/65 sm:text-base">
              {role}
            </span>
          </div>
        );
      })}
    </div>

    <div className="mx-auto mt-8 max-w-3xl border-t border-white/8 pt-6 text-center">
      <p className="text-sm leading-7 text-white/35">
        These are anticipated positions and are not currently open job
        postings. Roles and staffing needs may change as the eHub moves toward
        opening.
      </p>
    </div>
  </div>
</section>

<section className="relative mt-28 overflow-hidden rounded-[2rem] bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] p-px">
  <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[#020205] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(139,92,246,0.12),transparent_32%),radial-gradient(circle_at_90%_70%,rgba(163,230,53,0.07),transparent_28%)]"
    />

    <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
      <div className="text-center lg:text-left">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[#ef4fb5]/30 bg-[#ef4fb5]/10 lg:mx-0">
          <HeartHandshake
            aria-hidden="true"
            className="size-5 text-[#ef4fb5]"
          />
        </div>

        <p className="mt-6 inline-block bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] bg-clip-text text-xs font-black tracking-[0.28em] text-transparent uppercase">
          Help Us Build It
        </p>

        <h2 className="mt-4 text-4xl font-black text-white [text-shadow:0_0_4px_rgba(255,255,255,0.95),0_0_12px_rgba(255,255,255,0.55),0_0_26px_rgba(139,92,246,0.2)] sm:text-5xl lg:text-6xl">
          We Cannot Build This Alone.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/52 sm:text-lg lg:mx-0">
          Building the Five Fifths eHub takes equipment, construction,
          technology, furniture, programming, people, and partners who believe
          communities deserve infrastructure built for their future.
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/38 lg:mx-0">
          Every contribution helps move the eHub closer to opening its doors.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
          <a
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] px-8 text-sm font-black text-white shadow-[0_0_30px_rgba(139,92,246,0.18)] transition hover:-translate-y-0.5 hover:brightness-110"
            href="https://www.paypal.com/donate/?hosted_button_id=2DW3JU6Q4BF4C"
            rel="noopener noreferrer"
            target="_blank"
          >
            Support The Build
          </a>

          <a
            className="inline-flex rounded-full bg-[linear-gradient(90deg,#3b82f6_0%,#8b5cf6_25%,#f472b6_50%,#fb923c_75%,#a3e635_100%)] p-px transition hover:-translate-y-0.5 hover:brightness-110"
            href="https://docs.google.com/forms/d/e/1FAIpQLSfcr0DJhYiTDpPXDrDlnq574hFWC7smaLhK6vS9cGyNnMGZYA/viewform?pli=1"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#020205] px-8 text-sm font-black text-white">
              Partner With Five Fifths ↗
            </span>
          </a>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[1.5rem] border border-[#4169ff]/25 bg-[#4169ff]/[0.04] p-6 text-center lg:text-left">
          <p className="text-xs font-black tracking-[0.16em] text-[#4169ff] uppercase">
            Donate
          </p>

          <h3 className="mt-2 text-xl font-black text-white">
            Help Fund The Buildout
          </h3>

          <p className="mt-3 text-sm leading-7 text-white/45 sm:text-base">
            Contributions help support construction, equipment, technology,
            furnishings, and the infrastructure needed to open the eHub.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#ef4fb5]/25 bg-[#ef4fb5]/[0.04] p-6 text-center lg:text-left">
          <p className="text-xs font-black tracking-[0.16em] text-[#ef4fb5] uppercase">
            Sponsor
          </p>

          <h3 className="mt-2 text-xl font-black text-white">
            Support A Space Or Program
          </h3>

          <p className="mt-3 text-sm leading-7 text-white/45 sm:text-base">
            Organizations can help equip spaces, sponsor programming, or
            support access to technology and career-building experiences.
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[#8ee71d]/25 bg-[#8ee71d]/[0.04] p-6 text-center lg:text-left">
          <p className="text-xs font-black tracking-[0.16em] text-[#8ee71d] uppercase">
            Partner
          </p>

          <h3 className="mt-2 text-xl font-black text-white">
            Build Opportunity With Us
          </h3>

          <p className="mt-3 text-sm leading-7 text-white/45 sm:text-base">
            Employers, educators, technology partners, creators, and community
            organizations can help create pathways that extend beyond the eHub.
          </p>
        </div>
      </div>
    </div>

    <div className="relative mt-12 border-t border-white/10 pt-7 text-center">
      <p className="mx-auto max-w-3xl text-sm leading-7 text-white/35 sm:text-base">
        This project is community-powered. Every contribution, partnership, and
        shared resource brings us one step closer to making the Five Fifths
        eHub real.
      </p>
    </div>
      <div className="mt-7 flex justify-center gap-3">
    {["#4169ff", "#8a4dff", "#ef4fb5", "#d96b9a", "#94e51d"].map(
      (color) => (
        <span
          className="size-3.5 rounded-full shadow-[0_0_16px_currentColor] lg:size-4"
          key={color}
          style={{ backgroundColor: color, color }}
        />
      ),
    )}
  </div>

  </div>
</section>

      </Container>
    </>
  );
}