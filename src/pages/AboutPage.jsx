import { useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Reveal from '../components/interactive/Reveal'
import SectionLabel from '../components/ui/SectionLabel'
import GlassButton from '../components/ui/GlassButton'
import { fetchAbout, cachedPeek } from '../lib/cms'
import { navigate } from '../lib/router'
import { CONTACT } from '../data/content'

// "2024-06-01" → "Jun 2024"; null "to" → "Present".
function fmt(date) {
  if (!date) return 'Present'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const ACCENTS = ['#3F6B5E', '#6E8FA6', '#B99A5B']

function TimelineList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const accent = ACCENTS[i % ACCENTS.length]
        const row = (
          <div className="glass flex items-center gap-5 rounded-2xl px-5 py-5 transition-all duration-500 ease-ethereal group-hover/row:translate-x-1 group-hover/row:shadow-[0_16px_50px_rgba(43,42,40,0.10)] sm:gap-6 sm:px-7">
            {/* company / institution logo */}
            {it.icon ? (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/70 sm:h-16 sm:w-16">
                <img
                  src={it.icon}
                  alt={it.org}
                  loading="lazy"
                  className="h-full w-full object-contain p-2"
                />
              </span>
            ) : (
              <span
                className="h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-16"
                style={{ backgroundColor: `${accent}33` }}
              />
            )}

            <div className="min-w-0 flex-1">
              <h3 className="font-serif text-xl font-medium leading-tight text-ink sm:text-2xl">
                {it.title}
              </h3>
              <p className="mt-1 text-sm font-light text-graphite/75">
                {it.org}
                {it.location ? ` · ${it.location}` : ''}
              </p>
            </div>

            {/* date pinned to the far right — uses the full width */}
            <span
              className="hidden shrink-0 text-right text-xs uppercase tracking-widest sm:block"
              style={{ color: accent }}
            >
              {fmt(it.from)}
              <br />
              <span className="text-ash">{fmt(it.to)}</span>
            </span>
          </div>
        )
        // Animate on MOUNT (not scroll): this content loads asynchronously and
        // may appear while already in the viewport, where a scroll-trigger
        // reveal would either never fire or snap in with no animation.
        return (
          <div
            key={i}
            className="row-rise group/row block"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {it.url ? (
              <a href={it.url} target="_blank" rel="noreferrer" className="block" data-cursor="Visit">
                {row}
              </a>
            ) : (
              row
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AboutPage() {
  // Seed from the session cache so repeat visits render instantly (no gap).
  const seed = cachedPeek('about')
  const [about, setAbout] = useState(seed)
  const [status, setStatus] = useState(seed ? 'ok' : 'loading')

  useEffect(() => {
    if (seed) return // already have data; skip the fetch entirely
    let alive = true
    fetchAbout()
      .then((a) => alive && (setAbout(a), setStatus(a ? 'ok' : 'empty')))
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When the real content replaces the skeletons, the page height changes — so
  // recompute all ScrollTrigger start/end positions, otherwise the timeline
  // reveals fire against stale (skeleton-height) positions and appear late.
  useEffect(() => {
    if (!about) return
    const ids = [0, 120, 350].map((ms) => setTimeout(() => ScrollTrigger.refresh(), ms))
    return () => ids.forEach(clearTimeout)
  }, [about])

  return (
    <main className="relative min-h-screen px-6 pb-28 pt-32 sm:px-10 sm:pt-36 lg:px-20">
      <div className="mx-auto w-full max-w-5xl">
        <Reveal className="mb-6">
          <button
            onClick={() => navigate('/')}
            data-cursor="Back"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-graphite/70 transition-colors duration-300 hover:text-ink"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Home
          </button>
        </Reveal>

        {/* Editorial hero: an oversized ABOUT wordmark with the photo breaking
            across it, the intro tucked to one side, and a floating location tag. */}
        <div className="relative mb-20 sm:mb-28">
          <Reveal>
            <SectionLabel>Get to know me</SectionLabel>
          </Reveal>

          {/* Two columns share the height: title + intro on the left, the photo
              filling the right — no dead space, no stray caption. */}
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-16">
            <div>
              <Reveal className="relative z-10">
                <h1 className="font-serif font-medium leading-[0.82] tracking-tightest text-ink">
                  <span className="block text-[22vw] sm:text-[18vw] lg:text-[11rem]">About</span>
                </h1>
              </Reveal>

              <Reveal className="mt-8 max-w-md">
                <p className="text-lg font-light leading-relaxed text-graphite/80">
                  I am a full-stack engineer based in Paris who likes turning
                  messy problems into software that feels simple to use. When I
                  am not shipping code, I am usually up a mountain, where the
                  only thing that crashes is me on the way down.
                </p>
                <div className="mt-8">
                  <GlassButton href={about?.cv || CONTACT.cvUrl} strong>
                    Download CV
                  </GlassButton>
                </div>
              </Reveal>
            </div>

            {/* photo fills the right column; on mobile it sits below the title
                as a shorter banner so the heading is what you see first */}
            <Reveal y={50} className="lg:order-last">
              <figure className="group relative">
                <div className="relative overflow-hidden rounded-[1.5rem] shadow-[0_28px_80px_rgba(43,42,40,0.20)] ring-1 ring-white/50">
                  <img
                    src="/mountains.png"
                    alt="Trinh Xuan Tam hiking above Innsbruck"
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover object-bottom transition-transform duration-[1.6s] ease-ethereal group-hover:scale-[1.05] lg:aspect-[4/5]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-graphite/30 to-transparent" />
                  {/* cooler tag: geeky coordinates + a "currently" vibe */}
                  <figcaption className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[0.6rem] uppercase tracking-widest2 text-white/90 [text-shadow:0_2px_16px_rgba(43,42,40,0.6)]">
                    <span>47.31°N&nbsp;&nbsp;11.38°E</span>
                    <span>2275m ↑</span>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-24">
            {['Experience', 'Education'].map((label) => (
              <section key={label} className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-16">
                <div className="lg:sticky lg:top-28">
                  <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
                    {label}
                  </h2>
                </div>
                <div className="space-y-3">
                  {[0, 1, 2].map((n) => (
                    <div
                      key={n}
                      className="glass flex items-center gap-5 rounded-2xl px-5 py-5 sm:px-7"
                    >
                      <span className="skeleton h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-16" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <span className="skeleton block h-5 w-2/3 rounded" />
                        <span className="skeleton block h-3 w-1/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {about && (
          <div className="space-y-24">
            {about.workExperience.length > 0 && (
              <section className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-16">
                <Reveal>
                  <div className="lg:sticky lg:top-28">
                    <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
                      Experience
                    </h2>
                    <p className="mt-3 text-sm font-light text-graphite/60">
                      {about.workExperience.length} roles · Paris & remote
                    </p>
                  </div>
                </Reveal>
                <TimelineList items={about.workExperience} />
              </section>
            )}

            {about.education.length > 0 && (
              <section className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-16">
                <Reveal>
                  <div className="lg:sticky lg:top-28">
                    <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
                      Education
                    </h2>
                    <p className="mt-3 text-sm font-light text-graphite/60">
                      {about.education.length} programmes
                    </p>
                  </div>
                </Reveal>
                <TimelineList items={about.education} />
              </section>
            )}

            {about.extra.length > 0 && (
              <section>
                <Reveal className="mb-12 text-center">
                  <SectionLabel>More about me</SectionLabel>
                  <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
                    Beyond the résumé
                  </h2>
                </Reveal>

                {/* bold numbered features, alternating alignment — distinct from
                    the timeline rows above */}
                <div className="space-y-16 sm:space-y-24">
                  {about.extra.map((x, i) => {
                    const accent = ACCENTS[i % ACCENTS.length]
                    const flip = i % 2 === 1
                    return (
                      <Reveal key={i} y={30}>
                        <div
                          className={
                            'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10 ' +
                            (flip ? 'sm:flex-row-reverse sm:text-right' : '')
                          }
                        >
                          {/* oversized outlined index number */}
                          <span
                            className="font-serif leading-none tracking-tightest"
                            style={{
                              fontSize: 'clamp(4rem,10vw,8rem)',
                              color: 'transparent',
                              WebkitTextStroke: `1.5px ${accent}`,
                            }}
                          >
                            {i + 1}
                          </span>
                          <div className={'max-w-xl ' + (flip ? 'sm:ml-auto' : '')}>
                            <h3 className="whitespace-pre-line font-serif text-2xl font-medium leading-tight text-ink sm:text-3xl">
                              {x.title}
                            </h3>
                            {x.text && (
                              <p className="mt-3 text-base font-light leading-relaxed text-graphite/80">
                                {x.text}
                              </p>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
