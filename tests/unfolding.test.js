import test from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { getBoxNetFaces, getNetSize, getCylinderStripPoint, getCylinderCapMatrices, getUnfoldingPoints, getUnfoldingFrameDistance, getNetViewDistance, getNetLabelLayout, stageProgress } from '../src/utils/unfolding.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} ≈ ${expected}`);
const point = (face, xyz) => new Vector3(...xyz).applyMatrix4(face.matrix);
const samePoint = (a, b) => close(a.distanceTo(b), 0);

test('Every net label remains readable; narrow faces use leaders instead of hiding numbers', () => {
  for (const dimensions of [{ d: 5, r: 3, h: 2 }, { d: 10, r: 1, h: 10 }, { d: 1, r: 10, h: 1 }]) {
    for (const [width, height] of [[628, 400], [308, 340]]) {
      const distance = getNetViewDistance(dimensions, width, height, 38);
      const pixels = height / (2 * Math.tan(38 * Math.PI / 360) * distance);
      for (const face of getBoxNetFaces(dimensions, 1)) {
        const label = getNetLabelLayout({ ...face, naturalSize: Math.min(face.width, face.height) * .38 }, pixels);
        assert.ok(label.size * pixels >= 27.999 && label.size * pixels <= 36.001);
        if (Math.min(face.width, face.height) * pixels < 28) {
          assert.equal(label.external, true);
          assert.ok(Math.abs(label.x) + Math.abs(label.y) > 0);
        }
      }
    }
  }
});

test('Six hinged rectangles close to the exact cuboid surfaces and outward normals', () => {
  const faces = getBoxNetFaces({ d: 5, r: 3, h: 2 }, 0);
  const centers = [[0, 0, -1.5], [-2.5, 0, 0], [0, 0, 1.5], [2.5, 0, 0], [0, 1, 0], [0, -1, 0]];
  const normals = [[0, 0, -1], [-1, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0], [0, -1, 0]];
  faces.forEach((face, i) => {
    samePoint(point(face, [0, 0, 0]), new Vector3(...centers[i]));
    samePoint(new Vector3(0, 0, 1).transformDirection(face.matrix), new Vector3(...normals[i]));
  });
});

test('Unfolded faces are coplanar, keep correct areas and do not overlap', () => {
  for (const dimensions of [{ d: 3, r: 3, h: 3 }, { d: 5, r: 3, h: 2 }, { d: 1, r: 10, h: 10 }]) {
    const faces = getBoxNetFaces(dimensions, 1);
    const bounds = faces.map(face => {
      const center = point(face, [0, 0, 0]);
      close(center.z, 0);
      samePoint(new Vector3(0, 0, 1).transformDirection(face.matrix), new Vector3(0, 0, 1));
      return { left: center.x - face.width / 2, right: center.x + face.width / 2, bottom: center.y - face.height / 2, top: center.y + face.height / 2 };
    });
    for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i], b = bounds[j];
      const overlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.top, b.top) - Math.max(a.bottom, b.bottom));
      close(overlap, 0);
    }
    const { d, r, h } = dimensions;
    close(faces.reduce((sum, face) => sum + face.width * face.height, 0), 2 * (d * r + d * h + r * h));
    close(Math.max(...bounds.map(b => b.right)) - Math.min(...bounds.map(b => b.left)), getNetSize(dimensions).width);
  }
});

