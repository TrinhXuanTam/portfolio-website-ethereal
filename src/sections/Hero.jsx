import { useRef, useLayoutEffect, useEffect } from 'react'
import { gsap } from 'gsap'
import { HERO } from '../data/content'
import GlassButton from '../components/ui/GlassButton'
import { pointer } from '../lib/pointer'
import { navigate } from '../lib/router'

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Hero() {
  const root = useRef(null)
  const portrait = useRef(null)

  // Entrance timeline. Uses explicit set -> to (not .from) and clears props on
  // completion, so the content is GUARANTEED to end in its natural, visible
  // state — even if StrictMode double-mounts or the tween is interrupted. This
  // avoids the "portrait shows but text is invisible" failure of a stuck .from.
  useLayoutEffect(() => {
    if (prefersReduced || !root.current) return
    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray('[data-hero-line] > *')
      gsap.set(lines, { yPercent: 118 })
      gsap.set(['[data-hero-sub]', '[data-hero-cta]'], { opacity: 0, y: 20 })
      gsap.set('[data-hero-meta]', { opacity: 0 })

      const tl = gsap.timeline({
        delay: 0.3,
        onComplete: () => {
          // strip any leftover inline transforms so layout is fully natural
          gsap.set(
            [...lines, '[data-hero-sub]', '[data-hero-cta]', '[data-hero-meta]'],
            { clearProps: 'all' }
          )
        },
      })
      tl.to(lines, { yPercent: 0, duration: 1.4, ease: 'power4.out', stagger: 0.12 })
        .to('[data-hero-sub]', { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, '-=1.0')
        .to('[data-hero-cta]', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
        .to('[data-hero-meta]', { opacity: 1, duration: 1.2, ease: 'power2.out' }, '-=0.9')
    }, root)
    return () => ctx.revert()
  }, [])

  // Gentle cursor parallax on the portrait (pointer-driven, no React re-render)
  useEffect(() => {
    if (prefersReduced || !portrait.current) return
    // Only lean on devices with a real hover pointer, so touch layouts are still.
    if (window.matchMedia('(hover: none)').matches) return
    const xTo = gsap.quickTo(portrait.current, 'x', { duration: 1.1, ease: 'power3.out' })
    const yTo = gsap.quickTo(portrait.current, 'y', { duration: 1.1, ease: 'power3.out' })
    const rTo = gsap.quickTo(portrait.current, 'rotateY', { duration: 1.1, ease: 'power3.out' })
    let raf
    const loop = () => {
      xTo(pointer.x * 14)
      yTo(-pointer.y * 10)
      rTo(pointer.x * 3)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Family name on the first line, given name on the second.
  const lines = ['Trinh', 'Xuan Tam']

  return (
    <section
      id="top"
      ref={root}
      className="relative flex min-h-[100svh] items-start overflow-hidden px-6 pt-28 pb-16 sm:px-10 sm:pt-24 lg:items-center lg:px-20 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
        {/* Text column — always first so the name is what you see on load */}
        <div className="relative z-10 order-1">
          <p
            data-hero-meta
            className="mb-6 flex items-center gap-3 text-[0.65rem] uppercase tracking-widest2 text-ash sm:text-xs"
          >
            <span className="inline-block h-px w-8 bg-ash/50 sm:w-10" />
            Portfolio, {new Date().getFullYear()}
          </p>

          <h1 className="font-serif font-medium leading-[0.88] tracking-tightest text-ink">
            {lines.map((line, i) => (
              <span
                key={i}
                data-hero-line
                className="block overflow-hidden whitespace-nowrap text-[clamp(3.25rem,13vw,9rem)]"
              >
                <span className="block">{line}</span>
              </span>
            ))}
          </h1>

          <p
            data-hero-sub
            className="mt-8 max-w-md text-base font-light leading-relaxed text-graphite/80 sm:text-lg lg:text-xl"
          >
            {HERO.role}
          </p>

          <div data-hero-cta className="mt-10">
            <GlassButton
              href="#/contact"
              strong
              onClick={(e) => {
                e.preventDefault()
                navigate('/contact')
              }}
            >
              {HERO.cta}
            </GlassButton>
          </div>
        </div>

        {/* Portrait column — a real grid cell, so it stacks predictably.
            The gradient masks feather the mid-waist crop and the left edge so
            it melts into the mist at every size instead of showing a hard box. */}
        <div className="relative order-2 flex justify-center lg:justify-end">
          <div
            data-portrait
            className="relative w-[min(58vw,260px)] sm:w-[min(55vw,360px)] lg:w-full lg:max-w-[520px]"
            style={{ perspective: '1000px' }}
          >
            <div
              ref={portrait}
              className="aspect-[4/5] w-full will-change-transform"
              style={{
                backgroundImage: 'url(/portrait.png)',
                backgroundSize: 'contain',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat',
                WebkitMaskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,1) 62%, rgba(0,0,0,0) 96%)',
                maskImage:
                  'linear-gradient(to bottom, rgba(0,0,0,1) 62%, rgba(0,0,0,0) 96%)',
                filter: 'saturate(0.92) contrast(1.02)',
              }}
            />
          </div>
        </div>
      </div>

      <div
        data-hero-meta
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 text-[0.65rem] uppercase tracking-widest2 text-ash sm:block"
      >
        Scroll
      </div>
    </section>
  )
}
