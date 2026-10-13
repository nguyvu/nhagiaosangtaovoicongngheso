export const DIMENSION_MIN = 1;
export const DIMENSION_MAX = 10;
export const MAX_UNIT_CUBES = 216;
export const SOLID_COUNTS = Object.freeze({ vertices: 8, edges: 12, faces: 6 });
// Use the same approximation in lessons, answers and the flat net.
export const PI = 3.14;

export function formatMeasure(value) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(value);
}

export function clampDimension(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(DIMENSION_MAX, Math.max(DIMENSION_MIN, Math.round(number)))
    : DIMENSION_MIN;
}

export function getDimensions(shape, dimensions) {
  if (shape === 'cylinder') return { radius: dimensions.radius, h: dimensions.h };
  return shape === 'cube'
    ? { d: dimensions.a, r: dimensions.a, h: dimensions.a }
    : { d: dimensions.d, r: dimensions.r, h: dimensions.h };
}

export function calculateGeometry(dimensions) {
  const { d, r, h, radius } = dimensions;
  if (radius !== undefined) {
    const round = value => Math.round(value * 100) / 100;
    const baseArea = PI * radius * radius;
    const lateralArea = 2 * PI * radius * h;
    return { baseArea: round(baseArea), circumference: round(2 * PI * radius),
      lateralArea: round(lateralArea), totalArea: round(lateralArea + 2 * baseArea), volume: round(baseArea * h) };
  }
  return {
    lateralArea: 2 * (d + r) * h,
    totalArea: 2 * (d * r + d * h + r * h),
    volume: d * r * h,
  };
}

export function canShowUnitCubes(dimensions) {
  return ['d', 'r', 'h'].every(key => Number.isInteger(dimensions[key]) && dimensions[key] >= 1)
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
