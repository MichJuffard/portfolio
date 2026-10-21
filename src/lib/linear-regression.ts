/** Browser implementation of the supplied Python project's normalized gradient descent. */
export const MAX_ITERATIONS = 300000;
export const CONVERGENCE_THRESHOLD = 1e-6;
export interface Observation { km: number; price: number }
export interface Model { theta0: number; theta1: number; min: number; max: number }
export function parseObservations(csv: string): Observation[] {
  const rows = csv.trim().split(/\r?\n/);
  if (rows.shift()?.trim() !== 'km,price') throw new Error('Colonnes attendues : km,price.');
  const data = rows.map(row => {
    const columns = row.split(',');
    if (columns.length !== 2 || columns.some(value => !value.trim())) throw new Error('Observation invalide.');
    const [km, price] = columns.map(Number);
    if (![km, price].every(Number.isFinite)) throw new Error('Les observations doivent être numériques.');
    return { km, price };
  });
  if (data.length < 2 || Math.max(...data.map(p => p.km)) === Math.min(...data.map(p => p.km))) throw new Error('Au moins deux kilométrages distincts sont nécessaires.');
  return data;
}
export function estimate(model: Model, km: number): number {
  return model.theta0 + model.theta1 * (km - model.min) / (model.max - model.min);
}
export function evaluate(data: Observation[], model: Model): { rmse: number; r2: number; mse: number } {
  const mean = data.reduce((sum, p) => sum + p.price, 0) / data.length;
  const squaredError = data.reduce((sum, p) => sum + (estimate(model, p.km) - p.price) ** 2, 0);
  const variance = data.reduce((sum, p) => sum + (p.price - mean) ** 2, 0);
  return { rmse: Math.sqrt(squaredError / data.length), mse: squaredError / data.length, r2: variance === 0 ? NaN : 1 - squaredError / variance };
}
export type TrainingHistory = Model[] & { stopReason: 'threshold' | 'budget' };
export function train(data: Observation[], rate = .01, iterations = 10000, threshold = CONVERGENCE_THRESHOLD): TrainingHistory {
  if (!data.length || !Number.isFinite(rate) || rate <= 0 || rate > 1 || !Number.isInteger(iterations) || iterations < 0 || iterations > MAX_ITERATIONS) throw new Error('Paramètres d’apprentissage invalides.');
  const min = Math.min(...data.map(p => p.km)), max = Math.max(...data.map(p => p.km));
  if (!(max > min)) throw new Error('Le kilométrage doit varier.');
  const scaled = data.map(p => ({ x: (p.km - min) / (max - min), y: p.price }));
  const states: TrainingHistory = Object.assign([{ theta0: 0, theta1: 0, min, max }], { stopReason: 'budget' as 'threshold' | 'budget' });
  let previousMse = Infinity;
  for (let i = 0; i < iterations; i++) {
    const model = states.at(-1)!;
    let g0 = 0, g1 = 0, mse = 0;
    for (const p of scaled) {
      const error = model.theta0 + model.theta1 * p.x - p.y;
      g0 += error; g1 += error * p.x; mse += error * error;
    }
    mse /= data.length;
    const next = { ...model, theta0: model.theta0 - rate * g0 / data.length, theta1: model.theta1 - rate * g1 / data.length };
    if (!Number.isFinite(next.theta0) || !Number.isFinite(next.theta1)) throw new Error('L’apprentissage diverge.');
    states.push(next);
    // Same stopping rule as run_training: compare MSE values before consecutive updates.
    if (Math.abs(mse - previousMse) < threshold) { states.stopReason = 'threshold'; break; }
    previousMse = mse;
  }
  return states;
}
export function compareRates(data: Observation[]) {
  return [.001, .01, .1].map(rate => {
    const states = train(data, rate, MAX_ITERATIONS);
    return { rate, iterations: states.length - 1, converged: states.stopReason === 'threshold',
      reference: evaluate(data, states[Math.min(10000, states.length - 1)]), final: evaluate(data, states.at(-1)!) };
  });
}
/** All interpolated values are numeric; no user text is inserted into this SVG. */
export function regressionPlot(data: Observation[], model: Model, mileage = 100000, residuals = false): string {
  const x = (km: number) => 70 + km / 260000 * 610;
  const y = (price: number) => 348 - price / 9000 * 290;
  const fmt = (v: number) => v.toFixed(2);
  const grid = [0, 2000, 4000, 6000, 8000].map(value => `<line x1="70" y1="${fmt(y(value))}" x2="680" y2="${fmt(y(value))}" stroke="#32384b"/><text x="58" y="${fmt(y(value) + 4)}" text-anchor="end">${value}</text>`).join('');
  const ticks = [0, 65000, 130000, 195000, 260000].map(value => `<text x="${fmt(x(value))}" y="372" text-anchor="middle">${value / 1000}k</text>`).join('');
  const errors = residuals ? data.map(p => `<line x1="${fmt(x(p.km))}" y1="${fmt(y(p.price))}" x2="${fmt(x(p.km))}" y2="${fmt(y(estimate(model, p.km)))}" stroke="#e5ae81" stroke-width="1.5" opacity=".7"/>`).join('') : '';
  const points = data.map(p => `<circle cx="${fmt(x(p.km))}" cy="${fmt(y(p.price))}" r="4" fill="#84c7eb"><title>${p.km} km · prix ${p.price}</title></circle>`).join('');
  const prediction = estimate(model, mileage);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 420" role="img" aria-label="Régression linéaire : 24 observations, droite apprise et estimation pour ${mileage} kilomètres" style="font-family:ui-monospace,monospace;font-size:12px;fill:#b0b6ca">
<defs><clipPath id="lr-plot-clip"><rect x="70" y="58" width="610" height="290"/></clipPath></defs>
<rect width="720" height="420" fill="#11131b"/><text x="70" y="30" fill="#b5b0ff" font-size="11">KILOMÉTRAGE → PRIX / 24 OBSERVATIONS</text>${grid}${ticks}
<text x="375" y="407" text-anchor="middle">Kilométrage (km)</text><text x="70" y="49" font-size="10">Prix (unité du jeu de données)</text>
<g clip-path="url(#lr-plot-clip)">${errors}<line x1="70" y1="${fmt(y(estimate(model, 0)))}" x2="680" y2="${fmt(y(estimate(model, 260000)))}" stroke="#b5b0ff" stroke-width="3"/>${points}
<line x1="${fmt(x(mileage))}" y1="348" x2="${fmt(x(mileage))}" y2="${fmt(y(prediction))}" stroke="#e5ae81" stroke-width="1.5" stroke-dasharray="5 5"/><circle cx="${fmt(x(mileage))}" cy="${fmt(y(prediction))}" r="6" fill="#e5ae81" stroke="#11131b" stroke-width="2"/></g></svg>`;
}
