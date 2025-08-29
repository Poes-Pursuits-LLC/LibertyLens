import { getAuth } from "@clerk/react-router/ssr.server";
import { hc } from "hono/client";
import type { AppType } from "~/server/main";
import type { Route } from "./+types/index";

export const feedsLoader = async (args: Route.LoaderArgs) => {
  try {
    const { userId } = await getAuth(args);
    const client = hc<AppType>(process.env.SERVER_URL!);

    const response = await client.feeds.$get({
      query: { userId: userId! },
    });

    if (!response.ok) {
      return {
        feeds: [],
        count: 0,
        error: "Failed to fetch feeds",
      };
    }

    const data = await response.json();

    return {
      feeds: data.feeds || [],
      count: data.count || 0,
    };
  } catch (error) {
    console.error("Error in feedsLoader:", error);
    return {
      feeds: [],
      count: 0,
      error: error instanceof Error ? error.message : "Failed to fetch feeds",
    };
  }
};
