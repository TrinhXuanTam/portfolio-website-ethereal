import { PROJECTS } from '../data/content'
import Reveal from '../components/interactive/Reveal'
import SectionLabel from '../components/ui/SectionLabel'
import ProjectArt from '../canvas/ProjectArt'
import { useCmsData } from '../lib/useCmsData'
import { fetchProjects } from '../lib/cms'
import { navigate } from '../lib/router'
import Footer from '../components/Footer'

const FALLBACK = PROJECTS.items.map((p, i) => ({
  ...p,
  id: `static-${i}`,
  thumbnail: null,
  url: null,
}))

// Small serif index + a rule that draws itself across on hover — a gallery
// catalogue touch shared by both the feature card and the grid cards.
function IndexRule({ n }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="font-serif text-sm italic text-ash">{n}</span>
      <span className="relative h-px flex-1 bg-ash/25">
        <span className="absolute inset-y-0 left-0 w-0 bg-ink/60 transition-[width] duration-700 ease-ethereal group-hover:w-full" />
      </span>
    </div>
  )
}

function Thumb({ p, index, className = '' }) {
  return (
    <div className={'relative overflow-hidden rounded-2xl ' + className}>
      {p.thumbnail ? (
        <img
          src={p.thumbnail}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1.1s] ease-ethereal group-hover:scale-[1.05]"
        />
      ) : (
        <ProjectArt seed={index / 2} />
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/40" />
    </div>
  )
}

// The lead project — full width, image and copy side by side on desktop.
function Feature({ p, index }) {
  return (
    <button
      onClick={() => navigate(`/projects/${p.id}`)}
      data-cursor="View"
      className="group grid w-full items-center gap-4 text-left outline-none sm:gap-6 lg:grid-cols-2 lg:gap-12"
    >
      <Thumb p={p} index={index} className="aspect-[16/10] lg:aspect-[4/3]" />
      <div>
        <IndexRule n={String(index + 1).padStart(2, '0')} />
        <h3 className="font-serif text-2xl font-medium leading-tight text-ink transition-colors duration-300 group-hover:text-graphite sm:text-4xl lg:text-5xl">
          {p.name}
        </h3>
        {p.body && (
          <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-graphite/75 sm:mt-4 sm:text-base">
            {p.body}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-widest text-graphite/70 transition-colors duration-300 group-hover:text-ink sm:mt-6">
          View project
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </button>
  )
}

function Card({ p, index }) {
  return (
    <button
      onClick={() => navigate(`/projects/${p.id}`)}
      data-cursor="View"
      className="group flex h-full flex-col text-left outline-none"
    >
      <IndexRule n={String(index + 1).padStart(2, '0')} />
      <Thumb p={p} index={index} className="aspect-[16/10]" />

      <div className="mt-3 flex items-baseline justify-between gap-3 sm:mt-4">
        <h3 className="font-serif text-lg font-medium leading-tight text-ink transition-colors duration-300 group-hover:text-graphite sm:text-2xl">
          {p.name}
        </h3>
        <span
          aria-hidden
          className="shrink-0 -translate-x-1 text-ink opacity-0 transition-all duration-300 ease-ethereal group-hover:translate-x-0 group-hover:opacity-100"
        >
          →
        </span>
      </div>
      {p.body && (
        <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-graphite/70">
          {p.body}
        </p>
      )}
    </button>
  )
}

export default function AllProjects() {
  const { data: projects } = useCmsData(fetchProjects, FALLBACK)
  const [lead, ...rest] = projects

  return (
    <main className="relative min-h-screen px-5 pb-20 pt-24 sm:px-10 sm:pb-28 sm:pt-36 lg:px-20">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mb-10 sm:mb-14">
          <button
            onClick={() => navigate('/')}
            data-cursor="Back"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-graphite/70 transition-colors duration-300 hover:text-ink"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Home
          </button>
        </Reveal>

        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-16">
          <div>
            <SectionLabel>The full archive</SectionLabel>
            <h1 className="font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-6xl lg:text-7xl">
              All projects
            </h1>
          </div>
          <span className="pb-2 font-serif text-lg text-ash">
            {String(projects.length).padStart(2, '0')} projects
          </span>
        </Reveal>

        {/* Editorial rhythm: one full-width lead project, then a 2-up grid of
            cards — each now carrying a two-line description instead of a tag.
            All stacks to a single column on phone. */}
        {lead && (
          <Reveal y={28} className="mb-10 sm:mb-20">
            <Feature p={lead} index={0} />
          </Reveal>
        )}

        {rest.length > 0 && (
          <Reveal
            stagger={0.07}
            y={28}
            className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2 sm:gap-y-14 lg:gap-x-14 lg:gap-y-16"
          >
            {rest.map((p, i) => (
              <Card key={p.id} p={p} index={i + 1} />
            ))}
          </Reveal>
        )}

        <Footer className="mt-24 sm:mt-32" />
      </div>
    </main>
  )
}
