import type { Route } from "./+types/$feedId";
import { useParams } from "react-router";
import { NewspaperIcon } from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/Card";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Feed Articles - Liberty Lens" },
    { name: "description", content: "View articles in your custom feed" },
  ];
}

export default function FeedDetail() {
  const { feedId } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Feed Articles
      </h1>
      
      <Card className="p-12 text-center">
        <NewspaperIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Feed View Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Articles for feed {feedId} will be displayed here with libertarian analysis.
        </p>
      </Card>
    </div>
  );
}
