import CylinderNet from './CylinderNet';
import { getNetLabelLayout } from '../utils/unfolding';
import { useEffect, useRef } from 'react';

const UNIT = 28;

// Four side faces form a strip. Both d × r bases attach to the d × h third face.
function BoxNet({ dimensions: { d, r, h } }) {
  const contentWidth = 2 * (d + r) * UNIT;
  const contentHeight = (h + 2 * r) * UNIT;
  const mobileScale = 188 / Math.max(contentWidth, contentHeight);
  const MARGIN = 56 / mobileScale;
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

  return <svg viewBox={`0 0 ${width} ${height}`} focusable="false">
      {faces.map(face => {
        const label = getNetLabelLayout({ width: face.width / UNIT, height: face.height / UNIT, base: face.kind === 'base', naturalSize: Math.min(face.width, face.height) / UNIT * .38 }, UNIT * mobileScale);
        return <g key={face.number} transform={`translate(${face.x} ${face.y})`}>
          <g className={`net-face net-face-${face.kind}`} style={{ '--net-x': `${face.dx || 0}px`, '--net-y': `${face.dy || 0}px` }}>
            <rect width={face.width} height={face.height} />
            {label.external && <line x1={face.width / 2 + label.anchorX * UNIT} y1={face.height / 2 - label.anchorY * UNIT} x2={face.width / 2 + label.x * UNIT} y2={face.height / 2 - label.y * UNIT} stroke="#493342" />}
            <text x={face.width / 2 + label.x * UNIT} y={face.height / 2 - label.y * UNIT} fontSize={label.size * UNIT * .72} dominantBaseline="central" textAnchor="middle">{face.number}</text>
          </g>
        </g>;
      })}
    </svg>;
}

export default function ShapeNet({ shape, dimensions, closing, onCloseComplete, onOpenComplete }) {
  const container = useRef();
  useEffect(() => {
    if (container.current?.getClientRects().length && !closing && window.matchMedia('(prefers-reduced-motion: reduce)').matches) onOpenComplete?.();
  }, [closing, onOpenComplete]);
  return <div ref={container} className="shape-net" aria-hidden="true" onAnimationEnd={event => {
    if (event.target !== event.currentTarget || !event.currentTarget.getClientRects().length) return;
    if (closing) onCloseComplete();
    else onOpenComplete?.();
  }}>
    {shape === 'cylinder' ? <CylinderNet dimensions={dimensions} /> : <BoxNet dimensions={dimensions} />}
  </div>;
}
