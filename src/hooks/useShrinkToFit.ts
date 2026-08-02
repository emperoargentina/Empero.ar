import { useLayoutEffect, useRef } from 'react'

interface ShrinkToFitOptions {
  /** Font size to start measuring from, in rem — should match the CSS default. */
  max?: number
  /**
   * Absolute floor, in rem — purely a runaway-loop safety net (e.g. a single
   * unbroken word that can't wrap). Kept low on purpose: the whole point is
   * that the title is always fully visible, never clipped, so this should
   * only ever bind on pathological content, not on real product names.
   */
  min?: number
  /** How much to shrink per iteration, in rem. */
  step?: number
}

// Shrinks an element's font-size (in small steps) until its content fits
// inside its own fixed-height box, instead of overflowing it — the whole
// title always ends up fully visible, just smaller. Used so that product
// titles of any length still fit a fixed-height card slot — every card ends
// up the same height instead of the longest title stretching its card
// taller than its siblings in the same grid row.
export function useShrinkToFit<T extends HTMLElement>(deps: unknown[], options?: ShrinkToFitOptions) {
  const ref = useRef<T>(null)
  const max = options?.max ?? 0.9
  const min = options?.min ?? 0.45
  const step = options?.step ?? 0.02

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const fit = () => {
      let fontSize = max
      el.style.fontSize = `${fontSize}rem`
      while (el.scrollHeight > el.clientHeight + 1 && fontSize > min) {
        fontSize = Math.round((fontSize - step) * 100) / 100
        el.style.fontSize = `${fontSize}rem`
      }
    }

    fit()

    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
