import {
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
  NewspaperIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Card } from "../ui/card";
import type { Article } from "~/core/article/article.model";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Truncate summary
  const truncateSummary = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="space-y-4">
        {/* Header with source and date */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <NewspaperIcon className="h-4 w-4" />
            <span className="font-medium">{article.sourceName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-2 group"
            >
              {article.title}
              <ArrowTopRightOnSquareIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </h3>

          {/* Image and summary */}
          <div className="flex gap-4">
            {article.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-24 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    // Hide image if it fails to load
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-1">
              {truncateSummary(article.summary)}
            </p>
          </div>

          {/* Author */}
          {article.author && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              By {article.author}
            </p>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <TagIcon className="h-4 w-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
