import test from 'node:test';
import assert from 'node:assert/strict';
import { renderScene, defaults, roots } from '../src/lib/minirt-demo.ts';
const width = 96, height = 54;
const base = renderScene(width, height);

test('produces an opaque, non-uniform image', () => {
  assert.equal(base.length, width * height * 4);
  for (let i = 3; i < base.length; i += 4) assert.equal(base[i], 255);
  assert.ok(new Set(base).size > 100);
});

test('moving the light changes the image', () => {
  const moved = renderScene(width, height, { ...defaults, light: 5 });
  const changed = base.reduce((n, value, i) => n + Number(value !== moved[i]), 0);
  assert.ok(changed > width * height);
});

test('cast shadows darken some surfaces and never brighten them', () => {
  const unshadowed = renderScene(width, height, { ...defaults, shadows: false });
  let darker = 0;
  for (let i = 0; i < base.length; i++) {
    assert.ok(base[i] <= unshadowed[i]);
    darker += Number(base[i] < unshadowed[i]);
  }
  assert.ok(darker > 100);
});

test('specular highlights brighten some pixels and leave others unchanged', () => {
  const matte = renderScene(width, height, { ...defaults, specular: false });
  let brighter = 0, same = 0;
  for (let i = 0; i < base.length; i++) {
    if (i % 4 === 3) continue;
    assert.ok(base[i] >= matte[i]);
    brighter += Number(base[i] > matte[i]);
    same += Number(base[i] === matte[i]);
  }
  assert.ok(brighter > 10);
  assert.ok(same > 100);
});

test('enabling the checker pattern changes the floor', () => {
  const checked = renderScene(width, height, { ...defaults, checker: true });
  assert.ok(base.some((value, i) => value !== checked[i]));
});

test('quadric intersections include tangencies and axial rays', () => {
  assert.deepEqual(roots(1, -2, 1), [1, 1]);
  assert.deepEqual(roots(0, 2, -6), [3]);
  assert.deepEqual(roots(0, 0, 4), []);
  assert.deepEqual(roots(1, 0, 1), []);
  assert.deepEqual(roots(1, -5, 6), [2, 3]);
});

test('the default cup has a visibly contrasting specular highlight', () => {
  const w = 192, h = 108;
  const glossy = renderScene(w, h);
  const matte = renderScene(w, h, { ...defaults, specular: false });
  let peak = 0, visiblePixels = 0;
  // Cup region only: tiny glints on handles or highlights on the floor do not count.
  for (let y = 20; y < 55; y++) for (let x = 80; x < 112; x++) {
    const i = (y * w + x) * 4;
    const contrast = (glossy[i] - matte[i] + glossy[i + 1] - matte[i + 1] + glossy[i + 2] - matte[i + 2]) / 3;
    peak = Math.max(peak, contrast);
    visiblePixels += Number(contrast > 20);
  }
  assert.ok(peak > 60, 'the highlight should stand out against the matte cup');
  assert.ok(visiblePixels > 25, 'the highlight should cover a visible patch of the cup');
});
