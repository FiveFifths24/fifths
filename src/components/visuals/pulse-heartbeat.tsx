type PulseHeartbeatProps = {
  mobile?: boolean;
  idPrefix?: string;
};

export function PulseHeartbeat({
  mobile = false,
  idPrefix = "desktop-signal",
}: PulseHeartbeatProps) {
  const gradientId = `${idPrefix}-pulse-gradient`;
  const signalGlowId = `${idPrefix}-signal-glow`;
  const signalSoftGlowId = `${idPrefix}-signal-soft-glow`;
  const softGlitterClearId = `${idPrefix}-soft-glitter-clear`;
  const glitterGlowId = `${idPrefix}-glitter-glow`;
  const glitterMaskId = `${idPrefix}-glitter-clear-mask`;
    const pseudoRandom = (seed: number) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  };

  /*
   * Simple signal waveform:
   * - long resting sections
   * - two large signal peaks
   * - a few smaller pulses
   */

const createSignalPath = (
  phaseShift: number,
  intensity: number,
  centerShift = 0,
) => {
  const baseline = 175;
  const commands: string[] = [];

  // The signal is active only between these two positions.
const activeStart = mobile ? 290 : 390;
const activeEnd = mobile ? 910 : 1010;
  const activeWidth = activeEnd - activeStart;

for (let x = 0; x <= 1200; x += 4) {
      let envelope = 0;

    if (x >= activeStart && x <= activeEnd) {
      const position = (x - activeStart) / activeWidth;

      /*
       * Starts flat, grows toward the middle,
       * then smoothly returns to flat.
       */
      envelope = Math.pow(Math.sin(position * Math.PI), 2);
    }

    // Irregular frequencies resemble someone speaking.
const voiceFrequency =
  Math.sin(x * 0.11 + phaseShift) * 80 +
  Math.sin(x * 0.19 - phaseShift * 2) * 20 +
  Math.sin(x * 0.32 + phaseShift * 3) * 100;

    // Creates changing clusters instead of one perfect sine wave.
    const speechRhythm =
      0.58 +
      Math.pow(
Math.sin(x * 0.025 + phaseShift * 2),
        2,
      ) *
        0.42;

    const shiftedEnvelope = Math.max(
      0,
      envelope *
        (1 +
          Math.sin(
            (x - centerShift) * 0.008 + phaseShift,
          ) *
            0.08),
    );

    const y =
      baseline +
      voiceFrequency *
        speechRhythm *
        shiftedEnvelope *
        intensity;

    commands.push(
      `${x === 0 ? "M" : "L"} ${x} ${y.toFixed(2)}`,
    );
  }

  return commands.join(" ");
};

const SIGNAL_FRAME_COUNT = 48;

const signalFrames = Array.from(
  { length: SIGNAL_FRAME_COUNT },
  (_, index) => {
    const progress = index / SIGNAL_FRAME_COUNT;
    const phase = progress * Math.PI * 2;

    const intensity =
      1.05 +
      Math.sin(phase) * 0.22 +
      Math.sin(phase * 2 + 0.6) * 0.12;

    const centerShift = Math.sin(phase) * 12;

    return createSignalPath(
      phase,
      intensity,
      centerShift,
    );
  },
);

/*
 * Add the exact first path again as the last frame.
 * This prevents a visible snap when the loop restarts.
 */
const signalPath1 = signalFrames[0];

