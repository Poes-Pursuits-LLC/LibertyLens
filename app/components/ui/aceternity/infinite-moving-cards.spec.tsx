import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { InfiniteMovingCards } from './infinite-moving-cards'

const items = [
  { quote: 'Quote 1', name: 'Alice', title: 'Engineer' },
  { quote: 'Quote 2', name: 'Bob', title: 'Designer' },
]

describe('InfiniteMovingCards', () => {
  it('renders items and duplicates them for infinite scroll', async () => {
    render(<InfiniteMovingCards items={items} />)

    // After effect it duplicates items so there should be twice as many list items
    await waitFor(() => {
      const lis = screen.getAllByRole('listitem')
      expect(lis.length).toBe(items.length * 2)
    })

    // Quotes and names should appear (duplicated)
    expect(screen.getAllByText('Quote 1').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Quote 2').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Bob').length).toBeGreaterThanOrEqual(2)
  })

  it('applies animation class after initialization', async () => {
    render(<InfiniteMovingCards items={items} />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      expect(list.className).toContain('animate-scroll')
    })
  })

  it('respects pauseOnHover prop', async () => {
    const { rerender } = render(<InfiniteMovingCards items={items} pauseOnHover />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      expect(list.className).toContain('hover:[animation-play-state:paused]')
    })

    rerender(<InfiniteMovingCards items={items} pauseOnHover={false} />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      expect(list.className).not.toContain('hover:[animation-play-state:paused]')
    })
  })

  it('sets animation direction to forwards when direction="left"', async () => {
    render(<InfiniteMovingCards items={items} direction="left" />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      const container = list.parentElement as HTMLElement
      expect(container.style.getPropertyValue('--animation-direction')).toBe('forwards')
    })
  })

  it('sets animation direction to reverse when direction="right"', async () => {
    render(<InfiniteMovingCards items={items} direction="right" />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      const container = list.parentElement as HTMLElement
      expect(container.style.getPropertyValue('--animation-direction')).toBe('reverse')
    })
  })

  it('sets animation duration when speed="fast"', async () => {
    render(<InfiniteMovingCards items={items} speed="fast" />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      const container = list.parentElement as HTMLElement
      expect(container.style.getPropertyValue('--animation-duration')).toBe('20s')
    })
  })

  it('sets animation duration when speed="normal"', async () => {
    render(<InfiniteMovingCards items={items} speed="normal" />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      const container = list.parentElement as HTMLElement
      expect(container.style.getPropertyValue('--animation-duration')).toBe('40s')
    })
  })

  it('sets animation duration when speed="slow"', async () => {
    render(<InfiniteMovingCards items={items} speed="slow" />)

    await waitFor(() => {
      const list = screen.getByRole('list')
      const container = list.parentElement as HTMLElement
      expect(container.style.getPropertyValue('--animation-duration')).toBe('80s')
    })
  })
})

