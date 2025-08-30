import { hc } from "hono/client";
// @ts-expect-error oops
import type { Route } from "~/routes/dashboard/feeds/+types/index";
import type { AppType } from "~/server/main";
import { getAuth } from "@clerk/react-router/ssr.server";

export const feedsLoader = async (args: Route.LoaderArgs) => {
  try {
    const { userId } = await getAuth(args);
    if (!userId) {
      return { feeds: [], count: 0 };
    }

    const client = hc<AppType>(process.env.SERVER_URL!);
    const response = await client.feeds.getUserFeeds
      .$get({
        query: { userId },
      })
      .then((res) => res.json());

    return {
      feeds: response.feeds,
      count: response.count,
    };
  } catch (error) {
    return {
      feeds: [],
      count: 0,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
