/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { feedsNewLoader } from '~/loaders/feeds-new.loader'
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

describe('feeds-new.loader', () => {
  it('loads sources for the user', async () => {
    const $get = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ sources: [{ sourceId: 's1', name: 'Reason' }], count: 1, categories: ['libertarian'] }),
    })
    mockedHc.mockReturnValue({ sources: { $get } } as any)

    const args = { request: new Request('http://localhost/dashboard/feeds/new') } as any
    const result = await feedsNewLoader(args)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect($get).toHaveBeenCalledWith({ query: { userId: 'user-1' } })
    expect(result).toEqual({ sources: [{ sourceId: 's1', name: 'Reason' }], count: 1, categories: ['libertarian'] })
  })

  it('handles invalid JSON gracefully', async () => {
    const $get = vi.fn().mockResolvedValue({ text: async () => 'INVALID' })
    mockedHc.mockReturnValue({ sources: { $get } } as any)

    const args = { request: new Request('http://localhost/dashboard/feeds/new') } as any
    const result = await feedsNewLoader(args)

    expect(result).toEqual({ sources: [], categories: [], count: 0 })
  })

  it('returns defaults when no userId', async () => {
    mockedGetAuth.mockResolvedValueOnce({ userId: null } as any)
    const args = { request: new Request('http://localhost/dashboard/feeds/new') } as any
    const result = await feedsNewLoader(args)
    expect(result).toEqual({ sources: [], categories: [], count: 0 })
  })
})
