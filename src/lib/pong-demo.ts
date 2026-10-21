/** Local portfolio demo. Arena and hexagon/classic geometry follow createGame.ts in the project. */
export type Point = { x: number; y: number };
export type Segment = { a: Point; b: Point };
export interface PongState {
  ball: Point & { vx: number; vy: number };
  player: number; opponent: number; score: [number, number]; cooldown: number;
  winner: 'player' | 'opponent' | null;
}
export const RADIUS = .5;
export const WIN_SCORE = 5;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const hexagonSegments: Segment[] = [6, -6].flatMap(y => {
  const vertices = [{ x: -6, y }, { x: -4, y: y - 1 }, { x: 4, y: y - 1 }, { x: 6, y }, { x: 4, y: y + 1 }, { x: -4, y: y + 1 }];
  return vertices.map((a, i) => ({ a, b: vertices[(i + 1) % vertices.length] }));
});
export function paddleSegments(left: boolean, y: number): Segment[] {
  const x = left ? -16 : 16;
  return [{ a: { x, y: y - 2 }, b: { x, y: y + 2 } }];
}
export function createPong(): PongState {
  return { ball: { x: 0, y: 0, vx: -17, vy: 6 }, player: 0, opponent: 0,
    score: [0, 0], cooldown: .7, winner: null };
}
/** Circle/segment contact, including the segment endpoints. */
export function bounce(ball: PongState['ball'], segment: Segment): boolean {
  const dx = segment.b.x - segment.a.x, dy = segment.b.y - segment.a.y;
  const length2 = dx * dx + dy * dy;
  const t = length2 ? clamp(((ball.x - segment.a.x) * dx + (ball.y - segment.a.y) * dy) / length2, 0, 1) : 0;
  const px = segment.a.x + t * dx, py = segment.a.y + t * dy;
  const nx0 = ball.x - px, ny0 = ball.y - py, distance = Math.hypot(nx0, ny0);
  if (distance >= RADIUS) return false;
  // The substeps normally prevent an exact center contact; retain a finite fallback.
  const normalLength = Math.sqrt(length2) || 1;
  const nx = distance > 1e-9 ? nx0 / distance : -dy / normalLength;
  const ny = distance > 1e-9 ? ny0 / distance : dx / normalLength;
  ball.x = px + nx * (RADIUS + .001);
  ball.y = py + ny * (RADIUS + .001);
  const approach = ball.vx * nx + ball.vy * ny;
  if (approach >= 0) return false;
  ball.vx -= 2 * approach * nx;
  ball.vy -= 2 * approach * ny;
  return true;
}
export function stepPong(state: PongState, elapsed: number, input: number, target?: number): void {
  if (state.winner) return;
  const dt = clamp(elapsed, 0, .05);
  const count = Math.max(1, Math.ceil(dt / (1 / 240))), substep = dt / count;
  for (let i = 0; i < count; i++) {
    const goal = target === undefined ? state.player + input * 22 * substep : target;
    state.player = clamp(state.player + clamp(goal - state.player, -22 * substep, 22 * substep), -8, 8);
    // Deliberately limited AI: it follows the ball at a bounded speed.
    const aiGoal = state.ball.vx > 0 ? state.ball.y : 0;
    state.opponent = clamp(state.opponent + clamp(aiGoal - state.opponent, -10 * substep, 10 * substep), -8, 8);
    if (state.cooldown > 0) { state.cooldown -= substep; continue; }
    const b = state.ball;
    b.x += b.vx * substep; b.y += b.vy * substep;
    if (b.y < -10 + RADIUS) { b.y = -10 + RADIUS; b.vy = Math.abs(b.vy); }
    if (b.y > 10 - RADIUS) { b.y = 10 - RADIUS; b.vy = -Math.abs(b.vy); }
    for (const segment of hexagonSegments) bounce(b, segment);
    for (const [left, y] of [[true, state.player], [false, state.opponent]] as const) {
      for (const segment of paddleSegments(left, y)) if (bounce(b, segment)) {
        // Limit near-vertical rallies and increase pace gradually after paddle contact.
        const speed = Math.min(32, Math.hypot(b.vx, b.vy) * 1.04);
        const sign = left ? 1 : -1;
        const vy = clamp(b.vy, -speed * .82, speed * .82);
        b.vy = vy; b.vx = sign * Math.sqrt(speed * speed - vy * vy);
      }
    }
    if (Math.abs(b.x) > 20 + RADIUS) {
      const scorer = b.x > 0 ? 0 : 1;
      state.score[scorer]++;
      if (state.score[scorer] >= WIN_SCORE) { state.winner = scorer === 0 ? 'player' : 'opponent'; return; }
      state.ball = { x: 0, y: 0, vx: scorer === 0 ? 17 : -17, vy: state.score.reduce((a, b) => a + b) % 2 ? -6 : 6 };
      state.cooldown = .8;
    }
  }
}
