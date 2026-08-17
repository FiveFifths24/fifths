"use client";

import { useEffect, useRef } from "react";

type Star = {
  baseX: number;
  baseY: number;

  radius: number;

  opacity: number;

  color: string;

  flickerPhase: number;
  flickerSpeed: number;
  flickerAmount: number;

  driftPhaseX: number;
  driftPhaseY: number;

  driftSpeedX: number;
  driftSpeedY: number;

  driftDistanceX: number;
  driftDistanceY: number;
};

type Ripple = {
  x: number;
  y: number;

  start: number;

  duration: number;

  maxRadius: number;

  strength: number;

  color: string;

  thickness: number;

  phase: number;
};

type Drop = {
  x: number;

  startY: number;
  impactY: number;

  start: number;

  duration: number;

  size: number;
};

const STAR_COLORS = [
  "255,255,255",
  "157,70,236",
  "243,89,210",
  "34,211,238",
  "124,255,0",
];

const WATER_COLORS = ["108,20,206", "157,70,236", "0,190,255", "190,225,255"];

export function PulseLivingBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = window.innerWidth;

    let height = window.innerHeight;

    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    let stars: Star[] = [];

    let ripples: Ripple[] = [];

    let drops: Drop[] = [];

    let animationFrame = 0;

    let dropTimer: ReturnType<typeof setInterval> | undefined;

    let firstDropTimer: ReturnType<typeof setTimeout> | undefined;

    let isVisible = !document.hidden;

    /* =========================================================
       HELPERS
    ========================================================== */

    const randomStarColor = () =>
      STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

    /* =========================================================
       GLITTER FIELD
    ========================================================== */

    const createStars = () => {
      const amount = Math.min(
        170,
        Math.max(80, Math.floor((width * height) / 10000)),
      );

      stars = Array.from(
        {
          length: amount,
        },
        () => {
          /*
           * Some stars move only a tiny amount.
           * Others float farther.
           *
           * This prevents the background
           * from looking like one uniform
           * particle animation.
           */

          const driftDistanceX = 5 + Math.random() * 28;

          const driftDistanceY = 4 + Math.random() * 22;

          return {
            baseX: Math.random() * width,

            baseY: Math.random() * height,

            radius: 0.35 + Math.random() * 1.2,

            opacity: 0.08 + Math.random() * 0.25,

            color: randomStarColor(),

            /*
             * Independent flickering.
             */
            flickerPhase: Math.random() * Math.PI * 2,

            flickerSpeed: 0.00035 + Math.random() * 0.0022,

            flickerAmount: 0.06 + Math.random() * 0.2,

            /*
             * Independent floating movement.
             */
            driftPhaseX: Math.random() * Math.PI * 2,

            driftPhaseY: Math.random() * Math.PI * 2,

            driftSpeedX: 0.000035 + Math.random() * 0.00009,

            driftSpeedY: 0.00003 + Math.random() * 0.000085,

            driftDistanceX,

            driftDistanceY,
          };
        },
      );
    };

    /* =========================================================
       CANVAS SIZE
    ========================================================== */

    const resizeCanvas = () => {
      width = window.innerWidth;

      height = window.innerHeight;

      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * pixelRatio);

      canvas.height = Math.floor(height * pixelRatio);

      canvas.style.width = `${width}px`;

      canvas.style.height = `${height}px`;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      createStars();
    };

    /* =========================================================
       WATER RIPPLE
    ========================================================== */

    const createRipple = (x: number, y: number, strength = 1) => {
      if (reducedMotion.matches) {
        return;
      }

      if (ripples.length > 40) {
        ripples = ripples.slice(-30);
      }

      const now = performance.now();

      const maxRadius = Math.max(width, height) * 0.42;

      /*
       * Four slow water rings.
       */
      for (let ring = 0; ring < 4; ring += 1) {
        ripples.push({
          x,
          y,

          start: now + ring * 300,

          duration: 8500,

          maxRadius: maxRadius * (0.76 + ring * 0.08),

          strength: strength * (1 - ring * 0.11),

          color: WATER_COLORS[ring % WATER_COLORS.length],

          thickness: 0.75 + ring * 0.12,

          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    /* =========================================================
       FALLING WATER DROP
    ========================================================== */

    const createDrop = () => {
      if (reducedMotion.matches || !isVisible) {
        return;
      }

      if (drops.length >= 2) {
        return;
      }

      /*
       * Drops mostly fall through
       * the center/right area.
       */
      const x = width * (0.4 + Math.random() * 0.45);

      /*
       * Invisible water surface.
       */
      const impactY = height * (0.5 + Math.random() * 0.18);

      drops.push({
        x,

        startY: -30 - Math.random() * 90,

        impactY,

        start: performance.now(),

        duration: 2600 + Math.random() * 900,

        size: 2.2 + Math.random() * 1.4,
      });
    };

    /* =========================================================
       GET CURRENT STAR POSITION
    ========================================================== */

    const getStarPosition = (star: Star, time: number) => {
      /*
       * X and Y use different speeds and phases.
       *
       * This creates slow organic drifting
       * instead of every star moving together.
       */

      const x =
        star.baseX +
        Math.sin(time * star.driftSpeedX + star.driftPhaseX) *
          star.driftDistanceX;

      const y =
        star.baseY +
        Math.cos(time * star.driftSpeedY + star.driftPhaseY) *
          star.driftDistanceY;

      return {
        x,
        y,
      };
    };

    /* =========================================================
       DRAW GLITTER
    ========================================================== */

    const drawStars = (time: number) => {
      for (const star of stars) {
        const position = getStarPosition(star, time);

        /*
         * Main flicker.
         */
        const flicker =
          (Math.sin(time * star.flickerSpeed + star.flickerPhase) + 1) / 2;

        /*
         * Secondary flicker gives the
         * light a less predictable feel.
         */
        const secondaryFlicker =
          (Math.sin(
            time * star.flickerSpeed * 2.37 + star.flickerPhase * 1.73,
          ) +
            1) /
          2;

        let opacity =
          star.opacity +
          flicker * star.flickerAmount +
          secondaryFlicker * 0.045;

        let radiusBoost = flicker * 0.25;

        /*
         * When a ripple passes through a
         * star, the star briefly brightens.
         */
        for (const ripple of ripples) {
          if (time < ripple.start) {
            continue;
          }

          const progress = (time - ripple.start) / ripple.duration;

          if (progress < 0 || progress > 1) {
            continue;
          }

          const eased = 1 - Math.pow(1 - progress, 2.2);

          const radius = ripple.maxRadius * eased;

          const dx = position.x - ripple.x;

          /*
           * Account for the shallow
           * water perspective.
           */
          const dy = (position.y - ripple.y) / 0.2;

          const distance = Math.sqrt(dx * dx + dy * dy);

          const waveDistance = Math.abs(distance - radius);

          if (waveDistance < 34) {
            const boost = 1 - waveDistance / 34;

            opacity += boost * 0.5 * ripple.strength * (1 - progress);

            radiusBoost += boost * 0.8;
          }
        }

        opacity = Math.min(opacity, 0.95);

        /*
         * Core glitter point.
         */
        ctx.beginPath();

        ctx.arc(
          position.x,
          position.y,
          star.radius + radiusBoost,
          0,
          Math.PI * 2,
        );

        ctx.fillStyle = `rgba(${star.color}, ${opacity})`;

        ctx.shadowBlur = opacity > 0.58 ? 10 : 3;

        ctx.shadowColor = `rgba(${star.color}, ${opacity})`;

        ctx.fill();

        /*
         * When a particle hits a brighter
         * flicker moment, create a tiny
         * sparkle cross.
         *
         * This is subtle and appears only
         * briefly.
         */
        if (opacity > 0.7 && star.radius > 0.75) {
          const sparkleSize = 1.5 + radiusBoost * 0.5;

          ctx.beginPath();

          ctx.moveTo(position.x - sparkleSize, position.y);

          ctx.lineTo(position.x + sparkleSize, position.y);

          ctx.moveTo(position.x, position.y - sparkleSize);

          ctx.lineTo(position.x, position.y + sparkleSize);

          ctx.strokeStyle = `rgba(${star.color}, ${opacity * 0.3})`;

          ctx.lineWidth = 0.4;

          ctx.shadowBlur = 0;

          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
    };

    /* =========================================================
       WATER RIPPLE PATH
    ========================================================== */

    const drawRipplePath = (
      ripple: Ripple,
      radius: number,
      progress: number,
    ) => {
      const points = 110;

      ctx.beginPath();

      for (let index = 0; index <= points; index += 1) {
        const angle = (index / points) * Math.PI * 2;

        /*
         * Small organic variation.
         */
        const wobble =
          Math.sin(angle * 4 + ripple.phase + progress * 5) *
          2.3 *
          (1 - progress);

        const ringRadius = radius + wobble;

        const pointX = Math.cos(angle) * ringRadius;

        const pointY = Math.sin(angle) * ringRadius * 0.2;

        if (index === 0) {
          ctx.moveTo(pointX, pointY);
        } else {
          ctx.lineTo(pointX, pointY);
        }
      }

      ctx.closePath();
    };

    /* =========================================================
       DRAW WATER RIPPLES
    ========================================================== */

    const drawRipples = (time: number) => {
      ripples = ripples.filter((ripple) => {
        if (time < ripple.start) {
          return true;
        }

        const progress = (time - ripple.start) / ripple.duration;

        if (progress >= 1) {
          return false;
        }

        const eased = 1 - Math.pow(1 - progress, 2.15);

        const radius = ripple.maxRadius * eased;

        const fade = Math.pow(1 - progress, 2);

        const opacity = fade * 0.25 * ripple.strength;

        ctx.save();

        ctx.translate(ripple.x, ripple.y);

        /*
         * Wide soft disturbance.
         */
        drawRipplePath(ripple, radius + 5, progress);

        ctx.strokeStyle = `rgba(${ripple.color}, ${opacity * 0.11})`;

        ctx.lineWidth = 8;

        ctx.shadowBlur = 14;

        ctx.shadowColor = `rgba(${ripple.color}, ${opacity * 0.3})`;

        ctx.stroke();

        /*
         * Main water wave.
         */
        drawRipplePath(ripple, radius, progress);

        const waterGradient = ctx.createLinearGradient(
          0,
          -radius * 0.2,
          0,
          radius * 0.2,
        );

        waterGradient.addColorStop(
          0,
          `rgba(${ripple.color}, ${opacity * 0.2})`,
        );

        waterGradient.addColorStop(0.52, `rgba(${ripple.color}, ${opacity})`);

        waterGradient.addColorStop(
          0.72,
          `rgba(215,240,255, ${opacity * 0.32})`,
        );

        waterGradient.addColorStop(
          1,
          `rgba(${ripple.color}, ${opacity * 0.12})`,
        );

        ctx.strokeStyle = waterGradient;

        ctx.lineWidth = ripple.thickness;

        ctx.shadowBlur = 7;

        ctx.shadowColor = `rgba(${ripple.color}, ${opacity * 0.55})`;

        ctx.stroke();

        /*
         * Thin water reflection.
         */
        if (radius > 8) {
          drawRipplePath(ripple, radius - 2.5, progress);

          ctx.strokeStyle = `rgba(220,245,255, ${opacity * 0.17})`;

          ctx.lineWidth = 0.45;

          ctx.shadowBlur = 0;

          ctx.stroke();
        }

        ctx.restore();

        return true;
      });

      ctx.shadowBlur = 0;
    };

    /* =========================================================
       DRAW FALLING WATER DROPS
    ========================================================== */

    const drawDrops = (time: number) => {
      drops = drops.filter((drop) => {
        const progress = (time - drop.start) / drop.duration;

        /*
         * Drop hits water.
         */
        if (progress >= 1) {
          createRipple(drop.x, drop.impactY, 0.82);

          return false;
        }

        /*
         * Gravity.
         */
        const gravity = progress * progress;

        const y = drop.startY + (drop.impactY - drop.startY) * gravity;

        ctx.save();

        ctx.translate(drop.x, y);

        /*
         * Teardrop shape.
         */
        ctx.beginPath();

        ctx.moveTo(0, -drop.size * 1.8);

        ctx.bezierCurveTo(
          drop.size * 0.25,
          -drop.size,
          drop.size,
          -drop.size * 0.1,
          drop.size,
          drop.size * 0.55,
        );

        ctx.bezierCurveTo(
          drop.size,
          drop.size * 1.3,
          drop.size * 0.5,
          drop.size * 1.75,
          0,
          drop.size * 1.75,
        );

        ctx.bezierCurveTo(
          -drop.size * 0.5,
          drop.size * 1.75,
          -drop.size,
          drop.size * 1.3,
          -drop.size,
          drop.size * 0.55,
        );

        ctx.bezierCurveTo(
          -drop.size,
          -drop.size * 0.1,
          -drop.size * 0.25,
          -drop.size,
          0,
          -drop.size * 1.8,
        );

        ctx.closePath();

        const gradient = ctx.createRadialGradient(
          -drop.size * 0.3,
          -drop.size * 0.45,
          0,
          0,
          0,
          drop.size * 2,
        );

        gradient.addColorStop(0, "rgba(255,255,255,0.94)");

        gradient.addColorStop(0.28, "rgba(205,240,255,0.8)");

        gradient.addColorStop(0.68, "rgba(80,170,255,0.42)");

        gradient.addColorStop(1, "rgba(110,70,255,0.08)");

        ctx.fillStyle = gradient;

        ctx.shadowBlur = 7;

        ctx.shadowColor = "rgba(160,220,255,0.24)";

        ctx.fill();

        /*
         * Water reflection.
         */
        ctx.beginPath();

        ctx.arc(
          -drop.size * 0.27,
          -drop.size * 0.42,
          Math.max(0.45, drop.size * 0.16),
          0,
          Math.PI * 2,
        );

        ctx.fillStyle = "rgba(255,255,255,0.75)";

        ctx.shadowBlur = 0;

        ctx.fill();

        ctx.restore();

        return true;
      });
    };

    /* =========================================================
       ANIMATION LOOP
    ========================================================== */

    const animate = (time: number) => {
      if (!isVisible) {
        animationFrame = requestAnimationFrame(animate);

        return;
      }

      ctx.clearRect(0, 0, width, height);

      drawStars(time);

      drawRipples(time);

      drawDrops(time);

      animationFrame = requestAnimationFrame(animate);
    };

    /* =========================================================
       TAP / CLICK RIPPLE
    ========================================================== */

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotion.matches) {
        return;
      }

      createRipple(event.clientX, event.clientY, 0.48);
    };

    /* =========================================================
       VISIBILITY
    ========================================================== */

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    /* =========================================================
       START
    ========================================================== */

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });

    document.addEventListener("visibilitychange", handleVisibility);

    if (!reducedMotion.matches) {
      animationFrame = requestAnimationFrame(animate);

      /*
       * First water drop.
       */
      firstDropTimer = setTimeout(createDrop, 1600);

      /*
       * Slow, deliberate water drops.
       */
      dropTimer = setInterval(createDrop, 8000);
    } else {
      /*
       * Static version for reduced-motion
       * accessibility preference.
       */
      ctx.clearRect(0, 0, width, height);

      drawStars(0);
    }

    /* =========================================================
       CLEANUP
    ========================================================== */

    return () => {
      cancelAnimationFrame(animationFrame);

      if (dropTimer) {
        clearInterval(dropTimer);
      }

      if (firstDropTimer) {
        clearTimeout(firstDropTimer);
      }

      window.removeEventListener("resize", resizeCanvas);

      window.removeEventListener("pointerdown", handlePointerDown);

      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
    />
  );
}
