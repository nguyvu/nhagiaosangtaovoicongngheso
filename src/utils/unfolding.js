import { Matrix4, Vector3 } from 'three';

export const NET_ANIMATION_SECONDS = 2.4;

export function smoothProgress(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function stageProgress(progress, start, end) {
  return smoothProgress((progress - start) / (end - start));
}

const translate = (x, y, z) => new Matrix4().makeTranslation(x, y, z);
const rotateX = angle => new Matrix4().makeRotationX(angle);
const rotateY = angle => new Matrix4().makeRotationY(angle);

// Every face remains attached to its hinge throughout the motion.
export function getBoxNetFaces({ d, r, h }, progress) {
  const sides = (1 - stageProgress(progress, .1, .85)) * Math.PI / 2;
  const back = (1 - stageProgress(progress, .3, 1)) * Math.PI / 2;
  const caps = (1 - stageProgress(progress, 0, .55)) * Math.PI / 2;
  const root = translate(d / 2 * progress, 0, r / 2 * (1 - progress));
  const left = root.clone().multiply(translate(-d / 2, 0, 0)).multiply(rotateY(-sides));
  return [
    { number: 1, width: d, height: h, matrix: left.clone().multiply(translate(-r, 0, 0)).multiply(rotateY(-back)).multiply(translate(-d / 2, 0, 0)), color: '#df85ad' },
    { number: 2, width: r, height: h, matrix: left.clone().multiply(translate(-r / 2, 0, 0)), color: '#d978a4' },
    { number: 3, width: d, height: h, matrix: root.clone(), color: '#df85ad' },
    { number: 4, width: r, height: h, matrix: root.clone().multiply(translate(d / 2, 0, 0)).multiply(rotateY(sides)).multiply(translate(r / 2, 0, 0)), color: '#d978a4' },
    { number: 5, width: d, height: r, matrix: root.clone().multiply(translate(0, h / 2, 0)).multiply(rotateX(-caps)).multiply(translate(0, r / 2, 0)), color: '#e691ba', base: true },
    { number: 6, width: d, height: r, matrix: root.clone().multiply(translate(0, -h / 2, 0)).multiply(rotateX(caps)).multiply(translate(0, -r / 2, 0)), color: '#e691ba', base: true },
  ];
}

export function getNetSize(dimensions) {
  return dimensions.radius !== undefined
    ? { width: 2 * Math.PI * dimensions.radius, height: dimensions.h + 4 * dimensions.radius }
    : { width: 2 * (dimensions.d + dimensions.r), height: dimensions.h + 2 * dimensions.r };
}

export function getNetViewDistance(dimensions, width, height, fov) {
  const net = getNetSize(dimensions);
  // Reserve space for readable number callouts outside narrow faces.
  const usableWidth = Math.max(width - 112, width / 2);
  const usableHeight = Math.max(height - 112, height / 2);
  return height / (2 * Math.tan(fov * Math.PI / 360)) * Math.max(net.width / usableWidth, net.height / usableHeight);
}

export function getNetLabelLayout({ width, height, radius, base, naturalSize }, pixelsPerUnit) {
  const w = radius ? 2 * radius : width;
  const h = radius ? 2 * radius : height;
  const external = Math.min(w, h) * pixelsPerUnit < 28;
  const size = (external ? 28 : Math.max(28, Math.min(36, naturalSize * pixelsPerUnit))) / pixelsPerUnit;
  return {
    size, external,
    x: external && base ? w / 2 + 28 / pixelsPerUnit : 0,
    y: external && !base ? h / 2 + 28 / pixelsPerUnit : 0,
    anchorX: external && base ? w / 2 : 0,
    anchorY: external && !base ? h / 2 : 0,
  };
}

// A strip of constant arc length: curvature decreases continuously to a flat rectangle.
export function getCylinderStripPoint(radius, arcPosition, progress) {
  const curvature = (1 - progress) / radius;
  if (Math.abs(curvature) < 1e-7) return [arcPosition, 0];
  const angle = arcPosition * curvature;
  return [Math.sin(angle) / curvature, (Math.cos(angle) - 1) / curvature + radius * (1 - progress)];
}

export function getCylinderCapMatrices({ radius, h }, progress) {
  const rolled = stageProgress(progress, .2, 1);
  const angle = (1 - stageProgress(progress, 0, .35)) * Math.PI / 2;
  const z = radius * (1 - rolled);
  return [
    translate(0, h / 2, z).multiply(rotateX(-angle)).multiply(translate(0, radius, 0)),
    translate(0, -h / 2, z).multiply(rotateX(angle)).multiply(translate(0, -radius, 0)),
  ];
}

export function getUnfoldingPoints(shape, dimensions, progress) {
  if (shape !== 'cylinder') return getBoxNetFaces(dimensions, progress).flatMap(face =>
    [-1, 1].flatMap(x => [-1, 1].map(y => new Vector3(x * face.width / 2, y * face.height / 2, 0).applyMatrix4(face.matrix))));
  const { radius, h } = dimensions;
  const rolled = stageProgress(progress, .2, 1);
  const points = [];
  for (let i = 0; i <= 96; i++) {
    const arc = (i / 96 - .5) * 2 * Math.PI * radius;
    const [x, z] = getCylinderStripPoint(radius, arc, rolled);
    points.push(new Vector3(x, -h / 2, z), new Vector3(x, h / 2, z));
  }
  for (const matrix of getCylinderCapMatrices(dimensions, progress)) for (let i = 0; i < 96; i++) {
    const angle = i / 96 * Math.PI * 2;
    points.push(new Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0).applyMatrix4(matrix));
  }
  return points;
}

// Fit the actual moving vertices in perspective, including the nearer corners.
export function getUnfoldingFrameDistance(points, direction, aspect, fov, margin = .82) {
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const tangent = Math.tan(fov * Math.PI / 360) * margin;
  return Math.max(...points.map(point => point.dot(direction) + Math.max(Math.abs(point.dot(up)) / tangent, Math.abs(point.dot(right)) / (tangent * aspect))));
}
