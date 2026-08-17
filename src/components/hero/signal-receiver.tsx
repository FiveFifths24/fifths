"use client";

import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";

const stations = [
  {
    channel: "01",
    name: "Pulse",
    frequency: "88.5",
    eyebrow: "Define your frequency",
    title: "Find Your Space.",
    gradientTitle: "That Matches Your Energy.",
    description:
      "Check in with your energy, capacity, and comfort level so SIGNAL can help surface what fits right now.",
    color: "#1e00c7",
  },
  {
    channel: "02",
    name: "Circles",
    frequency: "92.3",
    eyebrow: "Find your people",
    title: "Shared Interests.",
    gradientTitle: "Genuine Connection.",
    description:
      "Discover communities built around shared interests, identities, values, and ways of participating.",
    color: "#5e07e3",
  },
  {
    channel: "03",
    name: "Sessions",
    frequency: "96.7",
    eyebrow: "Find something to do",
    title: "Plans That Fit.",
    gradientTitle: "Show Up Your Way.",
    description:
      "Explore gatherings, workshops, meetups, and experiences that match your energy and availability.",
    color: "#ff3cac",
  },
  {
    channel: "04",
    name: "Passport",
    frequency: "101.9",
    eyebrow: "Carry it forward",
    title: "Your Participation.",
    gradientTitle: "Your Story.",
    description:
      "Build a lasting record of eligible verified participation, contributions, and experiences across SIGNAL.",
    color: "#ffcd03",
  },
  {
    channel: "05",
    name: "eHub",
    frequency: "105.5",
    eyebrow: "Meet in real life",
    title: "Digital Community.",
    gradientTitle: "Physical Home.",
    description:
      "Connect digital discovery to a physical third space designed for community, creativity, play, and participation.",
    color: "#7cff00",
  },
] as const;

