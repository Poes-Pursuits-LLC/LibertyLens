/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { feedArticlesLoader } from '~/loaders/feed-articles.loader'
import { hc } from 'hono/client'
import { getAuth } from '@clerk/react-router/ssr.server'

vi.mock('hono/client', () => ({
  hc: vi.fn(),
}))
vi.mock('@clerk/react-router/ssr.server', () => ({
  getAuth: vi.fn(),
}))
const mockedHc = vi.mocked(hc)
const mockedGetAuth = vi.mocked(getAuth)

const originalEnv = { ...process.env }

function responseWithText(obj: any) {
  return { text: async () => JSON.stringify(obj) }
}

beforeEach(() => {
  process.env.SERVER_URL = 'http://test.server'
  mockedGetAuth.mockResolvedValue({ userId: 'user-1' } as any)
})

afterEach(() => {
  process.env = originalEnv
  vi.restoreAllMocks()
})

describe('feed-articles.loader', () => {
  it('loads feed and articles for the user', async () => {
    const feed = { feedId: 'f1', userId: 'user-1', name: 'My Feed', description: 'desc' }
    const articles = [{ articleId: 'a1', title: 'T', originalUrl: 'u', sourceName: 'S', publishedAt: new Date().toISOString(), summary: 'sum' }]

    const feedsGet = vi.fn().mockResolvedValue(responseWithText({ feed }))
    const articlesGet = vi.fn().mockResolvedValue(responseWithText({ articles, nextCursor: 'next', hasMore: true }))

    mockedHc.mockReturnValue({
      feeds: { getFeed: { $get: feedsGet } },
      articles: { $get: articlesGet },
    } as any)

    const args = { params: { feedId: 'f1' }, request: new Request('http://localhost/dashboard/feeds/f1') } as any
    const result = await feedArticlesLoader(args)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect(feedsGet).toHaveBeenCalledWith({ query: { feedId: 'f1', userId: 'user-1' } })
    expect(articlesGet).toHaveBeenCalledWith({ query: { feedId: 'f1', userId: 'user-1', limit: 20 } })
    expect(result.feed).toEqual(feed)
    expect(result.articles).toEqual(articles)
    expect(result.nextCursor).toBe('next')
    expect(result.hasMore).toBe(true)
  })

  it('returns defaults on JSON parse error', async () => {
    const feedsGet = vi.fn().mockResolvedValue({ text: async () => 'INVALID' })
    const articlesGet = vi.fn().mockResolvedValue({ text: async () => 'INVALID' })

    mockedHc.mockReturnValue({
      feeds: { getFeed: { $get: feedsGet } },
      articles: { $get: articlesGet },
    } as any)

    const args = { params: { feedId: 'f1' }, request: new Request('http://localhost/dashboard/feeds/f1') } as any
    const result: any = await feedArticlesLoader(args)

    expect(result.feed).toBeNull()
    expect(result.articles).toEqual([])
    expect(result.nextCursor).toBeNull()
    expect(result.hasMore).toBe(false)
    expect(typeof result.error === 'string' || result.error === undefined).toBe(true)
  })

  it('returns defaults when no userId', async () => {
    mockedGetAuth.mockResolvedValueOnce({ userId: null } as any)

    const args = { params: { feedId: 'f1' }, request: new Request('http://localhost/dashboard/feeds/f1') } as any
    const result = await feedArticlesLoader(args)

    expect(result).toEqual({ feed: null, articles: [], nextCursor: null, hasMore: false })
    expect(mockedHc).not.toHaveBeenCalled()
  })
})