test('All five shared hinge edges stay joined at every intermediate fold', () => {
  for (const dimensions of [{ d: 3, r: 3, h: 3 }, { d: 5, r: 3, h: 2 }, { d: 10, r: 1, h: 10 }]) {
    const { d, r, h } = dimensions;
    for (const progress of [0, .1, .25, .5, .75, 1]) {
      const [back, left, front, right, top, bottom] = getBoxNetFaces(dimensions, progress);
      for (const sign of [-1, 1]) {
        samePoint(point(front, [-d / 2, sign * h / 2, 0]), point(left, [r / 2, sign * h / 2, 0]));
        samePoint(point(left, [-r / 2, sign * h / 2, 0]), point(back, [d / 2, sign * h / 2, 0]));
        samePoint(point(front, [d / 2, sign * h / 2, 0]), point(right, [-r / 2, sign * h / 2, 0]));
        samePoint(point(front, [sign * d / 2, h / 2, 0]), point(top, [sign * d / 2, -r / 2, 0]));
        samePoint(point(front, [sign * d / 2, -h / 2, 0]), point(bottom, [sign * d / 2, r / 2, 0]));
      }
    }
  }
});

test('Cylinder strip closes its seam on a circle and opens to a circumference-long rectangle', () => {
  for (const radius of [1, 2, 10]) {
    for (let i = 0; i <= 24; i++) {
      const arc = (i / 24 - .5) * 2 * Math.PI * radius;
      const [x, z] = getCylinderStripPoint(radius, arc, 0);
      close(Math.hypot(x, z), radius);
      const [flatX, flatZ] = getCylinderStripPoint(radius, arc, 1);
      close(flatX, arc); close(flatZ, 0);
    }
    const start = getCylinderStripPoint(radius, -Math.PI * radius, 0);
    const end = getCylinderStripPoint(radius, Math.PI * radius, 0);
    close(Math.hypot(start[0] - end[0], start[1] - end[1]), 0);
  }
});

test('Cylinder unrolling keeps arc length and both base hinges attached to the side', () => {
  const radius = 3, h = 5;
  for (const progress of [0, .2, .5, .8, 1]) {
    const rolled = stageProgress(progress, .2, 1);
    const caps = getCylinderCapMatrices({ radius, h }, progress);
    const [x, z] = getCylinderStripPoint(radius, 0, rolled);
    samePoint(new Vector3(0, -radius, 0).applyMatrix4(caps[0]), new Vector3(x, h / 2, z));
    samePoint(new Vector3(0, radius, 0).applyMatrix4(caps[1]), new Vector3(x, -h / 2, z));
    const epsilon = .0001;
    const a = getCylinderStripPoint(radius, 1, rolled), b = getCylinderStripPoint(radius, 1 + epsilon, rolled);
    assert.ok(Math.abs(Math.hypot(b[0] - a[0], b[1] - a[1]) / epsilon - 1) < 1e-6);
  }
  const caps = getCylinderCapMatrices({ radius, h }, 0);
  samePoint(new Vector3().applyMatrix4(caps[0]), new Vector3(0, h / 2, 0));
  samePoint(new Vector3().applyMatrix4(caps[1]), new Vector3(0, -h / 2, 0));
});

test('Perspective camera fits every intermediate face, including large thin shapes on mobile', () => {
  for (const [shape, dimensions] of [['cube', { d: 10, r: 10, h: 10 }], ['cuboid', { d: 1, r: 10, h: 10 }], ['cylinder', { radius: 10, h: 1 }], ['cylinder', { radius: 1, h: 10 }]]) {
    for (const aspect of [.9, 1.6]) for (const progress of [0, .1, .25, .5, .75, 1]) {
      const direction = new Vector3(8, 6, 9).normalize().lerp(new Vector3(0, 0, 1), progress).normalize();
      const points = getUnfoldingPoints(shape, dimensions, progress);
      const distance = getUnfoldingFrameDistance(points, direction, aspect, 38);
      const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
      const up = new Vector3().crossVectors(direction, right).normalize();
      const tangent = Math.tan(38 * Math.PI / 360);
      for (const point of points) {
        const depth = distance - point.dot(direction);
        assert.ok(depth > 0);
        assert.ok(Math.abs(point.dot(right) / (depth * tangent * aspect)) <= .820001);
        assert.ok(Math.abs(point.dot(up) / (depth * tangent)) <= .820001);
      }
    }
  }
});
