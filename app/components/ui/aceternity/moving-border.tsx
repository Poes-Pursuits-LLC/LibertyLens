"use client";
import React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "~/utils/cn";

export function MovingBorderButton({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  [key: string]: any;
}) {
  const pathRef = React.useRef<any>();
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / (duration || 4000);
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val)?.x
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val)?.y
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <Component
      className={cn(
        "relative text-xl p-[2px] overflow-hidden",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          borderClassName
        )}
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
        >
          <rect
            ref={pathRef}
            x="1"
            y="1"
            rx={`calc(${borderRadius} - 2px)`}
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            className="stroke-2"
            fill="none"
            stroke="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient">
              <stop stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="0.5" stopColor="#06b6d4" />
              <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 16,
            height: 16,
            transform,
          }}
          className="h-4 w-4 rounded-full bg-cyan-500 shadow-[0_0_20px_6px_rgba(6,182,212,0.5)]"
        />
      </div>

      <div
        className={cn(
          "relative z-10 flex items-center justify-center w-full h-full text-white",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}
