import type {
  MonitoringMetricName,
  MonitoringMetrics,
  MonitoringScope,
  MonitoringSnapshot,
  MonitoringState,
  SnapshotValidation,
} from '../types/homelab-monitoring';

const monitoringScopes: MonitoringScope[] = ['proxmox-host', 'vm'];

export const monitoringMetricNames: MonitoringMetricName[] = [
  'cpuPercent',
  'memoryPercent',
  'storagePercent',
];

export const MONITORING_REFRESH_MS = 3 * 60 * 1000;
export const MONITORING_MAX_AGE_MS = 10 * 60 * 1000;
const FUTURE_CLOCK_TOLERANCE_MS = 60 * 1000;

const metricLabels: Record<MonitoringMetricName, string> = {
  cpuPercent: 'Utilisation CPU',
  memoryPercent: 'Utilisation mémoire',
  storagePercent: 'Utilisation du stockage',
};

const scopeLabels: Record<MonitoringScope, string> = {
  'proxmox-host': 'Hôte Proxmox',
  vm: 'Machine virtuelle (sans nom)',
};

const stateLabels: Record<MonitoringState, string> = {
  demo: 'Démo — données fictives',
  available: 'Disponible',
  stale: 'Données anciennes',
  unavailable: 'Indisponible',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function containsOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every(key => allowed.includes(key));
}

function isIsoUtcTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

export function validateMonitoringSnapshot(value: unknown): SnapshotValidation {
  if (!isRecord(value) || !containsOnlyKeys(value, ['schemaVersion', 'measuredAt', 'scope', 'metrics'])) {
    return { ok: false, reason: 'La structure racine contient des champs inattendus ou est invalide.' };
  }

  if (value.schemaVersion !== 1) {
    return { ok: false, reason: 'La version du format n’est pas prise en charge.' };
  }
  if (!isIsoUtcTimestamp(value.measuredAt)) {
    return { ok: false, reason: 'La date doit être un horodatage ISO 8601 en UTC.' };
  }
  if (typeof value.scope !== 'string' || !monitoringScopes.includes(value.scope as MonitoringScope)) {
    return { ok: false, reason: 'Le périmètre de la mesure n’est pas reconnu.' };
  }
  if (!isRecord(value.metrics) || !containsOnlyKeys(value.metrics, monitoringMetricNames)) {
    return { ok: false, reason: 'Les métriques contiennent des champs inattendus ou sont invalides.' };
  }

  const normalized: MonitoringMetrics = {
    cpuPercent: null,
    memoryPercent: null,
    storagePercent: null,
  };

  for (const name of monitoringMetricNames) {
    if (!(name in value.metrics)) continue;

    const metric = value.metrics[name];
    if (metric === null) continue;
    if (typeof metric !== 'number' || !Number.isFinite(metric) || metric < 0 || metric > 100) {
      return { ok: false, reason: `La valeur ${name} doit être un pourcentage entre 0 et 100, ou null.` };
    }
    normalized[name] = metric;
  }

  return {
    ok: true,
    snapshot: {
      schemaVersion: 1,
      measuredAt: value.measuredAt,
      scope: value.scope as MonitoringScope,
      metrics: normalized,
    },
  };
}

export function isAllowedPublicMetricsEndpoint(value: string): boolean {
  if (!value || value !== value.trim() || value.includes('\\')) return false;

  const isSameOriginPath = value.startsWith('/') && !value.startsWith('//');
  let url: URL;
  try {
    url = new URL(value, 'https://portfolio.invalid');
  } catch {
    return false;
  }

  if (!url.pathname.toLowerCase().endsWith('.json') || url.search || url.hash || url.username || url.password) {
    return false;
  }
  if (isSameOriginPath) return true;
  if (url.protocol !== 'https:') return false;

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (
    host === 'localhost' ||
    host === 'localhost.localdomain' ||
    host.endsWith('.local') ||
    host.endsWith('.lan') ||
    host.endsWith('.internal') ||
    host.endsWith('.home.arpa')
  ) return false;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [first, second, third, fourth] = ipv4.slice(1).map(Number);
    if ([first, second, third, fourth].some(octet => octet > 255)) return false;
    if (
      first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 192 && second === 0 && third === 0) ||
      (first === 198 && (second === 18 || second === 19 || second === 51 && third === 100)) ||
      (first === 203 && second === 0 && third === 113)
    ) return false;
  }

  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:') || host.startsWith('::ffff:')) {
    return false;
  }
  return host.includes('.') || host.includes(':');
}

export function getMonitoringState(
  snapshot: MonitoringSnapshot | null,
  now = Date.now(),
  maxAgeMs = MONITORING_MAX_AGE_MS,
): Exclude<MonitoringState, 'demo'> {
  if (!snapshot || !monitoringMetricNames.some(name => snapshot.metrics[name] !== null)) {
    return 'unavailable';
  }

  const measuredAt = Date.parse(snapshot.measuredAt);
  if (!Number.isFinite(measuredAt) || measuredAt > now + FUTURE_CLOCK_TOLERANCE_MS) {
    return 'unavailable';
  }
  return now - measuredAt > maxAgeMs ? 'stale' : 'available';
}

export function getMonitoringFailureState(snapshot: MonitoringSnapshot | null, now = Date.now()): Exclude<MonitoringState, 'demo'> {
  if (!snapshot) return 'unavailable';
  return getMonitoringState(snapshot, now) === 'stale' ? 'stale' : 'unavailable';
}

export function getMonitoringScopeLabel(scope: MonitoringScope): string {
  return scopeLabels[scope];
}

export function getMonitoringMetricLabel(name: MonitoringMetricName): string {
  return metricLabels[name];
}

export function getMonitoringStateLabel(state: MonitoringState): string {
  return stateLabels[state];
}

export function formatMonitoringPercent(value: number | null): string {
  if (value === null) return 'Indisponible';
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
