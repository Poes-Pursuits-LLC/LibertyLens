import type { Route } from "~/routes/dashboard/feeds/+types/$feedId"
import { Card } from "~/components/ui/card"
import { Link } from "react-router"

export function FeedArticlesPage(
  loaderData: Route.ComponentProps["loaderData"],
) {
  const data = (loaderData as any) || {}
  const feed = data.feed
  const articles = Array.isArray(data.articles) ? data.articles : []
  const error: string | undefined = data.error

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
        <div className="space-y-4">
          {articles.map((a: any) => (
            <Card key={a.articleId} className="p-6 hover:shadow-md transition-shadow">
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
      )}
    </div>
  )
}
