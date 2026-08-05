import { VALUES } from '../data/content'
import SectionLabel from '../components/ui/SectionLabel'
import Reveal from '../components/interactive/Reveal'

const ACCENTS = ['#3F6B5E', '#6E8FA6', '#B99A5B']

// Editorial card grid — each cell is a self-contained block (number, value,
// description stacked), separated by hairline rules. Reading order is
// unambiguous: scan each card top to bottom, left to right.
export default function Values() {
  return (
    <section id="values" className="relative px-6 py-20 sm:px-10 sm:py-28 lg:px-20 lg:py-40">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="mb-12 max-w-3xl sm:mb-16">
          <SectionLabel>The reasons</SectionLabel>
          <h2 className="font-serif text-4xl font-medium leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl">
            {VALUES.title}
          </h2>
        </Reveal>

        <Reveal
          stagger={0.08}
          y={28}
          className="grid gap-px overflow-hidden rounded-3xl bg-graphite/10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {VALUES.items.map((v, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <div
                key={v.name}
                className="group relative bg-alabaster/70 p-8 backdrop-blur-sm transition-colors duration-500 hover:bg-pearl/85 lg:p-10"
              >
                {/* accent bar that grows on hover */}
                <span
                  className="mb-6 block h-[3px] w-8 rounded-full transition-all duration-500 ease-ethereal group-hover:w-14"
                  style={{ backgroundColor: accent }}
                />
                <h3 className="mb-3 font-serif text-2xl font-medium leading-tight text-ink sm:text-3xl">
                  {v.name}
                </h3>
                <p className="text-sm font-light leading-relaxed text-graphite/70">
                  {v.body}
                </p>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
