import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Article, ArticleSearchParams } from "~/core/article/article.model";
import { articleService } from "~/core/article/article.service";
import { feedService } from "~/core/feed/feed.service";
import { handleAsync } from "~/core/utils/helpers";
import { HTTPException } from "hono/http-exception";

// Validation schemas (query/params/json)
const articleSearchQuerySchema = z.object({
  sourceId: z.string().optional(),
  feedId: z.string().optional(),
  userId: z.string().optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasAnalysis: z.coerce.boolean().optional(),
  searchTerm: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  sortBy: z.enum(["publishedAt", "fetchedAt", "relevance"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const trendingQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  timeframe: z.enum(["24h", "7d", "30d"]).optional().default("24h"),
  userId: z.string().optional(),
});

const feedParamSchema = z.object({ feedId: z.string() });
const feedQuerySchema = z.object({
  userId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

const articleParamSchema = z.object({ articleId: z.string() });
const userIdBodySchema = z.object({ userId: z.string().min(1) });
const userIdQuerySchema = z.object({ userId: z.string().min(1) });

export const articleRouter = new Hono()
  // Search/list articles
  .get("/", zValidator("query", articleSearchQuerySchema), async (c) => {
    const params = c.req.valid("query");
    console.info("Invoked articleRouter.get '/' with params:", params);

    // Resolve tags to array (accept comma-separated string or string[])
    let tagsArray: string[] | undefined;
    if (Array.isArray(params.tags)) tagsArray = params.tags;
    else if (typeof params.tags === "string")
      tagsArray = params.tags.split(",").map((t) => t.trim()).filter(Boolean);

    // If feedId is specified, fetch feed and derive sourceIds
    let sourceIds: string[] | undefined;
    if (params.feedId) {
      const [feed, feedError] = await handleAsync(
        feedService.getFeedById(params.feedId)
      );
      if (feedError) {
        throw new HTTPException(500, { message: "Failed to fetch feed" });
      }
      if (!feed) {
        throw new HTTPException(404, { message: "Feed not found" });
      }
      if (params.userId && feed.userId !== params.userId) {
        throw new HTTPException(404, { message: "Feed not found" });
      }
      sourceIds = (feed.sources || []).map((source: any) =>
        typeof source === "string" ? source : source.sourceId
      );
    }

    // Build search parameters
    const searchParams: ArticleSearchParams = {
      sourceId:
        params.sourceId ||
        (sourceIds && sourceIds.length === 1 ? sourceIds[0] : undefined),
      tags: tagsArray,
      startDate: params.startDate,
      endDate: params.endDate,
      cursor: params.cursor,
      limit: params.limit || 20,
    };

    const [result, error] = await articleService.searchArticles(searchParams);
    if (error) {
      throw new HTTPException(500, { message: "Failed to fetch articles" });
    }

    if (!result) {
      return c.json({ articles: [], nextCursor: null, hasMore: false });
    }

    // If multiple source IDs from feed, filter results
    let articles = result.articles;
    if (sourceIds && sourceIds.length > 1) {
      articles = articles.filter((a) => sourceIds!.includes(a.sourceId));
    }

    // Post-process search term filtering if needed
    if (params.searchTerm) {
      const searchLower = params.searchTerm.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.summary.toLowerCase().includes(searchLower)
      );
    }

    return c.json({
      articles,
      nextCursor: result.cursor,
      hasMore: result.cursor !== null,
    });
  })
  // Trending
  .get("/trending", zValidator("query", trendingQuerySchema), async (c) => {
    const { limit = 10, timeframe } = c.req.valid("query");
    console.info("Invoked articleRouter.get '/trending' with", { limit, timeframe });

    let hours = 24;
    if (timeframe === "7d") hours = 24 * 7;
    if (timeframe === "30d") hours = 24 * 30;

    const [result, error] = await articleService.getRecentArticles(
      hours,
      undefined,
      limit
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Failed to fetch trending articles",
      });
    }

    return c.json({
      articles: result?.articles || [],
      timeframe,
      count: result?.articles.length || 0,
    });
  })
  // Articles by feed
  .get(
    "/feed/:feedId",
    zValidator("param", feedParamSchema),
    zValidator("query", feedQuerySchema),
    async (c) => {
      const { feedId } = c.req.valid("param");
      const { userId, limit = 20, cursor } = c.req.valid("query");
      console.info("Invoked articleRouter.get '/feed/:feedId' with", {
        feedId,
        userId,
        limit,
        cursor,
      });

      const [feed, feedError] = await handleAsync(feedService.getFeedById(feedId));
      if (feedError) {
        throw new HTTPException(500, { message: "Failed to fetch feed" });
      }
      if (!feed) {
        throw new HTTPException(404, { message: "Feed not found" });
      }
      if (userId && feed.userId !== userId) {
        throw new HTTPException(404, { message: "Feed not found or unauthorized" });
      }

      let articles: Article[] = [];
      let nextCursor: string | null = null;

      if (feed.sources.length > 0) {
        const firstSourceId =
          typeof feed.sources[0] === "string"
            ? (feed.sources[0] as unknown as string)
            : (feed.sources[0] as any).sourceId;
        const [result, error] = await articleService.getArticlesBySource(
          firstSourceId,
          undefined,
          undefined,
          cursor,
          limit
        );
        if (error) {
          throw new HTTPException(500, { message: "Failed to fetch articles" });
        }
        if (result) {
          articles = result.articles;
          nextCursor = result.cursor;
        }
      }

      return c.json({
        articles,
        feedId,
        nextCursor,
        hasMore: nextCursor !== null,
      });
    }
  )
  // Get a specific article
  .get("/:articleId", zValidator("param", articleParamSchema), async (c) => {
    const { articleId } = c.req.valid("param");
    console.info("Invoked articleRouter.get '/:articleId' with", { articleId });

    const [article, error] = await handleAsync(
      articleService.getArticleById(articleId)
    );
    if (error) {
      throw new HTTPException(500, { message: "Failed to fetch article" });
    }
    if (!article) {
      throw new HTTPException(404, { message: "Article not found" });
    }

    return c.json(article);
  })
  // Mark article as read
  .post(
    "/:articleId/read",
    zValidator("param", articleParamSchema),
    zValidator("json", userIdBodySchema),
    async (c) => {
      const { articleId } = c.req.valid("param");
      const { userId } = c.req.valid("json");
      console.info("Invoked articleRouter.post '/:articleId/read'", { articleId, userId });

      const [article, error] = await handleAsync(
        articleService.getArticleById(articleId)
      );
      if (error) {
        throw new HTTPException(500, { message: "Failed to fetch article" });
      }
      if (!article) {
        throw new HTTPException(404, { message: "Article not found" });
      }

      // TODO: Track user read history in a dedicated service
      return c.json({
        message: "Article marked as read",
        articleId,
        timestamp: new Date().toISOString(),
      });
    }
  )
  // Save article
  .post(
    "/:articleId/save",
    zValidator("param", articleParamSchema),
    zValidator("json", userIdBodySchema),
    async (c) => {
      const { articleId } = c.req.valid("param");
      const { userId } = c.req.valid("json");
      console.info("Invoked articleRouter.post '/:articleId/save'", { articleId, userId });

      const [article, error] = await handleAsync(
        articleService.getArticleById(articleId)
      );
      if (error) {
        throw new HTTPException(500, { message: "Failed to fetch article" });
      }
      if (!article) {
        throw new HTTPException(404, { message: "Article not found" });
      }

      // TODO: Implement saved articles functionality in a separate service
      return c.json({
        message: "Article saved",
        articleId,
        timestamp: new Date().toISOString(),
      });
    }
  )
  // Remove saved article
  .delete(
    "/:articleId/save",
    zValidator("param", articleParamSchema),
    zValidator("query", userIdQuerySchema),
    async (c) => {
      const { articleId } = c.req.valid("param");
      const { userId } = c.req.valid("query");
      console.info("Invoked articleRouter.delete '/:articleId/save'", { articleId, userId });

      // TODO: Implement removal in saved articles service
      return c.json({ message: "Article removed from saved", articleId });
    }
  );
