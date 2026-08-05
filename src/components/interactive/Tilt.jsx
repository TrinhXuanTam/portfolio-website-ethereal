import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 3D perspective tilt toward the cursor with a soft lift on hover. Applied to
 * the frosted glass service cards to give them a subtle sense of depth.
 *
 * The bounding rect is read once on enter (not on every move) and persistent
 * gsap.quickTo setters are reused, so a mousemove does no layout reflow and
 * spawns no new tween.
 */
export default function Tilt({ children, max = 8, lift = 10, className = '' }) {
  const ref = useRef(null)
  const rectRef = useRef(null)
  const setters = useRef(null)

  const ensureSetters = () => {
    if (!setters.current && ref.current) {
      const cfg = { duration: 0.6, ease: 'power2.out' }
      setters.current = {
        rx: gsap.quickTo(ref.current, 'rotateX', cfg),
        ry: gsap.quickTo(ref.current, 'rotateY', cfg),
        y: gsap.quickTo(ref.current, 'y', cfg),
      }
      gsap.set(ref.current, { transformPerspective: 900 })
    }
    return setters.current
  }

  const onEnter = useCallback((e) => {
    if (prefersReduced || !ref.current) return
    rectRef.current = ref.current.getBoundingClientRect()
    ensureSetters()
  }, [])

  const onMove = useCallback(
    (e) => {
      if (prefersReduced) return
      const rect = rectRef.current
      const s = setters.current
      if (!rect || !s) return
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      s.ry(px * max * 2)
      s.rx(-py * max * 2)
      s.y(-lift)
    },
    [max, lift]
  )

  const onLeave = useCallback(() => {
    if (!ref.current) return
    gsap.to(ref.current, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      duration: 1.1,
      ease: 'power3.out',
    })
  }, [])

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
