import { useEffect, useCallback } from 'react'

// Fullscreen image lightbox with prev/next toggling. Controlled by the parent:
// `index` is the active image (or null when closed). Supports arrow keys, Esc,
// clicking the backdrop to close, and on-screen controls.
export default function Lightbox({ images, index, onClose, onChange }) {
  const open = index !== null && index >= 0

  const prev = useCallback(
    (e) => {
      e?.stopPropagation()
      onChange((index - 1 + images.length) % images.length)
    },
    [index, images.length, onChange]
  )
  const next = useCallback(
    (e) => {
      e?.stopPropagation()
      onChange((index + 1) % images.length)
    },
    [index, images.length, onChange]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    // lock body scroll while open
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, prev, next, onClose])

  if (!open) return null

  const multiple = images.length > 1

  return (
    <div
      className="lightbox-fade fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-10"
      style={{ background: 'rgba(26,26,24,0.82)', backdropFilter: 'blur(14px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="glass-strong absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full text-lg text-graphite transition-transform duration-300 hover:scale-105"
      >
        ✕
      </button>

      {/* prev */}
      {multiple && (
        <button
          onClick={prev}
          aria-label="Previous"
          className="glass-strong absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-xl text-graphite transition-transform duration-300 hover:scale-105 sm:left-8"
        >
          ←
        </button>
      )}

      {/* image */}
      <img
        key={index}
        src={images[index]}
        alt={`View ${index + 1} of ${images.length}`}
        onClick={(e) => e.stopPropagation()}
        className="lightbox-img max-h-full max-w-full rounded-2xl object-contain shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
      />

      {/* next */}
      {multiple && (
        <button
          onClick={next}
          aria-label="Next"
          className="glass-strong absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-xl text-graphite transition-transform duration-300 hover:scale-105 sm:right-8"
        >
          →
        </button>
      )}

      {/* counter */}
      {multiple && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest2 text-white/70">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  )
}
