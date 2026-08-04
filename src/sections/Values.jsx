import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VALUES } from '../data/content'
import SectionLabel from '../components/ui/SectionLabel'
import Reveal from '../components/interactive/Reveal'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const ACCENTS = ['#3F6B5E', '#6E8FA6', '#B99A5B']

// Each value is a self-contained block (number + word + stacked description)
// that alternates to the left / right half of the row. On scroll each block
// slides in from its own side and gently parallaxes, and a huge ghost word
// drifts behind it — so the section feels alive as you move through it.
function ValueItem({ value, index }) {
  const accent = ACCENTS[index % ACCENTS.length]
  const flip = index % 2 === 1

  return (
    <div
      data-value
      data-flip={flip ? '1' : '0'}
      className={'group relative ' + (flip ? 'md:ml-auto md:pl-10' : 'md:mr-auto md:pr-10')}
      style={{ maxWidth: '30rem' }}
    >
      {/* giant ghost word framing the block — kept very faint so it never
          competes with the readable text */}
      <span
        data-ghost
        aria-hidden
        className="pointer-events-none absolute -top-16 select-none font-serif font-medium leading-none tracking-tightest"
        style={{
          fontSize: 'clamp(3.5rem,7.5vw,6rem)',
          color: 'transparent',
          WebkitTextStroke: `1.25px ${accent}`,
          [flip ? 'right' : 'left']: '-0.5rem',
          opacity: 0.42,
        }}
      >
        {value.name}
      </span>

      <div data-inner className="relative">
        {/* short accent bar that grows on hover */}
        <span
          className="mb-5 block h-[3px] w-8 rounded-full transition-all duration-500 ease-ethereal group-hover:w-16"
          style={{ backgroundColor: accent }}
        />

        <div className="flex items-baseline gap-3">
          <span className="font-serif text-base" style={{ color: accent }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3
            className="font-serif font-medium leading-none tracking-tight text-ink transition-transform duration-500 ease-ethereal group-hover:translate-x-1"
            style={{ fontSize: 'clamp(1.75rem,3.4vw,2.6rem)' }}
          >
            {value.name}
          </h3>
        </div>

        <p className="mt-4 text-base font-light leading-relaxed text-graphite/75 sm:text-lg">
          {value.body}
        </p>
      </div>
    </div>
  )
}

export default function Values() {
  const root = useRef(null)

  useLayoutEffect(() => {
    if (prefersReduced || !root.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-value]').forEach((el) => {
        const flip = el.dataset.flip === '1'
        const dir = flip ? 1 : -1
        const ghost = el.querySelector('[data-ghost]')
        const inner = el.querySelector('[data-inner]')

        // Slide the block in from its own side as it enters.
        gsap.from(el, {
          opacity: 0,
          x: dir * 70,
          filter: 'blur(8px)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })

        // Parallax: ghost word and content drift at different rates through the
        // viewport, giving depth and continuous motion while scrolling.
        gsap.to(ghost, {
          xPercent: dir * -14,
          yPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
        gsap.fromTo(
          inner,
          { yPercent: 8 },
          {
            yPercent: -8,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          }
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section id="values" ref={root} className="relative px-6 py-20 sm:px-10 sm:py-28 lg:px-20 lg:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mb-16 max-w-3xl sm:mb-24">
          <SectionLabel>The reasons</SectionLabel>
          <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {VALUES.title}
          </h2>
        </Reveal>

        <div className="flex flex-col gap-24 sm:gap-32">
          {VALUES.items.map((v, i) => (
            <ValueItem key={v.name} value={v} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
