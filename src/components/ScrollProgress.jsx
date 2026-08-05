import { useEffect, useRef } from 'react'

// A hairline accent line pinned to the very top of the viewport that fills as
// you scroll the page. Writes width directly to the DOM on scroll (no React
// re-render per frame). Sits above everything but ignores pointer events.
export default function ScrollProgress() {
  const bar = useRef(null)

  useEffect(() => {
    const el = bar.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      // Hide entirely when there's little/nothing to scroll (short pages), so
      // an empty bar never sits there looking broken.
      el.parentElement.style.opacity = max > 240 ? '1' : '0'
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      el.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] transition-opacity duration-500">
      <div
        ref={bar}
        className="h-full origin-left bg-accent"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  )
}
