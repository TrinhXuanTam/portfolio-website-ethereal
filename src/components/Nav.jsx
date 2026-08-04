import { useEffect, useState } from 'react'
import { scrollToId } from '../lib/useLenis'
import { useHashRoute, navigate } from '../lib/router'
import { CONTACT } from '../data/content'

// One item per route — clean and predictable regardless of which page you're on.
// Contact is rendered separately as a call-to-action pill.
const LINKS = [
  { path: '/', label: 'Home', match: 'home' },
  { path: '/about', label: 'About', match: 'about' },
  { path: '/projects', label: 'Work', match: 'projects' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const route = useHashRoute()
  const onHome = route.name === 'home'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const goHome = (e) => {
    e.preventDefault()
    if (onHome) scrollToId('top')
    else navigate('/')
  }

  // "Work" maps to the projects route; the detail page is also part of Work.
  const isActive = (l) =>
    l.match === route.name || (l.match === 'projects' && route.name === 'project')

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-6 pt-5">
      <nav
        className={
          'pointer-events-auto flex items-center gap-1 rounded-full px-3 py-2 transition-all duration-700 ease-ethereal ' +
          (scrolled || !onHome ? 'glass-strong' : 'bg-transparent')
        }
      >
        <a
          href="#/"
          onClick={goHome}
          aria-label="Home"
          className="group mr-2 flex items-center gap-0.5 pl-2.5 pr-3 font-serif text-xl font-semibold leading-none tracking-tight text-ink sm:mr-3 sm:pl-3 sm:text-2xl"
        >
          TXT
          <span className="mb-0.5 h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
        </a>
        {/* divider between brand mark and nav links */}
        <span className="mr-1 hidden h-4 w-px bg-graphite/15 sm:inline-block" />
        <div className="flex items-center gap-0.5 sm:gap-1">
          {LINKS.map((l) => (
            <a
              key={l.path}
              href={`#${l.path}`}
              onClick={(e) => {
                e.preventDefault()
                l.path === '/' ? goHome(e) : navigate(l.path)
              }}
              className={
                'rounded-full px-2.5 py-1.5 text-[0.7rem] uppercase tracking-wide transition-colors duration-300 sm:px-4 sm:text-xs sm:tracking-widest ' +
                (isActive(l) ? 'text-graphite' : 'text-ash hover:text-graphite')
              }
            >
              {l.label}
            </a>
          ))}

          {/* CV — opens the PDF in a new tab; hidden on the smallest screens */}
          <a
            href={CONTACT.cvUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full px-4 py-1.5 text-xs uppercase tracking-widest text-ash transition-colors duration-300 hover:text-graphite sm:inline"
          >
            CV
          </a>

          {/* Contact as a call-to-action pill */}
          <a
            href="#/contact"
            onClick={(e) => {
              e.preventDefault()
              navigate('/contact')
            }}
            className={
              'ml-0.5 rounded-full px-3 py-1.5 text-[0.7rem] uppercase tracking-wide transition-all duration-500 ease-ethereal sm:ml-1 sm:px-5 sm:text-xs sm:tracking-widest ' +
              (route.name === 'contact'
                ? 'bg-graphite text-pearl'
                : 'bg-graphite/90 text-pearl hover:scale-[1.04] hover:bg-graphite')
            }
          >
            <span className="sm:hidden">Talk</span>
            <span className="hidden sm:inline">Let's talk</span>
          </a>
        </div>
      </nav>
    </header>
  )
}
