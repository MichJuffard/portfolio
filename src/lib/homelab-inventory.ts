import type {
  HomelabInventory,
  HomelabInventoryFreshness,
  HomelabService,
  HomelabServiceStatus,
  HomelabServiceType,
} from '../types/homelab-inventory';

export const HOMELAB_INVENTORY_ENDPOINT = '/data/homelab-inventory.json';
export const HOMELAB_INVENTORY_REFRESH_MS = 3 * 60 * 1000;
export const HOMELAB_INVENTORY_MAX_AGE_MS = 15 * 60 * 1000;

export type InventoryLoadResult =
  | { ok: true; snapshot: HomelabInventory; freshness: HomelabInventoryFreshness }
  | { ok: false; reason: 'unavailable' | 'invalid' | 'future-timestamp' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: string[]): boolean {
  return Object.keys(value).every(key => allowed.includes(key));
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

function normalizeStatus(value: unknown): HomelabServiceStatus {
  return value === 'running' || value === 'stopped' || value === 'unknown' ? value : 'unknown';
}

export function validateHomelabInventory(value: unknown):
  | { ok: true; inventory: HomelabInventory }
  | { ok: false; reason: string } {
  if (!isRecord(value) || !hasOnlyKeys(value, ['collected_at', 'services'])
    || !Object.hasOwn(value, 'collected_at') || !Object.hasOwn(value, 'services')) {
    return { ok: false, reason: 'Le JSON doit contenir uniquement collected_at et services.' };
  }

  if (!isIsoUtcTimestamp(value.collected_at)) {
    return { ok: false, reason: 'La date de collecte doit être un horodatage ISO 8601 valide en UTC.' };
  }

  if (!Array.isArray(value.services)) {
    return { ok: false, reason: 'services doit être un tableau.' };
  }

  const services: HomelabService[] = [];
  for (const service of value.services) {
    if (!isRecord(service) || !hasOnlyKeys(service, ['id', 'name', 'description', 'type', 'status'])
      || !Object.hasOwn(service, 'type')) {
      return { ok: false, reason: 'Chaque service doit contenir uniquement id, name, description, type et status.' };
    }

    if (service.id !== undefined
      && (typeof service.id !== 'string'
        || !/^(vm|lxc)\/\d{1,6}$/.test(service.id)
        || service.id.split('/')[0] !== service.type)) {
      return { ok: false, reason: 'id doit respecter le format vm/<id> ou lxc/<id>.' };
    }

    if (service.name !== undefined
      && (typeof service.name !== 'string' || service.name.length > 80)) {
      return { ok: false, reason: 'name doit être un texte de 80 caractères maximum.' };
    }

    if (service.description !== undefined
      && (typeof service.description !== 'string' || service.description.length > 280)) {
      return { ok: false, reason: 'description doit être un texte de 280 caractères maximum.' };
    }

    if (service.type !== 'vm' && service.type !== 'lxc') {
      return { ok: false, reason: 'Le type de chaque service doit être vm ou lxc.' };
    }

    const normalizedService: HomelabService = {
      type: service.type as HomelabServiceType,
      status: normalizeStatus(service.status),
    };
    if (typeof service.id === 'string') normalizedService.id = service.id;
    if (typeof service.name === 'string' && service.name.trim()) normalizedService.name = service.name.trim();
    if (typeof service.description === 'string' && service.description.trim()) {
      normalizedService.description = service.description.trim();
    }
    services.push(normalizedService);
  }

  return { ok: true, inventory: { collected_at: value.collected_at, services } };
}

export function getHomelabInventoryFreshness(
  inventory: HomelabInventory,
  now = Date.now(),
  maxAgeMs = HOMELAB_INVENTORY_MAX_AGE_MS,
): HomelabInventoryFreshness {
  const collectedAt = Date.parse(inventory.collected_at);
  if (!Number.isFinite(collectedAt) || collectedAt > now) return 'inconsistent';
  return now - collectedAt >= maxAgeMs ? 'stale' : 'current';
}

export async function loadHomelabInventory(
  fetcher: typeof fetch = fetch,
  now = Date.now(),
  signal?: AbortSignal,
): Promise<InventoryLoadResult> {
  let response: Response;
  try {
    response = await fetcher(HOMELAB_INVENTORY_ENDPOINT, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal,
    });
  } catch {
    return { ok: false, reason: 'unavailable' };
  }

  if (!response.ok) return { ok: false, reason: 'unavailable' };

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  const result = validateHomelabInventory(payload);
  if (!result.ok) return { ok: false, reason: 'invalid' };

  const freshness = getHomelabInventoryFreshness(result.inventory, now);
  if (freshness === 'inconsistent') return { ok: false, reason: 'future-timestamp' };

  return { ok: true, snapshot: result.inventory, freshness };
}
