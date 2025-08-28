"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "~/utils/cn";

export const FloatingElements = ({ 
  className, 
  count = 8, 
  color = "rgba(59, 130, 246, 0.3)" 
}: { 
  className?: string; 
  count?: number;
  color?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const elements = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 10,
  }));

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
    >
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute rounded-full opacity-40"
          style={{
            left: `${element.initialX}%`,
            top: `${element.initialY}%`,
            width: element.size,
            height: element.size,
            backgroundColor: color,
            filter: "blur(1px)",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.4, 0.8, 0.3, 0.4],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};
