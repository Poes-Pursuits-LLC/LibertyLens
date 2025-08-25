import { getTTL, handleAsync } from '../utils'
import { DynamoCache } from '../cache/cache.dynamo'
import { DynamoFeed } from './feed.dynamo'
import type { FeedConfig, CreateFeedInput, UpdateFeedInput } from './feed.model'
import { defaultAnalysisSettings } from './feed.model'

const getFeedById = async (feedId: string): Promise<FeedConfig | null> => {
    const cacheKey = `feed:${feedId}`
    const { data: cached } = await DynamoCache().get({ cacheKey }).go()
    if (cached?.cached) return cached.cached as FeedConfig

    const { data: feed } = await DynamoFeed()
        .get({ feedId, type: 'feed' })
        .go()

    if (feed) {
        await DynamoCache()
            .put({
                cacheKey,
                cached: feed,
                expireAt: getTTL(1), // Cache for 1 hour
            })
            .go()
    }

    return feed || null
}

const getUserFeeds = async (userId: string, onlyActive = false) => {
    const cacheKey = `user-feeds:${userId}:${onlyActive ? 'active' : 'all'}`
    const { data: cached } = await DynamoCache().get({ cacheKey }).go()
    if (cached?.cached) return cached.cached as FeedConfig[]

    let feeds: FeedConfig[]

    if (onlyActive) {
        const { data } = await DynamoFeed()
            .query.byUserAndActive({ userId, isActive: true })
            .go()
        feeds = data
    } else {
        const { data } = await DynamoFeed()
            .query.byUser({ userId })
            .go()
        feeds = data
    }

    await DynamoCache()
        .put({
            cacheKey,
            cached: feeds,
            expireAt: getTTL(1), // Cache for 1 hour
        })
        .go()

    return feeds
}

const createFeed = async (userId: string, input: CreateFeedInput) => {
    const [feed, error] = await handleAsync(
        DynamoFeed()
            .put({
                userId,
                name: input.name,
                description: input.description,
                sources: input.sources || [],
                topics: input.topics || [],
                keywords: input.keywords || [],
                excludeKeywords: input.excludeKeywords || [],
                analysisSettings: {
                    ...defaultAnalysisSettings,
                    ...input.analysisSettings,
                },
                refreshInterval: input.refreshInterval || 60,
            })
            .go(),
    )

    if (feed?.data) {
        // Clear user feeds cache
        await Promise.all([
            DynamoCache().delete({ cacheKey: `user-feeds:${userId}:all` }).go(),
            DynamoCache().delete({ cacheKey: `user-feeds:${userId}:active` }).go(),
        ])
    }

    return [feed?.data || null, error]
}

const updateFeed = async (feedId: string, userId: string, updates: UpdateFeedInput) => {
    // Verify ownership
    const existingFeed = await getFeedById(feedId)
    if (!existingFeed || existingFeed.userId !== userId) {
        return [null, new Error('Feed not found or unauthorized')]
    }

    // Clear caches
    await Promise.all([
        DynamoCache().delete({ cacheKey: `feed:${feedId}` }).go(),
        DynamoCache().delete({ cacheKey: `user-feeds:${userId}:all` }).go(),
        DynamoCache().delete({ cacheKey: `user-feeds:${userId}:active` }).go(),
    ])

    const updateData: any = {}
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.sources !== undefined) updateData.sources = updates.sources
    if (updates.topics !== undefined) updateData.topics = updates.topics
    if (updates.keywords !== undefined) updateData.keywords = updates.keywords
    if (updates.excludeKeywords !== undefined) updateData.excludeKeywords = updates.excludeKeywords
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive
    if (updates.refreshInterval !== undefined) updateData.refreshInterval = updates.refreshInterval
    if (updates.analysisSettings !== undefined) {
        updateData.analysisSettings = {
            ...existingFeed.analysisSettings,
            ...updates.analysisSettings,
        }
    }

    const [feed, error] = await handleAsync(
        DynamoFeed()
            .update({ feedId, type: 'feed' })
            .set(updateData)
            .go({ response: 'all_new' }),
    )

    return [feed?.data || null, error]
}

const deleteFeed = async (feedId: string, userId: string) => {
    // Verify ownership
    const existingFeed = await getFeedById(feedId)
    if (!existingFeed || existingFeed.userId !== userId) {
        return [null, new Error('Feed not found or unauthorized')]
    }

    // Clear caches
    await Promise.all([
        DynamoCache().delete({ cacheKey: `feed:${feedId}` }).go(),
        DynamoCache().delete({ cacheKey: `user-feeds:${userId}:all` }).go(),
        DynamoCache().delete({ cacheKey: `user-feeds:${userId}:active` }).go(),
    ])

    const [result, error] = await handleAsync(
        DynamoFeed()
            .delete({ feedId, type: 'feed' })
            .go(),
    )

    return [result?.data || null, error]
}

const markFeedRefreshed = async (feedId: string) => {
    await DynamoCache().delete({ cacheKey: `feed:${feedId}` }).go()

    const [feed, error] = await handleAsync(
        DynamoFeed()
            .update({ feedId, type: 'feed' })
            .set({ lastRefreshedAt: new Date().toISOString() })
            .go({ response: 'all_new' }),
    )

    return [feed?.data || null, error]
}

const getFeedsToRefresh = async (limit = 20) => {
    const cutoffTime = new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago

    const { data } = await DynamoFeed()
        .query.allActiveFeeds({ isActive: true })
        .where((attr, op) => `
            ${op.lt(attr.lastRefreshedAt, cutoffTime)} OR ${op.notExists(attr.lastRefreshedAt)}
        `)
        .limit(limit)
        .go()

    return data
}

const toggleFeedStatus = async (feedId: string, userId: string) => {
    const existingFeed = await getFeedById(feedId)
    if (!existingFeed || existingFeed.userId !== userId) {
        return [null, new Error('Feed not found or unauthorized')]
    }

    return updateFeed(feedId, userId, { isActive: !existingFeed.isActive })
}

export const feedService = {
    getFeedById,
    getUserFeeds,
    createFeed,
    updateFeed,
    deleteFeed,
    markFeedRefreshed,
    getFeedsToRefresh,
    toggleFeedStatus,
}
