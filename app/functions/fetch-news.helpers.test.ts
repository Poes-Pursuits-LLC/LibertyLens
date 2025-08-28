import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseFetchParams,
  processSource,
  processSources,
  buildSummary,
} from "./fetch-news.helpers";

// Mocks matching the helper's import specifiers
vi.mock("../core/article/rss-fetcher", () => ({
  fetchRSSArticles: vi.fn(),
}));
vi.mock("../core/article/article.service", () => ({
  articleService: {
    saveFetchedArticles: vi.fn(),
  },
}));
vi.mock("../core/news-source/news-source.service", () => ({
  newsSourceService: {
    initializeDefaultSources: vi.fn(),
    getActiveSourcesForFetching: vi.fn(),
    recordFetchSuccess: vi.fn(),
    recordFetchFailure: vi.fn(),
  },
}));

const { fetchRSSArticles } = await import("../core/article/rss-fetcher");
const { articleService } = await import("../core/article/article.service");
const { newsSourceService } = await import("../core/news-source/news-source.service");

const makeSource = (overrides: Partial<any> = {}) => ({
  sourceId: overrides.sourceId ?? "source-1",
  name: overrides.name ?? "Test Source",
  url: overrides.url ?? "https://example.com/feed",
  tags: overrides.tags ?? [],
  fetchConfig: overrides.fetchConfig,
});

describe("parseFetchParams", () => {
  it("returns defaults when event is undefined", () => {
    expect(parseFetchParams(undefined)).toEqual({ limit: 50, concurrency: 5 });
  });

  it("coerces number-like strings and numbers", () => {
    expect(parseFetchParams({ limit: "10", concurrency: "2" })).toEqual({ limit: 10, concurrency: 2 });
    expect(parseFetchParams({ limit: 25, concurrency: 7 })).toEqual({ limit: 25, concurrency: 7 });
  });
});

describe("processSource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("happy path with articles: records success and counts saved", async () => {
    const source = makeSource();
    vi.mocked(fetchRSSArticles).mockResolvedValue([[{ originalUrl: "u1" } as any], null]);
    vi.mocked(articleService.saveFetchedArticles).mockResolvedValue([
      { saved: 1, total: 1, errors: [] },
      null,
    ]);

    const res = await processSource(source as any);

    expect(fetchRSSArticles).toHaveBeenCalledWith(source);
    expect(articleService.saveFetchedArticles).toHaveBeenCalledWith(source.sourceId, [{ originalUrl: "u1" }]);
    expect(newsSourceService.recordFetchSuccess).toHaveBeenCalledWith(source.sourceId);
    expect(newsSourceService.recordFetchFailure).not.toHaveBeenCalled();
    expect(res).toMatchObject({ success: true, articlesFound: 1, articlesSaved: 1 });
    expect(res).not.toHaveProperty("error");
  });

  it("happy path with zero articles: records success and zero saved", async () => {
    const source = makeSource();
    vi.mocked(fetchRSSArticles).mockResolvedValue([[], null]);

    const res = await processSource(source as any);

    expect(articleService.saveFetchedArticles).not.toHaveBeenCalled();
    expect(newsSourceService.recordFetchSuccess).toHaveBeenCalledWith(source.sourceId);
    expect(res).toMatchObject({ success: true, articlesFound: 0, articlesSaved: 0 });
  });

  it("fetch error path: records failure and zero counts", async () => {
    const source = makeSource();
    vi.mocked(fetchRSSArticles).mockResolvedValue([[], new Error("network")]);

    const res = await processSource(source as any);

    expect(articleService.saveFetchedArticles).not.toHaveBeenCalled();
    expect(newsSourceService.recordFetchFailure).toHaveBeenCalledWith(source.sourceId, "network");
    expect(res).toMatchObject({ success: false, articlesFound: 0, articlesSaved: 0, error: "network" });
  });

  it("save error path: records failure, keeps found count, zero saved", async () => {
    const source = makeSource();
    vi.mocked(fetchRSSArticles).mockResolvedValue([[{ originalUrl: "u1" } as any, { originalUrl: "u2" } as any], null]);
    vi.mocked(articleService.saveFetchedArticles).mockResolvedValue([null, new Error("db")]);

    const res = await processSource(source as any);

    expect(newsSourceService.recordFetchFailure).toHaveBeenCalledWith(source.sourceId, "db");
    expect(res).toMatchObject({ success: false, articlesFound: 2, articlesSaved: 0, error: "db" });
  });
});

describe("processSources concurrency", () => {
  it("limits concurrency by batches and preserves order", async () => {
    const sources = [0, 1, 2, 3, 4].map((i) => makeSource({ sourceId: `s-${i}`, name: `S${i}` })) as any[];

    // Spy on processSource via module import indirection
    const mod = await import("./fetch-news.helpers");

    let inFlight = 0;
    let maxInFlight = 0;
    const delays = [50, 40, 30, 20, 10];

    const processSpy = vi
      .spyOn(mod, "processSource")
      .mockImplementation(async (src: any) => {
        const idx = Number((src.sourceId as string).split("-")[1]);
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await new Promise((r) => setTimeout(r, delays[idx]));
        inFlight--;
        return {
          sourceId: src.sourceId,
          sourceName: src.name,
          success: true,
          articlesFound: idx,
          articlesSaved: idx,
        } as any;
      });

    const results = await processSources(sources as any, 2);

    expect(maxInFlight).toBeLessThanOrEqual(2);
    expect(results.map((r) => r.sourceId)).toEqual(sources.map((s: any) => s.sourceId));
    processSpy.mockRestore();
  });
});

describe("buildSummary", () => {
  it("aggregates counts correctly", () => {
    const sources = [makeSource({ sourceId: "a" }), makeSource({ sourceId: "b" }), makeSource({ sourceId: "c" })] as any;
    const results = [
      { sourceId: "a", sourceName: "A", success: true, articlesFound: 10, articlesSaved: 5 },
      { sourceId: "b", sourceName: "B", success: true, articlesFound: 50, articlesSaved: 20 },
      { sourceId: "c", sourceName: "C", success: false, articlesFound: 13, articlesSaved: 0 },
    ] as any;

    const summary = buildSummary(sources as any, results as any);

    expect(summary.totalSources).toBe(3);
    expect(summary.successfulSources).toBe(2);
    expect(summary.failedSources).toBe(1);
    expect(summary.totalArticlesFound).toBe(73);
    expect(summary.totalArticlesSaved).toBe(25);
    expect(summary.results).toHaveLength(3);
  });
});
