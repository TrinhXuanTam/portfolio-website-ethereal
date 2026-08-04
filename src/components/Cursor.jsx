import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A soft trailing dot that swells and shows a label over [data-cursor] targets.
// Disabled on touch / reduced-motion so it never gets in the way.
export default function Cursor() {
  const dot = useRef(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (prefersReduced) return
    if (window.matchMedia('(hover: none)').matches) return

    const el = dot.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e) => {
      xTo(e.clientX)
      yTo(e.clientY)
      const target = e.target.closest('[data-cursor]')
      setLabel(target ? target.getAttribute('data-cursor') : '')
    }

    document.body.style.cursor = 'none'
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.body.style.cursor = ''
    }
  }, [])

  if (prefersReduced) return null

  return (
    <div
      ref={dot}
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden -translate-x-1/2 -translate-y-1/2 sm:block"
      aria-hidden="true"
    >
      <div
        className={
          'flex items-center justify-center rounded-full text-[0.6rem] uppercase tracking-widest text-graphite transition-all duration-300 ease-ethereal ' +
          (label
            ? 'h-16 w-16 bg-white/70 backdrop-blur-md'
            : 'h-2.5 w-2.5 bg-graphite/60')
        }
      >
        {label}
      </div>
    </div>
  )
}
