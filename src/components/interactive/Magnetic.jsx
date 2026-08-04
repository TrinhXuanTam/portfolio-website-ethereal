import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Wraps a child so it drifts toward the cursor while hovered, then springs
 * back on leave. Purely transform-based, so it composes with hover scaling.
 */
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)

  const onMove = useCallback(
    (e) => {
      if (prefersReduced || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      gsap.to(ref.current, {
        x: relX * strength,
        y: relY * strength,
        duration: 0.9,
        ease: 'power3.out',
      })
    },
    [strength]
  )

  const onLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.4)' })
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
