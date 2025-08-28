import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sourcesAction } from './sources.action'
import { hc } from 'hono/client'

vi.mock('hono/client', () => ({
  hc: vi.fn(),
}))
const mockedHc = vi.mocked(hc)

const originalEnv = { ...process.env }

function createActionArgs(form: Record<string, any>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(form)) {
    fd.append(k, v as any)
  }
  const request = new Request('http://localhost/dashboard/sources', { method: 'POST', body: fd })
  return { request, params: {} } as any
}

beforeEach(() => {
  process.env.SERVER_URL = 'http://test.server'
  vi.clearAllMocks()
})

afterEach(() => {
  process.env = { ...originalEnv }
})

it('addToFeed merges string[] sources and updates feed', async () => {
  const userId = 'u1'
  const feedId = 'f1'
  const selected = ['c', 'd']

  const getFeed = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ feed: { sources: ['a', 'b'] } }) })
  const updateFeed = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ feedId }) })
  mockedHc.mockReturnValue({
    feeds: {
      getFeed: { $get: getFeed },
      updateFeed: { $post: updateFeed },
    },
  } as any)

  const res = await sourcesAction(
    createActionArgs({ action: 'addToFeed', userId, feedId, selectedSourceIds: JSON.stringify(selected) })
  )

  expect(mockedHc).toHaveBeenCalledWith(process.env.SERVER_URL)
  expect(getFeed).toHaveBeenCalledWith({ query: { feedId, userId } })
  expect(updateFeed).toHaveBeenCalled()
  const callArgs = updateFeed.mock.calls[0][0]
  expect(callArgs.json.updateFields.sources).toEqual(['a', 'b', 'c', 'd'])
  expect(res).toEqual({ success: true })
})

it('addToFeed merges object-shaped sources', async () => {
  const userId = 'u1'
  const feedId = 'f1'
  const selected = ['b']

  const getFeed = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ feed: { sources: [{ sourceId: 'a' }] } }) })
  const updateFeed = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ feedId }) })
  mockedHc.mockReturnValue({
    feeds: {
      getFeed: { $get: getFeed },
      updateFeed: { $post: updateFeed },
    },
  } as any)

  const res = await sourcesAction(
    createActionArgs({ action: 'addToFeed', userId, feedId, selectedSourceIds: JSON.stringify(selected) })
  )

  const callArgs = updateFeed.mock.calls[0][0]
  expect(callArgs.json.updateFields.sources).toEqual(['a', 'b'])
  expect(res).toEqual({ success: true })
})

it('addToFeed returns error when getFeed fails', async () => {
  const userId = 'u1'
  const feedId = 'f1'

  const getFeed = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
  mockedHc.mockReturnValue({ feeds: { getFeed: { $get: getFeed } } } as any)

  const res = await sourcesAction(
    createActionArgs({ action: 'addToFeed', userId, feedId, selectedSourceIds: JSON.stringify(['x']) })
  )
  expect(res).toEqual({ error: 'Failed to fetch feed' })
})

it('addToFeed returns error when updateFeed fails', async () => {
  const userId = 'u1'
  const feedId = 'f1'

  const getFeed = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ feed: { sources: [] } }) })
  const updateFeed = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'boom' }) })
  mockedHc.mockReturnValue({
    feeds: {
      getFeed: { $get: getFeed },
      updateFeed: { $post: updateFeed },
    },
  } as any)

  const res = await sourcesAction(
    createActionArgs({ action: 'addToFeed', userId, feedId, selectedSourceIds: JSON.stringify(['x']) })
  )
  expect(res).toEqual({ error: 'boom' })
})

it('createFeedFromSources success returns feedId', async () => {
  const userId = 'u1'
  const name = 'My Feed'
  const createFeed = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ feedId: 'new-feed' }) })
  mockedHc.mockReturnValue({
    feeds: {
      createFeed: { $post: createFeed },
    },
  } as any)

  const res = await sourcesAction(
    createActionArgs({ action: 'createFeedFromSources', userId, name, description: '', selectedSourceIds: JSON.stringify(['a']) })
  )

  expect(createFeed).toHaveBeenCalled()
  expect(res).toEqual({ success: true, feedId: 'new-feed' })
})

it('createFeedFromSources returns error on failure', async () => {
  const userId = 'u1'
  const name = 'My Feed'
  const createFeed = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'nope' }) })
  mockedHc.mockReturnValue({
    feeds: {
      createFeed: { $post: createFeed },
    },
  } as any)

  const res = await sourcesAction(
    createActionArgs({ action: 'createFeedFromSources', userId, name, description: '', selectedSourceIds: JSON.stringify(['a']) })
  )

  expect(res).toEqual({ error: 'nope' })
})
