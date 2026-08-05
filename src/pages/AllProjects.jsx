import { PROJECTS } from '../data/content'
import Reveal from '../components/interactive/Reveal'
import SectionLabel from '../components/ui/SectionLabel'
import ProjectArt from '../canvas/ProjectArt'
import { useCmsData } from '../lib/useCmsData'
import { fetchProjects } from '../lib/cms'
import { navigate } from '../lib/router'

const FALLBACK = PROJECTS.items.map((p, i) => ({
  ...p,
  id: `static-${i}`,
  thumbnail: null,
  url: null,
}))

function Media({ p, index, ratio }) {
  return (
    <div className={'relative overflow-hidden rounded-2xl ' + ratio}>
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

function Meta({ p, big = false }) {
  return (
    <>
      <h3
        className={
          'font-serif font-medium leading-tight text-ink transition-colors duration-300 group-hover:text-graphite ' +
          (big ? 'text-3xl sm:text-4xl' : 'text-2xl')
        }
      >
        {p.name}
      </h3>
      <p
        className={
          'mt-2 font-light leading-relaxed text-graphite/70 ' +
          (big ? 'max-w-xl text-base' : 'line-clamp-2 text-sm')
        }
      >
        {p.body}
      </p>
      {p.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {p.tags.slice(0, big ? 4 : 3).map((t) => (
            <li
              key={t}
              className="pill rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-widest text-graphite/70"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

// Editorial row: image and copy side by side, alternating sides per row.
function Row({ p, index }) {
  const flip = index % 2 === 1
  return (
    <Reveal y={44}>
      <button
        onClick={() => navigate(`/projects/${p.id}`)}
        data-cursor="View"
        className={
          'group grid w-full gap-6 text-left outline-none lg:grid-cols-12 lg:items-center lg:gap-12 ' +
          (flip ? 'lg:[direction:rtl]' : '')
        }
      >
        <div className="lg:col-span-7 lg:[direction:ltr]">
          <Media p={p} index={index} ratio="aspect-[16/10]" />
        </div>
        <div className="lg:col-span-5 lg:[direction:ltr]">
          <Meta p={p} big />
        </div>
      </button>
    </Reveal>
  )
}

export default function AllProjects() {
  const { data: projects } = useCmsData(fetchProjects, FALLBACK)

  return (
    <main className="relative min-h-screen px-6 pb-28 pt-32 sm:px-10 sm:pt-36 lg:px-20">
      <div className="mx-auto w-full max-w-6xl">
        {/* back link sits on its own line, clear of the title */}
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

        <Reveal className="mb-14 sm:mb-20">
          <SectionLabel>The full archive</SectionLabel>
          <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight text-ink sm:text-6xl lg:text-7xl">
            All projects
          </h1>
        </Reveal>

        {/* editorial alternating rows */}
        <div className="space-y-20 lg:space-y-28">
          {projects.map((p, i) => (
            <Row key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
