export default function ShapeIcon({ wide = false }) {
  return <svg viewBox="0 0 80 72" fill="none" aria-hidden="true" className="shape-icon">
    <g transform={wide ? 'translate(-8 7) scale(1.2 .8)' : undefined} stroke="currentColor" strokeWidth="2.3" strokeLinejoin="round">
      <path d="M40 5 70 21 40 38 10 21Z" fill="#ffe6ee" />
      <path d="M10 21 40 38 40 69 10 52Z" fill="#fbb6ce" />
      <path d="M40 38 70 21 70 52 40 69Z" fill="#ed86ac" />
    </g>
  </svg>;
}
