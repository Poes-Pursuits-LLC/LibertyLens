import type { MetaFunction } from "react-router"
import { ComponentShowcase } from "~/components/ComponentShowcase"

export const meta: MetaFunction = () => {
  return [
    { title: "Component Showcase - Liberty Lens" },
    { name: "description", content: "Showcase of shadcn/ui components" },
  ]
}

export default function ComponentsRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Component Library</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          This page showcases the shadcn/ui components available in your Liberty Lens project. 
          These components are built with Radix UI primitives and styled with Tailwind CSS.
        </p>
        <ComponentShowcase />
      </div>
    </div>
  )
}
