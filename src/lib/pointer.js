// A single shared pointer target that the WebGL canvas reads every frame.
// DOM listeners write to it; the R3F render loop lerps toward it. Keeping one
// global source avoids re-rendering React on every mouse move.

export const pointer = {
  // normalized device-ish coords in [-1, 1]
  x: 0,
  y: 0,
  // raw client px for DOM effects
  clientX: 0,
  clientY: 0,
  // scroll signals the WebGL background reads so it also reacts to scrolling
  // (essential on touch devices where there is no pointer to follow):
  //   scrollN  — overall scroll progress, 0..1
  //   scrollV  — instantaneous scroll velocity, eased, roughly [-1, 1]
  scrollN: 0,
  scrollV: 0,
}

let bound = false

export function bindPointer() {
  if (bound || typeof window === 'undefined') return
  bound = true

  const onMove = (e) => {
    pointer.clientX = e.clientX
    pointer.clientY = e.clientY
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  let lastY = window.scrollY
  const onScroll = () => {
    const y = window.scrollY
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    pointer.scrollN = Math.min(1, Math.max(0, y / max))
    // accumulate raw delta; the render loop eases scrollV back toward 0
    pointer.scrollV += (y - lastY) * 0.005
    pointer.scrollV = Math.max(-1.0, Math.min(1.0, pointer.scrollV))
    lastY = y
  }
  window.addEventListener('scroll', onScroll, { passive: true })
}
