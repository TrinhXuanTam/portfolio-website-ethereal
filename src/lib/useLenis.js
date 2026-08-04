import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Momentum smooth scrolling via Lenis, driven off GSAP's ticker so that
 * ScrollTrigger stays perfectly in sync with the smoothed scroll position.
 * Exposes the Lenis instance on window.__lenis for anchor navigation.
 */
export function useLenis() {
  useEffect(() => {
    if (prefersReduced) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    })

    window.__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // Async content (CMS data + lazy images) changes the page height after the
    // ScrollTriggers are created, leaving their start/end positions stale — so
    // triggers near the bottom (e.g. the Contact CTA) fire late and pop. Refresh
    // measurements on load and whenever an image finishes decoding.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const onImg = (e) => {
      if (e.target && e.target.tagName === 'IMG') refresh()
    }
    document.addEventListener('load', onImg, true) // capture: img load doesn't bubble
    // periodic settle for the first few seconds as CMS content streams in
    const settle = [400, 1200, 2500].map((ms) => setTimeout(refresh, ms))

    return () => {
      gsap.ticker.remove(raf)
      window.removeEventListener('load', refresh)
      document.removeEventListener('load', onImg, true)
      settle.forEach(clearTimeout)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}

/** Smoothly scroll to an anchor id, respecting Lenis if present. */
export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  if (window.__lenis) {
    window.__lenis.scrollTo(el, { offset: 0, duration: 1.4 })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
