import { type ReactNode } from "react";

interface HeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Hero({ title, subtitle, children, className = "" }: HeroProps) {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
          {children && (
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
