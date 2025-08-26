"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "~/utils/cn";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!beamsRef.current) return;

    const canvas = beamsRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawBeam = (x: number, progress: number) => {
      const width = 3;
      const maxHeight = canvas.clientHeight;
      const height = maxHeight * progress;
      const opacity = Math.sin(progress * Math.PI) * 0.3;

      ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`; // Blue color
      ctx.fillRect(x - width / 2, 0, width, height);
    };

    const beams = Array.from({ length: 12 }, (_, i) => ({
      x: (canvas.clientWidth / 12) * (i + 1),
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.005,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      beams.forEach((beam) => {
        beam.progress += beam.speed;
        if (beam.progress > 1) {
          beam.progress = 0;
          beam.speed = 0.005 + Math.random() * 0.005;
        }
        drawBeam(beam.x, beam.progress);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={beamsRef}
      className={cn(
        "absolute inset-0 h-full w-full",
        className
      )}
    />
  );
};
