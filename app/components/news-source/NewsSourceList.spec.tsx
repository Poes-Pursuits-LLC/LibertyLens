import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewsSourceList } from './NewsSourceList'
import type { NewsSource } from '~/core/news-source'

describe('NewsSourceList', () => {
  const mockSources: NewsSource[] = [
    {
      sourceId: 'source-1',
      name: 'Reason Magazine',
      description: 'Free minds and free markets',
      url: 'https://reason.com/feed',
      type: 'rss',
      category: 'libertarian',
      isActive: true,
      isPublic: true,
      fetchConfig: {},
      reliability: { score: 95, failureCount: 0 },
      tags: ['libertarian', 'politics'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      entityType: 'news-source'
    },
    {
      sourceId: 'source-2',
      name: 'Reuters',
      description: 'International news',
      url: 'https://reuters.com/feed',
      type: 'rss',
      category: 'mainstream',
      isActive: true,
      isPublic: true,
      fetchConfig: {},
      reliability: { score: 98, failureCount: 0 },
      tags: ['news', 'international'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      entityType: 'news-source'
    },
    {
      sourceId: 'source-3',
      name: 'Zero Hedge',
      description: 'Financial news',
      url: 'https://zerohedge.com/feed',
      type: 'rss',
      category: 'financial',
      isActive: true,
      isPublic: true,
      fetchConfig: {},
      reliability: { score: 85, failureCount: 2 },
      tags: ['finance', 'alternative'],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      entityType: 'news-source'
    }
  ]

  const mockOnSelectionChange = vi.fn()

  it('renders all news sources', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('Reason Magazine')).toBeInTheDocument()
    expect(screen.getByText('Reuters')).toBeInTheDocument()
    expect(screen.getByText('Zero Hedge')).toBeInTheDocument()
  })

  it('filters sources by search term', async () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search news sources...')
    fireEvent.change(searchInput, { target: { value: 'reason' } })

    await waitFor(() => {
      expect(screen.getByText('Reason Magazine')).toBeInTheDocument()
      expect(screen.queryByText('Reuters')).not.toBeInTheDocument()
      expect(screen.queryByText('Zero Hedge')).not.toBeInTheDocument()
    })
  })

  it('filters sources by category', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const categoryFilter = screen.getByRole('combobox', { name: /category/i })
    fireEvent.change(categoryFilter, { target: { value: 'libertarian' } })

    expect(screen.getByText('Reason Magazine')).toBeInTheDocument()
    expect(screen.queryByText('Reuters')).not.toBeInTheDocument()
    expect(screen.queryByText('Zero Hedge')).not.toBeInTheDocument()
  })

  it('shows selected sources correctly', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={['source-1', 'source-3']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
    expect(checkboxes[0].checked).toBe(true) // Reason Magazine
    expect(checkboxes[1].checked).toBe(false) // Reuters
    expect(checkboxes[2].checked).toBe(true) // Zero Hedge
  })

  it('calls onSelectionChange when source is toggled', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={['source-1']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const reutersCheckbox = screen.getAllByRole('checkbox')[1]
    fireEvent.click(reutersCheckbox)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['source-1', 'source-2'])
  })

  it('removes source from selection when unchecked', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={['source-1', 'source-2']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const reasonCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(reasonCheckbox)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['source-2'])
  })

  it('displays category counts', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    expect(screen.getByText('All (3)')).toBeInTheDocument()
    expect(screen.getByText('Libertarian (1)')).toBeInTheDocument()
    expect(screen.getByText('Mainstream (1)')).toBeInTheDocument()
    expect(screen.getByText('Financial (1)')).toBeInTheDocument()
  })

  it('shows empty state when no sources match filters', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const searchInput = screen.getByPlaceholderText('Search news sources...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No news sources found matching your filters.')).toBeInTheDocument()
  })

  it('handles select all functionality', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const selectAllButton = screen.getByText('Select All')
    fireEvent.click(selectAllButton)

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['source-1', 'source-2', 'source-3'])
  })

  it('handles clear all functionality', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={['source-1', 'source-2', 'source-3']}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const clearAllButton = screen.getByText('Clear All')
    fireEvent.click(clearAllButton)

    expect(mockOnSelectionChange).toHaveBeenCalledWith([])
  })

  it('sorts sources by reliability score', () => {
    render(
      <NewsSourceList 
        sources={mockSources}
        selectedSourceIds={[]}
        onSelectionChange={mockOnSelectionChange}
      />
    )

    const sortSelect = screen.getByRole('combobox', { name: /sort/i })
    fireEvent.change(sortSelect, { target: { value: 'reliability' } })

    const sourceNames = screen.getAllByTestId('source-name').map(el => el.textContent)
    expect(sourceNames).toEqual(['Reuters', 'Reason Magazine', 'Zero Hedge'])
  })
})
