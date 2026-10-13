export default function ShapeIcon({ wide = false, cylinder = false }) {
  if (cylinder) return <svg viewBox="0 0 80 72" fill="none" aria-hidden="true" className="shape-icon">
    <g stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round">
      <path d="M13 17V55C13 70 67 70 67 55V17" fill="var(--shape-left, #bee399)" />
      <path d="M40 29V66C56 66 67 62 67 55V17" fill="var(--shape-right, #8dc970)" stroke="none" />
      <path d="M13 17V55C13 70 67 70 67 55V17" />
      <ellipse cx="40" cy="17" rx="27" ry="12" fill="var(--shape-top, #e7f6cc)" />
    </g>
  </svg>;
  return <svg viewBox="0 0 80 72" fill="none" aria-hidden="true" className="shape-icon">
    <g transform={wide ? 'translate(-8 7) scale(1.2 .8)' : undefined} stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round">
      <path d="M40 5 70 21 40 38 10 21Z" fill="var(--shape-top, #e7f6cc)" />
      <path d="M10 21 40 38 40 69 10 52Z" fill="var(--shape-left, #bee399)" />
      <path d="M40 38 70 21 70 52 40 69Z" fill="var(--shape-right, #8dc970)" />
    </g>
  </svg>;
}
