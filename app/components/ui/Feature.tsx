import { type ReactNode } from "react";

interface FeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function Feature({ icon, title, description, className = "" }: FeatureProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
