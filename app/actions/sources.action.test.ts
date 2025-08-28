/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { sourcesAction } from '~/actions/sources.action'
import { hc } from 'hono/client'

vi.mock('hono/client', () => ({
  hc: vi.fn(),
}))
const mockedHc = vi.mocked(hc)

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env.SERVER_URL = 'http://test.server'
})

afterEach(() => {
  process.env = originalEnv
  vi.restoreAllMocks()
})

describe('sources.action create', () => {
  it('creates a news source successfully', async () => {
    const formData = new FormData()
    formData.append('action', 'create')
    formData.append('name', 'Reason')
    formData.append('description', 'desc')
    formData.append('url', 'https://example.com/rss')
    formData.append('type', 'rss')
    formData.append('category', 'tech')
    formData.append('logoUrl', 'https://example.com/logo.png')
    formData.append('headers', JSON.stringify({ Authorization: 'Bearer X' }))
    formData.append('apiKey', 'abc')
    formData.append('rateLimit', '5')
    formData.append('selector', '.item')
    formData.append('tags', JSON.stringify(['a','b']))

    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const $post = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'sourceId' }) })
    mockedHc.mockReturnValue({ sources: { $post } } as any)

    const result = await sourcesAction({ request } as any)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect($post).toHaveBeenCalledWith({ json: expect.objectContaining({ name: 'Reason', url: 'https://example.com/rss' }) })
    expect(result).toEqual({ success: true, data: { id: 'sourceId' } })
  })

  it('returns server error message when response not ok', async () => {
    const formData = new FormData()
    formData.append('action', 'create')
    formData.append('name', 'Reason')
    formData.append('url', 'https://example.com/rss')
    formData.append('type', 'rss')
    formData.append('category', 'tech')

    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const $post = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Failed to create news source' }) })
    mockedHc.mockReturnValue({ sources: { $post } } as any)

    const result = await sourcesAction({ request } as any)
    expect(result).toEqual({ error: 'Failed to create news source' })
  })

  it('returns error when call throws', async () => {
    const formData = new FormData()
    formData.append('action', 'create')
    formData.append('name', 'Reason')
    formData.append('url', 'https://example.com/rss')
    formData.append('type', 'rss')
    formData.append('category', 'tech')

    const request = new Request('http://localhost', { method: 'POST', body: formData })

    const $post = vi.fn().mockRejectedValue(new Error('Network error'))
    mockedHc.mockReturnValue({ sources: { $post } } as any)

    const result = await sourcesAction({ request } as any)
    expect(result).toEqual({ error: 'Network error' })
  })
})
