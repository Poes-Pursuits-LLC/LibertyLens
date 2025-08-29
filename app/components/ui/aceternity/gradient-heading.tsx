import { cn } from "~/utils/cn";

interface GradientHeadingProps {
  children: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function GradientHeading({
  children,
  gradientFrom = "from-blue-600",
  gradientVia = "via-indigo-600",
  gradientTo = "to-purple-600",
  className,
  as: Component = "h2",
}: GradientHeadingProps) {
  const gradientClasses = cn(
    "bg-gradient-to-r",
    gradientFrom,
    gradientVia,
    gradientTo,
    "bg-clip-text text-transparent",
    "inline-block"
  );

  return (
    <Component className={cn(gradientClasses, className)}>
      {children}
    </Component>
  );
}
