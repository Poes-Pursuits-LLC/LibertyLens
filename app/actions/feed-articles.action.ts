import { getAuth } from "@clerk/react-router/ssr.server";
import { hc } from "hono/client";
import type { AppType } from "~/server/main";
import type { Route } from "~/routes/dashboard/feeds/+types/$feedId";

export const feedArticlesAction = async (args: Route.ActionArgs) => {
  try {
    const { userId } = await getAuth(args);
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const feedId = args.params.feedId;
    const formData = await args.request.formData();
    const cursor = formData.get("cursor") as string | null;
    
    const client = hc<AppType>(process.env.SERVER_URL!);

    // Fetch more articles for this feed
    const articlesResponse = await client.articles.feed[":feedId"].$get({
      param: { feedId },
      query: { 
        userId,
        limit: "10",
        ...(cursor && { cursor })
      },
    });

    if (!articlesResponse.ok) {
      return {
        articles: [],
        nextCursor: null,
        hasMore: false,
        error: "Failed to fetch more articles",
      };
    }

    const data = await articlesResponse.json();

    return {
      articles: data.articles || [],
      nextCursor: data.nextCursor || null,
      hasMore: data.hasMore || false,
    };
  } catch (error) {
    console.error("Error in feedArticlesAction:", error);
    
    return {
      articles: [],
      nextCursor: null,
      hasMore: false,
      error: error instanceof Error ? error.message : "Failed to load more articles",
    };
  }
};
