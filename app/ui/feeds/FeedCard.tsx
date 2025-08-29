import { Link, useFetcher } from 'react-router';
import {
  RssIcon,
  NewspaperIcon,
  CogIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';

// Feed type definition
type Feed = {
  feedId: string;
  name: string;
  description?: string;
  sources?: string[];
  topics?: string[];
  lastRefreshedAt?: string | null;
};

export type FeedCardProps = {
  feed: Feed;
};

export function FeedCard({ feed }: FeedCardProps) {
  const fetcher = useFetcher();
  const isDeleting = fetcher.state !== 'idle';

  function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${feed.name}"? This action cannot be undone.`)) {
      return;
    }

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('feedId', feed.feedId);
    fetcher.submit(formData, { method: 'post' });
  }

  return (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${isDeleting ? 'opacity-60' : ''}`}>
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
            className={`text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Delete feed"
            title="Delete feed"
            aria-busy={isDeleting}
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span className="sr-only">Deleting...</span>
              </>
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
