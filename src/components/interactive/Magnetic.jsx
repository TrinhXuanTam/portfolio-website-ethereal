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
  const rectRef = useRef(null)
  const setters = useRef(null)

  const onEnter = useCallback(() => {
    if (prefersReduced || !ref.current) return
    rectRef.current = ref.current.getBoundingClientRect()
    if (!setters.current) {
      const cfg = { duration: 0.9, ease: 'power3.out' }
      setters.current = {
        x: gsap.quickTo(ref.current, 'x', cfg),
        y: gsap.quickTo(ref.current, 'y', cfg),
      }
    }
  }, [])

  const onMove = useCallback(
    (e) => {
      if (prefersReduced) return
      const rect = rectRef.current
      const s = setters.current
      if (!rect || !s) return
      s.x((e.clientX - (rect.left + rect.width / 2)) * strength)
      s.y((e.clientY - (rect.top + rect.height / 2)) * strength)
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
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
