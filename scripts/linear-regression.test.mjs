import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseObservations, train, estimate, evaluate, MAX_ITERATIONS, compareRates } from '../src/lib/linear-regression.ts';
const data = parseObservations(readFileSync(new URL('../src/data/linear-regression.csv', import.meta.url), 'utf8'));

test('loads the 24 observations and preserves normalization bounds', () => {
  assert.equal(data.length, 24);
  const initial = train(data, .01, 0)[0];
  assert.equal(initial.min, 22899); assert.equal(initial.max, 240000);
  assert.equal(estimate(initial, 100000), 0);
});

test('one gradient step matches the project formulas without normalizing prices', () => {
  const model = train(data, .01, 1).at(-1);
  const expected0 = .01 * data.reduce((s, p) => s + p.price, 0) / data.length;
  const expected1 = .01 * data.reduce((s, p) => s + p.price * (p.km - 22899) / (240000 - 22899), 0) / data.length;
  assert.ok(Math.abs(model.theta0 - expected0) < 1e-10);
  assert.ok(Math.abs(model.theta1 - expected1) < 1e-10);
});

test('training reduces squared error and learns a decreasing price trend', () => {
  const states = train(data);
  for (let i = 100; i < states.length; i += 100) {
    assert.ok(evaluate(data, states[i]).mse <= evaluate(data, states[i - 100]).mse);
  }
  const model = states.at(-1);
  assert.ok(estimate(model, 50000) > estimate(model, 200000));
  assert.ok(evaluate(data, model).rmse < 810);
});

test('converged descent approaches the independent least-squares solution', () => {
  const states = train(data, .1), model = states.at(-1);
  const meanX = data.reduce((s, p) => s + p.km, 0) / data.length;
  const meanY = data.reduce((s, p) => s + p.price, 0) / data.length;
  const slope = data.reduce((s, p) => s + (p.km - meanX) * (p.price - meanY), 0) / data.reduce((s, p) => s + (p.km - meanX) ** 2, 0);
  const intercept = meanY - slope * meanX;
  for (const km of [22899, 100000, 240000]) assert.ok(Math.abs(estimate(model, km) - (intercept + slope * km)) < 1);
  assert.ok(states.length < 10001, 'the convergence threshold should stop training early');
});

test('the learning rate changes progress under a fixed iteration budget', () => {
  const slow = train(data, .001, 1000).at(-1);
  const fast = train(data, .1, 1000).at(-1);
  assert.ok(evaluate(data, fast).mse < evaluate(data, slow).mse);
});

test('metrics report a perfect fit on a synthetic straight line', () => {
  const points = [{ km: 0, price: 2 }, { km: 5, price: 3 }, { km: 10, price: 4 }];
  const metrics = evaluate(points, { min: 0, max: 10, theta0: 2, theta1: 2 });
  assert.equal(metrics.rmse, 0); assert.equal(metrics.r2, 1);
});

test('invalid observations and unsafe training settings are rejected', () => {
  for (const csv of ['km,price\n1,NaN\n2,4', 'km,price\n1,2\n1,3', 'km,price\n,2\n2,3']) assert.throws(() => parseObservations(csv));
  assert.throws(() => train(data, 0));
  assert.throws(() => train(data, NaN));
  assert.throws(() => train(data, .01, MAX_ITERATIONS + 1));
});


test('a small rate gets enough iterations to reach the stopping criterion', () => {
  const short = train(data, .001, 10000);
  const extended = train(data, .001, MAX_ITERATIONS);
  assert.equal(short.stopReason, 'budget');
  assert.equal(extended.stopReason, 'threshold');
  assert.ok(extended.length > 100001);
  assert.deepEqual(extended[10000], short[10000]);
  assert.ok(evaluate(data, extended.at(-1)).rmse < evaluate(data, short.at(-1)).rmse - 400);
});

test('stable rates approach the same error with different stopping iterations', () => {
  const rows = compareRates(data);
  assert.ok(rows.every(row => row.converged));
  assert.ok(rows[0].iterations > rows[1].iterations && rows[1].iterations > rows[2].iterations);
  const finalErrors = rows.map(row => row.final.rmse);
  assert.ok(Math.max(...finalErrors) - Math.min(...finalErrors) < .001);
  assert.ok(rows[0].reference.rmse > rows[2].reference.rmse + 400);
});

test('the exact stopping iteration is distinguished from a smaller budget', () => {
  const converged = train(data, .1, MAX_ITERATIONS);
  const last = converged.length - 1;
  assert.equal(train(data, .1, last - 1).stopReason, 'budget');
  assert.equal(train(data, .1, last).stopReason, 'threshold');
});
