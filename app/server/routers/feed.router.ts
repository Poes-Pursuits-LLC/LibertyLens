import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { feedService } from "~/core/feed/feed.service";
import { handleAsync } from "~/core/utils/helpers";
import { HTTPException } from "hono/http-exception";

// Schemas
const getFeedQuerySchema = z.object({
  feedId: z.string().min(1),
  userId: z.string().min(1).optional(),
});

const getUserFeedsQuerySchema = z.object({
  userId: z.string().min(1),
  onlyActive: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

const createFeedSchema = z.object({
  userId: z.string().min(1),
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
  refreshInterval: z.number().min(15).max(1440).optional(),
});

const updatableFeedFields = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    sources: z.array(z.string()).optional(),
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
    isActive: z.boolean().optional(),
    refreshInterval: z.number().min(15).max(1440).optional(),
  })
  .partial();

const updateFeedSchema = z.object({
  feedId: z.string().min(1),
  userId: z.string().min(1),
  updateFields: updatableFeedFields,
});

const deleteFeedQuerySchema = z.object({
  feedId: z.string().min(1),
  userId: z.string().min(1),
});

const refreshFeedSchema = z.object({
  feedId: z.string().min(1),
  userId: z.string().min(1),
});

const toggleFeedSchema = z.object({
  feedId: z.string().min(1),
  userId: z.string().min(1),
});

const feedRouter = new Hono()
  .get("/getFeed", zValidator("query", getFeedQuerySchema), async (c) => {
    const { feedId, userId } = c.req.valid("query");
    console.info("Invoked feedRouter.getFeed with feedId:", feedId, userId);

    const [feed, getFeedError] = await handleAsync(feedService.getFeedById(feedId));
    if (getFeedError) {
      console.error(`Error getting feed: ${getFeedError.message}`);
      throw new HTTPException(500, { message: getFeedError.message });
    }
    if (!feed) {
      throw new HTTPException(404, { message: "Feed not found" });
    }

    if (userId && feed.userId !== userId) {
      // avoid leaking existence
      throw new HTTPException(404, { message: "Feed not found" });
    }

    return c.json({ feed });
  })
  .get(
    "/getUserFeeds",
    zValidator("query", getUserFeedsQuerySchema),
    async (c) => {
      const { userId, onlyActive } = c.req.valid("query");
      console.info("Invoked feedRouter.getUserFeeds with userId:", userId, onlyActive);

      const [feeds, getFeedsError] = await handleAsync(
        feedService.getUserFeeds(userId, Boolean(onlyActive))
      );
      if (getFeedsError) {
        console.error(`Error getting user feeds: ${getFeedsError.message}`);
        throw new HTTPException(500, { message: getFeedsError.message });
      }

      return c.json({ feeds: feeds ?? [], count: feeds?.length ?? 0 });
    }
  )
  .post(
    "/createFeed",
    zValidator("json", createFeedSchema),
    async (c) => {
      const { userId, ...input } = c.req.valid("json");
      console.info("Invoked feedRouter.createFeed with userId:", userId);

      const [created, createError] = await feedService.createFeed(userId, input);
      if (createError) {
        const message = createError instanceof Error ? createError.message : 'Unknown error';
        console.error(`Error creating feed: ${message}`);
        throw new HTTPException(500, { message });
      }

      if (!created || created instanceof Error) {
        throw new HTTPException(500, { message: 'Failed to create feed' });
      }

      return c.json({ feedId: created.feedId });
    }
  )
  .post(
    "/updateFeed",
    zValidator("json", updateFeedSchema),
    async (c) => {
      const { feedId, userId, updateFields } = c.req.valid("json");
      console.info(
        `Invoked feedRouter.updateFeed with feedId: ${feedId} and updates:`,
        updateFields
      );

      const [updated, updateError] = await feedService.updateFeed(
        feedId,
        userId,
        updateFields
      );
      if (updateError) {
        const message = updateError instanceof Error ? updateError.message : 'Failed to update feed';
        if (message.includes("not found") || message.includes("unauthorized")) {
          throw new HTTPException(404, { message: "Feed not found or unauthorized" });
        }
        console.error(`Error updating feed: ${message}`);
        throw new HTTPException(500, { message });
      }

      if (!updated || updated instanceof Error) {
        throw new HTTPException(500, { message: 'Failed to update feed' });
      }

      return c.json({ feedId: updated.feedId });
    }
  )
  .delete(
    "/deleteFeed",
    zValidator("query", deleteFeedQuerySchema),
    async (c) => {
      const { feedId, userId } = c.req.valid("query");
      console.info("Invoked feedRouter.deleteFeed with feedId:", feedId);

      const [_, deleteError] = await feedService.deleteFeed(feedId, userId);
      if (deleteError) {
        const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete feed';
        if (message.includes("not found") || message.includes("unauthorized")) {
          throw new HTTPException(404, { message: "Feed not found or unauthorized" });
        }
        console.error(`Error deleting feed: ${message}`);
        throw new HTTPException(500, { message });
      }

      return c.json({ message: "Feed deleted successfully" });
    }
  )
  .post(
    "/refreshFeed",
    zValidator("json", refreshFeedSchema),
    async (c) => {
      const { feedId, userId } = c.req.valid("json");
      console.info("Invoked feedRouter.refreshFeed with feedId:", feedId);

      // Ownership check via get
      const [feed, getFeedError] = await handleAsync(feedService.getFeedById(feedId));
      if (getFeedError) {
        const message = getFeedError instanceof Error ? getFeedError.message : 'Unknown error';
        console.error(`Error getting feed: ${message}`);
        throw new HTTPException(500, { message });
      }
      if (!feed || feed.userId !== userId) {
        throw new HTTPException(404, { message: "Feed not found or unauthorized" });
      }

      const [updated, markError] = await feedService.markFeedRefreshed(feedId);
      if (markError) {
        const message = markError instanceof Error ? markError.message : 'Failed to refresh feed';
        console.error(`Error refreshing feed: ${message}`);
        throw new HTTPException(500, { message });
      }

      if (!updated || updated instanceof Error) {
        throw new HTTPException(500, { message: 'Failed to refresh feed' });
      }

      return c.json({
        message: "Feed refresh initiated",
        feedId,
        lastRefreshedAt: updated.lastRefreshedAt,
      });
    }
  )
  .post(
    "/toggleFeedStatus",
    zValidator("json", toggleFeedSchema),
    async (c) => {
      const { feedId, userId } = c.req.valid("json");
      console.info("Invoked feedRouter.toggleFeedStatus with feedId:", feedId);

      const [updated, toggleError] = await feedService.toggleFeedStatus(
        feedId,
        userId
      );
      if (toggleError) {
        const message = toggleError instanceof Error ? toggleError.message : 'Failed to toggle feed status';
        if (message.includes("not found") || message.includes("unauthorized")) {
          throw new HTTPException(404, { message: "Feed not found or unauthorized" });
        }
        console.error(`Error toggling feed status: ${message}`);
        throw new HTTPException(500, { message });
      }

      if (!updated || updated instanceof Error) {
        throw new HTTPException(500, { message: 'Failed to toggle feed status' });
      }

      return c.json({ feed: updated });
    }
  );

export { feedRouter };
