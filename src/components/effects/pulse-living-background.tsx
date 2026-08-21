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

const STAR_COLORS = [
  "255,255,255",
  "157,70,236",
  "243,89,210",
  "34,211,238",
  "124,255,0",
];

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

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let animationFrame = 0;
    let isVisible = !document.hidden;

    const randomStarColor = () =>
      STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

    const createStars = () => {
      const amount = Math.min(
        170,
        Math.max(80, Math.floor((width * height) / 10000)),
      );

      stars = Array.from({ length: amount }, () => {
        const driftDistanceX = 5 + Math.random() * 28;
        const driftDistanceY = 4 + Math.random() * 22;

        return {
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          radius: 0.35 + Math.random() * 1.2,
          opacity: 0.08 + Math.random() * 0.25,
          color: randomStarColor()!,
          flickerPhase: Math.random() * Math.PI * 2,
          flickerSpeed: 0.00035 + Math.random() * 0.0022,
          flickerAmount: 0.06 + Math.random() * 0.2,
          driftPhaseX: Math.random() * Math.PI * 2,
          driftPhaseY: Math.random() * Math.PI * 2,
          driftSpeedX: 0.000035 + Math.random() * 0.00009,
          driftSpeedY: 0.00003 + Math.random() * 0.000085,
          driftDistanceX,
          driftDistanceY,
        };
      });
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

    const drawStars = (time: number) => {
      for (const star of stars) {
        const position = getStarPosition(star, time);

        const flicker =
          (Math.sin(time * star.flickerSpeed + star.flickerPhase) + 1) / 2;

        const secondaryFlicker =
          (Math.sin(
            time * star.flickerSpeed * 2.37 +
              star.flickerPhase * 1.73,
          ) +
            1) /
          2;

        const opacity = Math.min(
          star.opacity +
            flicker * star.flickerAmount +
            secondaryFlicker * 0.045,
          0.95,
        );

        const radiusBoost = flicker * 0.25;

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

    const animate = (time: number) => {
      if (!isVisible) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      drawStars(time);

      animationFrame = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
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
      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );
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