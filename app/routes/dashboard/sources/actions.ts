import { hc } from "hono/client";
import type { Route } from "./+types/index";
import type { AppType } from "~/server/main";
import type {
  CreateNewsSourceInput,
  UpdateNewsSourceInput,
} from "~/core/news-source";

export const dashboardAction = async (args: Route.ActionArgs) => {
  try {
    const formData = await args.request.formData();
    const action = String(formData.get("action"));

    switch (action) {
      case "create":
        return await createNewsSource(formData);
      case "update":
        return await updateNewsSource(formData);
      case "delete":
        return await deleteNewsSource(formData);
      case "test":
        return await testRssFeed(formData);
      default:
        return { error: `Unknown action: ${action}` };
    }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

async function createNewsSource(formData: FormData) {
  try {
    const client = hc<AppType>(import.meta.env.SERVER_URL);

    const input: CreateNewsSourceInput = {
      name: String(formData.get("name")),
      description: String(formData.get("description") || ""),
      url: String(formData.get("url")),
      type: String(formData.get("type")) as "rss" | "api" | "scraper",
      category: String(formData.get("category")) as any,
      logoUrl: String(formData.get("logoUrl") || ""),
      fetchConfig: {
        headers: formData.get("headers")
          ? JSON.parse(String(formData.get("headers")))
          : undefined,
        apiKey: String(formData.get("apiKey") || ""),
        rateLimit: formData.get("rateLimit")
          ? Number(formData.get("rateLimit"))
          : undefined,
        selector: String(formData.get("selector") || ""),
      },
      tags: formData.get("tags")
        ? JSON.parse(String(formData.get("tags")))
        : [],
    };

    const response = await client.sources.$post({
      json: input,
    });

    if (!response.ok) {
      let errorMessage = "Failed to create news source";
      try {
        const error = await response.json();
        if (error && typeof error === "object" && "error" in error) {
          errorMessage = String((error as any).error);
        }
      } catch {
        // ignore JSON parse errors, use default message
      }
      return { error: errorMessage };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create news source",
    };
  }
}

async function updateNewsSource(formData: FormData) {
  try {
    const client = hc<AppType>(import.meta.env.SERVER_URL);
    const sourceId = String(formData.get("sourceId"));

    const updates: UpdateNewsSourceInput = {
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      url: String(formData.get("url") || ""),
      category: String(formData.get("category") || "") as any,
      logoUrl: String(formData.get("logoUrl") || ""),
      fetchConfig: {
        headers: formData.get("headers")
          ? JSON.parse(String(formData.get("headers")))
          : undefined,
        apiKey: String(formData.get("apiKey") || ""),
        rateLimit: formData.get("rateLimit")
          ? Number(formData.get("rateLimit"))
          : undefined,
        selector: String(formData.get("selector") || ""),
      },
      tags: formData.get("tags")
        ? JSON.parse(String(formData.get("tags")))
        : [],
      isActive: formData.get("isActive")
        ? formData.get("isActive") === "true"
        : undefined,
    };

    const response = await (client.sources as any)[sourceId].$patch({
      json: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to update news source" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to update news source",
    };
  }
}

async function deleteNewsSource(formData: FormData) {
  try {
    const client = hc<AppType>(import.meta.env.SERVER_URL);
    const sourceId = String(formData.get("sourceId"));
    const userId = String(formData.get("userId"));

    const response = await client.sources.$delete({
      query: { userId, sourceId },
    });

    if (!response.ok) {
      return { error: "Failed to delete news source" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to delete news source",
    };
  }
}

async function testRssFeed(formData: FormData) {
  try {
    const client = hc<AppType>(import.meta.env.SERVER_URL);
    const url = String(formData.get("url"));

    const response = await client.sources.test.$post({
      json: { url },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error:
          typeof errorData === "object" && errorData && "error" in errorData
            ? (errorData as any).error
            : "Failed to test RSS feed",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to test RSS feed",
    };
  }
}
