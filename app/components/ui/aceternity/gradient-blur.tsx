"use client";
import { motion } from "framer-motion";
import { cn } from "~/utils/cn";

export const GradientBlur = ({
  className,
  colors = ["#3B82F6", "#8B5CF6", "#06B6D4"],
  blur = 60,
  opacity = 0.4,
  animated = true,
}: {
  className?: string;
  colors?: string[];
  blur?: number;
  opacity?: number;
  animated?: boolean;
}) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            filter: `blur(${blur}px)`,
            width: "40%",
            height: "40%",
          }}
          initial={{
            left: `${Math.random() * 60}%`,
            top: `${Math.random() * 60}%`,
          }}
          animate={animated ? {
            left: [`${Math.random() * 60}%`, `${Math.random() * 60}%`, `${Math.random() * 60}%`],
            top: [`${Math.random() * 60}%`, `${Math.random() * 60}%`, `${Math.random() * 60}%`],
            scale: [1, 1.2, 1],
          } : undefined}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
};
