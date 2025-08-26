import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import Parser from "rss-parser";
import { newsSourceService } from "~/core/news-source/news-source.service";
import { handleAsync } from "~/core";
import { HTTPException } from "hono/http-exception";

const createNewsSourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url(),
  type: z.enum(["rss", "api", "scraper"]),
  category: z.enum([
    "mainstream",
    "alternative",
    "libertarian",
    "financial",
    "tech",
    "international",
  ]),
  logoUrl: z.string().url().optional(),
  fetchConfig: z
    .object({
      headers: z.record(z.string()).optional(),
      apiKey: z.string().optional(),
      rateLimit: z.number().min(1).max(60).optional(),
      selector: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().min(1),
});

const updateNewsSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  url: z.string().url().optional(),
  category: z
    .enum([
      "mainstream",
      "alternative",
      "libertarian",
      "financial",
      "tech",
      "international",
    ])
    .optional(),
  logoUrl: z.string().url().optional(),
  fetchConfig: z
    .object({
      headers: z.record(z.string()).optional(),
      apiKey: z.string().optional(),
      rateLimit: z.number().min(1).max(60).optional(),
      selector: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().min(1),
  isActive: z.boolean().optional(),
});

// Validation schema for RSS test
const testRssSchema = z.object({
  url: z.string().url(),
});

// Query validation schema for routes with userId and optional category
const getNewsSourcesQuerySchema = z.object({
  userId: z.string().min(1),
  category: z
    .enum([
      "mainstream",
      "alternative",
      "libertarian",
      "financial",
      "tech",
      "international",
    ])
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
});

// Query validation schema for routes with userId and sourceId
const deleteNewsSourceQuerySchema = z.object({
  userId: z.string().min(1),
  sourceId: z.string().min(1),
});

// Query validation schema for routes with userId only
const userIdQuerySchema = z.object({
  userId: z.string().min(1),
});

// Initialize default sources on first run
let initialized = false;
async function ensureDefaultSourcesExist() {
  if (initialized) return;

  try {
    const [, error] = await handleAsync(
      newsSourceService.initializeDefaultSources()
    );
    if (error) {
      console.error("Failed to initialize default sources:", error);
      return;
    }
    initialized = true;
  } catch (error) {
    console.error("Failed to initialize default sources:", error);
  }
}

