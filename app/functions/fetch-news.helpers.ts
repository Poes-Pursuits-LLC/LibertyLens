import { articleService } from "../core/article/article.service";
import { newsSourceService } from "../core/news-source/news-source.service";
import { fetchRSSArticles } from "../core/article/rss-fetcher";
import type { NewsSource } from "../core/news-source/news-source.model";

export interface FetchResult {
  sourceId: string;
  sourceName: string;
  success: boolean;
  articlesFound: number;
  articlesSaved: number;
  error?: string;
}

export interface FetchSummary {
  timestamp: string;
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalArticlesFound: number;
  totalArticlesSaved: number;
  results: FetchResult[];
}

// Derive and normalize fetch params from the incoming event
export function parseFetchParams(event: any): { limit: number; concurrency: number } {
  const limitRaw = event?.limit ?? 50;
  const concurrencyRaw = event?.concurrency ?? 5;
  const limit = typeof limitRaw === "string" ? Number(limitRaw) : Number(limitRaw);
  const concurrency =
    typeof concurrencyRaw === "string" ? Number(concurrencyRaw) : Number(concurrencyRaw);
  return { limit: Number.isFinite(limit) ? limit : 50, concurrency: Number.isFinite(concurrency) ? concurrency : 5 };
}

// Fetch active sources (seeding defaults first) respecting a limit
export async function fetchActiveSources(limit: number): Promise<NewsSource[]> {
  await newsSourceService.initializeDefaultSources();
  const sources = await newsSourceService.getActiveSourcesForFetching(limit);
  return sources as NewsSource[];
}

// Process a single source
export async function processSource(source: NewsSource): Promise<FetchResult> {
  const result: FetchResult = {
    sourceId: source.sourceId,
    sourceName: source.name,
    success: false,
    articlesFound: 0,
    articlesSaved: 0,
  };

  try {
    const [articles, fetchError] = await fetchRSSArticles(source);

    if (fetchError) {
      result.error = fetchError.message;
      await newsSourceService.recordFetchFailure(source.sourceId, fetchError.message);
      return result;
    }

    result.articlesFound = articles.length;

    if (articles.length > 0) {
      const [stats, saveError] = await articleService.saveFetchedArticles(
        source.sourceId,
        articles
      );

      if (saveError) {
        result.error = saveError.message;
        await newsSourceService.recordFetchFailure(source.sourceId, saveError.message);
        return result;
      }

      result.articlesSaved = stats?.saved || 0;
    }

    await newsSourceService.recordFetchSuccess(source.sourceId);
    result.success = true;

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    result.error = errorMessage;
    await newsSourceService.recordFetchFailure(source.sourceId, errorMessage);
    return result;
  }
}

// Run an array of items in batches of size `concurrency`, preserving input order
export async function runInBatches<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((item, idx) => fn(item, i + idx)));
    results.push(...batchResults);
  }
  return results;
}

// Process multiple sources with concurrency control
export async function processSources(
  sources: NewsSource[],
  concurrency: number
): Promise<FetchResult[]> {
  return runInBatches(sources, concurrency, (source) => processSource(source));
}

// Build an overall summary from sources and per-source results
export function buildSummary(
  sources: NewsSource[],
  results: FetchResult[]
): FetchSummary {
  return {
    timestamp: new Date().toISOString(),
    totalSources: sources.length,
    successfulSources: results.filter((r) => r.success).length,
    failedSources: results.filter((r) => !r.success).length,
    totalArticlesFound: results.reduce((sum, r) => sum + r.articlesFound, 0),
    totalArticlesSaved: results.reduce((sum, r) => sum + r.articlesSaved, 0),
    results,
  };
}
