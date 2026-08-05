import { useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Softly materializes its children as they scroll into view — fade + rise +
 * de-blur with a long ethereal ease. Set `stagger` to cascade direct children.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  y = 30,
  stagger = 0,
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    if (prefersReduced || !ref.current) return
    const el = ref.current
    const targets = stagger > 0 ? Array.from(el.children) : [el]

    const ctx = gsap.context(() => {
      // Animate only opacity + transform (compositor-cheap). The former
      // filter:blur animation forced a repaint every frame per element and,
      // with stagger, ran many at once — a real jank source.
      gsap.set(targets, { opacity: 0, y })
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay,
        ease: 'power3.out',
        stagger: stagger || 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true,
        },
      })
    }, ref)

    return () => ctx.revert()
  }, [delay, y, stagger])

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
