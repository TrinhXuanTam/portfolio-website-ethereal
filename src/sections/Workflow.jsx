import { useRef, useLayoutEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { WORKFLOW } from '../data/content'
import SectionLabel from '../components/ui/SectionLabel'
import Reveal from '../components/interactive/Reveal'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const STEPS = WORKFLOW.steps
const ACCENTS = ['#3F6B5E', '#6E8FA6', '#B99A5B']

export default function Workflow() {
  const root = useRef(null)
  const stepsWrap = useRef(null)
  const fillRef = useRef(null)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    if (prefersReduced || !root.current) return

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray('[data-step]')

      // Whichever step is crossing the viewport middle becomes the active one;
      // this drives the sticky giant number and the dimming of the others.
      steps.forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => self.isActive && setActive(i),
        })

        // Each step's detail items cascade in the first time they appear.
        gsap.from(el.querySelectorAll('[data-item]'), {
          opacity: 0,
          x: 24,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        })
      })

      // The progress rail fills continuously across the whole steps column.
      gsap.to(fillRef.current, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stepsWrap.current,
          start: 'top 60%',
          end: 'bottom 70%',
          scrub: 0.6,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  const accent = ACCENTS[active % ACCENTS.length]

  return (
    <section id="workflow" ref={root} className="relative px-5 py-14 sm:px-10 sm:py-28 lg:px-20 lg:py-32">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mb-12 max-w-3xl sm:mb-20">
          <SectionLabel>The process</SectionLabel>
          <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {WORKFLOW.title}
          </h2>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Sticky left panel — giant number crossfades to the active step */}
          <div className="hidden lg:block">
            <div className="sticky top-[28vh]">
              <div className="relative h-[38vh] min-h-[20rem]">
                {STEPS.map((s, i) => (
                  <div
                    key={s.no}
                    className="absolute inset-0 transition-all duration-700 ease-ethereal"
                    style={{
                      opacity: active === i ? 1 : 0,
                      transform: `translateY(${active === i ? 0 : active > i ? -24 : 24}px)`,
                    }}
                    aria-hidden={active !== i}
                  >
                    <span
                      className="block font-serif leading-none tracking-tightest"
                      style={{ fontSize: 'clamp(4rem,16vw,13rem)', color: accent }}
                    >
                      {s.no}
                    </span>
                    <h3 className="mt-2 font-serif text-3xl font-medium text-ink sm:text-4xl">
                      {s.name}
                    </h3>
                  </div>
                ))}
              </div>

              {/* step ticker */}
              <div className="mt-10 flex items-center gap-3">
                {STEPS.map((s, i) => (
                  <span
                    key={s.no}
                    className="h-1 flex-1 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: i <= active ? accent : 'rgba(139,138,133,0.2)',
                    }}
                  />
                ))}
              </div>
              <p className="mt-4 text-xs uppercase tracking-widest2 text-ash">
                Step {active + 1} / {STEPS.length}
              </p>
            </div>
          </div>

          {/* Right column — the scrolling steps with a filling progress rail */}
          <div ref={stepsWrap} className="relative pl-10 sm:pl-14">
            {/* rail track + fill */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] rounded-full bg-graphite/15 sm:left-[11px]" />
            <div
              ref={fillRef}
              className="absolute left-[7px] top-2 bottom-2 w-[2px] origin-top rounded-full sm:left-[11px]"
              style={{
                transform: 'scaleY(0)',
                background: 'linear-gradient(to bottom, #3F6B5E, #6E8FA6, #B99A5B)',
              }}
            />

            <ol className="space-y-10 sm:space-y-20">
              {STEPS.map((s, i) => (
                <li
                  key={s.no}
                  data-step
                  className="relative transition-all duration-500 ease-ethereal"
                  style={{
                    opacity: active === i ? 1 : 0.42,
                    transform: `scale(${active === i ? 1 : 0.985})`,
                  }}
                >
                  {/* node marker */}
                  <span
                    className="absolute -left-10 top-1.5 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-500 sm:-left-14 sm:h-6 sm:w-6"
                    style={{
                      backgroundColor: active === i ? accent : 'rgba(255,255,255,0.7)',
                      boxShadow:
                        active === i ? `0 0 0 6px ${accent}22` : '0 0 0 1px rgba(139,138,133,0.25)',
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full transition-colors duration-500"
                      style={{ backgroundColor: active === i ? '#fff' : 'rgba(43,42,40,0.5)' }}
                    />
                  </span>

                  {/* per-step number/name (shown on mobile where the sticky panel is hidden) */}
                  <div className="mb-3 flex items-baseline gap-3 lg:hidden">
                    <span className="font-serif text-sm text-ash">{s.no}</span>
                    <h3 className="font-serif text-2xl font-medium text-ink">{s.name}</h3>
                  </div>

                  {/* name on desktop too, smaller, so the right column reads on its own */}
                  <h3 className="mb-4 hidden font-serif text-2xl font-medium text-ink lg:block">
                    {s.name}
                  </h3>

                  {/* Mobile: items wrap inline with hairline separators, so a
                      4-item step is ~2 lines instead of 4 — much shorter scroll.
                      lg+: one item per line, as before. */}
                  <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:flex-col lg:items-start lg:gap-2">
                    {s.items.map((item, k) => (
                      <li
                        key={item}
                        data-item
                        className="flex items-center gap-3 text-base font-light text-graphite/80 sm:text-lg"
                      >
                        {item}
                        {k < s.items.length - 1 && (
                          <span aria-hidden className="h-3 w-px bg-graphite/20 lg:hidden" />
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
