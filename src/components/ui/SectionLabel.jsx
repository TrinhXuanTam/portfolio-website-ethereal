// Small monospace-adjacent eyebrow label used above section headings.
export default function SectionLabel({ children }) {
  return (
    <span className="mb-6 inline-block text-[0.7rem] uppercase tracking-widest2 text-ash">
      {children}
    </span>
  )
}
