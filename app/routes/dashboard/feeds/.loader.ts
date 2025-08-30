import { getAuth } from "@clerk/react-router/ssr.server";
import { hc } from "hono/client";
import type { AppType } from "~/server/main";
import type { Route } from "./+types/$feedId";

export const feedArticlesLoader = async (args: Route.LoaderArgs) => {
  try {
    const { userId } = await getAuth(args);
    const feedId = args.params.feedId;
    const cursor = args.request.url.includes('cursor=') 
      ? new URL(args.request.url).searchParams.get('cursor') || undefined
      : undefined;

    const client = hc<AppType>(process.env.SERVER_URL!);

    // Fetch the feed details first
    const feedResponse = await client.feeds[":feedId"].$get({
      param: { feedId },
      query: { userId: userId! },
    });

    if (!feedResponse.ok) {
      if (feedResponse.status === 404) {
        throw new Response("Feed not found", { status: 404 });
      }
      return {
        feed: null,
        articles: [],
        nextCursor: null,
        hasMore: false,
        error: "Failed to fetch feed",
      };
    }

    const feed = await feedResponse.json();

    // Fetch articles for this feed with limit of 10
    const articlesResponse = await client.articles.feed[":feedId"].$get({
      param: { feedId },
      query: { 
        userId: userId!,
        limit: "10",
        ...(cursor && { cursor })
      },
    });

    if (!articlesResponse.ok) {
      return {
        feed,
        articles: [],
        nextCursor: null,
        hasMore: false,
        error: "Failed to fetch articles",
      };
    }

    const data = await articlesResponse.json();

    return {
      feed,
      articles: data.articles || [],
      nextCursor: data.nextCursor || null,
      hasMore: data.hasMore || false,
    };
  } catch (error) {
    console.error("Error in feedArticlesLoader:", error);
    
    // Re-throw Response objects (like 404s)
    if (error instanceof Response) {
      throw error;
    }

    return {
      feed: null,
      articles: [],
      nextCursor: null,
      hasMore: false,
      error: error instanceof Error ? error.message : "Failed to fetch feed articles",
    };
  }
};
