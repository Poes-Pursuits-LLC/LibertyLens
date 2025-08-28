import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CustomRSSForm } from './CustomRSSForm'

describe('CustomRSSForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful RSS test by default with the shape the component expects
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isValid: true,
        message: 'Feed validated',
        feedInfo: { itemCount: 0, title: 'Example Feed', description: 'Desc' },
      }),
    })
  })

  it('renders form fields correctly', () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText('Feed Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Feed URL')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
    expect(screen.getByText('Test Feed')).toBeInTheDocument()
    expect(screen.getByText('Add Feed')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByText('Add Feed')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Feed name is required')).toBeInTheDocument()
      expect(screen.getByText('Feed URL is required')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates URL format', async () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText('Feed Name')
    const urlInput = screen.getByLabelText('Feed URL')

    fireEvent.change(nameInput, { target: { value: 'Test Feed' } })
    fireEvent.change(urlInput, { target: { value: 'not-a-url' } })

    const submitButton = screen.getByText('Add Feed')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('tests feed URL before submission', async () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const urlInput = screen.getByLabelText('Feed URL')
    fireEvent.change(urlInput, { target: { value: 'https://example.com/feed.xml' } })

    const testButton = screen.getByText('Test Feed')
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(screen.getByText('Testing feed...')).toBeInTheDocument()
    })

    // Simulate successful test - success message includes item count, so match substring
    const successEl = await screen.findByText(/Feed is valid!/i)
    expect(successEl).toBeInTheDocument()
  })

  it('shows error for invalid feed URL', async () => {
    // Mock failed feed test
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Failed to fetch'))

    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const urlInput = screen.getByLabelText('Feed URL')
    fireEvent.change(urlInput, { target: { value: 'https://invalid-feed.com/feed' } })

    const testButton = screen.getByText('Test Feed')
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to validate feed. Please check the URL.')).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText('Feed Name')
    const urlInput = screen.getByLabelText('Feed URL')
    const descriptionInput = screen.getByLabelText('Description')
    const categorySelect = screen.getByLabelText('Category')
    const tagsInput = screen.getByLabelText('Tags')

    fireEvent.change(nameInput, { target: { value: 'My Custom Feed' } })
    fireEvent.change(urlInput, { target: { value: 'https://mycustomfeed.com/rss' } })
    fireEvent.change(descriptionInput, { target: { value: 'A great news source' } })
    fireEvent.change(categorySelect, { target: { value: 'alternative' } })
    fireEvent.change(tagsInput, { target: { value: 'news, independent, analysis' } })

    const submitButton = screen.getByText('Add Feed')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'My Custom Feed',
        url: 'https://mycustomfeed.com/rss',
        description: 'A great news source',
        type: 'rss',
        category: 'alternative',
        tags: ['news', 'independent', 'analysis']
      })
    })
  })

  it('disables submit button during submission', async () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    )

    const submitButton = screen.getByText('Adding...')
    expect(submitButton).toBeDisabled()
  })

  it('calls onCancel when cancel button clicked', () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('handles tag input correctly', async () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const tagsInput = screen.getByLabelText('Tags')
    fireEvent.change(tagsInput, { target: { value: 'tag1,  tag2  , tag3' } })

    const nameInput = screen.getByLabelText('Feed Name')
    const urlInput = screen.getByLabelText('Feed URL')
    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.change(urlInput, { target: { value: 'https://test.com/feed' } })

    const submitButton = screen.getByText('Add Feed')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['tag1', 'tag2', 'tag3'] // Trimmed and split
        })
      )
    })
  })

  it('limits feed name length', () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText('Feed Name') as HTMLInputElement
    expect(nameInput).toHaveAttribute('maxLength', '100')
  })

  it('limits description length', () => {
    render(
      <CustomRSSForm 
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const descriptionInput = screen.getByLabelText('Description') as HTMLTextAreaElement
    expect(descriptionInput).toHaveAttribute('maxLength', '500')
  })
})
