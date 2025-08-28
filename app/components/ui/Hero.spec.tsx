import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Hero } from './Hero'

describe('Hero', () => {
  it('renders title', () => {
    render(<Hero title={<>My Title</>} />)
    expect(screen.getByRole('heading', { level: 1, name: /my title/i })).toBeInTheDocument()
  })

  it('conditionally renders subtitle when provided', () => {
    const { rerender } = render(<Hero title={<>My Title</>} />)
    expect(screen.queryByText(/my subtitle/i)).not.toBeInTheDocument()

    rerender(<Hero title={<>My Title</>} subtitle={<>My Subtitle</>} />)
    expect(screen.getByText(/my subtitle/i)).toBeInTheDocument()
  })

  it('conditionally renders children when provided', () => {
    const { rerender } = render(<Hero title={<>My Title</>} />)
    expect(screen.queryByRole('button', { name: /click me/i })).not.toBeInTheDocument()

    rerender(
      <Hero title={<>My Title</>}>
        <button>Click me</button>
      </Hero>
    )
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
})

