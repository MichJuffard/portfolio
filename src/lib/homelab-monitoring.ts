import { monitoringMetricNames } from '../types/homelab-monitoring.ts';
import type {
  MonitoringMetricName,
  MonitoringSnapshot,
  MonitoringState,
} from '../types/homelab-monitoring';

export { monitoringMetricNames } from '../types/homelab-monitoring.ts';

export const MONITORING_REFRESH_MS = 3 * 60 * 1000;
export const MONITORING_MAX_AGE_MS = 15 * 60 * 1000;

const metricLabels: Record<MonitoringMetricName, string> = {
  cpu_percent: 'Utilisation CPU',
  memory_percent: 'Utilisation mémoire',
  storage_percent: 'Utilisation du stockage système rootfs',
};

const stateLabels: Record<MonitoringState, string> = {
  available: 'Mesures disponibles',
  stale: 'Données périmées',
  unavailable: 'Supervision temporairement indisponible',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactlyKeys(value: Record<string, unknown>, expected: string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.length && expected.every(key => Object.hasOwn(value, key));
}

function isIsoUtcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{1,3}))?Z$/);
  if (!match) return false;

  const milliseconds = (match[2] ?? '').padEnd(3, '0');
  const normalized = `${match[1]}.${milliseconds}Z`;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === normalized;
}

export function validateMonitoringSnapshot(value: unknown):
  | { ok: true; snapshot: MonitoringSnapshot }
  | { ok: false; reason: string } {
  const expectedKeys = ['collected_at', ...monitoringMetricNames];
  if (!isRecord(value) || !hasExactlyKeys(value, expectedKeys)) {
    return { ok: false, reason: 'Le JSON doit contenir exactement collected_at et les trois pourcentages attendus.' };
  }

  if (!isIsoUtcTimestamp(value.collected_at)) {
    return { ok: false, reason: 'La date de collecte doit être un horodatage ISO 8601 valide en UTC.' };
  }

  for (const name of monitoringMetricNames) {
    const metric = value[name];
    if (typeof metric !== 'number' || !Number.isFinite(metric) || metric < 0 || metric > 100) {
      return { ok: false, reason: `${name} doit être un nombre fini entre 0 et 100.` };
    }
  }

  return {
    ok: true,
    snapshot: {
      collected_at: value.collected_at,
      cpu_percent: value.cpu_percent as number,
      memory_percent: value.memory_percent as number,
      storage_percent: value.storage_percent as number,
    },
  };
}

export function getMonitoringState(
  snapshot: MonitoringSnapshot | null,
  now = Date.now(),
  maxAgeMs = MONITORING_MAX_AGE_MS,
): MonitoringState {
  if (!snapshot) return 'unavailable';

  const collectedAt = Date.parse(snapshot.collected_at);
  if (!Number.isFinite(collectedAt) || collectedAt > now) return 'unavailable';
  return now - collectedAt >= maxAgeMs ? 'stale' : 'available';
}

export function getMonitoringFailureState(snapshot: MonitoringSnapshot | null, now = Date.now()): MonitoringState {
  if (!snapshot) return 'unavailable';
  return getMonitoringState(snapshot, now) === 'stale' ? 'stale' : 'unavailable';
}

export function getMonitoringMetricLabel(name: MonitoringMetricName): string {
  return metricLabels[name];
}

export function getMonitoringStateLabel(state: MonitoringState): string {
  return stateLabels[state];
}

export function formatMonitoringPercent(value: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)} %`;
}

export function formatMonitoringTimestamp(value: string): string {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));
  return `${formatted} UTC`;
}
