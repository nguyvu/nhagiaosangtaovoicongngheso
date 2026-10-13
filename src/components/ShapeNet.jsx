const UNIT = 28;
const MARGIN = 12;

// Four side faces form a strip. Both d × r bases attach to the d × h third face.
export default function ShapeNet({ dimensions: { d, r, h }, closing, onCloseComplete }) {
  const sideY = MARGIN + r * UNIT;
  const centerX = MARGIN + (d + r) * UNIT;
  const faces = [
    { number: 1, x: MARGIN, y: sideY, width: d * UNIT, height: h * UNIT, kind: 'side', dx: (d + r) * UNIT },
    { number: 2, x: MARGIN + d * UNIT, y: sideY, width: r * UNIT, height: h * UNIT, kind: 'side', dx: r * UNIT },
    { number: 3, x: centerX, y: sideY, width: d * UNIT, height: h * UNIT, kind: 'side', dx: 0 },
    { number: 4, x: MARGIN + (2 * d + r) * UNIT, y: sideY, width: r * UNIT, height: h * UNIT, kind: 'side', dx: -d * UNIT },
    { number: 5, x: centerX, y: MARGIN, width: d * UNIT, height: r * UNIT, kind: 'base', dy: r * UNIT },
    { number: 6, x: centerX, y: sideY + h * UNIT, width: d * UNIT, height: r * UNIT, kind: 'base', dy: -h * UNIT },
  ];
  const width = 2 * (d + r) * UNIT + 2 * MARGIN;
  const height = (h + 2 * r) * UNIT + 2 * MARGIN;
  const mobileScale = Math.min(300 / width, 300 / height);

  return <div className="shape-net" aria-hidden="true" onAnimationEnd={event => {
    if (closing && event.target === event.currentTarget) onCloseComplete();
  }}>
    <svg viewBox={`0 0 ${width} ${height}`} focusable="false">
      {faces.map(face => {
        const showNumber = Math.min(face.width, face.height) * mobileScale >= 21;
        return <g key={face.number} transform={`translate(${face.x} ${face.y})`}>
          <g className={`net-face net-face-${face.kind}`} style={{ '--net-x': `${face.dx || 0}px`, '--net-y': `${face.dy || 0}px` }}>
            <rect width={face.width} height={face.height} />
            {showNumber && <text x={face.width / 2} y={face.height / 2} fontSize={Math.min(30, Math.min(face.width, face.height) * .82)} dominantBaseline="central" textAnchor="middle">{face.number}</text>}
          </g>
        </g>;
      })}
    </svg>
  </div>;
}
