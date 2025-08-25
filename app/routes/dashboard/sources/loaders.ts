import { hc } from "hono/client";
import type { Route } from "./+types/index";
import type { AppType } from "~/server/main";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

export const dashboardLoader = async (
  args: Route.LoaderArgs
): Promise<Route.LoaderData> => {
  try {
    const url = new URL(args.request.url);
    const category = url.searchParams.get("category") || undefined;
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return {
        sources: [],
        count: 0,
        categories: [],
        error: "userId is required",
      };
    }

    const client = hc<AppType>(SERVER_URL);

    const response = await client.api.sources.$get({
      query: { userId, category },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        sources: [],
        count: 0,
        categories: [],
        error: error.error || "Failed to fetch news sources",
      };
    }

    const data = await response.json();
    return {
      sources: data.sources || [],
      count: data.count || 0,
      categories: data.categories || [],
    };
  } catch (error) {
    return {
      sources: [],
      count: 0,
      categories: [],
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