const animatedSignalValues = [
  ...signalFrames,
  signalPath1,
].join(";");


  const glitterParticles = Array.from({ length: 160 }, (_, index) => {
    const seed = index + 1;

    const x = pseudoRandom(seed * 2) * 1200;
    const y = pseudoRandom(seed * 3) * 320;
    const radius = 0.3 + pseudoRandom(seed * 5) * 0.65;
    const sparkleDuration = 1.5 + pseudoRandom(seed * 7) * 3.2;
    const sparkleDelay = pseudoRandom(seed * 11) * 5;

    const driftX = pseudoRandom(seed * 13) * 20 - 10;
    const driftY = pseudoRandom(seed * 17) * 16 - 8;
    const floatDuration = 6 + pseudoRandom(seed * 19) * 8;
    const floatDelay = pseudoRandom(seed * 23) * 7;

    const colorChoice = pseudoRandom(seed * 29);

    return {
      x,
      y,
      radius,
      delay: `-${sparkleDelay.toFixed(2)}s`,
      duration: `${sparkleDuration.toFixed(2)}s`,
      driftX,
      driftY,
      floatDuration: `${floatDuration.toFixed(2)}s`,
      floatDelay: `-${floatDelay.toFixed(2)}s`,
      color:
        colorChoice > 0.88
          ? "#ffffff"
          : colorChoice > 0.48
            ? "#c084fc"
            : "#8b5cf6",
    };
  });

  return (
<div
  aria-hidden="true"
  className={
    mobile
      ? "pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      : "pointer-events-none absolute inset-y-0 right-[4%] w-full origin-right scale-[1.15] overflow-hidden lg:w-[65%] lg:scale-[1.20]"
  }
>
          <svg
        className="h-full w-full overflow-visible"
preserveAspectRatio={mobile ? "xMidYMid slice" : "xMidYMid meet"}
viewBox="0 0 1200 320"      >
        <defs>
<linearGradient
id={gradientId}
  gradientUnits="userSpaceOnUse"
  x1="0"
  y1="0"
  x2="1200"
  y2="0"
>
  <stop offset="30%" stopColor="#1800ad" />
  <stop offset="55%" stopColor="#6c14ce" />
  <stop offset="70%" stopColor="#ff3cac" />
  <stop offset="80%" stopColor="#7cff00" />
</linearGradient>
          <filter
id={signalGlowId}
            x="-30%"
            y="-100%"
            width="160%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="10" result="blur" />

            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter
            id={signalSoftGlowId}
            x="-30%"
            y="-100%"
            width="160%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="18" />
          </filter>

          <filter
id={softGlitterClearId}
            filterUnits="userSpaceOnUse"
            x="-100"
            y="-100"
            width="1400"
            height="520"
          >
            <feGaussianBlur stdDeviation="22" />
          </filter>

          <filter
            id={glitterGlowId}
            x="-300%"
            y="-300%"
            width="700%"
            height="700%"
          >
            <feGaussianBlur
              stdDeviation="1.5"
              result="glitterBlur"
            />

            <feMerge>
              <feMergeNode in="glitterBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clears glitter around the moving bright signal */}
          <mask
            id={glitterMaskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1200"
            height="320"
          >
            <rect width="1200" height="320" fill="white" />

<path
  d={signalPath1}
  fill="none"
filter={`url(#${softGlitterClearId})`}
  stroke="black"
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="70"
>
<animate
  attributeName="d"
  begin="0s"
  calcMode="linear"
  dur="1.8s"
  repeatCount="indefinite"
  values={animatedSignalValues}
/>
</path>
          </mask>
        </defs>

        {/* Floating background glitter */}
        <g
          className={mobile ? "hidden" : "motion-reduce:hidden"}
          filter={`url(#${glitterGlowId})`}
          mask={`url(#${glitterMaskId})`}
        >
          {glitterParticles.map((particle, index) => (
            <circle
              cx={particle.x}
              cy={particle.y}
              fill={particle.color}
              key={index}
              r={particle.radius}
            >
              <animateTransform
                attributeName="transform"
                begin={particle.floatDelay}
                dur={particle.floatDuration}
                repeatCount="indefinite"
                type="translate"
                values={[
                  "0 0",
                  `${particle.driftX} ${particle.driftY}`,
                  `${particle.driftX * -0.5} ${
                    particle.driftY * 0.5
                  }`,
                  "0 0",
                ].join(";")}
              />

              <animate
                attributeName="opacity"
                begin={particle.delay}
                dur={particle.duration}
                keyTimes="0;0.45;1"
                repeatCount="indefinite"
                values="0.08;0.85;0.08"
              />

              <animate
                attributeName="r"
                begin={particle.delay}
                dur={particle.duration}
                repeatCount="indefinite"
                values={[
                  particle.radius * 0.6,
                  particle.radius * 1.35,
                  particle.radius * 0.6,
                ].join(";")}
              />
            </circle>
          ))}
        </g>


        {/* Crisp neon core inside the traveling glow */}
{/* Dim signal that remains visible */}
<path
  d={signalPath1}
  fill="none"
  opacity="0.3"
stroke={`url(#${gradientId})`}
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="3"
>
<animate
  attributeName="d"
  begin="0s"
  calcMode="linear"
  dur="1.8s"
  repeatCount="indefinite"
  values={animatedSignalValues}
/>
</path>

{/* Wide glow around the moving frequency */}
<path
  className="motion-reduce:hidden"
  d={signalPath1}
  fill="none"
  filter={`url(#${signalGlowId})`}
  opacity="0.22"
  stroke={`url(#${gradientId})`}
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="11"
>
<animate
  attributeName="d"
  begin="0s"
  calcMode="linear"
  dur="1.8s"
  repeatCount="indefinite"
  values={animatedSignalValues}
/>
</path>

{/* Bright ombré frequency line */}
<path
  className="motion-reduce:hidden"
  d={signalPath1}
  fill="none"
  filter={`url(#${signalGlowId})`}
  stroke="url(#pulse-gradient)"
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="4"
>
<animate
  attributeName="d"
  begin="0s"
  calcMode="linear"
  dur="1.8s"
  repeatCount="indefinite"
  values={animatedSignalValues}
/>
</path>

{/* Crisp light inside the ombré signal */}
<path
  className="motion-reduce:hidden"
  d={signalPath1}
  fill="none"
  opacity="0.65"
  stroke="#ffffff"
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="0.8"
>
<animate
  attributeName="d"
  begin="0s"
  calcMode="linear"
  dur="1.8s"
  repeatCount="indefinite"
  values={animatedSignalValues}
/>
</path>
      </svg>
    </div>
  );
}