import Magnetic from '../interactive/Magnetic'

// Translucent glassmorphic pill. Renders as <a> when href is given.
export default function GlassButton({ children, href, onClick, strong = false }) {
  const cls =
    (strong ? 'glass-strong ' : 'glass ') +
    'group inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm ' +
    'font-medium tracking-wide text-graphite transition-all duration-500 ease-ethereal ' +
    'hover:scale-[1.04] hover:shadow-[0_16px_60px_rgba(43,42,40,0.12)]'

  const inner = (
    <>
      <span>{children}</span>
      <span className="inline-block transition-transform duration-500 ease-ethereal group-hover:translate-x-1">
        →
      </span>
    </>
  )

  return (
    <Magnetic strength={0.4}>
      {href ? (
        <a href={href} onClick={onClick} className={cls}>
          {inner}
        </a>
      ) : (
        <button onClick={onClick} className={cls}>
          {inner}
        </button>
      )}
    </Magnetic>
  )
}
