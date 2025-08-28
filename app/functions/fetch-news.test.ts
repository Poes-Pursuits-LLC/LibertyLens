import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("./fetch-news.helpers", () => {
  return {
    parseFetchParams: (event: any) => ({
      limit: event?.limit ?? 50,
      concurrency: event?.concurrency ?? 5,
    }),
    fetchActiveSources: vi.fn(async (limit: number) => {
      const { newsSourceService } = await import("../core/news-source/news-source.service");
      return await newsSourceService.getActiveSourcesForFetching(limit);
    }),
    processSources: vi.fn(async () => []),
    buildSummary: (sources: any[], results: any[]) => ({
      timestamp: new Date().toISOString(),
      totalSources: sources.length,
      successfulSources: results.filter((r) => r.success).length,
      failedSources: results.filter((r) => !r.success).length,
      totalArticlesFound: results.reduce((s, r) => s + (r.articlesFound || 0), 0),
      totalArticlesSaved: results.reduce((s, r) => s + (r.articlesSaved || 0), 0),
      results,
    }),
  };
});
import { handler } from "./fetch-news";

vi.mock("../core/news-source/news-source.service", () => ({
  newsSourceService: {
    initializeDefaultSources: vi.fn(),
    getActiveSourcesForFetching: vi.fn(),
  },
}));

const { newsSourceService } = await import("../core/news-source/news-source.service");

const makeSource = (id: string, name: string) => ({
  sourceId: id,
  name,
  url: "https://example.com/feed",
  tags: [],
});

describe("fetch-news handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zero summary when no sources are found", async () => {
    const helpers = await import("./fetch-news.helpers");
    vi.mocked(newsSourceService.initializeDefaultSources).mockResolvedValue(undefined as any);
    vi.mocked(newsSourceService.getActiveSourcesForFetching).mockResolvedValue([] as any);

    const summary = await handler(undefined as any);

    expect(summary.totalSources).toBe(0);
    expect(summary.totalArticlesFound).toBe(0);
    expect(summary.totalArticlesSaved).toBe(0);
    expect(helpers.processSources).not.toHaveBeenCalled();
  });

  it("orchestrates normal path and uses defaults", async () => {
    const helpers = await import("./fetch-news.helpers");
    const sources = [makeSource("s1", "S1"), makeSource("s2", "S2"), makeSource("s3", "S3")];
    vi.mocked(newsSourceService.initializeDefaultSources).mockResolvedValue(undefined as any);
    vi.mocked(newsSourceService.getActiveSourcesForFetching).mockResolvedValue(sources as any);

    const results = [
      { sourceId: "s1", sourceName: "S1", success: true, articlesFound: 10, articlesSaved: 3 },
      { sourceId: "s2", sourceName: "S2", success: false, articlesFound: 0, articlesSaved: 0 },
      { sourceId: "s3", sourceName: "S3", success: true, articlesFound: 7, articlesSaved: 6 },
    ] as any;

    vi.mocked(helpers.processSources).mockResolvedValue(results);

    const summary = await handler(undefined as any);

    expect(newsSourceService.getActiveSourcesForFetching).toHaveBeenCalledWith(50);
    expect(helpers.processSources).toHaveBeenCalledWith(sources as any, 5);

    expect(summary.totalSources).toBe(3);
    expect(summary.successfulSources).toBe(2);
    expect(summary.failedSources).toBe(1);
    expect(summary.totalArticlesFound).toBe(17);
    expect(summary.totalArticlesSaved).toBe(9);
  });

  it("applies event overrides for limit and concurrency", async () => {
    const helpers = await import("./fetch-news.helpers");
    const sources = [makeSource("s1", "S1"), makeSource("s2", "S2")];
    vi.mocked(newsSourceService.initializeDefaultSources).mockResolvedValue(undefined as any);
    vi.mocked(newsSourceService.getActiveSourcesForFetching).mockResolvedValue(sources as any);

    vi.mocked(helpers.processSources).mockResolvedValue([] as any);

    await handler({ limit: 10, concurrency: 2 } as any);

    expect(newsSourceService.getActiveSourcesForFetching).toHaveBeenCalledWith(10);
    expect(helpers.processSources).toHaveBeenCalledWith(sources as any, 2);
  });
});
