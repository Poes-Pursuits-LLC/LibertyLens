import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SourcesPage } from './SourcesPage'

vi.mock('react-router', async (orig) => {
  const actual = await (orig as any).default?.() ?? await import('react-router')
  return {
    ...actual,
    useActionData: vi.fn(() => undefined),
    useNavigation: vi.fn(() => ({ state: 'idle' })),
    useRevalidator: vi.fn(() => ({ state: 'idle', revalidate: vi.fn() })),
    useSubmit: vi.fn(() => vi.fn()),
  }
})

// Mock NewsSourceList to control selection externally
vi.mock('~/components/news-source', () => ({
  NewsSourceList: ({ onSelectionChange }: any) => (
    <div>
      <button onClick={() => onSelectionChange(['s1'])}>Mock Select One</button>
      <button onClick={() => onSelectionChange([])}>Mock Clear</button>
    </div>
  ),
  CustomRSSForm: () => <div>CustomRSSForm</div>,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

it('does not show Add to Feed button when nothing selected', () => {
  render(
    <SourcesPage
      {...({} as any)}
    />
  )

  expect(screen.queryByText('Add to Feed')).not.toBeInTheDocument()
})

it('shows Add to Feed button after selection', () => {
  render(<SourcesPage {...({ feeds: [], sources: [] } as any)} />)

  // click our mock select button
  fireEvent.click(screen.getByText('Mock Select One'))

  expect(screen.getByText('Add to Feed')).toBeInTheDocument()
})
