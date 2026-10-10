import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGeometry, getDimensions, SOLID_COUNTS, clampDimension, getUnitPositions, canShowUnitCubes, isHighlightedFace } from '../src/utils/geometry.js';
import { isCorrectAnswer, parseAnswer } from '../src/utils/answerValidation.js';
import { exercises } from '../src/data/exercises.js';

test('Lập phương cạnh 3: Sxq 36, Stp 54, V 27', () => {
  assert.deepEqual(calculateGeometry(getDimensions('cube', { a: 3 })), { lateralArea: 36, totalArea: 54, volume: 27 });
});
test('Hộp chữ nhật 5 × 3 × 2: Sxq 32, Stp 62, V 30', () => {
  assert.deepEqual(calculateGeometry({ d: 5, r: 3, h: 2 }), { lateralArea: 32, totalArea: 62, volume: 30 });
});
test('Giữ các cạnh lập phương bằng nhau; giới hạn số nguyên 1–10', () => {
  assert.deepEqual(getDimensions('cube', { a: 7 }), { d: 7, r: 7, h: 7 });
  assert.equal(clampDimension(-2), 1); assert.equal(clampDimension(11), 10);
  assert.equal(clampDimension('abc'), 1); assert.equal(clampDimension(3.7), 4);
});
test('Hai hình có 8 đỉnh, 12 cạnh và 6 mặt', () => {
  assert.deepEqual(SOLID_COUNTS, { vertices: 8, edges: 12, faces: 6 });
});
test('Diện tích xung quanh chỉ tô 4 mặt bên; toàn phần tô 6 mặt', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].filter(i => isHighlightedFace(i, 'lateral')), [0, 1, 4, 5]);
  assert.equal([0, 1, 2, 3, 4, 5].filter(i => isHighlightedFace(i, 'total')).length, 6);
  assert.equal(isHighlightedFace(0, null), false);
});
test('Khối đơn vị đủ số lượng, không trùng, nằm đúng trong hình', () => {
  const positions = getUnitPositions({ d: 5, r: 3, h: 2 });
  assert.equal(positions.length, 30);
  assert.equal(new Set(positions.map(p => p.join(','))).size, 30);
  assert.ok(positions.every(([x, y, z]) => Math.abs(x) <= 2 && Math.abs(y) <= .5 && Math.abs(z) <= 1));
  assert.equal(getUnitPositions({ d: 3, r: 3, h: 3 }).length, 27);
});
test('Khối đơn vị chặn quá 216 khối và kích thước không nguyên', () => {
  assert.equal(canShowUnitCubes({ d: 6, r: 6, h: 6 }), true);
  assert.equal(canShowUnitCubes({ d: 10, r: 10, h: 10 }), false);
  assert.deepEqual(getUnitPositions({ d: 3.5, r: 2, h: 2 }), []);
});
test('Đáp án chấp nhận dấu phẩy/dấu chấm, sai số nhỏ; từ chối dữ liệu rỗng hoặc sai', () => {
  assert.equal(isCorrectAnswer(' 2,5 ', 2.5), true);
  assert.equal(isCorrectAnswer('2.5005', 2.5), true);
  for (const value of ['', ' ', '1,2,3', '3cm', 'Infinity', '0x10']) assert.equal(parseAnswer(value), null);
  assert.equal(isCorrectAnswer('35', 36), false);
});
test('Mỗi hình có 4 bài với đáp án đúng và ID duy nhất', () => {
  assert.deepEqual(exercises.cube.map(e => e.answer), [8, 36, 24, 27]);
  assert.deepEqual(exercises.cuboid.map(e => e.answer), [12, 32, 62, 30]);
  const all = Object.values(exercises).flat();
  assert.equal(new Set(all.map(e => e.id)).size, 8);
  assert.ok(all.every(e => e.unit && e.solution && e.question));
});
