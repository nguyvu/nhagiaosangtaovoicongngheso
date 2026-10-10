export const DIMENSION_MIN = 1;
export const DIMENSION_MAX = 10;
export const MAX_UNIT_CUBES = 216;
export const SOLID_COUNTS = Object.freeze({ vertices: 8, edges: 12, faces: 6 });

export function clampDimension(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(DIMENSION_MAX, Math.max(DIMENSION_MIN, Math.round(number)))
    : DIMENSION_MIN;
}

export function getDimensions(shape, dimensions) {
  return shape === 'cube'
    ? { d: dimensions.a, r: dimensions.a, h: dimensions.a }
    : { d: dimensions.d, r: dimensions.r, h: dimensions.h };
}

export function calculateGeometry({ d, r, h }) {
  return {
    lateralArea: 2 * (d + r) * h,
    totalArea: 2 * (d * r + d * h + r * h),
    volume: d * r * h,
  };
}

export function canShowUnitCubes(dimensions) {
  return Object.values(dimensions).every(n => Number.isInteger(n) && n >= 1)
    && calculateGeometry(dimensions).volume <= MAX_UNIT_CUBES;
}

// Three.js BoxGeometry: +X, -X, +Y, -Y, +Z, -Z. Y là chiều cao.
export function isHighlightedFace(index, mode) {
  return mode === 'total' || mode === 'faces'
    || (mode === 'lateral' && index !== 2 && index !== 3);
}

export function getUnitPositions({ d, r, h }) {
  if (!canShowUnitCubes({ d, r, h })) return [];
  const positions = [];
  for (let x = 0; x < d; x += 1)
    for (let y = 0; y < h; y += 1)
      for (let z = 0; z < r; z += 1)
        positions.push([x - (d - 1) / 2, y - (h - 1) / 2, z - (r - 1) / 2]);
  return positions;
}
