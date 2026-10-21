/** Web interpretation of scene/bonus/trophy.rt (origin/update-readme).
 * Geometry follows the scene; camera, floor and lighting are adapted for the portfolio.
 * This module does not execute the original miniRT C code.
 */
type Vec = [number, number, number];
export interface RenderOptions { light: number; shadows: boolean; specular: boolean; checker: boolean }
export const defaults: RenderOptions = { light: -3, shadows: true, specular: true, checker: false };
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: Vec): Vec => scale(a, 1 / Math.hypot(...a));
interface Material { color: Vec; shininess: number }
const gold: Material = { color: [191 / 255, 161 / 255, 0], shininess: 32 };
const base: Material = { color: [205 / 255, 97 / 255, 85 / 255], shininess: 70 };
type Shape = { center: Vec; material: Material } & (
  { kind: 'ellipsoid'; radii: Vec } |
  { kind: 'paraboloid'; coefficients: Vec; height: number } |
  { kind: 'cylinder'; axis: Vec; radius: number; height: number }
);
const cylinder = (center: Vec, axis: Vec, diameter: number, height: number, material = gold): Shape =>
  ({ kind: 'cylinder', center, axis: norm(axis), radius: diameter / 2, height, material });
const shapes: Shape[] = [
  { kind: 'paraboloid', center: [0, 0, 5], coefficients: [1, 2, 2], height: 3, material: gold },
  cylinder([0, 0, 5], [0, 1, 0], .4, 5),
  { kind: 'ellipsoid', center: [0, -2, 5], radii: [1, .2, 1], material: gold },
  cylinder([0, -4, 5], [0, 1, 0], 6, 4, base),
  { kind: 'ellipsoid', center: [0, 0, 5], radii: [.25, .25, .25], material: gold },
  cylinder([-1.4, 2.5, 5], [1, .5, 0], .1, 2),
  cylinder([1.4, 2.5, 5], [-1, .5, 0], .1, 2),
  cylinder([-1.2, 1, 5], [-1, 1, 0], .1, 3),
  cylinder([1.2, 1, 5], [1, 1, 0], .1, 3),
];
const EPS = .0001;
/** Handles quadratic and degenerate linear intersections (e.g. axial rays). */
export function roots(a: number, b: number, c: number): number[] {
  if (Math.abs(a) < 1e-10) return Math.abs(b) < 1e-10 ? [] : [-c / b];
  const d = b * b - 4 * a * c;
  if (d < 0) return [];
  const s = Math.sqrt(d);
  return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((x, y) => x - y);
}
interface Hit { t: number; normal: Vec; color: Vec; shininess: number; floor: boolean }
function intersect(origin: Vec, direction: Vec, checker: boolean, limit = Infinity): Hit | undefined {
  let closest: Hit | undefined;
  let best = limit;
  const save = (t: number, normal: Vec, material: Material) => {
    if (t <= EPS || t >= best) return;
    best = t;
    normal = norm(normal);
    if (dot(normal, direction) > 0) normal = scale(normal, -1);
    closest = { t, normal, ...material, floor: false };
  };
  for (const shape of shapes) {
    const o = sub(origin, shape.center);
    if (shape.kind === 'ellipsoid') {
      const q = o.map((v, i) => v / shape.radii[i]) as Vec;
      const d = direction.map((v, i) => v / shape.radii[i]) as Vec;
      for (const t of roots(dot(d, d), 2 * dot(q, d), dot(q, q) - 1)) {
        if (t <= EPS || t >= best) continue;
        const p = add(o, scale(direction, t));
        save(t, p.map((v, i) => v / shape.radii[i] ** 2) as Vec, shape.material);
      }
    } else if (shape.kind === 'paraboloid') {
      const [a, b, c] = shape.coefficients;
      const [dx, dy, dz] = direction;
      for (const t of roots(dx * dx / a + dz * dz / c,
        2 * o[0] * dx / a + 2 * o[2] * dz / c - dy / b,
        o[0] * o[0] / a + o[2] * o[2] / c - o[1] / b)) {
        if (t <= EPS || t >= best) continue;
        const p = add(o, scale(direction, t));
        if (p[1] >= 0 && p[1] <= shape.height) save(t, [2 * p[0] / a, -1 / b, 2 * p[2] / c], shape.material);
      }
    } else {
      const h = dot(o, shape.axis), dh = dot(direction, shape.axis);
      const radialO = sub(o, scale(shape.axis, h));
      const radialD = sub(direction, scale(shape.axis, dh));
      for (const t of roots(dot(radialD, radialD), 2 * dot(radialO, radialD), dot(radialO, radialO) - shape.radius ** 2)) {
        if (t <= EPS || t >= best || Math.abs(h + t * dh) > shape.height / 2) continue;
        save(t, add(radialO, scale(radialD, t)), shape.material);
      }
      if (Math.abs(dh) > 1e-10) for (const sign of [-1, 1]) {
        const t = (sign * shape.height / 2 - h) / dh;
        if (t <= EPS || t >= best) continue;
        const p = add(radialO, scale(radialD, t));
        if (dot(p, p) <= shape.radius ** 2) save(t, scale(shape.axis, sign), shape.material);
      }
    }
  }
  const t = (-2.5 - origin[1]) / direction[1];
  if (t > EPS && t < best) {
    const p = add(origin, scale(direction, t));
    const tile = checker && ((Math.floor(p[0]) + Math.floor(p[2])) % 2 === 0);
    closest = { t, normal: [0, 1, 0], color: tile ? [.22, .24, .32] : [.12, .14, .20], shininess: 100, floor: true };
  }
  return closest;
}
export function renderScene(width: number, height: number, options: RenderOptions = defaults): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);
  const origin: Vec = [0, 2, -6];
  const forward = norm([0, -1.8, 11]);
  const up: Vec = [0, forward[2], -forward[1]];
  const offset = options.light - defaults.light;
  const lights: { position: Vec; color: Vec; diffuse: number; specular: number }[] = [
    { position: [5 + offset, 4, -5], color: [.08, .85, .18], diffuse: .65, specular: 1 },
    // Co-located sources are combined to avoid redundant shadow intersections.
    { position: [-5 + offset, 4, -5], color: [1.1, .22, .95], diffuse: .65, specular: 1 },
    // A low frontal white source catches the downward-facing cup normals.
    // Its diffuse contribution stays subtle so the gold retains highlight headroom.
    { position: [-2 + offset, .5, -5], color: [1, .96, .88], diffuse: .12, specular: 2.5 },
  ];
  const fov = Math.tan(46 * Math.PI / 360);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const sx = (2 * (x + .5) / width - 1) * width / height * fov;
    const sy = (1 - 2 * (y + .5) / height) * fov;
    const direction = norm(add(add(forward, [sx, 0, 0]), scale(up, sy)));
    const hit = intersect(origin, direction, options.checker);
    let color: Vec = [.018, .023, .04];
    if (hit) {
      const p = add(origin, scale(direction, hit.t));
      color = hit.color.map(v => v * .12) as Vec;
      for (const light of lights) {
        const toLight = sub(light.position, p), distance = Math.hypot(...toLight), l = norm(toLight);
        const shadowed = options.shadows && intersect(add(p, scale(hit.normal, .001)), l, options.checker, distance);
        if (shadowed) continue;
        const diffuse = Math.max(0, dot(hit.normal, l));
        const reflection = sub(scale(hit.normal, 2 * dot(hit.normal, l)), l);
        const specular = options.specular && diffuse > 0
          ? .5 * Math.pow(Math.max(0, dot(reflection, scale(direction, -1))), hit.shininess) : 0;
        color = color.map((v, i) => v + light.color[i] * (hit.color[i] * diffuse * light.diffuse + specular * light.specular)) as Vec;
      }
      const fog = 1 - Math.exp(-Math.max(0, hit.t - 18) * .04);
      color = color.map((v, i) => v * (1 - fog) + [.018, .023, .04][i] * fog) as Vec;
    }
    const i = (y * width + x) * 4;
    for (let channel = 0; channel < 3; channel++) pixels[i + channel] = 255 * Math.pow(Math.min(1, Math.max(0, color[channel])), 1 / 2.2);
    pixels[i + 3] = 255;
  }
  return pixels;
}
