import { useEffect, useRef, useState } from 'react'
import { useHashRoute } from '../lib/router'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A short narrative line per destination, rather than repeating the route word.
const LINES = {
  home: 'Back to the start', // short narrative line, consistent with the others
  projects: 'A look at recent work',
  project: 'Diving into the details',
  about: 'A little about me',
  contact: "Let's build something",
}

// Route transition: the background color holds while a narrative line reveals
// letter-by-letter, then fades out. Also plays a one-time intro on first load
// so the page never flashes raw content before the shader has painted.
export default function RouteTransition({ routeKey }) {
  const [phase, setPhase] = useState('intro') // 'intro'|'intro-out'|'in'|'out'|'idle'
  const [runId, setRunId] = useState(0) // bumps each navigation to remount letters
  const prevKey = useRef(routeKey)
  const route = useHashRoute()
  const line = LINES[route.name] || ''

  // First-load intro: hold a soft veil briefly, then fade to reveal the page.
  useEffect(() => {
    if (prefersReduced) {
      setPhase('idle')
      return
    }
    const t1 = setTimeout(() => setPhase('intro-out'), 650) // begin fade
    const t2 = setTimeout(() => setPhase('idle'), 1300) // fully revealed
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Subsequent navigations.
  useEffect(() => {
    if (routeKey === prevKey.current) return // not a real navigation
    prevKey.current = routeKey
    if (prefersReduced) return

    setRunId((n) => n + 1) // new key → letters remount and replay from the start
    setPhase('in')
    const t1 = setTimeout(() => setPhase('out'), 950) // reveal + hold
    const t2 = setTimeout(() => setPhase('idle'), 1550) // faded out
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [routeKey])

  if (prefersReduced || phase === 'idle') return null

  const intro = phase === 'intro' || phase === 'intro-out'
  const covering = phase === 'in' || phase === 'intro'
  const letters = [...(intro ? '' : line)]

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[95] flex items-center justify-center"
      style={{
        background: '#f2f0ea',
        opacity: covering ? 1 : 0,
        // no fade-IN on the very first paint (avoids a flash); only fade OUT
        transition: intro ? 'opacity 620ms ease 100ms' : 'opacity 560ms cubic-bezier(0.16,1,0.3,1)',
        pointerEvents: covering ? 'auto' : 'none',
      }}
    >
      {intro ? (
        // first load: a quiet breathing mark, no text
        <span className="route-pulse h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#93ab89' }} />
      ) : (
        <h2
          key={runId}
          className="flex flex-wrap justify-center px-6 text-center font-serif text-3xl font-medium tracking-tight text-ink sm:text-5xl"
        >
          {letters.map((ch, i) => (
            <span key={i} className="overflow-hidden leading-[1.15]">
              <span className="route-letter inline-block" style={{ animationDelay: `${i * 34}ms` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            </span>
          ))}
        </h2>
      )}
    </div>
  )
}
