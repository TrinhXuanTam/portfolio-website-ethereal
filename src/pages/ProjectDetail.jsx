import { useEffect, useState } from 'react'
import Reveal from '../components/interactive/Reveal'
import SectionLabel from '../components/ui/SectionLabel'
import GlassButton from '../components/ui/GlassButton'
import Lightbox from '../components/Lightbox'
import { fetchProject, cachedPeek } from '../lib/cms'
import { navigate } from '../lib/router'

// Strapi richtext arrives as markdown-ish text; render paragraphs simply.
function RichText({ text }) {
  if (!text) return null
  const blocks = text.split(/\n{2,}/).filter(Boolean)
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <p key={i} className="text-base font-light leading-relaxed text-graphite/85 sm:text-lg">
          {b}
        </p>
      ))}
    </div>
  )
}

function MetaList({ label, items }) {
  if (!items || items.length === 0) return null
  return (
    <div>
      <span className="mb-3 block text-[0.7rem] uppercase tracking-widest2 text-ash">
        {label}
      </span>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="text-sm font-light text-graphite/85">
            {it}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ProjectDetail({ id }) {
  // Seed from cache — if navigate() prefetched during the transition, the page
  // renders fully on mount with no loading state.
  const seed = cachedPeek(`project:${id}`)
  const [state, setState] = useState(
    seed ? { status: 'ok', project: seed } : { status: 'loading', project: null }
  )
  const [lightbox, setLightbox] = useState(null) // active gallery index, or null

  useEffect(() => {
    let alive = true
    const cachedProject = cachedPeek(`project:${id}`)
    if (cachedProject) {
      setState({ status: 'ok', project: cachedProject })
      setLightbox(null)
      return
    }
    setState({ status: 'loading', project: null })
    setLightbox(null)
    fetchProject(id)
      .then((p) => alive && setState({ status: p ? 'ok' : 'missing', project: p }))
      .catch(() => alive && setState({ status: 'error', project: null }))
    return () => {
      alive = false
    }
  }, [id])

  const back = (
    <button
      onClick={() => navigate('/projects')}
      data-cursor="Back"
      className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-graphite/70 transition-colors duration-300 hover:text-ink"
    >
      <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
      All projects
    </button>
  )

  if (state.status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <span className="text-sm uppercase tracking-widest2 text-ash">Loading…</span>
      </main>
    )
  }

  if (state.status !== 'ok') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="font-serif text-3xl text-ink">Project not found</p>
        {back}
      </main>
    )
  }

  const p = state.project

  return (
    <main className="relative min-h-screen px-6 pb-28 pt-32 sm:px-10 sm:pt-36 lg:px-20">
      <div className="mx-auto w-full max-w-5xl">
        <Reveal className="mb-10">{back}</Reveal>

        {/* Title block */}
        <Reveal className="mb-12">
          <SectionLabel>Project</SectionLabel>
          <h1 className="font-serif text-5xl font-medium leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
            {p.name}
          </h1>
          {p.brief && (
            <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-graphite/80">
              {p.brief}
            </p>
          )}
          {p.url && (
            <div className="mt-8">
              <GlassButton href={p.url} strong>
                Visit live project
              </GlassButton>
            </div>
          )}
        </Reveal>

        {/* Hero image */}
        {p.thumbnail && (
          <Reveal className="mb-16">
            <div className="overflow-hidden rounded-3xl ring-1 ring-white/40">
              <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
            </div>
          </Reveal>
        )}

        {/* Body + meta */}
        <div className="grid gap-12 lg:grid-cols-[1fr_16rem] lg:gap-16">
          <Reveal>
            {p.description ? (
              <RichText text={p.description} />
            ) : (
              <p className="text-lg font-light leading-relaxed text-graphite/85">{p.brief}</p>
            )}
          </Reveal>

          <Reveal className="flex flex-col gap-8 lg:border-l lg:border-graphite/12 lg:pl-10">
            <MetaList label="Roles" items={p.roles} />
            <MetaList label="Responsibilities" items={p.responsibilities} />
            <MetaList label="Technologies" items={p.technologies} />
          </Reveal>
        </div>

        {/* Gallery */}
        {p.images.length > 0 && (
          <Reveal className="mt-20">
            <span className="mb-6 block text-[0.7rem] uppercase tracking-widest2 text-ash">
              Gallery
            </span>
            <div className="grid gap-5 sm:grid-cols-2">
              {p.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i)}
                  data-cursor="Open"
                  className="group block overflow-hidden rounded-2xl outline-none ring-1 ring-white/40"
                >
                  <img
                    src={src}
                    alt={`${p.name} ${i + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-ethereal group-hover:scale-[1.04]"
                  />
                </button>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal className="mt-24 flex justify-center">
          <GlassButton onClick={() => navigate('/projects')}>Back to all projects</GlassButton>
        </Reveal>
      </div>

      {/* Fullscreen gallery lightbox */}
      <Lightbox
        images={p.images}
        index={lightbox}
        onClose={() => setLightbox(null)}
        onChange={setLightbox}
      />
    </main>
  )
}
