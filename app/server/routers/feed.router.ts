import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import type { Feed } from "~/core/feed/feed.model";
import { defaultAnalysisSettings } from "~/core/feed/feed.model";

// Validation schemas
const createFeedSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  sources: z.array(z.string()).min(1),
  topics: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  excludeKeywords: z.array(z.string()).optional(),
  analysisSettings: z
    .object({
      intensity: z.enum(["light", "moderate", "deep"]).optional(),
      focusAreas: z.array(z.string()).optional(),
      includeSources: z.boolean().optional(),
      includeCounterArguments: z.boolean().optional(),
    })
    .optional(),
  refreshInterval: z.number().min(15).max(1440).optional(), // 15 min to 24 hours
});

const updateFeedSchema = createFeedSchema.partial().extend({
  isActive: z.boolean().optional(),
});

const feedRouter = new Hono();

// TODO: Replace with actual DynamoDB calls
const mockFeedDb = new Map<string, Feed>();

// Get all feeds for the current user
feedRouter.get("/", async (c) => {
  // Filter feeds by userId
  const userFeeds = Array.from(mockFeedDb.values())
    .filter((feed) => feed.userId === userId && feed.isActive)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return c.json({
    feeds: userFeeds,
    count: userFeeds.length,
  });
});

// Get a specific feed
feedRouter.get("/:feedId", requireAuth, async (c) => {
  const userId = c.get("userId");
  const feedId = c.req.param("feedId");

  const feed = mockFeedDb.get(feedId);

  if (!feed) {
    return c.json({ error: "Feed not found" }, 404);
  }

  // Check ownership
  if (feed.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json(feed);
});

// Create a new feed
feedRouter.post(
  "/",
  requireAuth,
  zValidator("json", createFeedSchema),
  async (c) => {
    const userId = c.get("userId");
    const input = c.req.valid("json");

    // Check feed limit (e.g., 10 feeds for free tier)
    const userFeedCount = Array.from(mockFeedDb.values()).filter(
      (feed) => feed.userId === userId && feed.isActive
    ).length;

    if (userFeedCount >= 10) {
      return c.json(
        { error: "Feed limit reached. Upgrade to create more feeds." },
        403
      );
    }

    const feed: Feed = {
      feedId: `feed_${Date.now()}`,
      userId,
      name: input.name,
      description: input.description,
      sources: input.sources,
      topics: input.topics || [],
      keywords: input.keywords || [],
      excludeKeywords: input.excludeKeywords || [],
      analysisSettings: {
        ...defaultAnalysisSettings,
        ...input.analysisSettings,
      },
      isActive: true,
      refreshInterval: input.refreshInterval || 60, // Default 1 hour
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: "feed",
    };

    mockFeedDb.set(feed.feedId, feed);

    return c.json(feed, 201);
  }
);

// Update a feed
feedRouter.patch(
  "/:feedId",
  requireAuth,
  zValidator("json", updateFeedSchema),
  async (c) => {
    const userId = c.get("userId");
    const feedId = c.req.param("feedId");
    const updates = c.req.valid("json");

    const feed = mockFeedDb.get(feedId);

    if (!feed) {
      return c.json({ error: "Feed not found" }, 404);
    }

    // Check ownership
    if (feed.userId !== userId) {
      return c.json({ error: "Forbidden" }, 403);
    }

    // Apply updates
    Object.assign(feed, {
      ...updates,
      analysisSettings: updates.analysisSettings
        ? { ...feed.analysisSettings, ...updates.analysisSettings }
        : feed.analysisSettings,
      updatedAt: new Date().toISOString(),
    });

    mockFeedDb.set(feedId, feed);

    return c.json(feed);
  }
);

// Delete a feed (soft delete)
feedRouter.delete("/:feedId", requireAuth, async (c) => {
  const userId = c.get("userId");
  const feedId = c.req.param("feedId");

  const feed = mockFeedDb.get(feedId);

  if (!feed) {
    return c.json({ error: "Feed not found" }, 404);
  }

  // Check ownership
  if (feed.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Soft delete
  feed.isActive = false;
  feed.updatedAt = new Date().toISOString();
  mockFeedDb.set(feedId, feed);

  return c.json({ message: "Feed deleted successfully" });
});

// Refresh a feed (trigger article fetching)
feedRouter.post("/:feedId/refresh", requireAuth, async (c) => {
  const userId = c.get("userId");
  const feedId = c.req.param("feedId");

  const feed = mockFeedDb.get(feedId);

  if (!feed) {
    return c.json({ error: "Feed not found" }, 404);
  }

  // Check ownership
  if (feed.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  // Check if enough time has passed since last refresh
  if (feed.lastRefreshedAt) {
    const lastRefresh = new Date(feed.lastRefreshedAt);
    const now = new Date();
    const minutesSinceRefresh =
      (now.getTime() - lastRefresh.getTime()) / (1000 * 60);

    if (minutesSinceRefresh < 5) {
      // 5 minute cooldown
      return c.json(
        {
          error: "Feed was recently refreshed. Please wait a few minutes.",
        },
        429
      );
    }
  }

  // TODO: Trigger actual feed refresh process (SQS message, etc.)
  feed.lastRefreshedAt = new Date().toISOString();
  feed.updatedAt = new Date().toISOString();
  mockFeedDb.set(feedId, feed);

  return c.json({
    message: "Feed refresh initiated",
    feedId,
    lastRefreshedAt: feed.lastRefreshedAt,
  });
});

export { feedRouter };
