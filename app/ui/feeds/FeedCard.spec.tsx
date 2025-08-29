import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { FeedCard } from './FeedCard';
import type { FeedCardProps } from './FeedCard';

// Create a fetcher stub that we can control per test
let fetcherStub: any;

// Partially mock react-router to control useFetcher while keeping real Link
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useFetcher: vi.fn(() => fetcherStub),
  };
});

// Mock window.confirm
const mockConfirm = vi.spyOn(window, 'confirm');

describe('FeedCard', () => {
  const mockFeed: FeedCardProps['feed'] = {
    feedId: 'test-feed-123',
    name: 'Liberty News Feed',
    description: 'Curated libertarian news and analysis',
    sources: ['source1', 'source2', 'source3'],
    topics: ['freedom', 'economics', 'politics'],
    lastRefreshedAt: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    // Default fetcher state
    fetcherStub = {
      state: 'idle',
      submit: vi.fn(),
    };
    mockConfirm.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders feed name, description, topics as badges, sources count, and View Articles link', () => {
    render(
      <MemoryRouter>
        <FeedCard feed={mockFeed} />
      </MemoryRouter>
    );

    // Check feed name
    expect(screen.getByText('Liberty News Feed')).toBeInTheDocument();

    // Check description
    expect(screen.getByText('Curated libertarian news and analysis')).toBeInTheDocument();

    // Check topics as badges
    expect(screen.getByText('freedom')).toBeInTheDocument();
    expect(screen.getByText('economics')).toBeInTheDocument();
    expect(screen.getByText('politics')).toBeInTheDocument();

    // Check sources count
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();

    // Check View Articles link
    const viewArticlesLink = screen.getByRole('link', { name: /view articles/i });
    expect(viewArticlesLink).toBeInTheDocument();
    expect(viewArticlesLink).toHaveAttribute('href', '/dashboard/feeds/test-feed-123');
  });

  it('does not call fetcher.submit when delete is clicked but window.confirm returns false', () => {
    mockConfirm.mockReturnValue(false);

    render(
      <MemoryRouter>
        <FeedCard feed={mockFeed} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole('button', { name: /delete feed/i });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Liberty News Feed"? This action cannot be undone.'
    );
    expect(fetcherStub.submit).not.toHaveBeenCalled();
  });

  it('calls fetcher.submit with correct FormData when delete is clicked and window.confirm returns true', () => {
    mockConfirm.mockReturnValue(true);

    render(
      <MemoryRouter>
        <FeedCard feed={mockFeed} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole('button', { name: /delete feed/i });
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Liberty News Feed"? This action cannot be undone.'
    );
    expect(fetcherStub.submit).toHaveBeenCalledTimes(1);

    // Check that FormData was created with correct values
    const formDataCall = fetcherStub.submit.mock.calls[0][0];
    expect(formDataCall).toBeInstanceOf(FormData);
    expect(formDataCall.get('action')).toBe('delete');
    expect(formDataCall.get('feedId')).toBe('test-feed-123');

    // Check submit options
    const optionsCall = fetcherStub.submit.mock.calls[0][1];
    expect(optionsCall).toEqual({ method: 'post' });
  });

  it('shows loading state when fetcher.state is submitting', () => {
    fetcherStub = {
      state: 'submitting',
      submit: vi.fn(),
    };

    render(
      <MemoryRouter>
        <FeedCard feed={mockFeed} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole('button', { name: /delete feed/i });

    // Button should be disabled
    expect(deleteButton).toBeDisabled();

    // Button should have aria-busy
    expect(deleteButton).toHaveAttribute('aria-busy', 'true');

    // Should show "Deleting..." text for screen readers
    expect(screen.getByText('Deleting...')).toBeInTheDocument();

    // Should have spinner icon (ArrowPathIcon has specific classes)
    const spinner = deleteButton.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows loading state when fetcher.state is loading', () => {
    fetcherStub = {
      state: 'loading',
      submit: vi.fn(),
    };

    render(
      <MemoryRouter>
        <FeedCard feed={mockFeed} />
      </MemoryRouter>
    );

    const deleteButton = screen.getByRole('button', { name: /delete feed/i });

    // Button should be disabled
    expect(deleteButton).toBeDisabled();

    // Button should have aria-busy
    expect(deleteButton).toHaveAttribute('aria-busy', 'true');

    // Should show "Deleting..." text for screen readers
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('renders properly with minimal feed data', () => {
    const minimalFeed: FeedCardProps['feed'] = {
      feedId: 'minimal-feed',
      name: 'Minimal Feed',
    };

    render(
      <MemoryRouter>
        <FeedCard feed={minimalFeed} />
      </MemoryRouter>
    );

    // Check feed name
    expect(screen.getByText('Minimal Feed')).toBeInTheDocument();

    // Should show 0 for both Articles and Sources
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(2); // Articles: 0 and Sources: 0

    // Should show em dash for updated
    expect(screen.getByText('—')).toBeInTheDocument();

    // Topics section should not be rendered
    expect(screen.queryByText('freedom')).not.toBeInTheDocument();

    // Description should not be rendered
    expect(screen.queryByText('Curated libertarian news and analysis')).not.toBeInTheDocument();
  });
});
