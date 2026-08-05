export function PulseHeartbeat() {
const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const createPulsePath = () => {
  const baseline = 175;
  const commands = [`M 0 ${baseline}`];

  let x = 0;
  let beat = 1;

  while (x < 1080) {
    const restingSpace = 90 + pseudoRandom(beat * 3) * 55;
    const pWaveHeight = 9 + pseudoRandom(beat * 5) * 12;
    const qrsHeight = 65 + pseudoRandom(beat * 7) * 55;
    const qrsDepth = 70 + pseudoRandom(beat * 11) * 55;
    const tWaveHeight = 18 + pseudoRandom(beat * 13) * 22;

    x += restingSpace;
    commands.push(`L ${x.toFixed(1)} ${baseline}`);

    // Small P wave
    x += 16;
    commands.push(`L ${x.toFixed(1)} ${(baseline - pWaveHeight).toFixed(1)}`);

    x += 17;
    commands.push(`L ${x.toFixed(1)} ${baseline}`);

    // Short pause before the main heartbeat spike
    x += 24 + pseudoRandom(beat * 17) * 18;
    commands.push(`L ${x.toFixed(1)} ${baseline}`);

    // QRS complex
    x += 10;
    commands.push(`L ${x.toFixed(1)} ${(baseline + 14).toFixed(1)}`);

    x += 14;
    commands.push(`L ${x.toFixed(1)} ${(baseline - qrsHeight).toFixed(1)}`);

    x += 17;
    commands.push(`L ${x.toFixed(1)} ${(baseline + qrsDepth).toFixed(1)}`);

    x += 18;
    commands.push(`L ${x.toFixed(1)} ${(baseline - 25).toFixed(1)}`);

    x += 18;
    commands.push(`L ${x.toFixed(1)} ${baseline}`);

    // Rounded T wave
    x += 32;
    commands.push(`L ${x.toFixed(1)} ${baseline}`);

    x += 20;
    commands.push(`L ${x.toFixed(1)} ${(baseline - tWaveHeight).toFixed(1)}`);

    x += 24;
    commands.push(`L ${x.toFixed(1)} ${baseline}`);

    beat += 1;
  }

  commands.push(`L 1200 ${baseline}`);

  return commands.join(" ");
};

const pulsePath = createPulsePath();

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
className="pointer-events-none absolute inset-y-0 right-0 w-full origin-right scale-[1.15] overflow-hidden lg:w-[82%] lg:scale-[1.35]"
    >
      <svg
        className="h-full w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 1200 320"
      >
        <defs>
          <filter
            id="soft-glitter-clear"
            filterUnits="userSpaceOnUse"
            x="-100"
            y="-100"
            width="1400"
            height="520"
          >
            <feGaussianBlur stdDeviation="22" />
          </filter>
<linearGradient id="pulse-gradient" x1="0%" x2="100%">
  <stop offset="10%" stopColor="#17104f" />
  <stop offset="30%" stopColor="#1e00c7" />
  <stop offset="50%" stopColor="#6100cc" />
  <stop offset="70%" stopColor="#ff3cac" />
  <stop offset="90%" stopColor="#3ac700" />
</linearGradient>
          <filter id="pulse-glow" x="-30%" y="-100%" width="160%" height="300%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter
            id="glitter-glow"
            x="-300%"
            y="-300%"
            width="700%"
            height="700%"
          >
            <feGaussianBlur stdDeviation="1.5" result="glitterBlur" />
            <feMerge>
              <feMergeNode in="glitterBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* This mask clears glitter around the moving pulse */}
          <mask
            id="glitter-clear-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="1200"
            height="320"
          >
            <rect width="1200" height="320" fill="white" />

            <path
              d={pulsePath}
              fill="none"
              filter="url(#soft-glitter-clear)"
              pathLength="1200"
              stroke="black"
              strokeDasharray="260 940"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="70"
            >
<animate
  attributeName="stroke-dashoffset"
  calcMode="linear"
  dur="4.2s"
  keyTimes="0; 0.36; 0.42; 1"
  repeatCount="indefinite"
  values="1200; 760; 620; 0"
/>
            </path>
          </mask>
        </defs>

        {/* Suspended glitter throughout the atmosphere */}
        <g
          className="motion-reduce:hidden"
          filter="url(#glitter-glow)"
          mask="url(#glitter-clear-mask)"
        >
          {glitterParticles.map((particle) => (
            <circle
              cx={particle.x}
              cy={particle.y}
              fill={particle.color}
              key={`${particle.x}-${particle.y}`}
              r={particle.radius}
            >
              {/* Slow floating movement */}
              <animateTransform
                attributeName="transform"
                begin={particle.floatDelay}
                dur={particle.floatDuration}
                repeatCount="indefinite"
                type="translate"
                values={`0 0; ${particle.driftX} ${particle.driftY}; ${particle.driftX * -0.5} ${particle.driftY * 0.5}; 0 0`}
              />

              {/* Fading sparkle */}
              <animate
                attributeName="opacity"
                begin={particle.delay}
                dur={particle.duration}
                keyTimes="0;0.45;1"
                repeatCount="indefinite"
                values="0.08;0.85;0.08"
              />

              {/* Gentle glitter twinkle */}
              <animate
                attributeName="r"
                begin={particle.delay}
                dur={particle.duration}
                repeatCount="indefinite"
                values={`${particle.radius * 0.6};${particle.radius * 1.35};${particle.radius * 0.6}`}
              />
            </circle>
          ))}
        </g>
        {/* Dim heartbeat that remains visible */}
        <path
          d={pulsePath}
          fill="none"
          opacity="0.3"
          stroke="url(#pulse-gradient)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />

        {/* Bright section traveling across the heartbeat */}
        <path
          d={pulsePath}
          fill="none"
          filter="url(#pulse-glow)"
          pathLength="1200"
          stroke="url(#pulse-gradient)"
          strokeDasharray="260 940"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        >
<animate
  attributeName="stroke-dashoffset"
  calcMode="linear"
  dur="4.2s"
  keyTimes="0; 0.36; 0.42; 1"
  repeatCount="indefinite"
  values="1200; 760; 620; 0"
/>
        </path>
        {/* Crisp neon core inside the traveling glow */}
        <path
          d={pulsePath}
          fill="none"
          opacity="0.70"
          pathLength="1200"
          stroke="#ffffff"
          strokeDasharray="260 940"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.8"
        >
<animate
  attributeName="stroke-dashoffset"
  calcMode="linear"
  dur="4.2s"
  keyTimes="0; 0.36; 0.42; 1"
  repeatCount="indefinite"
  values="1200; 760; 620; 0"
/>
        </path>
      </svg>
    </div>
  );
}
