import { motion } from "framer-motion";
import * as React from "react";
import { fadeInUp } from "~/lib/motion";
import { cn } from "~/lib/utils";

interface GradientHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: "brand" | "success" | "warning" | "danger" | "custom";
  customGradient?: string;
  animate?: boolean;
  delay?: number;
}

const gradients = {
  brand: "from-brand-primary to-brand-secondary",
  success: "from-green-500 to-emerald-500",
  warning: "from-amber-500 to-orange-500",
  danger: "from-red-500 to-rose-500",
  custom: "",
};

export const GradientHeading = React.forwardRef<
  HTMLHeadingElement,
  GradientHeadingProps
>(
  (
    {
      className,
      children,
      level = 1,
      gradient = "brand",
      customGradient,
      animate = true,
      delay = 0,
      ...props
    },
    ref,
  ) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const headingClass = cn(
      "font-bold tracking-tight",
      {
        "text-4xl md:text-5xl lg:text-6xl": level === 1,
        "text-3xl md:text-4xl lg:text-5xl": level === 2,
        "text-2xl md:text-3xl lg:text-4xl": level === 3,
        "text-xl md:text-2xl lg:text-3xl": level === 4,
        "text-lg md:text-xl lg:text-2xl": level === 5,
        "text-base md:text-lg lg:text-xl": level === 6,
      },
      "bg-gradient-to-r bg-clip-text text-transparent",
      gradient === "custom" ? customGradient : gradients[gradient],
      className,
    );

    const content = (
      <Tag ref={ref} className={headingClass} {...props}>
        {children}
      </Tag>
    );

    if (!animate) return content;

    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        transition={{ delay }}
      >
        {content}
      </motion.div>
    );
  },
);

GradientHeading.displayName = "GradientHeading";
