import type { Route } from "./+types/index";
import { Link } from "react-router";
import { 
  PlusIcon,
  RssIcon,
  NewspaperIcon,
  CogIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Feeds - Liberty Lens" },
    { name: "description", content: "Manage your custom libertarian news feeds" },
  ];
}

// Mock data
const feeds = [
  {
    id: "1",
    name: "Economic Freedom Watch",
    description: "Tracking free market news and Austrian economics analysis",
    sources: ["Mises Institute", "FEE", "Reason Magazine"],
    topics: ["economics", "monetary-policy", "free-markets"],
    articleCount: 24,
    lastUpdated: "2 hours ago",
    unreadCount: 8,
  },
  {
    id: "2",
    name: "Civil Liberties Tracker",
    description: "Privacy, surveillance, and individual rights news",
    sources: ["EFF", "ACLU", "TechCrunch"],
    topics: ["privacy", "surveillance", "civil-rights"],
    articleCount: 18,
    lastUpdated: "4 hours ago",
    unreadCount: 3,
  },
  {
    id: "3",
    name: "Regulatory Overreach Alert",
    description: "Monitoring government expansion and regulatory capture",
    sources: ["Wall Street Journal", "Reuters", "Bloomberg"],
    topics: ["regulation", "government", "policy"],
    articleCount: 31,
    lastUpdated: "1 hour ago",
    unreadCount: 12,
  },
];

export default function FeedsIndex() {
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
        {feeds.map((feed) => (
          <Card key={feed.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <RssIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feed.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feed.description}
                  </p>
                </div>
              </div>
              {feed.unreadCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  {feed.unreadCount} new
                </span>
              )}
            </div>

            {/* Feed Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Articles</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{feed.articleCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sources</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{feed.sources.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{feed.lastUpdated}</p>
              </div>
            </div>

            {/* Topics */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {feed.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link to={`/dashboard/feeds/${feed.id}`}>
                <Button variant="primary" size="sm">
                  <NewspaperIcon className="h-4 w-4 mr-2" />
                  View Articles
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <CogIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
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
