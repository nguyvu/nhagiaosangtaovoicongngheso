import { calculateGeometry } from '../utils/geometry';

const UNIT = 28;
const MARGIN = 12;

export default function CylinderNet({ dimensions }) {
  const { radius, h } = dimensions;
  const r = radius * UNIT;
  const length = calculateGeometry(dimensions).circumference * UNIT;
  const height = h * UNIT;
  const width = length + 2 * MARGIN;
  const netHeight = height + 4 * r + 2 * MARGIN;
  const centerX = width / 2;
  const rectY = MARGIN + 2 * r;
  const scale = Math.min(300 / width, 300 / netHeight);
  const showNumbers = Math.min(2 * r, height) * scale >= 21;
  const numberSize = Math.min(30, 1.4 * r, height * .8);
  return <svg viewBox={`0 0 ${width} ${netHeight}`} focusable="false">
    <g className="net-face net-face-side">
      <rect x={MARGIN} y={rectY} width={length} height={height} />
      {showNumbers && <text x={centerX} y={rectY + height / 2} fontSize={numberSize} dominantBaseline="central" textAnchor="middle">1</text>}
    </g>
    {[{ number: 2, cy: MARGIN + r, dy: r + height / 2 }, { number: 3, cy: rectY + height + r, dy: -r - height / 2 }].map(base => <g key={base.number} className="net-face net-face-base" style={{ '--net-y': `${base.dy}px` }}>
      <circle cx={centerX} cy={base.cy} r={r} />
      {showNumbers && <text x={centerX} y={base.cy} fontSize={numberSize} dominantBaseline="central" textAnchor="middle">{base.number}</text>}
    </g>)}
  </svg>;
}
