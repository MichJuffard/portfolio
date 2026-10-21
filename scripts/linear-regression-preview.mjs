import { readFileSync, writeFileSync } from 'node:fs';
import { parseObservations, train, regressionPlot, MAX_ITERATIONS } from '../src/lib/linear-regression.ts';
const data = parseObservations(readFileSync(new URL('../src/data/linear-regression.csv', import.meta.url), 'utf8'));
const model = train(data, .01, MAX_ITERATIONS).at(-1);
writeFileSync(new URL('../src/assets/linear-regression.svg', import.meta.url), regressionPlot(data, model));
