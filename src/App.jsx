import { useEffect } from 'react'
import Scene from './canvas/Scene'
import Nav from './components/Nav'
import Cursor from './components/Cursor'
import Hero from './sections/Hero'
import Services from './sections/Services'
import Workflow from './sections/Workflow'
import Projects from './sections/Projects'
import Values from './sections/Values'
import Contact from './sections/Contact'
import AllProjects from './pages/AllProjects'
import ProjectDetail from './pages/ProjectDetail'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import RouteTransition from './components/RouteTransition'
import ScrollProgress from './components/ScrollProgress'
import { useLenis } from './lib/useLenis'
import { bindPointer } from './lib/pointer'
import { useHashRoute } from './lib/router'
import { initAnalytics } from './lib/firebase'

function Landing() {
  return (
    <main>
      <Hero />
      <Services />
      <Workflow />
      <Projects />
      <Values />
      <Contact />
    </main>
  )
}

export default function App() {
  useLenis()
  const route = useHashRoute()

  useEffect(() => {
    bindPointer()
    initAnalytics()
  }, [])

  // Refresh ScrollTrigger measurements whenever the route (and thus the DOM
  // height) changes, so scroll-driven effects on the new page compute correctly.
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [route.name, route.id])

  return (
    <>
      {/* Layer 0 — continuous WebGL fluid background, persists across routes */}
      <Scene />
      <Cursor />

      {/* Veil that masks the brief flash on every route change */}
      <RouteTransition routeKey={`${route.name}:${route.id || ''}`} />

      {/* Hairline scroll-progress line — on every route (keyed so it resets) */}
      <ScrollProgress key={`${route.name}:${route.id || ''}`} />

      {/* Layer 1 — routed DOM UI overlaying the canvas */}
      <div className="dom-layer">
        <Nav />
        {route.name === 'projects' && <AllProjects />}
        {route.name === 'project' && <ProjectDetail id={route.id} />}
        {route.name === 'about' && <AboutPage />}
        {route.name === 'contact' && <ContactPage />}
        {route.name === 'home' && <Landing />}
      </div>
    </>
  )
}
