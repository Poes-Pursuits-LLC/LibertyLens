import { redirect } from 'react-router'
import type { Route } from '~/routes/dashboard/+types/_layout'
import { getAuth } from '@clerk/react-router/ssr.server'
import { createClerkClient } from '@clerk/backend'
import type { AppType } from '~/server/main'
import { hc } from 'hono/client'

export const dashboardLayoutLoader = async (args: Route.LoaderArgs) => {
  try {
    const { userId, has } = await getAuth(args)

    if (!userId) {
      return redirect('/login')
    }

    // Check if user has a premium subscription
    const isSubscriber = has({ plan: 'liberty_lens_premium' })

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    })

    const client = hc<AppType>(process.env.SERVER_URL!)

    // Fetch user data and stats in parallel
    const [user, userStats] = await Promise.all([
      clerkClient.users.getUser(userId),
      // Fetch user stats from your API
      client.analytics
        .$get({ query: { userId } })
        .then((res) => res.json())
        .catch(() => ({
          activeFeedCount: 0,
          analyzedArticlesCount: 0,
          sourcesFollowingCount: 0,
          timeSaved: 0,
        })),
    ])

    // Extract metadata
    const freeFeedLimit = (user.privateMetadata as { freeFeedLimit?: number })?.freeFeedLimit ?? 3
    const currentFeedCount = (user.privateMetadata as { currentFeedCount?: number })?.currentFeedCount ?? 0

    return {
      userId,
      user: {
        id: user.id,
        firstName: user.firstName || 'Friend',
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress,
        imageUrl: user.imageUrl,
      },
      isSubscriber,
      freeFeedLimit,
      currentFeedCount,
      userStats,
    }
  } catch (error) {
    console.error('Dashboard layout loader error:', error)
    // If there's an error, redirect to login
    return redirect('/login')
  }
}
