import { hc } from "hono/client";
import type { Route } from "./+types/index";
import type { AppType } from "~/server/main";
import { getAuth } from "@clerk/react-router/ssr.server";
import type { SourceCategory } from "~/core";

export const dashboardLoader = async (args: Route.LoaderArgs) => {
  try {
    console.info("Started dashboardLoader");

    const url = new URL(args.request.url);
    const categoryParam = url.searchParams.get("category");
    const category = categoryParam
      ? (categoryParam as SourceCategory)
      : undefined;
    const { userId } = await getAuth(args);

    console.info("SERVER_URL:", process.env.SERVER_URL);
    const client = hc<AppType>(process.env.SERVER_URL!);

    console.info("Fetching sources with params:", { userId, category });

    const response = await client.sources.$get({
      query: { userId: userId!, category },
    });

    console.info("Response status:", response.status);
    console.info(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.info("Raw response text:", responseText);

    let newsSources;
    try {
      newsSources = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", e);
      newsSources = { sources: [], count: 0, categories: [] };
    }

    console.info("Finished dashboardLoader");
    return {
      sources: newsSources.sources || [],
      count: newsSources.count || 0,
      categories: newsSources.categories || [],
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
