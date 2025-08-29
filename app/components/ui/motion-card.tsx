import { type MotionProps, motion } from "framer-motion";
import * as React from "react";
import { fadeInUp, hoverGlow, hoverLift } from "~/lib/motion";
import { cn } from "~/lib/utils";
import { Card, type CardProps } from "./card";

export interface MotionCardProps extends CardProps, MotionProps {
  animateOnce?: boolean;
  delay?: number;
  enableHover?: boolean;
  enableGlow?: boolean;
}

export const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  (
    {
      children,
      className,
      animateOnce = true,
      delay = 0,
      enableHover = true,
      enableGlow = false,
      variant,
      ...props
    },
    ref,
  ) => {
    const animationProps = {
      ...fadeInUp,
      ...(enableHover && hoverLift),
      ...(enableGlow && hoverGlow),
    };

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={fadeInUp}
        transition={{ delay }}
        viewport={{ once: animateOnce }}
        whileInView="animate"
        {...(enableHover && hoverLift)}
        {...(enableGlow && hoverGlow)}
        {...props}
      >
        <Card variant={variant} className={className}>
          {children}
        </Card>
      </motion.div>
    );
  },
);

MotionCard.displayName = "MotionCard";
