// Shared site footer. Lives on every route (landing Contact section reuses it
// too), so the standalone pages don't end on a hard edge.
export default function Footer({ className = '' }) {
  return (
    <footer
      className={
        'mx-auto w-full max-w-6xl border-t border-graphite/10 pt-8 ' + className
      }
    >
      <div className="flex flex-col items-center justify-between gap-4 text-xs uppercase tracking-widest text-ash sm:flex-row">
        <span className="font-serif normal-case tracking-tight text-graphite">
          Trinh Xuan Tam
        </span>
        <span>Paris, France</span>
        <span>© {new Date().getFullYear()} — All rights reserved</span>
      </div>
    </footer>
  )
}
