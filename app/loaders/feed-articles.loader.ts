import { hc } from "hono/client";
// @ts-expect-error route types are generated
import type { Route } from "~/routes/dashboard/feeds/+types/$feedId";
import type { AppType } from "~/server/main";
import { getAuth } from "@clerk/react-router/ssr.server";

export const feedArticlesLoader = async (args: Route.LoaderArgs) => {
  try {
    const { userId } = await getAuth(args);
    if (!userId) {
      return { feed: null, articles: [], nextCursor: null, hasMore: false };
    }

    const feedId = args.params?.feedId;
    if (!feedId) {
      return {
        feed: null,
        articles: [],
        nextCursor: null,
        hasMore: false,
        error: "Missing feedId",
      };
    }

    const client = hc<AppType>(process.env.SERVER_URL!);

    // Fetch and authorize feed
    const feedRes = await client.feeds.getFeed.$get({
      query: { feedId, userId },
    });
    const feedText = await feedRes.text();
    let feedJson: any = null;
    try {
      feedJson = JSON.parse(feedText);
    } catch {
      // ignore parse error; handled below
    }
    const feed = feedJson?.feed ?? null;
    if (!feed) {
      return {
        feed: null,
        articles: [],
        nextCursor: null,
        hasMore: false,
        error: "Feed not found or unauthorized",
      };
    }

    // Fetch articles for this feed via the ephemeral aggregator endpoint
    const articlesRes = await client.articles.feed[":feedId"].$get({
      param: { feedId },
      query: { userId, limit: "10" },
    });
    const articlesText = await articlesRes.text();
    let articlesJson: any = null;
    try {
      articlesJson = JSON.parse(articlesText);
    } catch {
      // ignore parse error; handled in defaults
    }

    const articles = Array.isArray(articlesJson?.articles)
      ? articlesJson.articles
      : [];
    const nextCursor = articlesJson?.nextCursor ?? null;
    const hasMore = Boolean(articlesJson?.hasMore);

    return { feed, articles, nextCursor, hasMore };
  } catch (error) {
    return {
      feed: null,
      articles: [],
      nextCursor: null,
      hasMore: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};
