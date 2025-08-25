import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'
import { newsSourceRouter } from './news-source.router'
import * as newsSourceService from '~/core/news-source/news-source.service'

// Mock the entire news source service
vi.mock('~/core/news-source/news-source.service', () => ({
  newsSourceService: {
    initializeDefaultSources: vi.fn().mockResolvedValue({ created: 8, message: 'Initialized' }),
    getPublicNewsSources: vi.fn().mockResolvedValue([
      {
        sourceId: 'source-1',
        name: 'Test Source 1',
        url: 'https://test1.com/rss',
        type: 'rss',
        category: 'libertarian',
        isActive: true,
        isPublic: true,
        reliability: { score: 95, failureCount: 0 },
        tags: ['test'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        entityType: 'news-source'
      }
    ]),
    getUserNewsSources: vi.fn().mockResolvedValue([]),
    getNewsSourceById: vi.fn().mockResolvedValue(null),
    createNewsSource: vi.fn().mockResolvedValue([
      {
        sourceId: 'new-source',
        name: 'New Source',
        url: 'https://new.com/rss',
        type: 'rss',
        category: 'alternative',
        isActive: true,
        isPublic: false,
        addedByUserId: 'test-user',
        reliability: { score: 50, failureCount: 0 },
        tags: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        entityType: 'news-source'
      },
      null
    ]),
    updateNewsSource: vi.fn(),
    deleteNewsSource: vi.fn()
  }
}))

// Mock Clerk auth
vi.mock('@clerk/backend', () => ({
  getAuth: vi.fn().mockReturnValue({ userId: 'test-user' })
}))

describe('News Source Router', () => {
  let app: Hono

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono()
    app.route('/sources', newsSourceRouter)
  })

  it('GET /sources returns list of news sources', async () => {
    const res = await app.request('/sources', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.sources).toHaveLength(1)
    expect(data.sources[0].name).toBe('Test Source 1')
    expect(data.categories).toContain('libertarian')
  })

  it('POST /sources creates a new news source', async () => {
    const newSource = {
      name: 'New Source',
      url: 'https://new.com/rss',
      type: 'rss',
      category: 'alternative'
    }

    const res = await app.request('/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newSource)
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.name).toBe('New Source')
    expect(data.addedByUserId).toBe('test-user')
  })

  it('POST /sources/test validates RSS feed', async () => {
    const res = await app.request('/sources/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: 'https://example.com/feed.xml' })
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('isValid')
    expect(data).toHaveProperty('url', 'https://example.com/feed.xml')
  })

  it('Returns 401 when not authenticated', async () => {
    // Override auth mock for this test
    const { getAuth } = await import('@clerk/backend')
    vi.mocked(getAuth).mockReturnValueOnce(null as any)

    const res = await app.request('/sources', {
      method: 'GET'
    })

    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })
})
