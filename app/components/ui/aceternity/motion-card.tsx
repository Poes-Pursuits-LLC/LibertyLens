import { motion } from "framer-motion";
import { cn } from "~/utils/cn";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
  whileHover?: object;
  transition?: object;
}

export function MotionCard({
  children,
  className,
  whileHover = { 
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  },
  transition = { duration: 0.25, ease: "easeInOut" },
}: MotionCardProps) {
  return (
    <motion.div
      className={cn("h-full", className)}
      whileHover={whileHover}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
