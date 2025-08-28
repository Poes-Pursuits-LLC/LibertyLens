import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddToFeedModal } from './AddToFeedModal'

vi.mock('react-router', async (orig) => {
  const actual = await (orig as any).default?.() ?? await import('react-router')
  return {
    ...actual,
    useFetcher: vi.fn(() => ({ state: 'idle', data: {}, submit: vi.fn() })),
  }
})

const feeds = [
  { id: 'f1', name: 'Feed One' },
  { id: 'f2', name: 'Feed Two' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

it('renders existing feeds and enables Add to Existing once selected', () => {
  const onClose = vi.fn()
  const onSuccess = vi.fn()

  render(
    <AddToFeedModal
      open
      onClose={onClose}
      onSuccess={onSuccess}
      feeds={feeds}
      selectedSourceIds={['s1', 's2']}
      userId="u1"
    />
  )

  // radios present
  expect(screen.getByText('Feed One')).toBeInTheDocument()
  expect(screen.getByText('Feed Two')).toBeInTheDocument()

  const btn = screen.getByRole('button', { name: /Add to Existing Feed/i }) as HTMLButtonElement
  expect(btn.disabled).toBe(true)

  // select a feed
  fireEvent.click(screen.getByLabelText(/Feed One/i))

  expect(btn.disabled).toBe(false)
})

it('switches to Create New and prefills name', () => {
  render(
    <AddToFeedModal
      open
      onClose={vi.fn()}
      onSuccess={vi.fn()}
      feeds={feeds}
      selectedSourceIds={['s1', 's2']}
      userId="u1"
    />
  )

  fireEvent.click(screen.getByRole('button', { name: /Create New/i }))

  const nameInput = screen.getByLabelText(/Feed Name/i) as HTMLInputElement
  expect(nameInput.value).toMatch(/New feed \(2 sources\)/)

  const createBtn = screen.getByRole('button', { name: /Create Feed/i }) as HTMLButtonElement
  expect(createBtn.disabled).toBe(false)
})

it('calls onClose when Cancel clicked', () => {
  const onClose = vi.fn()
  render(
    <AddToFeedModal
      open
      onClose={onClose}
      onSuccess={vi.fn()}
      feeds={[]}
      selectedSourceIds={['s1']}
      userId="u1"
    />
  )

  fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
  expect(onClose).toHaveBeenCalled()
})
