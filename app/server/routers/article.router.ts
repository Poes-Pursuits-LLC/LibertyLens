import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type {
  Article,
  ArticleSearchParams,
} from "~/core/article/article.model";
import { articleService } from "~/core/article/article.service";
import { feedService } from "~/core/feed/feed.service";

console.info("article.router.ts");

// Validation schemas
const articleSearchSchema = z.object({
  sourceId: z.string().optional(),
  feedId: z.string().optional(),
  userId: z.string().optional(), // Optional userId from query params
  tags: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasAnalysis: z.boolean().optional(),
  searchTerm: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(["publishedAt", "fetchedAt", "relevance"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const articleRouter = new Hono();

// Get articles for user's feeds
articleRouter.get("/", zValidator("query", articleSearchSchema), async (c) => {
  const params = c.req.valid("query");
  const userId = params.userId; // Get userId from query params if provided

  try {
    // If feedId is specified, get the feed's source IDs
    let sourceIds: string[] | undefined;
    if (params.feedId && userId) {
      const feed = await feedService.getFeedById(params.feedId);
      if (!feed) {
        return c.json({ error: "Feed not found" }, 404);
      }
      // Verify feed belongs to user if userId is provided
      if (feed.userId !== userId) {
        return c.json({ error: "Feed not found" }, 404);
      }
      // feed.sources is NewsSource[], but we need string[] of source IDs
      sourceIds = feed.sources.map((source: any) =>
        typeof source === "string" ? source : source.id
      );
    } else if (params.feedId && !userId) {
      // If feedId is specified but no userId, we can't verify ownership
      const feed = await feedService.getFeedById(params.feedId);
      if (!feed) {
        return c.json({ error: "Feed not found" }, 404);
      }
      // feed.sources is NewsSource[], but we need string[] of source IDs
      sourceIds = feed.sources.map((source: any) =>
        typeof source === "string" ? source : source.id
      );
    }

    // Build search parameters
    const searchParams: ArticleSearchParams = {
      sourceId:
        params.sourceId ||
        (sourceIds && sourceIds.length === 1 ? sourceIds[0] : undefined),
      tags: params.tags,
      startDate: params.startDate,
      endDate: params.endDate,
      cursor: params.cursor,
      limit: params.limit || 20,
    };

    // Fetch articles from database
    const [result, error] = await articleService.searchArticles(searchParams);

    if (error) {
      console.error("Error searching articles:", error);
      return c.json({ error: "Failed to fetch articles" }, 500);
    }

    if (!result) {
      return c.json({
        articles: [],
        nextCursor: null,
        hasMore: false,
      });
    }

    // If multiple source IDs from feed, filter results
    let articles = result.articles;
    if (sourceIds && sourceIds.length > 1) {
      articles = articles.filter((a) => sourceIds.includes(a.sourceId));
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
  } catch (error) {
    console.error("Error in article search:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get trending articles (most analyzed in libertarian community)
articleRouter.get("/trending", async (c) => {
  const limit = parseInt(c.req.query("limit") || "10");
  const timeframe = c.req.query("timeframe") || "24h"; // 24h, 7d, 30d
  const userId = c.req.query("userId"); // Optional userId from query params

  try {
    // Calculate hours based on timeframe
    let hours = 24;
    switch (timeframe) {
      case "7d":
        hours = 24 * 7;
        break;
      case "30d":
        hours = 24 * 30;
        break;
    }

    const [result, error] = await articleService.getRecentArticles(
      hours,
      undefined,
      limit
    );

    if (error) {
      console.error("Error fetching trending articles:", error);
      return c.json({ error: "Failed to fetch trending articles" }, 500);
    }

    // TODO: Implement actual trending logic based on:
    // - Number of analyses
    // - User engagement
    // - Libertarian relevance score
    // For now, just return recent articles

    return c.json({
      articles: result?.articles || [],
      timeframe,
      count: result?.articles.length || 0,
    });
  } catch (error) {
    console.error("Error fetching trending articles:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get articles by feed
articleRouter.get("/feed/:feedId", async (c) => {
  const feedId = c.req.param("feedId");
  const userId = c.req.query("userId"); // Optional userId from query params
  const limit = parseInt(c.req.query("limit") || "20");
  const cursor = c.req.query("cursor") || undefined;

  try {
    // Get the feed
    const feed = await feedService.getFeedById(feedId);
    if (!feed) {
      return c.json({ error: "Feed not found" }, 404);
    }

    // Optionally verify ownership if userId is provided
    if (userId && feed.userId !== userId) {
      return c.json({ error: "Feed not found or unauthorized" }, 404);
    }

    // Get articles from all sources in the feed
    const allArticles: Article[] = [];
    let nextCursor: string | null = null;

    // For simplicity, fetch from first source with pagination
    // In production, you'd want to merge and sort from all sources
    if (feed.sources.length > 0) {
      const [result, error] = await articleService.getArticlesBySource(
        feed.sources[0].id, // Pass the source id as a string
        undefined,
        undefined,
        cursor,
        limit
      );

      if (error) {
        console.error("Error fetching feed articles:", error);
        return c.json({ error: "Failed to fetch articles" }, 500);
      }

      if (result) {
        allArticles.push(...result.articles);
        nextCursor = result.cursor;
      }
    }

    return c.json({
      articles: allArticles,
      feedId,
      nextCursor,
      hasMore: nextCursor !== null,
    });
  } catch (error) {
    console.error("Error fetching feed articles:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get a specific article
articleRouter.get("/:articleId", async (c) => {
  const articleId = c.req.param("articleId");
  const userId = c.req.query("userId"); // Optional userId from query params

  try {
    const article = await articleService.getArticleById(articleId);

    if (!article) {
      return c.json({ error: "Article not found" }, 404);
    }

    // No authentication required - articles are public

    return c.json(article);
  } catch (error) {
    console.error("Error fetching article:", error);
    return c.json({ error: "Failed to fetch article" }, 500);
  }
});

// Mark article as read (for tracking)
articleRouter.post("/:articleId/read", async (c) => {
  const articleId = c.req.param("articleId");
  const body = await c.req.json();
  const userId = body.userId || c.req.query("userId");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    const article = await articleService.getArticleById(articleId);

    if (!article) {
      return c.json({ error: "Article not found" }, 404);
    }

    // TODO: Track user read history in a separate service

    return c.json({
      message: "Article marked as read",
      articleId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error marking article as read:", error);
    return c.json({ error: "Failed to mark article as read" }, 500);
  }
});

// Save article for later
articleRouter.post("/:articleId/save", async (c) => {
  const articleId = c.req.param("articleId");
  const body = await c.req.json();
  const userId = body.userId || c.req.query("userId");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    const article = await articleService.getArticleById(articleId);

    if (!article) {
      return c.json({ error: "Article not found" }, 404);
    }

    // TODO: Implement saved articles functionality in a separate service

    return c.json({
      message: "Article saved",
      articleId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving article:", error);
    return c.json({ error: "Failed to save article" }, 500);
  }
});

// Remove saved article
articleRouter.delete("/:articleId/save", async (c) => {
  const articleId = c.req.param("articleId");
  const userId = c.req.query("userId");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    // TODO: Implement remove from saved articles in a separate service

    return c.json({
      message: "Article removed from saved",
      articleId,
    });
  } catch (error) {
    console.error("Error removing saved article:", error);
    return c.json({ error: "Failed to remove saved article" }, 500);
  }
});

export { articleRouter };