export function SignalReceiver() {
  const [stationIndex, setStationIndex] = useState(0);
  const station = stations[stationIndex] ?? stations[0];
  const [isTuning, setIsTuning] = useState(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      setIsTuning(true);
    }, 0);

    const timer = window.setTimeout(() => {
      setIsTuning(false);
    }, 450);

    return () => window.clearTimeout(timer);
    window.clearTimeout(startTimer);
  }, [stationIndex]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Ambient SIGNAL glow */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-[15%] left-[-12rem] size-[34rem] rounded-full bg-[#6c14ce]/12 blur-[150px]" />
        <div className="absolute top-[20%] right-[-10rem] size-[30rem] rounded-full bg-[#f359d2]/10 blur-[140px]" />
        <div className="absolute bottom-[-12rem] left-[38%] size-[32rem] rounded-full bg-[#7cff00]/6 blur-[150px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[76rem] px-4 sm:px-6">
        {/* Television / receiver body */}
        <div className="relative rounded-[2.6rem] border border-white/15 bg-[linear-gradient(145deg,#121217_0%,#08080c_38%,#050507_100%)] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-18px_36px_rgba(0,0,0,0.28)] sm:p-5 lg:rounded-[3.25rem] lg:p-7">
          {/* Outer hardware rim */}
          <div className="rounded-[2.15rem] border border-[#6c14ce]/25 bg-[#050508] p-3 sm:p-5 lg:rounded-[2.7rem] lg:p-7">
            {/* Receiver header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1 font-mono text-[0.55rem] tracking-[0.18em] text-white/35 uppercase sm:mb-5 sm:text-[0.62rem]">
              <div className="flex items-center gap-3">
                <span className="text-[#69cc0c]">SIGNAL // RECEIVER_001</span>

                <span className="hidden text-white/15 sm:inline">/</span>

                <span className="hidden sm:inline">PUBLIC CHANNEL</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="signal-search-light relative flex size-2">
                  <span className="absolute inset-0 rounded-full bg-[#66b40b] opacity-40 blur-[3px]" />

                  <span className="relative size-2 rounded-full bg-[#55ab04] shadow-[0_0_10px_rgba(202,154,255,0.95)]" />
                </span>

                <span>SEARCHING FOR YOUR FREQUENCY</span>
              </div>
            </div>

            {/* CRT screen */}
            <div className="relative overflow-hidden rounded-[2rem_2.4rem_2rem_2.4rem] border border-white/10 bg-[#020205] px-5 py-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.98),inset_0_0_35px_rgba(108,20,206,0.08),0_0_0_1px_rgba(255,255,255,0.025)] sm:px-10 sm:py-12 lg:min-h-[38rem] lg:rounded-[3rem_3.6rem_3rem_3.6rem] lg:px-16 lg:py-14">
              {/* screen color */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-colors duration-500"
                style={{
                  background: `radial-gradient(circle at center, ${station.color}18 0%, transparent 58%)`,
                }}
              />

              {/* channel-change blink */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 z-40 bg-white transition-opacity ${
                  isTuning ? "signal-channel-blink" : "opacity-0"
                }`}
              />

              {/* scanlines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-20 opacity-[0.055]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(255,255,255,0.32) 4px)",
                }}
              />

              {/* CRT vignette */}
              <div className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] shadow-[inset_0_0_90px_rgba(0,0,0,0.9)]" />

              {/* Screen status */}
              <div className="relative z-30 flex items-center justify-between gap-4 font-mono text-[0.5rem] tracking-[0.18em] text-white/30 uppercase sm:text-[0.58rem]">
                <span>
                  CH_{station.channel} / {station.name}
                </span>

                <span style={{ color: station.color }}>
                  FREQ {station.frequency}
                </span>
              </div>

              {/* Main screen content */}
              <div className="relative z-10 mx-auto mt-10 max-w-[52rem] text-center sm:mt-12">
                <p
                  className="font-mono text-[0.6rem] font-bold tracking-[0.24em] uppercase sm:text-[0.7rem]"
                  style={{ color: station.color }}
                >
                  {station.eyebrow}
                </p>

                <h1 className="display-type mt-5 text-[clamp(3.1rem,7vw,7rem)] leading-[0.88] tracking-[-0.055em]">
                  <span className="block text-[#f2f0ed]">{station.title}</span>

                  <span className="mt-2 block bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_30%,#f359d2_62%,#7cff00_100%)] bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
                    {station.gradientTitle}
                  </span>
                </h1>

                {/* Untuned CRT static */}
                {/* SIGNAL tuning window */}
                <div
                  aria-hidden="true"
                  className="relative mx-auto mt-7 h-24 w-full max-w-[42rem] overflow-hidden rounded-xl border border-white/10 bg-[#050508] sm:h-28"
                >
                  {/* static texture */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      isTuning ? "opacity-80" : "opacity-30"
                    }`}
                    style={{
                      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.7) 0 1px, transparent 1.4px),
        radial-gradient(circle at 70% 55%, rgba(202,154,255,0.65) 0 1px, transparent 1.5px),
        radial-gradient(circle at 45% 75%, rgba(243,89,210,0.55) 0 1px, transparent 1.4px),
        radial-gradient(circle at 85% 20%, rgba(124,255,0,0.45) 0 1px, transparent 1.4px)
      `,
                      backgroundSize:
                        "9px 9px, 13px 13px, 17px 17px, 21px 21px",
                    }}
                  />

                  {/* signal sweep */}
                  <div
                    className={`absolute inset-x-0 h-px bg-white/60 shadow-[0_0_12px_rgba(255,255,255,0.7)] transition-all duration-500 ${
                      isTuning ? "top-[75%] opacity-80" : "top-[25%] opacity-0"
                    }`}
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="font-mono text-[0.58rem] tracking-[0.24em] uppercase transition-colors duration-300"
                      style={{
                        color: isTuning
                          ? "rgba(255,255,255,0.42)"
                          : station.color,
                      }}
                    >
                      {isTuning
                        ? "Searching..."
                        : `Signal Locked // ${station.name}`}
                    </span>
                  </div>
                </div>

                <p className="mx-auto mt-6 max-w-[38rem] text-sm leading-7 text-white/55 sm:text-base sm:leading-8">
                  {station.description}
                </p>

                <div className="mx-auto mt-8 flex max-w-[25rem] flex-col justify-center gap-3 sm:flex-row">
                  <ButtonLink
                    className="w-full border-0 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_36%,#f359d2_70%,#7cff00_100%)] font-mono text-[0.66rem] tracking-[0.16em] text-white uppercase shadow-[0_0_28px_rgba(108,20,206,0.3)] hover:brightness-110 sm:w-auto sm:min-w-44"
                    href="/signup"
                  >
                    Join SIGNAL
                  </ButtonLink>

                  <ButtonLink
                    className="w-full border border-white/20 bg-black/45 font-mono text-[0.66rem] tracking-[0.16em] text-white uppercase backdrop-blur-sm hover:border-white/40 hover:bg-white/10 sm:w-auto sm:min-w-36"
                    href="/login"
                    variant="secondary"
                  >
                    Log in
                  </ButtonLink>
                </div>
              </div>

              {/* mobile station */}
              <div className="relative z-30 mt-10 flex items-center justify-between border-t border-white/10 pt-4 font-mono text-[0.5rem] tracking-[0.16em] text-white/30 uppercase sm:hidden">
                <span>CH 01</span>

                <span>READY</span>
              </div>
            </div>

            {/* Desktop tuner */}
            {/* Retro receiver controls */}
            <div className="mt-6 hidden sm:grid sm:grid-cols-[1fr_15rem] sm:gap-6">
              {/* tuner deck */}
              <div className="rounded-[1.4rem] border border-white/10 bg-[#09090d] p-5 shadow-[inset_0_0_30px_rgba(0,0,0,0.65)]">
                <div className="mb-4 flex items-center justify-between font-mono text-[0.5rem] tracking-[0.18em] text-white/30 uppercase">
                  <span>Frequency Range</span>

                  <span style={{ color: station.color }}>
                    {station.frequency} FM
                  </span>
                </div>

                {/* tuner scale */}
                {/* tuner scale */}
                <div className="relative">
                  <div className="flex justify-between px-[9px] font-mono text-[0.46rem] text-white/20">
                    <span>88</span>
                    <span>92</span>
                    <span>96</span>
                    <span>101</span>
                    <span>105</span>
                  </div>

                  {/* interactive frequency window */}
                  <div className="relative mt-2 h-12 overflow-hidden rounded-md border border-white/10 bg-black/70">
                    {/* SIGNAL ombré frequency line */}
                    <div
                      aria-hidden="true"
                      className="absolute top-1/2 right-[9px] left-[9px] h-[2px] -translate-y-1/2 bg-[linear-gradient(90deg,#1800ad_0%,#6c14ce_30%,#f359d2_62%,#7cff00_100%)] opacity-70"
                    />

                    {/* frequency marks */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-[9px] opacity-40"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(255,255,255,0.22) 19px, transparent 20px)",
                      }}
                    />

                    {/* selected station glow */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-0 w-16 -translate-x-1/2 blur-xl transition-[left] duration-300"
                      style={{
                        left: `calc(9px + ${stationIndex * 25}% - ${
                          stationIndex * 4.5
                        }px)`,
                        backgroundColor: station.color,
                        opacity: 0.22,
                      }}
                    />

                    {/* tuning needle */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-y-2 w-px -translate-x-1/2 transition-[left] duration-300"
                      style={{
                        left: `calc(9px + ${stationIndex * 25}% - ${
                          stationIndex * 4.5
                        }px)`,
                        backgroundColor: station.color,
                        boxShadow: `0 0 14px ${station.color}`,
                      }}
                    />

                    {/* invisible interactive range sitting over the frequency window */}
                    <input
                      aria-label="Tune through SIGNAL stations"
                      className="signal-frequency-input absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent"
                      max={stations.length - 1}
                      min="0"
                      onChange={(event) =>
                        setStationIndex(Number(event.target.value))
                      }
                      onInput={(event) =>
                        setStationIndex(Number(event.currentTarget.value))
                      }
                      step="1"
                      type="range"
                      value={stationIndex}
                    />
                  </div>

                  {/* perfectly aligned station stops */}
                  <div className="relative mx-[9px] mt-1 h-10">
                    {stations.map((item, index) => (
                      <button
                        className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1.5 font-mono text-[0.46rem] tracking-[0.1em] text-white/25 uppercase transition hover:text-white/70"
                        key={item.name}
                        onClick={() => setStationIndex(index)}
                        style={{
                          left: `${index * 25}%`,
                        }}
                        type="button"
                      >
                        <span
                          className="size-1.5 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              index === stationIndex
                                ? item.color
                                : "rgba(255,255,255,0.18)",
                            boxShadow:
                              index === stationIndex
                                ? `0 0 10px ${item.color}`
                                : "none",
                          }}
                        />

                        <span
                          className={
                            index === stationIndex ? "text-white/75" : undefined
                          }
                        >
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* hardware controls */}
              <div className="grid grid-rows-[1fr_auto] gap-4">
                {/* knobs */}
                <div className="flex items-center justify-center gap-5 rounded-[1.4rem] border border-white/10 bg-[#09090d] px-5 py-4">
                  <div className="text-center">
                    <div className="relative mx-auto size-14 rounded-full border border-white/15 bg-[radial-gradient(circle_at_35%_30%,#34343a,#0a0a0d_68%)] shadow-[0_6px_16px_rgba(0,0,0,0.75)]">
                      <span className="absolute top-2 left-1/2 h-3 w-px -translate-x-1/2 bg-white/35" />
                    </div>

                    <p className="mt-2 font-mono text-[0.44rem] tracking-[0.14em] text-white/25 uppercase">
                      Gain
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="relative mx-auto size-14 rounded-full border border-[#6c14ce]/30 bg-[radial-gradient(circle_at_35%_30%,#30154d,#09090d_68%)] shadow-[0_0_20px_rgba(108,20,206,0.15)]">
                      <span
                        className="absolute top-2 left-1/2 h-3 w-px -translate-x-1/2"
                        style={{
                          backgroundColor: station.color,
                          boxShadow: `0 0 6px ${station.color}`,
                        }}
                      />
                    </div>

                    <p className="mt-2 font-mono text-[0.44rem] tracking-[0.14em] text-white/25 uppercase">
                      Tune
                    </p>
                  </div>
                </div>

                {/* speaker grille */}
                <div className="rounded-[1.4rem] border border-white/10 bg-[#08080b] p-4">
                  <div
                    aria-hidden="true"
                    className="h-12 rounded-lg opacity-40"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 5px)",
                    }}
                  />

                  <p className="mt-3 text-center font-mono text-[0.42rem] tracking-[0.18em] text-white/20 uppercase">
                    Signal Output
                  </p>
                </div>
              </div>
            </div>

            {/* Equipment label */}
            <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4 font-mono text-[0.46rem] tracking-[0.16em] text-white/20 uppercase">
              <span>FIVE FIFTHS // SIGNAL</span>

              <span>MODEL FF-05</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes signal-search-flicker {
          0%,
          100% {
            opacity: 1;
            filter: brightness(1);
          }

          12% {
            opacity: 0.35;
            filter: brightness(0.7);
          }

          18% {
            opacity: 0.9;
            filter: brightness(1.35);
          }

          41% {
            opacity: 0.55;
          }

          46% {
            opacity: 1;
            filter: brightness(1.4);
          }

          72% {
            opacity: 0.7;
          }

          76% {
            opacity: 1;
          }
        }

        @keyframes signal-channel-blink {
          0% {
            opacity: 0;
          }

          20% {
            opacity: 0.12;
          }

          34% {
            opacity: 0.015;
          }

          48% {
            opacity: 0.08;
          }

          62% {
            opacity: 0;
          }

          100% {
            opacity: 0;
          }
        }

        .signal-search-light {
          animation: signal-search-flicker 2.8s steps(1, end) infinite;
        }

        .signal-channel-blink {
          animation: signal-channel-blink 450ms ease-out forwards;
        }

        .signal-frequency-input {
          touch-action: none;
        }

        .signal-frequency-input::-webkit-slider-runnable-track {
          height: 48px;
          background: transparent;
          border: 0;
        }

        .signal-frequency-input::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 48px;
          background: transparent;
          border: 0;
          cursor: ew-resize;
        }

        .signal-frequency-input::-moz-range-track {
          height: 48px;
          background: transparent;
          border: 0;
        }

        .signal-frequency-input::-moz-range-thumb {
          width: 20px;
          height: 48px;
          background: transparent;
          border: 0;
          cursor: ew-resize;
        }
      `}</style>
    </section>
  );
}
