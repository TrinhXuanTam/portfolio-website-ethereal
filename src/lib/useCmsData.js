import { useEffect, useState } from 'react'

// Loads data from an async fetcher, falling back to a static value if the CMS
// is unreachable. Returns { data, source } where source is 'cms' | 'fallback'
// | 'loading', so the UI can start with real static content and swap in live
// CMS content once it arrives (no empty flash, graceful offline behavior).
export function useCmsData(fetcher, fallback) {
  const [state, setState] = useState({ data: fallback, source: 'loading' })

  useEffect(() => {
    let alive = true
    fetcher()
      .then((data) => {
        if (!alive) return
        if (Array.isArray(data) ? data.length : data) {
          setState({ data, source: 'cms' })
        } else {
          setState({ data: fallback, source: 'fallback' })
        }
      })
      .catch(() => {
        if (alive) setState({ data: fallback, source: 'fallback' })
      })
    return () => {
      alive = false
    }
    // fetcher/fallback are stable module-level values in practice
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
