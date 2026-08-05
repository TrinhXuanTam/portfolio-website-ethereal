import { useState } from 'react'
import { SERVICES } from '../data/content'
import SectionLabel from '../components/ui/SectionLabel'
import Reveal from '../components/interactive/Reveal'

const ACCENTS = ['#3F6B5E', '#6E8FA6', '#B99A5B']

// Each row narrates ONE service: it leads with the service name (highlighted),
// then flows that service's own capabilities in a logical progression, so the
// row reads as a coherent phrase rather than a scattered pile of tags. Rows
// alternate drift direction for a woven, kinetic texture.
const ROWS = [
  {
    dir: 'left',
    // Developer for Hire — how I plug into a team and ship
    words: [
      { t: 'Developer for Hire', accent: 0 },
      { t: 'joins your team' },
      { t: 'React' },
      { t: 'TypeScript' },
      { t: 'Node.js' },
      { t: 'agile delivery' },
      { t: 'clean code' },
      { t: 'ships fast' },
    ],
  },
  {
    dir: 'right',
    // Custom Software — building a product end to end
    words: [
      { t: 'Custom Software Solutions', accent: 1 },
      { t: 'from idea to launch' },
      { t: 'system architecture' },
      { t: 'APIs' },
      { t: 'databases' },
      { t: 'cloud & DevOps' },
      { t: 'built to scale' },
    ],
  },
  {
    dir: 'left',
    // IT Consulting — advising on strategy and direction
    words: [
      { t: 'IT Consulting', accent: 2 },
      { t: 'technology strategy' },
      { t: 'architecture reviews' },
      { t: 'performance' },
      { t: 'security' },
      { t: 'right tech choices' },
    ],
  },
]

function Row({ row, paused }) {
  // Duplicate the words once so translateX(±50%) loops seamlessly.
  const words = [...row.words, ...row.words]
  return (
    <div
      className={
        'flex w-max items-center gap-6 sm:gap-10 ' +
        (row.dir === 'left' ? 'marquee-l' : 'marquee-r')
      }
      style={{ animationPlayState: paused ? 'paused' : 'running' }}
    >
      {words.map((w, i) => {
        const isService = w.accent !== undefined
        const accent = isService ? ACCENTS[w.accent] : null
        return (
          <span key={i} className="flex shrink-0 items-center gap-6 sm:gap-10">
            <span
              className="font-serif font-medium leading-none tracking-tight"
              style={{
                fontSize: isService ? 'clamp(1.5rem,3.6vw,2.8rem)' : 'clamp(1.1rem,2.4vw,1.9rem)',
                color: isService ? accent : 'transparent',
                WebkitTextStroke: isService ? '0' : '1px rgba(43,42,40,0.22)',
                fontStyle: isService ? 'normal' : 'italic',
              }}
            >
              {w.t}
            </span>
            {isService ? (
              // solid accent dot anchors the service name that opens the row
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
              />
            ) : (
              // thin hairline slash keeps the following phrases flowing as one line
              <span className="h-4 w-px shrink-0 rotate-12 bg-graphite/20" />
            )}
          </span>
        )
      })}
    </div>
  )
}

export default function Services() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  return (
    <section id="services" className="relative overflow-hidden px-0 py-14 sm:py-28 lg:py-40">
      <div className="mx-auto mb-12 w-full max-w-6xl px-6 sm:mb-16 sm:px-10 lg:px-20">
        <Reveal className="max-w-3xl">
          <SectionLabel>What I do</SectionLabel>
          <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {SERVICES.title}
          </h2>
        </Reveal>
      </div>

      {/* Multi-row keyword marquee — rows alternate direction. Edges fade over
          the live liquid via a mask (no opaque colour band). */}
      <div
        className="marquee-mask relative flex w-full flex-col gap-4 sm:gap-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {ROWS.map((row, i) => (
          <Row key={i} row={row} paused={paused} />
        ))}
      </div>

      {/* All three descriptions. Mobile: a swipeable snap-rail so the trio reads
          as a short horizontal gallery instead of a tall stack. md+ : 3-col grid. */}
      <div className="mx-auto mt-14 w-full max-w-6xl px-5 sm:mt-20 sm:px-10 lg:px-20">
        <div
          data-lenis-prevent
          className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-10 md:overflow-visible md:px-0 md:pb-0"
        >
          {SERVICES.cards.map((card, i) => {
            const cAccent = ACCENTS[i % ACCENTS.length]
            const on = active === i
            return (
              <div
                key={card.label}
                onMouseEnter={() => setActive(i)}
                className="group relative w-[80%] shrink-0 snap-center pt-5 transition-all duration-500 ease-ethereal max-md:!opacity-100 md:w-auto"
                style={{ opacity: on ? 1 : 0.7 }}
              >
                <span className="absolute left-0 top-0 h-px w-full bg-graphite/15" />
                <span
                  className="absolute left-0 top-0 h-px transition-all duration-500 ease-ethereal"
                  style={{ width: on ? '100%' : '2.5rem', backgroundColor: cAccent }}
                />

                <div className="mb-3 flex items-center gap-3">
                  <span className="font-serif text-sm" style={{ color: cAccent }}>
                    0{i + 1}
                  </span>
                  <h3 className="font-sans text-sm font-medium uppercase tracking-widest text-ink">
                    {card.label}
                  </h3>
                </div>
                <p className="text-base font-light leading-relaxed text-graphite/80">
                  {card.body}
                </p>
              </div>
            )
          })}
        </div>

        {/* swipe affordance — mobile only */}
        <p className="mt-4 flex items-center gap-2 text-xs uppercase tracking-widest text-ash md:hidden">
          Swipe <span aria-hidden>→</span>
        </p>
      </div>
    </section>
  )
}
