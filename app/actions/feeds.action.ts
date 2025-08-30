import { hc } from "hono/client"
import type { AppType } from "~/server/main"
import type { Route } from "~/routes/dashboard/feeds/+types/new"
import { getAuth } from "@clerk/react-router/ssr.server"
import { redirect } from "react-router"

export const feedsAction = async (args: Route.ActionArgs) => {
  try {
    const { userId } = await getAuth(args)
    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const formData = await args.request.formData()
    const action = String(formData.get("action") || "")

    if (action === "delete") {
      const feedId = String(formData.get("feedId") || "").trim()
      if (!feedId) {
        return new Response("Feed ID is required", { status: 400 })
      }

      const client = hc<AppType>(process.env.SERVER_URL!)
      const res = await (client.feeds as any).deleteFeed.$delete({
        query: { feedId, userId },
      })

      if (!res.ok) {
        let message = "Failed to delete feed"
        try {
          const data = await res.json()
          if (data && typeof data === "object" && "message" in data) {
            message = String((data as any).message)
          }
        } catch { }
        return new Response(JSON.stringify({ message }), {
          status: (res as any).status || 500,
          headers: { "Content-Type": "application/json" },
        })
      }

      return redirect("/dashboard/feeds", { status: 302 })
    } else if (action === "create") {
      const name = String(formData.get("name") || "").trim()
      if (!name) {
        return new Response("Name is required", { status: 400 })
      }

      const description = String(formData.get("description") || "").trim()
      const sourcesRaw = String(formData.get("sources") || "[]")
      const topicsRaw = String(formData.get("topics") || "[]")
      const analysisIntensity = String(formData.get("analysisIntensity") || "").trim() as
        | "light"
        | "moderate"
        | "deep"
        | ""
      const refreshIntervalRaw = String(formData.get("refreshInterval") || "").trim()

      let sources: string[] = []
      let topics: string[] = []
      try {
        const parsed = JSON.parse(sourcesRaw)
        if (Array.isArray(parsed)) sources = parsed.map(String)
      } catch { }
      try {
        const parsed = JSON.parse(topicsRaw)
        if (Array.isArray(parsed)) topics = parsed.map(String)
      } catch { }

      const payload: any = {
        userId,
        name,
        ...(description && { description }),
        sources,
        ...(topics.length ? { topics } : {}),
        ...(analysisIntensity && { analysisSettings: { intensity: analysisIntensity } }),
      }

      if (refreshIntervalRaw) {
        const n = Number(refreshIntervalRaw)
        if (!Number.isNaN(n)) payload.refreshInterval = n
      }

      const client = hc<AppType>(process.env.SERVER_URL!)
      const res = await (client.feeds as any).createFeed.$post({ json: payload })
      if (!res.ok) {
        // Try to read error body
        let message = "Failed to create feed"
        try {
          const data = await res.json()
          if (data && typeof data === "object" && "message" in data) {
            message = String((data as any).message)
          }
        } catch { }
        return new Response(JSON.stringify({ message }), {
          status: (res as any).status || 500,
          headers: { "Content-Type": "application/json" },
        })
      }

      return redirect("/dashboard/feeds", { status: 302 })
    } else {
      return new Response(`Unknown action: ${action}`, { status: 400 })
    }
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "An unexpected error occurred",
      { status: 500 },
    )
  }
}
