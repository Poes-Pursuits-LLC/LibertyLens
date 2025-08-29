import { hc } from "hono/client";
import type { CreateFeedInput, UpdateFeedInput } from "~/core/feed/feed.model";
import type { AppType } from "~/server/main";
import type { Route } from "./+types/index";
import { getAuth } from "@clerk/react-router/ssr.server";

export const feedsAction = async (args: Route.ActionArgs) => {
  try {
    const { userId } = await getAuth(args);
    const formData = await args.request.formData();
    const action = String(formData.get("action"));

    switch (action) {
      case "create":
        return await createFeed(formData, userId!);
      case "update":
        return await updateFeed(formData, userId!);
      case "delete":
        return await deleteFeed(formData, userId!);
      case "addSources":
        return await addSourcesToFeed(formData, userId!);
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

async function createFeed(formData: FormData, userId: string) {
  try {
    const client = hc<AppType>(process.env.SERVER_URL!);

    const analysisIntensity = formData.get("analysisIntensity");

    const input: CreateFeedInput = {
      name: String(formData.get("name")),
      description: String(formData.get("description") || ""),
      sources: JSON.parse(String(formData.get("sources") || "[]")),
      topics: formData.get("topics")
        ? JSON.parse(String(formData.get("topics")))
        : [],
      keywords: formData.get("keywords")
        ? JSON.parse(String(formData.get("keywords")))
        : [],
      excludeKeywords: formData.get("excludeKeywords")
        ? JSON.parse(String(formData.get("excludeKeywords")))
        : [],
      refreshInterval: formData.get("refreshInterval")
        ? Number(formData.get("refreshInterval"))
        : 60,
      analysisSettings: analysisIntensity
        ? { intensity: analysisIntensity as any }
        : undefined,
    };

    const response = await client.feeds.$post({
      query: { userId },
      json: input,
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      return { error: error.error || "Failed to create feed" };
    }

    const feed = await response.json();
    return { success: true, feed };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create feed",
    };
  }
}

async function updateFeed(formData: FormData, userId: string) {
  try {
    const client = hc<AppType>(process.env.SERVER_URL!);
    const feedId = String(formData.get("feedId"));

    const updates: UpdateFeedInput = {};

    if (formData.has("name")) updates.name = String(formData.get("name"));
    if (formData.has("description"))
      updates.description = String(formData.get("description"));
    if (formData.has("sources"))
      updates.sources = JSON.parse(String(formData.get("sources")));
    if (formData.has("topics"))
      updates.topics = JSON.parse(String(formData.get("topics")));
    if (formData.has("keywords"))
      updates.keywords = JSON.parse(String(formData.get("keywords")));
    if (formData.has("excludeKeywords"))
      updates.excludeKeywords = JSON.parse(
        String(formData.get("excludeKeywords"))
      );
    if (formData.has("isActive"))
      updates.isActive = formData.get("isActive") === "true";
    if (formData.has("refreshInterval"))
      updates.refreshInterval = Number(formData.get("refreshInterval"));

    const response = await (client.feeds as any)[feedId].$patch({
      query: { userId },
      json: updates,
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to update feed" };
    }

    const feed = await response.json();
    return { success: true, feed };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update feed",
    };
  }
}

async function deleteFeed(formData: FormData, userId: string) {
  try {
    const client = hc<AppType>(process.env.SERVER_URL!);
    const feedId = String(formData.get("feedId"));

    const response = await (client.feeds as any)[feedId].$delete({
      query: { userId },
    });

    if (!response.ok) {
      return { error: "Failed to delete feed" };
    }

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete feed",
    };
  }
}

async function addSourcesToFeed(formData: FormData, userId: string) {
  try {
    const client = hc<AppType>(process.env.SERVER_URL!);
    const feedId = String(formData.get("feedId"));
    const sources = JSON.parse(String(formData.get("sources") || "[]"));

    // Just send the sources, the server will handle merging
    const response = await (client.feeds as any)[feedId].$patch({
      query: { userId },
      json: { sources },
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Failed to add sources to feed" };
    }

    const feed = await response.json();
    return { success: true, feed };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to add sources to feed",
    };
  }
}
