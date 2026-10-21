import type { MonitoringSnapshot } from '../types/homelab-monitoring';

// Valeurs fabriquées pour la présentation : elles ne proviennent d'aucun hôte.
export const homelabMonitoringDemo: MonitoringSnapshot = {
  schemaVersion: 1,
  measuredAt: '2026-10-21T08:30:00.000Z',
  scope: 'proxmox-host',
  metrics: {
    cpuPercent: 18.4,
    memoryPercent: 62.1,
    storagePercent: 41.7,
  },
};
