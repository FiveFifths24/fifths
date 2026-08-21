import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Compass,
  Gamepad2,
  Globe2,
  PenLine,
  UsersRound,
} from "lucide-react";

const featureLinks = [
  {
    label: "Pulse",
    href: "/home/pulse",
    color: "#1800ad",
    icon: Activity,
  },
  {
    label: "Sessions",
    href: "/home/sessions",
    color: "#6c14ce",
    icon: CalendarDays,
  },
  {
    label: "Circles",
    href: "/home/circles",
    color: "#f359d2",
    icon: UsersRound,
  },
  {
    label: "Creator Commons",
    href: "/home/commons",
    color: "#c25cff",
    icon: PenLine,
  },
  {
    label: "Fifth Realm",
    href: "/home/realm",
    color: "#22d3ee",
    icon: Gamepad2,
  },
  {
    label: "Passport",
    href: "/home/passport",
    color: "#7cff00",
    icon: Globe2,
  },
] as const;

function PulseDial() {
  return (
    <div
      aria-hidden="true"
      className="relative flex size-32 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#1800ad,#6c14ce,#f359d2,#7cff00,#22d3ee,#1800ad)] p-px shadow-[0_0_55px_rgba(108,20,206,0.24)] sm:size-40 lg:size-44"
    >
      <div className="absolute inset-px rounded-full bg-[radial-gradient(circle_at_center,rgba(243,89,210,0.24),rgba(24,0,173,0.11)_46%,#06060a_72%)]" />

      <span className="absolute inset-1 animate-[ping_3s_ease-out_infinite] rounded-full border border-[#6c14ce]/30 motion-reduce:animate-none" />

      <span className="absolute inset-1 animate-[ping_3s_ease-out_infinite] rounded-full border border-[#7cff00]/20 [animation-delay:1.35s] motion-reduce:animate-none" />

      <div className="absolute inset-3 rounded-full border border-[#6c14ce]/40" />

      <div className="absolute inset-5 rounded-full border border-dashed border-[#f359d2]/50" />

      <div className="absolute inset-8 rounded-full border border-[#22d3ee]/30 shadow-[inset_0_0_24px_rgba(243,89,210,0.16)]" />

      <div className="absolute inset-3 animate-[spin_6s_linear_infinite] rounded-full motion-reduce:animate-none">
        <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[#7cff00] shadow-[0_0_14px_#7cff00]" />
      </div>

      <div className="absolute inset-x-5 top-1/2 h-px bg-[linear-gradient(90deg,transparent,#6c14ce,#f359d2,#7cff00,transparent)] shadow-[0_0_12px_rgba(243,89,210,0.8)]" />

      <Activity
        className="relative z-10 size-14 animate-[pulse_1.45s_ease-in-out_infinite] text-[#ff63c7] drop-shadow-[0_0_14px_rgba(243,89,210,0.95)] motion-reduce:animate-none lg:size-16"
        strokeWidth={1.7}
      />
    </div>
  );
}

function MobilePulseCard() {
  return (
    <div className="rounded-[1.4rem] border border-white/15 bg-[linear-gradient(135deg,rgba(19,18,25,0.96),rgba(5,5,8,0.94))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] lg:hidden">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        Your Pulse
        <Activity className="size-5 text-[#f359d2]" />
      </div>

      <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-5">
        <PulseDial />

        <div className="min-w-0">
          <p className="text-xl font-semibold text-[#f359d2]">Luminous</p>

          <p className="mt-1 text-sm leading-6 text-white/65">
            Ready to connect and create.
          </p>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[82%] rounded-full bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)] shadow-[0_0_12px_rgba(243,89,210,0.6)]" />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-white/45">Updated just now</p>
            <p className="text-sm font-bold text-white">82%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopPulseReceiver() {
  return (
    <div className="relative hidden min-h-[17rem] overflow-hidden rounded-[2.25rem] border border-white/15 bg-[linear-gradient(135deg,rgba(17,16,23,0.98),rgba(3,3,6,0.96))] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.55)] lg:grid lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-8">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_22%_50%,rgba(108,20,206,0.2),transparent_34%),radial-gradient(circle_at_85%_18%,rgba(124,255,0,0.05),transparent_35%)]"
      />

      <div className="relative flex justify-center">
        <PulseDial />
      </div>

      <div className="relative">
        <p className="bg-[linear-gradient(90deg,#6c14ce,#f359d2,#7cff00)] bg-clip-text text-sm font-black tracking-[0.08em] text-transparent uppercase [-webkit-text-fill-color:transparent]">
          Pulse
        </p>

        <p className="mt-2 text-sm text-white/65">
          How are you feeling right now?
        </p>

        <div className="mt-5 flex min-h-12 items-center justify-between rounded-2xl border border-white/15 bg-black/30 px-5">
          <div className="flex items-center gap-3">
            <span className="size-2.5 rounded-full bg-[#f359d2] shadow-[0_0_10px_#f359d2]" />
            <span className="text-sm font-bold text-white">Balanced</span>
          </div>

          <span className="text-sm text-white/85">64%</span>
        </div>

        <div className="mt-7">
          <div className="relative h-1 rounded-full bg-white/10">
            <div className="h-full w-[64%] rounded-full bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2,#7cff00)] shadow-[0_0_14px_rgba(243,89,210,0.7)]" />

            <span className="absolute top-1/2 left-[64%] size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#ff8bd7] bg-[#f359d2] shadow-[0_0_18px_#f359d2]" />
          </div>

          <div className="mt-3 flex justify-between text-[0.65rem] text-white/40">
            <span>Low Energy</span>
            <span className="text-white/85">Balanced</span>
            <span>High Energy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PulseHero() {
  return (
    <section className="relative overflow-hidden px-5 pt-28 pb-10 sm:px-7 lg:px-10 lg:pt-32 lg:pb-12 xl:px-12">
      <div
        aria-hidden="true"
        className="absolute top-14 left-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#1800ad]/10 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="absolute top-0 right-0 h-[30rem] w-[30rem] translate-x-1/2 rounded-full bg-[#f359d2]/9 blur-[150px]"
      />

      <div className="relative mx-auto w-full max-w-[86rem]">
        <div className="grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] xl:gap-16">
          <div className="text-center lg:text-left">
            <h1 className="display-type mx-auto max-w-[44rem] text-[clamp(3rem,11vw,5rem)] leading-[0.96] tracking-[-0.045em] text-[#f4f2ef] lg:mx-0 lg:text-[clamp(3rem,3.4vw,4.25rem)]">
              <span className="block">
                <span className="text-[#f359d2]">Your Energy</span> Changes.
              </span>

              <span className="mt-2 block">
                Your{" "}
                <span className="bg-[linear-gradient(90deg,#1800ad,#6c14ce,#f359d2)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
                  Options
                </span>{" "}
                Should Too.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[38rem] text-base leading-7 text-white/65 sm:text-lg sm:leading-8 lg:mx-0">
              Find people, places, and plans that match your energy, time,
              interests, and comfort level.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_34%,#f359d2_70%,#7cff00_120%)] px-8 text-sm font-black text-white shadow-[0_0_34px_rgba(108,20,206,0.28)] transition hover:scale-[1.02] hover:brightness-110 sm:w-auto sm:min-w-52"
                href="/home/pulse"
              >
                <Activity className="size-5" />
                Check Your Pulse
              </Link>

              <Link
                className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-white/25 bg-black/30 px-8 text-sm font-bold text-white backdrop-blur-xl transition hover:border-[#f359d2]/60 hover:bg-white/[0.06] sm:w-auto sm:min-w-56"
                href="/home/sessions"
              >
                <Compass className="size-5" />
                Explore What&apos;s Happening
              </Link>
            </div>

            <nav
              aria-label="Quick access to SIGNAL features"
              className="mt-7 hidden max-w-[42rem] flex-wrap gap-2 lg:flex"
            >
              {featureLinks.map((feature) => {
                const Icon = feature.icon;

                return (
                  <Link
                    className="group inline-flex min-h-10 items-center justify-center gap-2 rounded-full border bg-black/35 px-4 text-[0.68rem] font-bold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06]"
                    href={feature.href}
                    key={feature.href}
                    style={{
                      borderColor: `${feature.color}70`,
                      boxShadow: `inset 0 0 18px ${feature.color}0a`,
                    }}
                  >
                    <Icon
                      className="size-3.5 transition group-hover:scale-110"
                      style={{ color: feature.color }}
                    />

                    {feature.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <DesktopPulseReceiver />
        </div>

        <div className="mt-7">
          <MobilePulseCard />
        </div>
      </div>
    </section>
  );
}