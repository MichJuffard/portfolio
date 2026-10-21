import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getMonitoringFailureState,
  getMonitoringState,
  isAllowedPublicMetricsEndpoint,
  validateMonitoringSnapshot,
} from '../src/lib/homelab-monitoring.ts';

const measuredAt = '2026-10-21T08:30:00.000Z';
const validSnapshot = {
  schemaVersion: 1,
  measuredAt,
  scope: 'proxmox-host',
  metrics: {
    cpuPercent: 18.4,
    memoryPercent: 62.1,
    storagePercent: 41.7,
  },
};

test('validates the documented public JSON shape', () => {
  const result = validateMonitoringSnapshot(validSnapshot);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.snapshot.metrics.cpuPercent, 18.4);
});

test('keeps missing and null metrics unavailable instead of converting them to zero', () => {
  const result = validateMonitoringSnapshot({
    ...validSnapshot,
    metrics: { cpuPercent: null },
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.snapshot.metrics, {
      cpuPercent: null,
      memoryPercent: null,
      storagePercent: null,
    });
    assert.equal(getMonitoringState(result.snapshot, Date.parse(measuredAt)), 'unavailable');
  }
});

test('rejects extra fields that could expose identifying metadata', () => {
  const result = validateMonitoringSnapshot({
    ...validSnapshot,
    hostname: 'private-host',
  });
  assert.equal(result.ok, false);
});

test('rejects unknown scopes, invalid dates, and out-of-range percentages', () => {
  assert.equal(validateMonitoringSnapshot({ ...validSnapshot, scope: 'named-vm' }).ok, false);
  assert.equal(validateMonitoringSnapshot({ ...validSnapshot, measuredAt: 'yesterday' }).ok, false);
  assert.equal(validateMonitoringSnapshot({
    ...validSnapshot,
    metrics: { ...validSnapshot.metrics, cpuPercent: 100.1 },
  }).ok, false);
});

test('allows only public HTTPS or same-origin JSON endpoints without embedded credentials', () => {
  assert.equal(isAllowedPublicMetricsEndpoint('/data/homelab-metrics.json'), true);
  assert.equal(isAllowedPublicMetricsEndpoint('https://metrics.example.org/public/latest.json'), true);
  assert.equal(isAllowedPublicMetricsEndpoint('http://metrics.example.org/latest.json'), false);
  assert.equal(isAllowedPublicMetricsEndpoint('https://192.168.1.20/metrics.json'), false);
  assert.equal(isAllowedPublicMetricsEndpoint('https://user:token@metrics.example.org/metrics.json'), false);
  assert.equal(isAllowedPublicMetricsEndpoint('https://metrics.example.org/api'), false);
});

test('classifies recent, stale, and future measurements explicitly', () => {
  const parsed = validateMonitoringSnapshot(validSnapshot);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  assert.equal(getMonitoringState(parsed.snapshot, Date.parse(measuredAt) + 9 * 60 * 1000), 'available');
  assert.equal(getMonitoringState(parsed.snapshot, Date.parse(measuredAt) + 11 * 60 * 1000), 'stale');
  assert.equal(getMonitoringState(parsed.snapshot, Date.parse(measuredAt) - 2 * 60 * 1000), 'unavailable');
  assert.equal(getMonitoringState(null), 'unavailable');
});

test('a failed refresh reports unavailable without a usable cached sample and preserves stale state otherwise', () => {
  const parsed = validateMonitoringSnapshot(validSnapshot);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  assert.equal(getMonitoringFailureState(null), 'unavailable');
  assert.equal(getMonitoringFailureState(parsed.snapshot, Date.parse(measuredAt) + 5 * 60 * 1000), 'unavailable');
  assert.equal(getMonitoringFailureState(parsed.snapshot, Date.parse(measuredAt) + 11 * 60 * 1000), 'stale');
});
