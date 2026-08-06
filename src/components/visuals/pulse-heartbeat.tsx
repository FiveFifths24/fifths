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

  const createSignalPath = (
    phaseShift: number,
    intensity: number,
    centerShift = 0,
  ) => {
    const baseline = 175;
    const commands: string[] = [];
    const activeStart = mobile ? 290 : 390;
    const activeEnd = mobile ? 910 : 1010;
    const activeWidth = activeEnd - activeStart;

    for (let x = 0; x <= 1200; x += 4) {
      let envelope = 0;

      if (x >= activeStart && x <= activeEnd) {
        const position = (x - activeStart) / activeWidth;
        envelope = Math.pow(Math.sin(position * Math.PI), 2);
      }

      const voiceFrequency =
        Math.sin(x * 0.11 + phaseShift) * 80 +
        Math.sin(x * 0.19 - phaseShift * 2) * 20 +
        Math.sin(x * 0.32 + phaseShift * 3) * 100;

      const speechRhythm =
        0.58 + Math.pow(Math.sin(x * 0.025 + phaseShift * 2), 2) * 0.42;

      const shiftedEnvelope = Math.max(
        0,
        envelope *
          (1 + Math.sin((x - centerShift) * 0.008 + phaseShift) * 0.08),
      );

      const y =
        baseline +
        voiceFrequency * speechRhythm * shiftedEnvelope * intensity;

      commands.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(2)}`);
    }

    return commands.join(" ");
  };

  const signalFrameCount = 48;
  const signalFrames = Array.from(
    { length: signalFrameCount },
    (_, index) => {
      const progress = index / signalFrameCount;
      const phase = progress * Math.PI * 2;
      const intensity =
        1.05 +
        Math.sin(phase) * 0.22 +
        Math.sin(phase * 2 + 0.6) * 0.12;
      const centerShift = Math.sin(phase) * 12;

      return createSignalPath(phase, intensity, centerShift);
    },
  );

  const signalPath = signalFrames[0];
  const animatedSignalValues = [...signalFrames, signalPath].join(";");

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
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 1200 320"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="1200"
            y1="0"
            y2="0"
          >
            <stop offset="30%" stopColor="#1800ad" />
            <stop offset="55%" stopColor="#6c14ce" />
            <stop offset="70%" stopColor="#ff3cac" />
            <stop offset="80%" stopColor="#7cff00" />
          </linearGradient>

          <filter
            id={signalGlowId}
            height="300%"
            width="160%"
            x="-30%"
            y="-100%"
          >
            <feGaussianBlur result="blur" stdDeviation="10" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter
            id={signalSoftGlowId}
            height="300%"
            width="160%"
            x="-30%"
            y="-100%"
          >
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* Soft atmospheric glow is desktop-only. */}
        <path
          className={mobile ? "hidden" : undefined}
          d={signalPath}
          fill="none"
          filter={`url(#${signalSoftGlowId})`}
          opacity="0.12"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="12"
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

        {/* Dim signal that remains visible. */}
        <path
          d={signalPath}
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

        {/* Wide glow is desktop-only so mobile stays crisp. */}
        <path
          className={mobile ? "hidden" : "motion-reduce:hidden"}
          d={signalPath}
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

        {/* Bright ombré frequency line. */}
        <path
          className="motion-reduce:hidden"
          d={signalPath}
          fill="none"
          filter={`url(#${signalGlowId})`}
          stroke={`url(#${gradientId})`}
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

        {/* Crisp light inside the ombré signal. */}
        <path
          className="motion-reduce:hidden"
          d={signalPath}
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
