import { useState, useEffect } from "react";
import type { Route } from "~/routes/dashboard/feeds/+types/$feedId";
import { Card } from "~/components/ui/card";
import { Link, useFetcher } from "react-router";

interface FeedArticlesPageProps {
  loaderData: Route.ComponentProps["loaderData"];
  actionData?: Route.ComponentProps["actionData"];
}

export function FeedArticlesPage({ loaderData, actionData }: FeedArticlesPageProps) {
  const data = (loaderData as any) || {};
  const feed = data.feed;
  const initialArticles = Array.isArray(data.articles) ? data.articles : [];
  const error: string | undefined = data.error;
  
  const [articles, setArticles] = useState(initialArticles);
  const [nextCursor, setNextCursor] = useState(data.nextCursor);
  const [hasMore, setHasMore] = useState(data.hasMore);
  
  const fetcher = useFetcher<typeof actionData>();
  const isLoadingMore = fetcher.state === "submitting" || fetcher.state === "loading";

  // Update articles when we get new data from the action
  useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      const newArticles = Array.isArray(fetcher.data.articles) ? fetcher.data.articles : [];
      setArticles(prev => [...prev, ...newArticles]);
      setNextCursor(fetcher.data.nextCursor);
      setHasMore(fetcher.data.hasMore);
    }
  }, [fetcher.data]);

  // Reset when loader data changes (e.g., navigating to a different feed)
  useEffect(() => {
    setArticles(initialArticles);
    setNextCursor(data.nextCursor);
    setHasMore(data.hasMore);
  }, [loaderData]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      fetcher.submit(
        { cursor: nextCursor },
        { method: "post" }
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {feed?.name ?? "Feed Articles"}
          </h1>
          {feed?.description && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {feed.description}
            </p>
          )}
        </div>
        <Link
          to="/dashboard/feeds"
          className="text-blue-600 hover:underline text-sm"
        >
          Back to Feeds
        </Link>
      </div>

      {error && (
        <div className="rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {fetcher.data?.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fetcher.data.error}
        </div>
      )}

      {articles.length === 0 ? (
        <Card className="p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No articles yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Articles for this feed will appear here as sources are fetched.
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {articles.map((a: any, index: number) => (
              <Card key={`${a.articleId}-${index}`} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <a
                      href={a.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-700 hover:underline"
                    >
                      {a.title}
                    </a>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-2">
                      {a.sourceName && <span>{a.sourceName}</span>}
                      {a.publishedAt && (
                        <>
                          <span>•</span>
                          <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    {a.summary && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {a.summary}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className={`
                  px-6 py-2 rounded-md font-medium transition-colors
                  ${isLoadingMore 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                  }
                `}
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  `Load More Articles`
                )}
              </button>
            </div>
          )}

          {!hasMore && articles.length > 0 && (
            <div className="text-center text-sm text-gray-500 pt-4">
              No more articles to load
            </div>
          )}
        </>
      )}
    </div>
  );
}
