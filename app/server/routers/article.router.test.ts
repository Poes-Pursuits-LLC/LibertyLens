import { describe, it, expect, beforeEach, vi } from "vitest"
import { Hono } from "hono"
import { articleRouter } from "./article.router"
import { articleService } from "~/core/article/article.service"
import { feedService } from "~/core/feed/feed.service"

// Mocks
vi.mock("~/core/article/article.service", () => {
  const svc = {
    searchArticles: vi.fn(),
    getRecentArticles: vi.fn(),
    getArticlesBySource: vi.fn(),
    getArticleById: vi.fn(),
  }
  return { articleService: svc }
})

vi.mock("~/core/feed/feed.service", () => {
  const svc = {
    getFeedById: vi.fn(),
  }
  return { feedService: svc }
})

describe("article.router", () => {
  let app: Hono

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono().route("/articles", articleRouter)
  })

  it("GET /articles with feedId resolves feed, constrains to source and returns results", async () => {
    vi.mocked(feedService.getFeedById).mockResolvedValue({
      feedId: "feed-1",
      userId: "user-1",
      sources: [
        { sourceId: "src-1", name: "S1", url: "https://s1.com", type: "rss", enabled: true },
      ],
    } as any)

    vi.mocked(articleService.searchArticles).mockResolvedValue([
      { articles: [
        { articleId: "a1", sourceId: "src-1", title: "Hello", summary: "World" },
      ], cursor: null },
      null,
    ] as any)

    const res = await app.request(
      "/articles?feedId=feed-1&userId=user-1&limit=10",
      { method: "GET" }
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.articles)).toBe(true)
    expect(data.articles[0].articleId).toBe("a1")
    expect(data.hasMore).toBe(false)
  })

  it("GET /articles applies searchTerm filtering", async () => {
    vi.mocked(articleService.searchArticles).mockResolvedValue([
      { articles: [
        { articleId: "a1", sourceId: "src-1", title: "Foo news", summary: "..." },
        { articleId: "a2", sourceId: "src-1", title: "Bar update", summary: "foo inside" },
      ], cursor: null },
      null,
    ] as any)

    const res = await app.request(
      "/articles?searchTerm=foo",
      { method: "GET" }
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    const ids = data.articles.map((a: any) => a.articleId)
    expect(ids).toContain("a1")
    expect(ids).toContain("a2")
  })

  it("GET /articles with tags=comma,separated passes and returns results", async () => {
    vi.mocked(articleService.searchArticles).mockResolvedValue([
      { articles: [ { articleId: "a1", sourceId: "src-1", title: "t", summary: "s" } ], cursor: null },
      null,
    ] as any)

    const res = await app.request(
      "/articles?tags=liberty,markets",
      { method: "GET" }
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.articles.length).toBe(1)
  })

  it("GET /articles/trending respects timeframe and limit", async () => {
    vi.mocked(articleService.getRecentArticles).mockResolvedValue([
      { articles: [ { articleId: "a1" }, { articleId: "a2" } ] as any, cursor: null },
      null,
    ] as any)

    const res = await app.request(
      "/articles/trending?timeframe=7d&limit=5",
      { method: "GET" }
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.timeframe).toBe("7d")
    expect(data.count).toBe(2)
  })

  it("GET /articles/feed/:feedId returns 404 when feed not found", async () => {
    vi.mocked(feedService.getFeedById).mockResolvedValue(null as any)

    const res = await app.request(
      "/articles/feed/unknown?userId=user-1",
      { method: "GET" }
    )

    expect(res.status).toBe(404)
  })

  it("GET /articles/feed/:feedId returns 404 when unauthorized", async () => {
    vi.mocked(feedService.getFeedById).mockResolvedValue({
      feedId: "feed-1", userId: "other", sources: [],
    } as any)

    const res = await app.request(
      "/articles/feed/feed-1?userId=user-1",
      { method: "GET" }
    )

    expect(res.status).toBe(404)
  })

  it("GET /articles/feed/:feedId returns articles with pagination", async () => {
    vi.mocked(feedService.getFeedById).mockResolvedValue({
      feedId: "feed-1",
      userId: "user-1",
      sources: [ { sourceId: "src-1", name: "S1", url: "", type: "rss", enabled: true } ],
    } as any)

    vi.mocked(articleService.getArticlesBySource).mockResolvedValue([
      { articles: [ { articleId: "a1" } ] as any, cursor: "next" },
      null,
    ] as any)

    const res = await app.request(
      "/articles/feed/feed-1?userId=user-1&limit=1",
      { method: "GET" }
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.articles[0].articleId).toBe("a1")
    expect(data.hasMore).toBe(true)
  })

  it("GET /articles/:articleId returns 404 when not found", async () => {
    vi.mocked(articleService.getArticleById).mockResolvedValue(null as any)

    const res = await app.request("/articles/abc", { method: "GET" })
    expect(res.status).toBe(404)
  })

  it("GET /articles/:articleId returns 200 when found", async () => {
    vi.mocked(articleService.getArticleById).mockResolvedValue({ articleId: "abc" } as any)

    const res = await app.request("/articles/abc", { method: "GET" })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.articleId).toBe("abc")
  })

  it("POST /articles/:id/read requires userId and returns 200", async () => {
    vi.mocked(articleService.getArticleById).mockResolvedValue({ articleId: "abc" } as any)

    const res = await app.request("/articles/abc/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-1" }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toMatch(/marked as read/)
  })

  it("POST /articles/:id/read returns 404 when article missing", async () => {
    vi.mocked(articleService.getArticleById).mockResolvedValue(null as any)

    const res = await app.request("/articles/abc/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-1" }),
    })

    expect(res.status).toBe(404)
  })

  it("POST /articles/:id/save returns 200 when ok", async () => {
    vi.mocked(articleService.getArticleById).mockResolvedValue({ articleId: "abc" } as any)

    const res = await app.request("/articles/abc/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "user-1" }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toMatch(/Article saved/)
  })

  it("DELETE /articles/:id/save returns 200 when ok", async () => {
    const res = await app.request("/articles/abc/save?userId=user-1", { method: "DELETE" })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toMatch(/removed from saved/)
  })
})

