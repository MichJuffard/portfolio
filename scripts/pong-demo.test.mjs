import test from 'node:test';
import assert from 'node:assert/strict';
import { createPong, stepPong, bounce, hexagonSegments, RADIUS } from '../src/lib/pong-demo.ts';

test('an hexagon face reflects an approaching ball and separates contact', () => {
  const b = { x: 0, y: 5.3, vx: 0, vy: -10 };
  const speed = Math.hypot(b.vx, b.vy);
  assert.equal(bounce(b, hexagonSegments[1]), true);
  assert.ok(Math.abs(Math.hypot(b.vx, b.vy) - speed) < 1e-9);
  assert.ok(b.vy > 9, 'the lower horizontal face should return the ball toward the arena center');
  assert.equal(bounce(b, hexagonSegments[1]), false, 'the same contact should not reflect twice');
});

test('segment endpoints reflect a ball without tunnelling', () => {
  const b = { x: 4.2, y: 4.7, vx: -5, vy: 5 };
  assert.equal(bounce(b, hexagonSegments[1]), true);
  assert.ok(Math.hypot(b.x - 4, b.y - 5) >= RADIUS);
});

test('top and bottom walls reflect balls back into the arena', () => {
  for (const sign of [-1, 1]) {
    const s = createPong(); s.cooldown = 0;
    s.ball = { x: -10, y: sign * 9.49, vx: 1, vy: sign * 20 };
    stepPong(s, .02, 0);
    assert.ok(Math.abs(s.ball.y) <= 10 - RADIUS);
    assert.ok(s.ball.vy * sign < 0);
  }
});

test('a classic paddle returns the ball toward the opponent', () => {
  const s = createPong(); s.cooldown = 0;
  s.ball = { x: -15.4, y: 0, vx: -20, vy: 0 };
  stepPong(s, .03, 0);
  assert.ok(s.ball.vx > 0);
  assert.ok(Math.hypot(s.ball.vx, s.ball.vy) <= 32);
});

test('a missed ball awards one point and resets away from obstacles', () => {
  const s = createPong(); s.cooldown = 0;
  s.ball = { x: 20.49, y: 0, vx: 20, vy: 0 };
  stepPong(s, .02, 0);
  assert.deepEqual(s.score, [1, 0]);
  assert.equal(s.ball.x, 0); assert.equal(s.ball.y, 0);
  assert.ok(s.cooldown > 0);
});

test('five points end the game and subsequent ticks do not change it', () => {
  const s = createPong(); s.cooldown = 0; s.score = [4, 0];
  s.ball = { x: 20.49, y: 0, vx: 20, vy: 0 };
  stepPong(s, .02, 0);
  assert.equal(s.winner, 'player');
  const snapshot = structuredClone(s);
  stepPong(s, .05, 1);
  assert.deepEqual(s, snapshot);
});

test('long frame gaps and pointer targets keep paddles and physics bounded', () => {
  const s = createPong();
  for (let i = 0; i < 2000 && !s.winner; i++) {
    stepPong(s, i % 100 === 0 ? 10 : 1 / 60, 0, Math.sin(i / 15) * 50);
    assert.ok(Math.abs(s.player) <= 8 && Math.abs(s.opponent) <= 8);
    for (const value of Object.values(s.ball)) assert.ok(Number.isFinite(value));
    assert.ok(Math.hypot(s.ball.vx, s.ball.vy) <= 32.001);
  }
});
