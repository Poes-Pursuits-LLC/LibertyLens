/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { feedsAction } from '~/actions/feeds.action'
import { hc } from 'hono/client'
import { getAuth } from '@clerk/react-router/ssr.server'
import type { Route } from '~/routes/dashboard/feeds/+types/new'

vi.mock('hono/client', () => ({
  hc: vi.fn(),
}))
vi.mock('@clerk/react-router/ssr.server', () => ({
  getAuth: vi.fn(),
}))
const mockedHc = vi.mocked(hc)
const mockedGetAuth = vi.mocked(getAuth)

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env.SERVER_URL = 'http://test.server'
  mockedGetAuth.mockResolvedValue({ userId: 'user-123' } as any)
})

afterEach(() => {
  process.env = originalEnv
  vi.restoreAllMocks()
})

describe('feeds.action create', () => {
  it('posts createFeed with full payload and redirects', async () => {
    const formData = new FormData()
    formData.append('action', 'create')
    formData.append('name', 'My Feed')
    formData.append('description', 'desc')
    formData.append('sources', JSON.stringify(['s1','s2']))
    formData.append('topics', JSON.stringify(['t1']))
    formData.append('analysisIntensity', 'deep')

    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const $post = vi.fn().mockResolvedValue({ ok: true })
    mockedHc.mockReturnValue({ feeds: { createFeed: { $post } } } as any)

    const res = await feedsAction({ request } as any)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect($post).toHaveBeenCalledWith({
      json: expect.objectContaining({
        userId: 'user-123',
        name: 'My Feed',
        description: 'desc',
        sources: ['s1','s2'],
        topics: ['t1'],
        analysisSettings: { intensity: 'deep' },
      }),
    })
    expect((res as Response).status).toBe(302)
    expect((res as Response).headers.get('Location')).toBe('/dashboard/feeds')
  })

  it('returns 401 when unauthenticated', async () => {
    mockedGetAuth.mockResolvedValueOnce({ userId: null } as any)
    const formData = new FormData()
    formData.append('action', 'create')
    formData.append('name', 'My Feed')
    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const res = await feedsAction({ request } as any)
    expect((res as Response).status).toBe(401)
  })

  it('returns error when backend returns not ok', async () => {
    const formData = new FormData()
    formData.append('action', 'create')
    formData.append('name', 'My Feed')
    formData.append('sources', JSON.stringify(['s1']))
    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const $post = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Failed' }) })
    mockedHc.mockReturnValue({ feeds: { createFeed: { $post } } } as any)

    const res = (await feedsAction({ request } as any)) as Response
    expect(res.status).toBe(500)
  })
})

describe('feeds.action delete', () => {
  it('deletes a feed and redirects', async () => {
    const formData = new FormData()
    formData.append('action', 'delete')
    formData.append('feedId', 'feed-1')
    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const $delete = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    mockedHc.mockReturnValue({ feeds: { deleteFeed: { $delete } } } as any)

    const res = await feedsAction({ request } as any)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect($delete).toHaveBeenCalledWith({ query: { feedId: 'feed-1', userId: 'user-123' } })
    expect((res as Response).status).toBe(302)
    expect((res as Response).headers.get('Location')).toBe('/dashboard/feeds')
  })

  it('returns 400 when feedId is missing', async () => {
    const formData = new FormData()
    formData.append('action', 'delete')
    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const res = await feedsAction({ request } as any)
    expect((res as Response).status).toBe(400)
  })

  it('returns 401 when unauthenticated', async () => {
    mockedGetAuth.mockResolvedValueOnce({ userId: null } as any)
    const formData = new FormData()
    formData.append('action', 'delete')
    formData.append('feedId', 'feed-1')
    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const res = await feedsAction({ request } as any)
    expect((res as Response).status).toBe(401)
  })

  it('bubbles backend error and returns backend status', async () => {
    const formData = new FormData()
    formData.append('action', 'delete')
    formData.append('feedId', 'feed-404')
    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const $delete = vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({ message: 'not found' }) })
    mockedHc.mockReturnValue({ feeds: { deleteFeed: { $delete } } } as any)

    const res = (await feedsAction({ request } as any)) as Response
    expect(res.status).toBe(404)
  })
})
