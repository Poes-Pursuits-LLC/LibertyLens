import { describe, it, expect, beforeEach, vi } from "vitest";
import { Hono } from "hono";
import { newsSourceRouter } from "./news-source.router";
import { newsSourceService } from "~/core/news-source/news-source.service";

// Mock the news source service so we can precisely control inputs/outputs per test
vi.mock("~/core/news-source/news-source.service", () => {
  const svc = {
    initializeDefaultSources: vi.fn().mockResolvedValue({ created: 0, message: "ok" }),
    getPublicNewsSources: vi.fn(),
    getUserNewsSources: vi.fn(),
    getNewsSourceById: vi.fn(),
    createNewsSource: vi.fn(),
    updateNewsSource: vi.fn(),
    deleteNewsSource: vi.fn(),
  };
  return { newsSourceService: svc };
});

// Mock rss-parser to avoid network calls during tests
vi.mock("rss-parser", () => {
  class ParserMock {
    parseURL = vi.fn().mockResolvedValue({
      title: "Mock Feed",
      description: "Mock Desc",
      link: "https://example.com",
      language: "en",
      items: [{}, {}, {}],
      lastBuildDate: "2025-01-01T00:00:00Z",
      generator: "mock",
      categories: ["mock"],
    });
  }
  return { default: ParserMock };
});

