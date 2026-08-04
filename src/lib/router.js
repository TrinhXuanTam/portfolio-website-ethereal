import { useEffect, useState } from 'react'

// Minimal hash router — no dependency, works on any static host and needs no
// server rewrite rules. Routes:
//   #/                 → landing
//   #/projects         → all projects
//   #/projects/:id     → project detail
export function useHashRoute() {
  const [hash, setHash] = useState(
    typeof window !== 'undefined' ? window.location.hash : ''
  )

  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const path = (hash || '#/').replace(/^#/, '') || '/'
  const parts = path.split('/').filter(Boolean) // e.g. ['projects','7']

  if (parts[0] === 'projects' && parts[1]) {
    return { name: 'project', id: decodeURIComponent(parts[1]) }
  }
  if (parts[0] === 'projects') return { name: 'projects' }
  if (parts[0] === 'about') return { name: 'about' }
  if (parts[0] === 'contact') return { name: 'contact' }
  return { name: 'home', anchor: parts[0] || null }
}

// Kick off the CMS fetch for a destination the moment navigation starts, so it
// loads during the transition animation and is cached (sessionStorage) by the
// time the page mounts — the new page then renders instantly with no gap.
function prefetchFor(to) {
  const path = to.replace(/^#/, '')
  const parts = path.split('/').filter(Boolean)
  // dynamic import avoids a circular dependency between router and cms
  import('./cms')
    .then((cms) => {
      if (parts[0] === 'projects' && parts[1]) cms.fetchProject?.(parts[1])
      else if (parts[0] === 'projects') cms.fetchProjects?.()
      else if (parts[0] === 'about') cms.fetchAbout?.()
      else if (parts[0] === 'contact') cms.fetchContact?.()
    })
    .catch(() => {})
}

// Navigate + scroll to top (for route changes).
export function navigate(to) {
  prefetchFor(to)
  window.location.hash = to
  // let the hashchange fire, then jump to top
  requestAnimationFrame(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  })
}
