import type { Route } from "./+types/index";
import { Link, useSubmit } from "react-router";
import {
  PlusIcon,
  RssIcon,
  NewspaperIcon,
  CogIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { feedsLoader } from "~/loaders/feeds.loader";
import { feedsAction } from "~/actions/feeds.action";

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
  const submit = useSubmit();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Feeds
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
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
          <Card key={feed.feedId} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <RssIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feed.name}
                  </h3>
                  {feed.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feed.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Feed Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Articles</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sources</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{feed.sources?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{feed.lastRefreshedAt || "—"}</p>
              </div>
            </div>

            {/* Topics */}
            {!!feed.topics?.length && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {feed.topics.map((topic: string) => (
                    <span
                      key={topic}
                      className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link to={`/dashboard/feeds/${feed.feedId}`}>
                <Button size="sm">
                  <NewspaperIcon className="h-4 w-4 mr-2" />
                  View Articles
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <CogIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Delete feed"
                  title="Delete feed"
                  onClick={() => {
                    if (!window.confirm(`Are you sure you want to delete "${feed.name}"? This action cannot be undone.`)) {
                      return;
                    }
                    const formData = new FormData();
                    formData.append("action", "delete");
                    formData.append("feedId", feed.feedId);
                    submit(formData, { method: "post" });
                  }}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {feeds.length === 0 && (
        <Card className="p-12 text-center">
          <RssIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No feeds yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
