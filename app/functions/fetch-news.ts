import { articleService } from "../core/article/article.service";
import { newsSourceService } from "../core/news-source/news-source.service";
import { fetchRSSArticles } from "../core/article/rss-fetcher";
import type { NewsSource } from "../core/news-source/news-source.model";

interface FetchResult {
  sourceId: string;
  sourceName: string;
  success: boolean;
  articlesFound: number;
  articlesSaved: number;
  error?: string;
}

interface FetchSummary {
  timestamp: string;
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalArticlesFound: number;
  totalArticlesSaved: number;
  results: FetchResult[];
}

async function processSource(source: NewsSource): Promise<FetchResult> {
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
      await newsSourceService.recordFetchFailure(
        source.sourceId,
        fetchError.message
      );
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
        await newsSourceService.recordFetchFailure(
          source.sourceId,
          saveError.message
        );
        return result;
      }

      result.articlesSaved = stats?.saved || 0;
    }

    await newsSourceService.recordFetchSuccess(source.sourceId);
    result.success = true;

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.error = errorMessage;
    await newsSourceService.recordFetchFailure(source.sourceId, errorMessage);
    return result;
  }
}

async function processSources(
  sources: NewsSource[],
  concurrency: number
): Promise<FetchResult[]> {
  const results: FetchResult[] = [];

  for (let i = 0; i < sources.length; i += concurrency) {
    const batch = sources.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((source) => processSource(source))
    );
    results.push(...batchResults);
  }

  return results;
}

export const handler = async (event: any) => {
  console.log("Starting news fetch job", { event });

  try {
    const limit = event?.limit || 50;
    const concurrency = event?.concurrency || 5;

    await newsSourceService.initializeDefaultSources();

    const sources = await newsSourceService.getActiveSourcesForFetching(limit);
    console.log(`Found ${sources.length} active sources to fetch`);

    if (sources.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        totalSources: 0,
        successfulSources: 0,
        failedSources: 0,
        totalArticlesFound: 0,
        totalArticlesSaved: 0,
        results: [],
      };
    }

    const results = await processSources(sources as NewsSource[], concurrency);

    const summary: FetchSummary = {
      timestamp: new Date().toISOString(),
      totalSources: sources.length,
      successfulSources: results.filter((r) => r.success).length,
      failedSources: results.filter((r) => !r.success).length,
      totalArticlesFound: results.reduce((sum, r) => sum + r.articlesFound, 0),
      totalArticlesSaved: results.reduce((sum, r) => sum + r.articlesSaved, 0),
      results,
    };

    console.log("Fetch job completed", {
      successfulSources: summary.successfulSources,
      failedSources: summary.failedSources,
      totalArticlesFound: summary.totalArticlesFound,
      totalArticlesSaved: summary.totalArticlesSaved,
    });

    const failedSources = results.filter((r) => !r.success);
    if (failedSources.length > 0) {
      console.warn("Failed sources:", failedSources);
    }

    return summary;
  } catch (error) {
    console.error("Fatal error in fetch job", error);
    throw error;
  }
};