export const newsSourceRouter = new Hono()
  .get("/", zValidator("query", getNewsSourcesQuerySchema), async (c) => {
    const { userId, category } = c.req.valid("query");
    console.log("Invoked newsSourceRouter.get", userId, category);

    await ensureDefaultSourcesExist();

    try {
      const [publicSources, publicError] = await handleAsync(
        newsSourceService.getPublicNewsSources(category ?? undefined)
      );
      if (publicError) {
        throw new HTTPException(500, {
          message: "Failed to fetch public news sources",
        });
      }

      const [userSources, userError] = await handleAsync(
        newsSourceService.getUserNewsSources(userId)
      );
      if (userError) {
        throw new HTTPException(500, {
          message: "Failed to fetch user news sources",
        });
      }

      let allSources = [...(publicSources || []), ...(userSources || [])];
      if (category) {
        allSources = allSources.filter((s) => s.category === category);
      }

      // Sort by reliability score and name
      allSources.sort((a, b) => {
        if (b.reliability.score !== a.reliability.score) {
          return b.reliability.score - a.reliability.score;
        }
        return a.name.localeCompare(b.name);
      });

      return c.json({
        sources: allSources,
        count: allSources.length,
        categories: [
          "mainstream",
          "alternative",
          "libertarian",
          "financial",
          "tech",
          "international",
        ],
      });
    } catch (error) {
      throw new HTTPException(500, {
        message: "Failed to fetch news sources",
      });
    }
  })
  // Create a custom news source
  .post("/", zValidator("json", createNewsSourceSchema), async (c) => {
    const { userId, ...sourceData } = c.req.valid("json");

    try {
      // Check if user has reached custom source limit (e.g., 5 for free tier)
      const [userSources, userSourcesError] = await handleAsync(
        newsSourceService.getUserNewsSources(userId)
      );
      if (userSourcesError) {
        console.error("Error fetching user sources:", userSourcesError);
        return c.json({ error: "Failed to fetch user sources" }, 500);
      }
      const activeUserSourceCount = (userSources || []).filter(
        (s: any) => s.isActive
      ).length;

      if (activeUserSourceCount >= 5) {
        return c.json(
          {
            error: "Custom source limit reached. Upgrade to add more sources.",
          },
          403
        );
      }

      // Check if URL already exists
      const [publicSources, publicSourcesError] = await handleAsync(
        newsSourceService.getPublicNewsSources()
      );
      if (publicSourcesError) {
        console.error("Error fetching public sources:", publicSourcesError);
        return c.json({ error: "Failed to fetch public sources" }, 500);
      }
      const allSources = [...(publicSources || []), ...(userSources || [])];
      const existingSource = allSources.find(
        (source) => source.url === sourceData.url
      );

      if (existingSource) {
        return c.json(
          {
            error: "A source with this URL already exists",
            existingSourceId: existingSource.sourceId,
          },
          409
        );
      }

      // Create the news source
      const [newSource, error] = await handleAsync(
        newsSourceService.createNewsSource({
          ...sourceData,
          userId,
        })
      );

      if (error) {
        console.error("Error creating news source:", error);
        return c.json({ error: "Failed to create news source" }, 500);
      }

      return c.json(newSource!, 201);
    } catch (error) {
      console.error("Error creating news source:", error);
      return c.json({ error: "Failed to create news source" }, 500);
    }
  })
  // Test a news source URL
  .post("/test", zValidator("json", testRssSchema), async (c) => {
    const { url } = c.req.valid("json");

    try {
      // Create a new parser instance
      const parser = new Parser({
        timeout: 5000,
        headers: {
          "User-Agent": "Liberty Lens RSS Reader/1.0",
        },
      });

      // Try to parse the RSS feed
      const feed = await parser.parseURL(url);

      // Extract feed information
      const feedInfo = {
        valid: true,
        title: feed.title || "Untitled Feed",
        description: feed.description,
        link: feed.link,
        language: feed.language,
        itemCount: feed.items?.length || 0,
        lastBuildDate: feed.lastBuildDate,
        generator: feed.generator,
        categories: feed.categories || [],
      };

      return c.json({
        url,
        type: "rss",
        isValid: true,
        feedInfo,
        message: "RSS feed is valid and accessible",
        testTimestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("RSS validation error:", error);

      let errorMessage = "Failed to validate RSS feed";
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage = "Feed took too long to respond";
        } else if (error.message.includes("404")) {
          errorMessage = "Feed URL not found";
        } else if (error.message.includes("parse")) {
          errorMessage = "Invalid RSS/XML format";
        } else {
          errorMessage = error.message;
        }
      }

      return c.json(
        {
          url,
          type: "rss",
          isValid: false,
          error: errorMessage,
          message: errorMessage,
          testTimestamp: new Date().toISOString(),
        },
        400
      );
    }
  })
  // Get a specific news source
  .get("/:sourceId", zValidator("query", userIdQuerySchema), async (c) => {
    const { userId } = c.req.valid("query");
    const sourceId = c.req.param("sourceId");

    try {
      const [source, sourceError] = await handleAsync(
        newsSourceService.getNewsSourceById(sourceId)
      );
      if (sourceError) {
        console.error("Error fetching news source:", sourceError);
        return c.json({ error: "Failed to fetch news source" }, 500);
      }

      if (!source) {
        return c.json({ error: "News source not found" }, 404);
      }

      // Check access rights
      if (!source.isPublic && source.addedByUserId !== userId) {
        return c.json({ error: "Forbidden" }, 403);
      }

      return c.json(source);
    } catch (error) {
      console.error("Error fetching news source:", error);
      return c.json({ error: "Failed to fetch news source" }, 500);
    }
  })
  .patch(
    "/:sourceId",
    zValidator("json", updateNewsSourceSchema),
    async (c) => {
      const { userId, ...updates } = c.req.valid("json");
      const sourceId = c.req.param("sourceId");

      try {
        const [updatedSource, error] = await handleAsync(
          newsSourceService.updateNewsSource(sourceId, updates, userId)
        );

        if (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("not found")) {
            return c.json({ error: "News source not found" }, 404);
          }
          if (errorMessage.includes("unauthorized")) {
            return c.json({ error: "Cannot modify this news source" }, 403);
          }
          console.error("Error updating news source:", error);
          return c.json({ error: "Failed to update news source" }, 500);
        }

        return c.json(updatedSource!);
      } catch (error) {
        console.error("Error updating news source:", error);
        return c.json({ error: "Failed to update news source" }, 500);
      }
    }
  )
  .delete("/", zValidator("query", deleteNewsSourceQuerySchema), async (c) => {
    const { userId, sourceId } = c.req.valid("query");

    try {
      const [result, error] = await handleAsync(
        newsSourceService.deleteNewsSource(sourceId, userId)
      );

      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("not found")) {
          return c.json({ error: "News source not found" }, 404);
        }
        if (errorMessage.includes("unauthorized")) {
          return c.json({ error: "Cannot delete this news source" }, 403);
        }
        console.error("Error deleting news source:", error);
        return c.json({ error: "Failed to delete news source" }, 500);
      }

      return c.json({ message: "News source deleted successfully" });
    } catch (error) {
      console.error("Error deleting news source:", error);
      return c.json({ error: "Failed to delete news source" }, 500);
    }
  });
