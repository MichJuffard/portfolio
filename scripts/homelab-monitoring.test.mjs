import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getMonitoringFailureState,
  getMonitoringState,
  MONITORING_MAX_AGE_MS,
  validateMonitoringSnapshot,
} from '../src/lib/homelab-monitoring.ts';

// Synthetic test fixture only; these values are never included in the site.
const collectedAt = '2026-01-02T03:04:05Z';
const validSnapshot = {
  collected_at: collectedAt,
  cpu_percent: 12.3,
  memory_percent: 45.6,
  storage_percent: 78.9,
};

test('validates the four-field public JSON format', () => {
  const result = validateMonitoringSnapshot(validSnapshot);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.snapshot, validSnapshot);
});

test('rejects missing, extra, or non-object fields', () => {
  const { storage_percent, ...withoutStorage } = validSnapshot;
  assert.equal(validateMonitoringSnapshot(withoutStorage).ok, false);
  assert.equal(validateMonitoringSnapshot({ ...validSnapshot, hostname: 'private-host' }).ok, false);
  assert.equal(validateMonitoringSnapshot(null).ok, false);
  assert.equal(validateMonitoringSnapshot([]).ok, false);
});

test('rejects invalid, non-UTC, or impossible collection timestamps', () => {
  for (const collected_at of [
    'not-a-date',
    '2026-01-02T03:04:05+01:00',
    '2026-02-30T03:04:05Z',
    '2026-01-02T03:04:05.1234Z',
  ]) {
    assert.equal(validateMonitoringSnapshot({ ...validSnapshot, collected_at }).ok, false, collected_at);
  }
});

test('rejects non-numeric, non-finite, and out-of-range percentages', () => {
  for (const name of ['cpu_percent', 'memory_percent', 'storage_percent']) {
    for (const value of [null, '12', Number.NaN, Number.POSITIVE_INFINITY, -0.1, 100.1]) {
      assert.equal(validateMonitoringSnapshot({ ...validSnapshot, [name]: value }).ok, false, `${name}: ${value}`);
    }
  }
});

test('uses collected_at and marks a measurement stale at exactly fifteen minutes', () => {
  const parsed = validateMonitoringSnapshot(validSnapshot);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const collectedAtMs = Date.parse(collectedAt);
  assert.equal(getMonitoringState(parsed.snapshot, collectedAtMs + MONITORING_MAX_AGE_MS - 1), 'available');
  assert.equal(getMonitoringState(parsed.snapshot, collectedAtMs + MONITORING_MAX_AGE_MS), 'stale');
  assert.equal(getMonitoringState(parsed.snapshot, collectedAtMs + MONITORING_MAX_AGE_MS + 1), 'stale');
});

test('treats future timestamps as unavailable and failures preserve only stale status', () => {
  const parsed = validateMonitoringSnapshot(validSnapshot);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const collectedAtMs = Date.parse(collectedAt);
  assert.equal(getMonitoringState(parsed.snapshot, collectedAtMs - 1), 'unavailable');
  assert.equal(getMonitoringState(null), 'unavailable');
  assert.equal(getMonitoringFailureState(null), 'unavailable');
  assert.equal(getMonitoringFailureState(parsed.snapshot, collectedAtMs + 5 * 60 * 1000), 'unavailable');
  assert.equal(getMonitoringFailureState(parsed.snapshot, collectedAtMs + MONITORING_MAX_AGE_MS), 'stale');
});
