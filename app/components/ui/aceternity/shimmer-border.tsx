"use client";
import { motion } from "framer-motion";
import { cn } from "~/utils/cn";

export const ShimmerBorder = ({
  children,
  className,
  borderRadius = "0.75rem",
  shimmerColor = "rgba(255, 255, 255, 0.2)",
  duration = 3,
}: {
  children: React.ReactNode;
  className?: string;
  borderRadius?: string;
  shimmerColor?: string;
  duration?: number;
}) => {
  return (
    <motion.div
      className={cn("relative p-[1px] overflow-hidden", className)}
      style={{ borderRadius }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${shimmerColor} 50%, transparent 70%)`,
            transform: "translateX(-100%)",
          }}
          animate={{
            transform: ["translateX(-100%)", "translateX(300%)"],
          }}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      <div
        className="relative bg-[var(--surface)] z-10 h-full w-full"
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      >
        {children}
      </div>
    </motion.div>
  );
};
