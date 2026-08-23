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
  hitStartedAt: number;
  hitUntil: number;
  hitColor: string;
  hitStrength: number;
};

type SignalBurstDetail = {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
  distance: number;
  duration: number;
};

type ActiveSignal = SignalBurstDetail & {
  startedAt: number;
  rgbColor: string;
};

const STAR_COLORS = [
  "255,255,255",
  "157,70,236",
  "243,89,210",
  "34,211,238",
  "124,255,0",
];

function hexToRgb(hexColor: string) {
  const normalized = hexColor.replace("#", "");

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return "255,255,255";
  }

  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;

  return `${red},${green},${blue}`;
}

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
    let activeSignals: ActiveSignal[] = [];
    let animationFrame = 0;
    let isVisible = !document.hidden;

    const randomStarColor = () =>
      STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

    const createStars = () => {
      const amount = Math.min(
        170,
        Math.max(80, Math.floor((width * height) / 10000)),
      );

      stars = Array.from({ length: amount }, () => ({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        radius: 0.35 + Math.random() * 1.2,
        opacity: 0.08 + Math.random() * 0.25,
        color: randomStarColor() ?? "255,255,255",
        flickerPhase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.00035 + Math.random() * 0.0022,
        flickerAmount: 0.06 + Math.random() * 0.2,
        driftPhaseX: Math.random() * Math.PI * 2,
        driftPhaseY: Math.random() * Math.PI * 2,
        driftSpeedX: 0.000035 + Math.random() * 0.00009,
        driftSpeedY: 0.00003 + Math.random() * 0.000085,
        driftDistanceX: 5 + Math.random() * 28,
        driftDistanceY: 4 + Math.random() * 22,
        hitStartedAt: 0,
        hitUntil: 0,
        hitColor: "255,255,255",
        hitStrength: 0,
      }));
    };

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

    const getStarPosition = (star: Star, time: number) => {
      const x =
        star.baseX +
        Math.sin(time * star.driftSpeedX + star.driftPhaseX) *
          star.driftDistanceX;

      const y =
        star.baseY +
        Math.cos(time * star.driftSpeedY + star.driftPhaseY) *
          star.driftDistanceY;

      return { x, y };
    };

    const applySignalHits = (
      star: Star,
      starX: number,
      starY: number,
      time: number,
    ) => {
      for (const signal of activeSignals) {
        const elapsed = time - signal.startedAt;
        const progress = elapsed / signal.duration;

        if (progress < 0 || progress > 1) {
          continue;
        }

        const radians = (signal.angle * Math.PI) / 180;
        const directionX = Math.cos(radians);
        const directionY = Math.sin(radians);
        const relativeX = starX - signal.x;
        const relativeY = starY - signal.y;
        const forwardDistance = relativeX * directionX + relativeY * directionY;
        const sideDistance = Math.abs(
          -relativeX * directionY + relativeY * directionX,
        );
        const waveDistance = progress * signal.distance;
        const waveThickness = 24;
        const waveWidth = 30 + progress * 38;
        const distanceFromWave = Math.abs(forwardDistance - waveDistance);

        if (
          forwardDistance >= 0 &&
          forwardDistance <= signal.distance + waveThickness &&
          distanceFromWave <= waveThickness &&
          sideDistance <= waveWidth
        ) {
          const forwardStrength = 1 - distanceFromWave / waveThickness;
          const sideStrength = 1 - sideDistance / waveWidth;
          const strength = Math.max(0, forwardStrength * sideStrength);

          if (strength >= star.hitStrength || star.hitUntil <= time) {
            star.hitStartedAt = time;
            star.hitUntil = time + 760;
            star.hitColor = signal.rgbColor;
            star.hitStrength = Math.max(0.35, strength);
          }
        }
      }
    };

    const drawStars = (time: number) => {
      activeSignals = activeSignals.filter(
        (signal) => time - signal.startedAt <= signal.duration,
      );

      for (const star of stars) {
        const position = getStarPosition(star, time);

        applySignalHits(star, position.x, position.y, time);

        const flicker =
          (Math.sin(time * star.flickerSpeed + star.flickerPhase) + 1) / 2;

        const secondaryFlicker =
          (Math.sin(
            time * star.flickerSpeed * 2.37 + star.flickerPhase * 1.73,
          ) +
            1) /
          2;

        const hitDuration = Math.max(1, star.hitUntil - star.hitStartedAt);
        const hitProgress =
          star.hitUntil > time
            ? Math.max(0, (star.hitUntil - time) / hitDuration)
            : 0;
        const hitGlow = hitProgress * star.hitStrength;
        const opacity = Math.min(
          star.opacity +
            flicker * star.flickerAmount +
            secondaryFlicker * 0.045 +
            hitGlow * 0.85,
          1,
        );
        const radiusBoost = flicker * 0.25 + hitGlow * 1.7;
        const drawColor = hitGlow > 0 ? star.hitColor : star.color;

        ctx.beginPath();
        ctx.arc(
          position.x,
          position.y,
          star.radius + radiusBoost,
          0,
          Math.PI * 2,
        );

        ctx.fillStyle = `rgba(${drawColor}, ${opacity})`;
        ctx.shadowBlur =
          hitGlow > 0 ? 8 + hitGlow * 24 : opacity > 0.58 ? 10 : 3;
        ctx.shadowColor = `rgba(${drawColor}, ${Math.max(opacity, hitGlow)})`;

        ctx.fill();

        if ((opacity > 0.7 || hitGlow > 0.25) && star.radius > 0.65) {
          const sparkleSize = 1.5 + radiusBoost * 0.65;

          ctx.beginPath();
          ctx.moveTo(position.x - sparkleSize, position.y);
          ctx.lineTo(position.x + sparkleSize, position.y);
          ctx.moveTo(position.x, position.y - sparkleSize);
          ctx.lineTo(position.x, position.y + sparkleSize);

          ctx.strokeStyle = `rgba(${drawColor}, ${opacity * 0.45})`;
          ctx.lineWidth = 0.45;
          ctx.shadowBlur = 0;

          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
    };

    const animate = (time: number) => {
      if (!isVisible) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      drawStars(time);

      animationFrame = requestAnimationFrame(animate);
    };

    const handleSignalBurst = (event: Event) => {
      if (reducedMotion.matches) {
        return;
      }

      const { detail } = event as CustomEvent<SignalBurstDetail>;

      if (!detail) {
        return;
      }

      activeSignals.push({
        ...detail,
        startedAt: performance.now(),
        rgbColor: hexToRgb(detail.color),
      });
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("signal:burst", handleSignalBurst);
    document.addEventListener("visibilitychange", handleVisibility);

    if (reducedMotion.matches) {
      ctx.clearRect(0, 0, width, height);
      drawStars(0);
    } else {
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("signal:burst", handleSignalBurst);
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
