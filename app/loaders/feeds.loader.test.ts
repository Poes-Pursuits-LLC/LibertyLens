/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { feedsLoader } from '~/loaders/feeds.loader'
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

describe('feeds.loader', () => {
  it('loads feeds for the user', async () => {
    const $get = vi.fn().mockResolvedValue({
      text: async () => JSON.stringify({ feeds: [{ feedId: 'f1' }], count: 1 }),
    })
    mockedHc.mockReturnValue({ feeds: { getUserFeeds: { $get } } } as any)

    const args = { request: new Request('http://localhost/dashboard/feeds') } as any
    const result = await feedsLoader(args)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect($get).toHaveBeenCalledWith({ query: { userId: 'user-1' } })
    expect(result).toEqual({ feeds: [{ feedId: 'f1' }], count: 1 })
  })

  it('returns defaults when parsing fails', async () => {
    const $get = vi.fn().mockResolvedValue({ text: async () => 'INVALID' })
    mockedHc.mockReturnValue({ feeds: { getUserFeeds: { $get } } } as any)

    const args = { request: new Request('http://localhost/dashboard/feeds') } as any
    const result = await feedsLoader(args)

    expect(result).toEqual({ feeds: [], count: 0 })
  })

  it('returns defaults on error with message', async () => {
    const $get = vi.fn().mockRejectedValue(new Error('boom'))
    mockedHc.mockReturnValue({ feeds: { getUserFeeds: { $get } } } as any)

    const args = { request: new Request('http://localhost/dashboard/feeds') } as any
    const result: any = await feedsLoader(args)

    expect(result.feeds).toEqual([])
    expect(result.count).toBe(0)
    expect(result.error).toBe('boom')
  })

  it('returns defaults when no userId', async () => {
    mockedGetAuth.mockResolvedValueOnce({ userId: null } as any)
    const args = { request: new Request('http://localhost/dashboard/feeds') } as any
    const result = await feedsLoader(args)
    expect(result).toEqual({ feeds: [], count: 0 })
  })
})
