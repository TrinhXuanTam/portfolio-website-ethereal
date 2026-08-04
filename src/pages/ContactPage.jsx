import Contact from '../sections/Contact'
import Reveal from '../components/interactive/Reveal'
import { navigate } from '../lib/router'

// Standalone /contact route — reuses the Contact section with a back link and
// top padding so it clears the fixed nav.
export default function ContactPage() {
  return (
    <div className="relative pt-28 sm:pt-32">
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-10 lg:px-20">
        <Reveal>
          <button
            onClick={() => navigate('/')}
            data-cursor="Back"
            className="group inline-flex items-center gap-2 text-sm uppercase tracking-widest text-graphite/70 transition-colors duration-300 hover:text-ink"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            Home
          </button>
        </Reveal>
      </div>
      <Contact />
    </div>
  )
}
