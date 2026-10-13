import test from 'node:test';
import assert from 'node:assert/strict';
import { fitDistanceForExtent } from '../src/scene/cameraFit.js';

test('Cube keeps growing on screen from 4 to 10 cm while the 10 cm view retains margin', () => {
  const apparentSize = side => side / fitDistanceForExtent(side, 1.5);
  assert.ok(apparentSize(3) < apparentSize(4));
  for (let side = 5; side <= 10; side++) assert.ok(apparentSize(side) > apparentSize(side - 1));
  assert.ok(apparentSize(10) >= apparentSize(4) * 1.2);
  assert.ok(apparentSize(10) < .4);
  assert.ok(fitDistanceForExtent(10, .9) > fitDistanceForExtent(10, 1.5), 'Narrow scenes need more camera distance');
});
