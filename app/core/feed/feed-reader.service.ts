import { createHash } from 'crypto'
import { DynamoCache } from '~/core/cache/cache.dynamo'
import { feedService } from '~/core/feed/feed.service'
import { newsSourceService } from '~/core/news-source/news-source.service'
import { fetchRSSArticles } from '~/core/article/rss-fetcher'
import type { EphemeralArticle, EphemeralSourceCacheEntry } from '~/core/article/article.ephemeral'
import { FEED_EPHEMERAL_TTL_MINUTES, FEED_EPHEMERAL_DEFAULT_LIMIT, MAX_AGGREGATION_LIMIT } from '~/core/feed/feed.constants'

interface AggregationOptions {
  userId?: string
  limit?: number
  cursor?: string
  forceRefresh?: boolean
}

const nowIso = () => new Date().toISOString()
const minutesToSeconds = (m: number) => Math.floor(m * 60)
const toOffset = (cursor?: string) => {
  const n = Number(cursor)
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0
}
const clampLimit = (limit?: number) => {
  const n = Number(limit ?? FEED_EPHEMERAL_DEFAULT_LIMIT)
  if (!Number.isFinite(n) || n <= 0) return FEED_EPHEMERAL_DEFAULT_LIMIT
  return Math.min(Math.floor(n), MAX_AGGREGATION_LIMIT)
}

const computeId = (url: string) => createHash('sha1').update(url).digest('hex')

async function getSourceItemsEphemeral(
  sourceId: string,
  forceRefresh = false,
): Promise<{ items: EphemeralArticle[]; fetchedAt: string }> {
  // Resolve source (cached by newsSourceService internally)
  const source = await newsSourceService.getNewsSourceById(sourceId)
  if (!source || source.isActive === false) {
    return { items: [], fetchedAt: nowIso() }
  }

  const cacheKey = `ephemeral:source:${sourceId}`
  const ttlSeconds = minutesToSeconds(FEED_EPHEMERAL_TTL_MINUTES)

  try {
    if (!forceRefresh) {
      const { data: cached } = await DynamoCache().get({ cacheKey, type: 'ephemeral' }).go()
      const entry = cached?.cached as EphemeralSourceCacheEntry | undefined
      if (entry?.fetchedAt) {
        const ageMs = Date.now() - new Date(entry.fetchedAt).getTime()
        if (ageMs < FEED_EPHEMERAL_TTL_MINUTES * 60 * 1000) {
          return entry
        }
      }
    }

    const [articles, fetchError] = await fetchRSSArticles(source as any)
    if (fetchError) {
      console.warn(`Ephemeral fetch failed for source ${sourceId}: ${fetchError.message}`)
      return { items: [], fetchedAt: nowIso() }
    }

    const items: EphemeralArticle[] = (articles || []).map((a) => ({
      id: computeId(a.originalUrl),
      originalUrl: a.originalUrl,
      title: a.title,
      summary: a.summary,
      content: a.content,
      author: a.author,
      publishedAt: a.publishedAt,
      tags: a.tags,
      imageUrl: a.imageUrl,
      sourceId: a.sourceId,
      sourceName: a.sourceName,
    }))

    // Sort by publishedAt desc, fallback to now for missing dates
    items.sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
      return tb - ta
    })

    const entry: EphemeralSourceCacheEntry = { items, fetchedAt: nowIso() }
    await DynamoCache()
      .put({
        cacheKey,
        cached: entry,
        expireAt: Math.floor(Date.now() / 1000) + ttlSeconds,
        type: 'ephemeral',
      })
      .go()

    return entry
  } catch (err) {
    console.warn(`Ephemeral fetch exception for source ${sourceId}:`, err)
    return { items: [], fetchedAt: nowIso() }
  }
}

function filterByKeywords(items: EphemeralArticle[], keywords?: string[] | null) {
  if (!keywords || keywords.length === 0) return items
  const needles = keywords.map((k) => k.toLowerCase())
  return items.filter((it) => {
    const text = `${it.title || ''} ${it.summary || ''}`.toLowerCase()
    return needles.some((k) => text.includes(k))
  })
}

function excludeByKeywords(items: EphemeralArticle[], exclude?: string[] | null) {
  if (!exclude || exclude.length === 0) return items
  const needles = exclude.map((k) => k.toLowerCase())
  return items.filter((it) => {
    const text = `${it.title || ''} ${it.summary || ''}`.toLowerCase()
    return !needles.some((k) => text.includes(k))
  })
}

function filterByTopics(items: EphemeralArticle[], topics?: string[] | null) {
  if (!topics || topics.length === 0) return items
  const topicSet = new Set(topics.map((t) => t.toLowerCase()))
  return items.filter((it) => {
    const tags = (it.tags || []).map((t) => t.toLowerCase())
    return tags.some((t) => topicSet.has(t))
  })
}

function dedupeById(items: EphemeralArticle[]) {
  const map = new Map<string, EphemeralArticle>()
  for (const it of items) {
    const existing = map.get(it.id)
    if (!existing) {
      map.set(it.id, it)
    } else {
      // Keep the newest by publishedAt
      const te = existing.publishedAt ? new Date(existing.publishedAt).getTime() : 0
      const tn = it.publishedAt ? new Date(it.publishedAt).getTime() : 0
      if (tn > te) map.set(it.id, it)
    }
  }
  return Array.from(map.values())
}

export async function getAggregatedFeedItems(
  feedId: string,
  opts: AggregationOptions = {},
): Promise<{ articles: EphemeralArticle[]; nextCursor?: string; hasMore: boolean }> {
  const { limit, cursor, forceRefresh } = opts
  const pageSize = clampLimit(limit)
  const offset = toOffset(cursor)

  const feed = await feedService.getFeedById(feedId)
  if (!feed) throw new Error('Feed not found')

  const enabledSources = (feed.sources || []).filter((s: any) => s?.enabled)
  if (enabledSources.length === 0) {
    return { articles: [], hasMore: false }
  }

  const results = await Promise.allSettled(
    enabledSources.map(async (s: any) => {
      const res = await getSourceItemsEphemeral(s.sourceId, !!forceRefresh)
      return res.items
    }),
  )

  let merged: EphemeralArticle[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') merged = merged.concat(r.value)
    else console.warn('Source aggregation failed:', r.reason)
  }

  // Filters
  merged = filterByKeywords(merged, feed.keywords)
  merged = excludeByKeywords(merged, feed.excludeKeywords)
  merged = filterByTopics(merged, feed.topics)

  // Deduplicate and sort desc
  merged = dedupeById(merged)
  merged.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return tb - ta
  })

  const page = merged.slice(offset, offset + pageSize)
  const hasMore = merged.length > offset + pageSize
  const nextCursor = hasMore ? String(offset + pageSize) : undefined

  return { articles: page, hasMore, nextCursor }
}

export const feedReaderService = {
  getAggregatedFeedItems,
}

