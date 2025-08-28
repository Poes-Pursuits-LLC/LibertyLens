/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { dashboardLayoutLoader } from '~/loaders/dashboard-layout.loader'
import { getAuth } from '@clerk/react-router/ssr.server'
import { createClerkClient } from '@clerk/backend'
import { hc } from 'hono/client'

vi.mock('@clerk/react-router/ssr.server', () => ({
  getAuth: vi.fn(),
}))
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(),
}))
vi.mock('hono/client', () => ({
  hc: vi.fn(),
}))

const mockedGetAuth = vi.mocked(getAuth)
const mockedCreateClerkClient = vi.mocked(createClerkClient)
const mockedHc = vi.mocked(hc)

const originalEnv = { ...process.env }

beforeEach(() => {
  process.env.SERVER_URL = 'http://test.server'
  process.env.CLERK_SECRET_KEY = 'sk_test'
})

afterEach(() => {
  process.env = originalEnv
  vi.restoreAllMocks()
})

describe('dashboardLayoutLoader', () => {
  it('redirects to /login when unauthenticated', async () => {
    mockedGetAuth.mockResolvedValue({ userId: null } as any)

    const res = await dashboardLayoutLoader({ request: new Request('http://localhost/dashboard') } as any)

    expect(res instanceof Response).toBe(true)
    const response = res as Response
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/login')
  })

  it('loads user data and stats', async () => {
    mockedGetAuth.mockResolvedValue({ userId: 'user-1', has: vi.fn().mockReturnValue(true) } as any)

    const users = { getUser: vi.fn().mockResolvedValue({
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      imageUrl: 'http://img',
      privateMetadata: { freeFeedLimit: 5, currentFeedCount: 2 },
    }) }
    mockedCreateClerkClient.mockReturnValue({ users } as any)

    const $get = vi.fn().mockResolvedValue({ json: async () => ({ activeFeedCount: 1, analyzedArticlesCount: 2, sourcesFollowingCount: 3, timeSaved: 4 }) })
    mockedHc.mockReturnValue({ analytics: { $get } } as any)

    const result: any = await dashboardLayoutLoader({ request: new Request('http://localhost/dashboard') } as any)

    expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
    expect(users.getUser).toHaveBeenCalledWith('user-1')
    expect(result.userId).toBe('user-1')
    expect(result.isSubscriber).toBe(true)
    expect(result.freeFeedLimit).toBe(5)
    expect(result.currentFeedCount).toBe(2)
    expect(result.user.email).toBe('john@example.com')
  })

  it('redirects to /login on error', async () => {
    mockedGetAuth.mockRejectedValue(new Error('auth boom'))

    const res = await dashboardLayoutLoader({ request: new Request('http://localhost/dashboard') } as any)

    expect(res instanceof Response).toBe(true)
    expect((res as Response).headers.get('Location')).toBe('/login')
  })
})
