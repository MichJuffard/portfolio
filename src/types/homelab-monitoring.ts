export const monitoringMetricNames = ['cpu_percent', 'memory_percent', 'storage_percent'] as const;
export type MonitoringMetricName = (typeof monitoringMetricNames)[number];
export type MonitoringState = 'available' | 'stale' | 'unavailable';

export interface MonitoringSnapshot {
  collected_at: string;
  cpu_percent: number;
  memory_percent: number;
  storage_percent: number;
}

export type SnapshotValidation =
  | { ok: true; snapshot: MonitoringSnapshot }
  | { ok: false; reason: string };
