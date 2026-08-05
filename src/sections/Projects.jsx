import { useRef, useState, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROJECTS } from '../data/content'
import SectionLabel from '../components/ui/SectionLabel'
import Reveal from '../components/interactive/Reveal'
import ProjectArt from '../canvas/ProjectArt'
import { useCmsData } from '../lib/useCmsData'
import { fetchProjects } from '../lib/cms'
import { navigate } from '../lib/router'
import GlassButton from '../components/ui/GlassButton'

const LANDING_COUNT = 3

gsap.registerPlugin(ScrollTrigger)

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Static fallback keeps the shape fetchProjects returns (no/name/body/tags),
// so the component renders identically whether data is live or offline.
const FALLBACK = PROJECTS.items.map((p, i) => ({
  ...p,
  id: `static-${i}`,
  thumbnail: null,
  url: null,
}))

function ProjectRow({ p, index }) {
  const flip = index % 2 === 1
  // The whole card opens the in-site detail page for this project.
  const openDetail = () => navigate(`/projects/${p.id}`)

  const panelRef = useRef(null)
  // "active" = this thumbnail is near the viewport center (or hovered): it pops
  // from muted grayscale to full color with a gentle scale-up.
  const [centered, setCentered] = useState(false)
  const [hovered, setHovered] = useState(false)
  const active = centered || hovered

  useLayoutEffect(() => {
    if (prefersReduced || !panelRef.current) return
    const st = ScrollTrigger.create({
      trigger: panelRef.current,
      start: 'top 65%',
      end: 'bottom 35%',
      onToggle: (self) => setCentered(self.isActive),
    })
    return () => st.kill()
  }, [])

  return (
    <Reveal y={50}>
      <article
        className={
          'grid items-center gap-8 lg:grid-cols-12 lg:gap-16 ' +
          (flip ? 'lg:[direction:rtl]' : '')
        }
      >
        {/* Media panel — muted at rest, pops to full color when scrolled to the
            viewport center (or on hover). ProjectArt is the fallback image. */}
        <div className="lg:col-span-7 lg:[direction:ltr]">
          <button
            ref={panelRef}
            onClick={openDetail}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative block aspect-[16/11] w-full overflow-hidden rounded-3xl transition-transform duration-[1.1s] ease-ethereal"
            style={{ transform: active ? 'scale(1.03)' : 'scale(1)' }}
            data-cursor="View"
          >
            {p.thumbnail ? (
              <>
                {/* Grayscale at rest unifies every screenshot into one tonal
                    look; full color returns when the panel is active. */}
                <img
                  src={p.thumbnail}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover ease-ethereal"
                  style={{
                    // Only transition the two properties we animate (not `all`),
                    // and isolate the image on its own compositor layer so the
                    // grayscale->color rasterization doesn't jank the main
                    // thread / shader during the pop.
                    transition: 'filter 1.1s, transform 1.1s',
                    filter: active ? 'grayscale(0)' : 'grayscale(1)',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                    willChange: 'filter, transform',
                    backfaceVisibility: 'hidden',
                  }}
                />
                {/* soft sage tint that clears as the panel becomes active */}
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-700"
                  style={{ backgroundColor: '#93ab89', opacity: active ? 0 : 0.4 }}
                />
              </>
            ) : (
              <ProjectArt seed={index / 2} />
            )}

            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
            <span
              className="pointer-events-none absolute left-6 top-6 font-serif text-5xl text-white/90 sm:text-6xl"
              style={{ textShadow: '0 2px 18px rgba(43,42,40,0.35)' }}
            >
              {p.no}
            </span>
          </button>
        </div>

        {/* copy */}
        <div className="lg:col-span-5 lg:[direction:ltr]">
          <button
            onClick={openDetail}
            data-cursor="View"
            className="group/title text-left outline-none"
          >
            <h3 className="font-serif text-3xl font-medium leading-tight text-ink transition-colors duration-300 group-hover/title:text-graphite sm:text-4xl">
              {p.name}
            </h3>
          </button>
          <p className="mt-5 text-base font-light leading-relaxed text-graphite/75">
            {p.body}
          </p>
          {p.tags.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <li
                  key={t}
                  className="pill rounded-full px-4 py-1.5 text-xs uppercase tracking-widest text-graphite/70"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={openDetail}
            data-cursor="View"
            className="mt-7 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-graphite/70 transition-colors duration-300 hover:text-ink"
          >
            View project
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </div>
      </article>
    </Reveal>
  )
}

export default function Projects() {
  const { data: all } = useCmsData(fetchProjects, FALLBACK)
  // Landing shows only the most recent few; the full list lives on /projects.
  const projects = all.slice(0, LANDING_COUNT)

  return (
    <section id="projects" className="relative px-6 py-20 sm:px-10 sm:py-28 lg:px-20 lg:py-48">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6 sm:mb-20">
          <div className="max-w-3xl">
            <SectionLabel>Selected work</SectionLabel>
            <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {PROJECTS.title}
            </h2>
          </div>
          <button
            onClick={() => navigate('/projects')}
            data-cursor="Browse"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-graphite/70 transition-colors duration-300 hover:text-ink"
          >
            All projects
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </Reveal>

        <div className="space-y-28 lg:space-y-40">
          {projects.map((p, i) => (
            <ProjectRow key={p.id} p={{ ...p, no: String(i + 1).padStart(2, '0') }} index={i} />
          ))}
        </div>

        <Reveal className="mt-24 flex justify-center">
          <GlassButton onClick={() => navigate('/projects')} strong>
            View all projects
          </GlassButton>
        </Reveal>
      </div>
    </section>
  )
}
