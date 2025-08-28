import { useEffect, useRef } from "react"

/**
 * Minimal spotlight background effect.
 * - Follows pointer to subtly shift a radial gradient mask
 * - Honors prefers-reduced-motion: static position, no listeners
 * - Pure CSS variables, no external deps
 * - Intended for single use on the landing hero
 */
export function Spotlight({
  className = "",
  color = "oklch(70% 0.16 263 / 0.45)",
  blurPx = 160,
  staticPosition = { x: "50%", y: "30%" },
}: {
  className?: string
  color?: string
  blurPx?: number
  staticPosition?: { x: string; y: string }
}) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mm = typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null
    const reduce = mm?.matches ?? false

    const el = ref.current
    if (!el || reduce) {
      if (el) {
        el.style.setProperty("--spot-x", staticPosition.x)
        el.style.setProperty("--spot-y", staticPosition.y)
      }
      return
    }

    let raf = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = `${e.clientX - rect.left}px`
        const y = `${e.clientY - rect.top}px`
        el.style.setProperty("--spot-x", x)
        el.style.setProperty("--spot-y", y)
      })
    }

    el.addEventListener("pointermove", onMove, { passive: true })
    el.style.setProperty("--spot-x", staticPosition.x)
    el.style.setProperty("--spot-y", staticPosition.y)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", onMove)
    }
  }, [staticPosition.x, staticPosition.y])

  return (
    <div
      ref={ref}
      data-testid="aceternity-spotlight"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 [--spot-x:50%] [--spot-y:30%] ${className}`}
      style={{
        ["--spot-color" as any]: color,
        ["--spot-blur" as any]: `${blurPx}px`,
      }}
    >
      <div className="size-full [mask-image:radial-gradient(240px_240px_at_var(--spot-x)_var(--spot-y),#000_0%,transparent_70%)]">
        <div className="size-full blur-[var(--spot-blur)] bg-[radial-gradient(closest-side,var(--spot-color),transparent_70%)]" />
      </div>
    </div>
  )
}

