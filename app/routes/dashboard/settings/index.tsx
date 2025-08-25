import type { Route } from "./+types/index";
import { CogIcon } from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/Card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Settings - Liberty Lens" },
    { name: "description", content: "Manage your Liberty Lens settings" },
  ];
}

export default function SettingsIndex() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>
      
      <Card className="p-12 text-center">
        <CogIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Settings Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Profile, preferences, and notification settings will be available here.
        </p>
      </Card>
    </div>
  );
}