describe("news-source.router", () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();
    app = new Hono().route("/sources", newsSourceRouter);
  });

  it("GET /sources returns list of news sources", async () => {
    vi.mocked(newsSourceService.getPublicNewsSources).mockResolvedValue([
      {
        sourceId: "source-1",
        name: "Test Source 1",
        url: "https://test1.com/rss",
        type: "rss",
        category: "libertarian",
        isActive: true,
        isPublic: true,
        reliability: { score: 95, failureCount: 0 },
        tags: ["test"],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        entityType: "news-source",
      },
    ] as any);
    vi.mocked(newsSourceService.getUserNewsSources).mockResolvedValue([] as any);

    const res = await app.request("/sources?userId=user-1", { method: "GET" });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.sources)).toBe(true);
    expect(data.sources[0].name).toBe("Test Source 1");
    expect(Array.isArray(data.categories)).toBe(true);
  });

  it("GET /sources returns 500 when fetching public sources fails", async () => {
    vi.mocked(newsSourceService.getPublicNewsSources).mockRejectedValue(
      new Error("public failure")
    );
    vi.mocked(newsSourceService.getUserNewsSources).mockResolvedValue([] as any);

    const res = await app.request("/sources?userId=user-1", { method: "GET" });
    expect(res.status).toBe(500);
  });

  it("GET /sources returns 500 when fetching user sources fails", async () => {
    vi.mocked(newsSourceService.getPublicNewsSources).mockResolvedValue([] as any);
    vi.mocked(newsSourceService.getUserNewsSources).mockRejectedValue(
      new Error("user failure")
    );

    const res = await app.request("/sources?userId=user-1", { method: "GET" });
    expect(res.status).toBe(500);
  });

  it("POST /sources creates a new news source (201)", async () => {
    vi.mocked(newsSourceService.getUserNewsSources).mockResolvedValue([] as any);
    vi.mocked(newsSourceService.getPublicNewsSources).mockResolvedValue([] as any);
    vi.mocked(newsSourceService.createNewsSource).mockResolvedValue([
      {
        sourceId: "new-source",
        name: "New Source",
        url: "https://new.com/rss",
        type: "rss",
        category: "alternative",
        isActive: true,
        isPublic: false,
        addedByUserId: "user-1",
        reliability: { score: 100, failureCount: 0 },
        tags: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        entityType: "news-source",
      },
      null,
    ] as any);

    const body = {
      userId: "user-1",
      name: "New Source",
      url: "https://new.com/rss",
      type: "rss",
      category: "alternative",
    };

    const res = await app.request("/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("New Source");
    expect(data.addedByUserId).toBe("user-1");
  });

  it("POST /sources returns 403 when custom source limit reached", async () => {
    vi.mocked(newsSourceService.getUserNewsSources).mockResolvedValue([
      { isActive: true },
      { isActive: true },
      { isActive: true },
      { isActive: true },
      { isActive: true },
    ] as any);

    const body = {
      userId: "user-1",
      name: "New Source",
      url: "https://new.com/rss",
      type: "rss",
      category: "alternative",
    };

    const res = await app.request("/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/Custom source limit/);
  });

  it("POST /sources returns 409 on duplicate URL", async () => {
    vi.mocked(newsSourceService.getUserNewsSources).mockResolvedValue([] as any);
    vi.mocked(newsSourceService.getPublicNewsSources).mockResolvedValue([
      {
        sourceId: "existing",
        name: "Existing",
        url: "https://dup.com/rss",
        type: "rss",
        category: "libertarian",
        isActive: true,
        isPublic: true,
        reliability: { score: 90, failureCount: 0 },
        tags: [],
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
        entityType: "news-source",
      },
    ] as any);

    const body = {
      userId: "user-1",
      name: "Dup",
      url: "https://dup.com/rss",
      type: "rss",
      category: "libertarian",
    };

    const res = await app.request("/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toMatch(/already exists/);
    expect(data.existingSourceId).toBe("existing");
  });

  it("POST /sources/test validates RSS feed (200)", async () => {
    const res = await app.request("/sources/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/feed.xml" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.isValid).toBe(true);
    expect(data.feedInfo.itemCount).toBe(3);
  });

  it("GET /sources/:id 404 when not found", async () => {
    vi.mocked(newsSourceService.getNewsSourceById).mockResolvedValue(null as any);

    const res = await app.request("/sources/abc?userId=user-1", { method: "GET" });
    expect(res.status).toBe(404);
  });

  it("GET /sources/:id 403 when private and different owner", async () => {
    vi.mocked(newsSourceService.getNewsSourceById).mockResolvedValue({
      sourceId: "abc",
      name: "X",
      url: "https://x.com/rss",
      type: "rss",
      category: "alternative",
      isActive: true,
      isPublic: false,
      addedByUserId: "other-user",
      reliability: { score: 80, failureCount: 0 },
      tags: [],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      entityType: "news-source",
    } as any);

    const res = await app.request("/sources/abc?userId=user-1", { method: "GET" });
    expect(res.status).toBe(403);
  });

  it("GET /sources/:id 200 when accessible", async () => {
    vi.mocked(newsSourceService.getNewsSourceById).mockResolvedValue({
      sourceId: "abc",
      name: "X",
      url: "https://x.com/rss",
      type: "rss",
      category: "alternative",
      isActive: true,
      isPublic: true,
      reliability: { score: 80, failureCount: 0 },
      tags: [],
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      entityType: "news-source",
    } as any);

    const res = await app.request("/sources/abc?userId=user-1", { method: "GET" });
    expect(res.status).toBe(200);
  });

  it("PATCH /sources/:id updates and returns source", async () => {
    vi.mocked(newsSourceService.updateNewsSource).mockResolvedValue([
      { sourceId: "abc", name: "Updated" },
      null,
    ] as any);

    const res = await app.request("/sources/abc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-1", name: "Updated" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sourceId).toBe("abc");
    expect(data.name).toBe("Updated");
  });

  it("PATCH /sources/:id 404 on not found", async () => {
    vi.mocked(newsSourceService.updateNewsSource).mockResolvedValue([
      null,
      new Error("not found"),
    ] as any);

    const res = await app.request("/sources/abc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-1", name: "Updated" }),
    });

    expect(res.status).toBe(404);
  });

  it("PATCH /sources/:id 403 on unauthorized", async () => {
    vi.mocked(newsSourceService.updateNewsSource).mockResolvedValue([
      null,
      new Error("unauthorized"),
    ] as any);

    const res = await app.request("/sources/abc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-1", name: "Updated" }),
    });

    expect(res.status).toBe(403);
  });

  it("PATCH /sources/:id 500 on unexpected error", async () => {
    vi.mocked(newsSourceService.updateNewsSource).mockResolvedValue([
      null,
      new Error("boom"),
    ] as any);

    const res = await app.request("/sources/abc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-1", name: "Updated" }),
    });

    expect(res.status).toBe(500);
  });

  it("DELETE /sources deletes and returns message", async () => {
    vi.mocked(newsSourceService.deleteNewsSource).mockResolvedValue([
      { ok: true },
      null,
    ] as any);

    const res = await app.request("/sources?userId=user-1&sourceId=abc", {
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toMatch(/deleted successfully/);
  });

  it("DELETE /sources 404 on not found", async () => {
    vi.mocked(newsSourceService.deleteNewsSource).mockResolvedValue([
      null,
      new Error("not found"),
    ] as any);

    const res = await app.request("/sources?userId=user-1&sourceId=abc", {
      method: "DELETE",
    });

    expect(res.status).toBe(404);
  });

  it("DELETE /sources 403 on unauthorized", async () => {
    vi.mocked(newsSourceService.deleteNewsSource).mockResolvedValue([
      null,
      new Error("unauthorized"),
    ] as any);

    const res = await app.request("/sources?userId=user-1&sourceId=abc", {
      method: "DELETE",
    });

    expect(res.status).toBe(403);
  });

  it("DELETE /sources 500 on unexpected error", async () => {
    vi.mocked(newsSourceService.deleteNewsSource).mockResolvedValue([
      null,
      new Error("boom"),
    ] as any);

    const res = await app.request("/sources?userId=user-1&sourceId=abc", {
      method: "DELETE",
    });

    expect(res.status).toBe(500);
  });
});
