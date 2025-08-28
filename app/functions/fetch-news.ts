import { buildSummary, fetchActiveSources, parseFetchParams, processSources } from "./fetch-news.helpers";

export const handler = async (event: any) => {
  console.log("Starting news fetch job", { event });

  try {
    const { limit, concurrency } = parseFetchParams(event);

    const sources = await fetchActiveSources(limit);
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

    const results = await processSources(sources, concurrency);

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
