import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 3D perspective tilt toward the cursor with a soft lift on hover. Applied to
 * the frosted glass service cards to give them a subtle sense of depth.
 */
export default function Tilt({ children, max = 8, lift = 10, className = '' }) {
  const ref = useRef(null)

  const onMove = useCallback(
    (e) => {
      if (prefersReduced || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      gsap.to(ref.current, {
        rotateY: px * max * 2,
        rotateX: -py * max * 2,
        y: -lift,
        duration: 0.6,
        ease: 'power2.out',
        transformPerspective: 900,
      })
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
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  )
}
