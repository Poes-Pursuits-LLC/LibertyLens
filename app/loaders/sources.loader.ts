import { hc } from "hono/client";
import type { Route } from "~/routes/dashboard/sources/+types/index";
import type { AppType } from "~/server/main";
import { getAuth } from "@clerk/react-router/ssr.server";
import type { SourceCategory } from "~/core";

export const sourcesLoader = async (args: Route.LoaderArgs) => {
  try {
    console.info("Started sourcesLoader");

    const url = new URL(args.request.url);
    const categoryParam = url.searchParams.get("category");
    const category = categoryParam
      ? (categoryParam as SourceCategory)
      : undefined;
    const { userId } = await getAuth(args);

    console.info("SERVER_URL:", process.env.SERVER_URL);
    const client = hc<AppType>(process.env.SERVER_URL!);

    // Fetch news sources from server
    const response = await client.sources.$get({
      query: { userId: userId ?? "", category },
    });

    const responseText = await response.text();

    let newsSources: { sources: any[]; count: number; categories: string[] } = {
      sources: [],
      count: 0,
      categories: [],
    };
    try {
      const parsed = JSON.parse(responseText);
      newsSources = {
        sources: Array.isArray(parsed?.sources) ? parsed.sources : [],
        count: typeof parsed?.count === "number" ? parsed.count : 0,
        categories: Array.isArray(parsed?.categories) ? parsed.categories : [],
      };
    } catch {
      // fall back to defaults
    }

    console.info("Finished sourcesLoader");
    return {
      sources: newsSources.sources,
      count: newsSources.count,
      categories: newsSources.categories,
    };
  } catch (error) {
    console.error("Error in sourcesLoader:", error);
    return {
      sources: [],
      count: 0,
      categories: [],
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
