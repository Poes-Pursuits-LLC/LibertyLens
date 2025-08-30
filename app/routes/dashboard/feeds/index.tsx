import type { Route } from "./+types/index";
import { Link } from "react-router";
import {
  PlusIcon,
  RssIcon
} from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { feedsLoader } from "~/loaders/feeds.loader";
import { feedsAction } from "~/actions/feeds.action";
import { FeedCard } from "~/ui/feeds/FeedCard";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "My Feeds - Liberty Lens" },
    { name: "description", content: "Manage your custom libertarian news feeds" },
  ];
}

export async function loader(args: Route.LoaderArgs) {
  return await feedsLoader(args);
}

export async function action(args: Route.ActionArgs) {
  return await feedsAction(args as any);
}

export default function FeedsIndex({ loaderData }: Route.ComponentProps) {
  const { feeds } = (loaderData as any) ?? { feeds: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Feeds
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your custom news feeds and analysis preferences
          </p>
        </div>
        <Link to="/dashboard/feeds/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Feed
          </Button>
        </Link>
      </div>

      {/* Feeds Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {feeds.map((feed: any) => (
          <FeedCard key={feed.feedId} feed={feed} />
        ))}
      </div>

      {/* Empty State */}
      {feeds.length === 0 && (
        <Card className="p-12 text-center">
          <RssIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No feeds yet
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Create your first feed to start receiving libertarian news analysis
          </p>
          <Link to="/dashboard/feeds/new">
            <Button>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Feed
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
