export const monitoringScopes = ['proxmox-host', 'vm'] as const;

export type MonitoringScope = (typeof monitoringScopes)[number];
export type MonitoringMetricName = 'cpuPercent' | 'memoryPercent' | 'storagePercent';
export type MonitoringState = 'demo' | 'available' | 'stale' | 'unavailable';

export interface MonitoringMetrics {
  cpuPercent: number | null;
  memoryPercent: number | null;
  storagePercent: number | null;
}

export interface MonitoringSnapshot {
  schemaVersion: 1;
  measuredAt: string;
  scope: MonitoringScope;
  metrics: MonitoringMetrics;
}

export type SnapshotValidation =
  | { ok: true; snapshot: MonitoringSnapshot }
  | { ok: false; reason: string };
