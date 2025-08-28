import { hc } from "hono/client"
// @ts-expect-error oops
import type { Route } from "~/routes/dashboard/feeds/+types/index"
import type { AppType } from "~/server/main"
import { getAuth } from "@clerk/react-router/ssr.server"

export const feedsLoader = async (args: Route.LoaderArgs) => {
  try {
    const { userId } = await getAuth(args)
    if (!userId) {
      return { feeds: [], count: 0 }
    }

    const client = hc<AppType>(process.env.SERVER_URL!)
    const response = await client.feeds.getUserFeeds.$get({
      query: { userId },
    })

    // Prefer robust parsing similar to sources.loader.ts
    const text = await response.text()
    let data: any = { feeds: [], count: 0 }
    try {
      data = JSON.parse(text)
    } catch {
      // fall back to defaults
    }

    return {
      feeds: Array.isArray(data.feeds) ? data.feeds : [],
      count: typeof data.count === "number" ? data.count : 0,
    }
  } catch (error) {
    return {
      feeds: [],
      count: 0,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
