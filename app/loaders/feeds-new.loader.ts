import { hc } from "hono/client"
import type { Route } from "~/routes/dashboard/feeds/+types/new"
import type { AppType } from "~/server/main"
import { getAuth } from "@clerk/react-router/ssr.server"

export const feedsNewLoader = async (args: Route.LoaderArgs) => {
  try {
    const { userId } = await getAuth(args)
    if (!userId) {
      return { sources: [], categories: [], count: 0 }
    }

    const client = hc<AppType>(process.env.SERVER_URL!)
    const response = await client.sources.$get({
      query: { userId },
    })

    const text = await response.text()
    let data: any = { sources: [], count: 0, categories: [] }
    try {
      data = JSON.parse(text)
    } catch {
      // fall back to defaults
    }

    return {
      sources: Array.isArray(data.sources) ? data.sources : [],
      count: typeof data.count === "number" ? data.count : 0,
      categories: Array.isArray(data.categories) ? data.categories : [],
    }
  } catch (error) {
    return {
      sources: [],
      categories: [],
      count: 0,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
