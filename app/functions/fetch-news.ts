import {
  buildSummary,
  fetchActiveSources,
  parseFetchParams,
  processSources,
} from "./fetch-news.helpers";

export const handler = async (event: any) => {
  console.log("Starting news fetch job", { event });

  try {
    const { limit, concurrency } = parseFetchParams(event);
    console.log("Parsed fetch params:", { limit, concurrency });

    const sources = await fetchActiveSources(limit);
    console.log(`Found ${sources.length} active sources to fetch`);

    // Detailed logging of each source
    console.log("=== DETAILED SOURCE ANALYSIS ===");
    sources.forEach((source, index) => {
      console.log(`Source ${index + 1}:`, {
        sourceId: source.sourceId,
        name: source.name,
        url: source.url,
        isActive: source.isActive,
        reliabilityScore: source.reliability?.score,
        failureCount: source.reliability?.failureCount,
        lastSuccessfulFetch: source.reliability?.lastSuccessfulFetch,
        lastFailedFetch: source.reliability?.lastFailedFetch,
        category: source.category,
        tags: source.tags,
      });
    });
    console.log("=== END SOURCE ANALYSIS ===");

    if (sources.length === 0) {
      console.log("No active sources found - returning empty summary");
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

    console.log("Processing sources with concurrency:", concurrency);
    const results = await processSources(sources, concurrency);

    // Log detailed results for each source
    console.log("=== FETCH RESULTS ===");
    results.forEach((result, index) => {
      console.log(`Result ${index + 1}:`, {
        sourceId: result.sourceId,
        sourceName: result.sourceName,
        success: result.success,
        articlesFound: result.articlesFound,
        articlesSaved: result.articlesSaved,
        error: result.error || "none",
      });
    });
    console.log("=== END FETCH RESULTS ===");

    const summary = buildSummary(sources, results);

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
