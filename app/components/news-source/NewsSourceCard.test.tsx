import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NewsSourceCard } from './NewsSourceCard'
import type { NewsSource } from '~/core/news-source'

describe('NewsSourceCard', () => {
  const mockSource: NewsSource = {
    sourceId: 'test-source-1',
    name: 'Test News Source',
    description: 'A test news source',
    url: 'https://test.com/rss',
    type: 'rss',
    category: 'libertarian',
    logoUrl: 'https://test.com/logo.png',
    isActive: true,
    isPublic: true,
    fetchConfig: {},
    reliability: {
      score: 95,
      failureCount: 0
    },
    tags: ['test', 'libertarian'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    entityType: 'news-source'
  }

  const mockOnToggle = vi.fn()

  it('renders news source information correctly', () => {
    render(
      <NewsSourceCard 
        source={mockSource} 
        isSelected={false} 
        onToggle={mockOnToggle} 
      />
    )

    expect(screen.getByText('Test News Source')).toBeInTheDocument()
    expect(screen.getByText('A test news source')).toBeInTheDocument()
    // Check category badge
    const categoryBadge = screen.getByText('libertarian', { selector: '.bg-purple-100' })
    expect(categoryBadge).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument() // reliability score
  })

  it('shows selected state correctly', () => {
    render(
      <NewsSourceCard 
        source={mockSource} 
        isSelected={true} 
        onToggle={mockOnToggle} 
      />
    )

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('calls onToggle when clicked', () => {
    render(
      <NewsSourceCard 
        source={mockSource} 
        isSelected={false} 
        onToggle={mockOnToggle} 
      />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockOnToggle).toHaveBeenCalledWith(mockSource.sourceId, true)
  })

  it('displays logo when available', () => {
    render(
      <NewsSourceCard 
        source={mockSource} 
        isSelected={false} 
        onToggle={mockOnToggle} 
      />
    )

    const logo = screen.getByAltText('Test News Source logo')
    expect(logo).toHaveAttribute('src', 'https://test.com/logo.png')
  })

  it('shows fallback when no logo', () => {
    const sourceWithoutLogo = { ...mockSource, logoUrl: undefined }
    render(
      <NewsSourceCard 
        source={sourceWithoutLogo} 
        isSelected={false} 
        onToggle={mockOnToggle} 
      />
    )

    expect(screen.getByText('TN')).toBeInTheDocument() // Initials
  })

  it('indicates low reliability with warning', () => {
    const lowReliabilitySource = {
      ...mockSource,
      reliability: { score: 45, failureCount: 5 }
    }
    render(
      <NewsSourceCard 
        source={lowReliabilitySource} 
        isSelected={false} 
        onToggle={mockOnToggle} 
      />
    )

    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('45%')).toHaveClass('text-red-600')
  })

  it('shows disabled state for inactive sources', () => {
    const inactiveSource = { ...mockSource, isActive: false }
    render(
      <NewsSourceCard 
        source={inactiveSource} 
        isSelected={false} 
        onToggle={mockOnToggle} 
        disabled={true}
      />
    )

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.disabled).toBe(true)
  })

  it('displays tags correctly', () => {
    render(
      <NewsSourceCard 
        source={mockSource} 
        isSelected={false} 
        onToggle={mockOnToggle} 
      />
    )

    expect(screen.getByText('test')).toBeInTheDocument()
    // libertarian appears as both category and tag
    const libertarianElements = screen.getAllByText('libertarian')
    expect(libertarianElements).toHaveLength(2)
  })
})
