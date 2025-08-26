import { hc } from "hono/client";
import type { Route } from "./+types/index";
import type { AppType } from "~/server/main";
import { getAuth } from "@clerk/react-router/ssr.server";

export const dashboardLoader = async (args: Route.LoaderArgs) => {
  try {
    console.info("Invoked dashboardLoader");
    const url = new URL(args.request.url);
    const category = url.searchParams.get("category") || undefined;
    const userId = await getAuth(args);

    if (!userId) {
      return {
        sources: [],
        count: 0,
        categories: [],
        error: "userId is required",
      };
    }

    const client = hc<AppType>(process.env.SERVER_URL!);
    const response = await client.sources.$get();

    if (!response.ok) {
      const error = await response.json();
      return {
        sources: [],
        count: 0,
        categories: [],
        error: error || "Failed to fetch news sources",
      };
    }

    const data = await response.json();
    return {
      sources: data.sources || [],
      count: data.count || 0,
      categories: data.categories || [],
    };
  } catch (error) {
    console.error("Error in dashboardLoader:", error);
    return {
      sources: [],
      count: 0,
      categories: [],
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
