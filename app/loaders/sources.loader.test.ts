/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { sourcesLoader } from '~/loaders/sources.loader'
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

beforeEach(() => {
  process.env.SERVER_URL = 'http://test.server'
  mockedGetAuth.mockResolvedValue({ userId: 'user-1' } as any)
})

afterEach(() => {
  process.env = originalEnv
  vi.restoreAllMocks()
})

describe('sources.loader', () => {
  it('loads sources without category', async () => {
    const $get = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ sources: [{ id: '1' }], count: 1, categories: ['general'] }),
    })
    mockedHc.mockReturnValue({ sources: { $get } } as any)

    const args = { request: new Request('http://localhost/dashboard/sources') } as any
    const result = await sourcesLoader(args)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect($get).toHaveBeenCalledWith({ query: { userId: 'user-1', category: undefined } })
    expect(result).toEqual({ sources: [{ id: '1' }], count: 1, categories: ['general'] })
  })

  it('loads sources with category', async () => {
    const $get = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify({ sources: [], count: 0, categories: [] }),
    })
    mockedHc.mockReturnValue({ sources: { $get } } as any)
    const args = { request: new Request('http://localhost/dashboard/sources?category=tech') } as any
    await sourcesLoader(args)
    expect($get).toHaveBeenCalledWith({ query: { userId: 'user-1', category: 'tech' } })
  })

  it('handles invalid JSON gracefully', async () => {
    const $get = vi.fn().mockResolvedValue({
      status: 200,
      headers: new Headers(),
      text: async () => 'INVALID',
    })
    mockedHc.mockReturnValue({ sources: { $get } } as any)

    const args = { request: new Request('http://localhost/dashboard/sources') } as any
    const result = await sourcesLoader(args)

    expect(result).toEqual({ sources: [], count: 0, categories: [] })
  })

  it('handles error case', async () => {
    const $get = vi.fn().mockRejectedValue(new Error('boom'))
    mockedHc.mockReturnValue({ sources: { $get } } as any)

    const args = { request: new Request('http://localhost/dashboard/sources') } as any
    const result = await sourcesLoader(args)

    expect(result).toEqual({ sources: [], count: 0, categories: [], error: 'boom' })
  })
})
