import assert from 'node:assert/strict';
import test from 'node:test';
import { getHomelabServiceViews } from '../src/data/homelab-service-view.ts';
import {
  getHomelabInventoryFreshness,
  HOMELAB_INVENTORY_ENDPOINT,
  HOMELAB_INVENTORY_MAX_AGE_MS,
  loadHomelabInventory,
  validateHomelabInventory,
} from '../src/lib/homelab-inventory.ts';

const collectedAt = '2026-10-26T15:15:07Z';
const legacyServices = [
  { name: 'Laboratoire d’expérimentation', type: 'vm', status: 'stopped' },
  { name: 'Accès distant sécurisé', type: 'lxc', status: 'running' },
  { name: 'Supervision', type: 'lxc', status: 'running' },
];
const legacyInventory = { collected_at: collectedAt, services: legacyServices };
const enrichedService = {
  id: 'lxc/103',
  name: 'Observabilité',
  description: 'Supervision des ressources du homelab avec Prometheus et Grafana.',
  type: 'lxc',
  status: 'running',
};
const enrichedInventory = { collected_at: collectedAt, services: [enrichedService] };

test('accepts the enriched public service contract and preserves curated fields', () => {
  const result = validateHomelabInventory(enrichedInventory);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(result.inventory, enrichedInventory);
  const [view] = getHomelabServiceViews(result.inventory.services);
  assert.equal(view.name, 'Observabilité');
  assert.equal(view.description, enrichedService.description);
  assert.equal(view.typeLabel, 'LXC');
  assert.equal(view.statusLabel, 'Actif');
});

test('keeps accepting legacy JSON without id or description', () => {
  const result = validateHomelabInventory(legacyInventory);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.deepEqual(result.inventory, legacyInventory);
  const [lab] = getHomelabServiceViews(result.inventory.services);
  assert.equal(lab.name, 'Laboratoire d’expérimentation');
  assert.equal(lab.description, 'Aucune description publique n’a été fournie.');
});

test('uses neutral fallbacks when a public name or description is absent', () => {
  const result = validateHomelabInventory({
    collected_at: collectedAt,
    services: [{ type: 'vm' }, { name: 'Service sans description', type: 'lxc', description: '  ' }],
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const [unnamed, undescribed] = getHomelabServiceViews(result.inventory.services);
  assert.equal(unnamed.name, 'Service public sans nom · VM');
  assert.equal(unnamed.description, 'Aucune description publique n’a été fournie.');
  assert.equal(undescribed.name, 'Service sans description');
  assert.equal(undescribed.description, 'Aucune description publique n’a été fournie.');
});

test('accepts a valid empty inventory without restoring previous services', () => {
  const result = validateHomelabInventory({ collected_at: collectedAt, services: [] });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(getHomelabServiceViews(result.inventory.services), []);
});

test('renders additional public services from their published values', () => {
  const service = { id: 'vm/210', name: 'Nouveau service', description: 'Description validée.', type: 'vm', status: 'running' };
  const result = validateHomelabInventory({ collected_at: collectedAt, services: [...legacyServices, service] });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const views = getHomelabServiceViews(result.inventory.services);
  assert.equal(views.length, 4);
  assert.equal(views[3].name, service.name);
  assert.equal(views[3].description, service.description);
  assert.equal(views[3].typeLabel, 'VM');
});

test('removes a service when it is absent from the next inventory', () => {
  const result = validateHomelabInventory({ collected_at: collectedAt, services: legacyServices.slice(1) });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(getHomelabServiceViews(result.inventory.services).length, 2);
});

test('keeps duplicate display names as separate entries', () => {
  const result = validateHomelabInventory({ collected_at: collectedAt, services: [legacyServices[1], legacyServices[1]] });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(getHomelabServiceViews(result.inventory.services).length, 2);
});

test('maps unknown and invalid status values to the accessible unknown label', () => {
  for (const status of ['unknown', 'paused', 'RUNNING', null, 42, undefined]) {
    const result = validateHomelabInventory({
      collected_at: collectedAt,
      services: [{ name: 'Service public', type: 'lxc', status }],
    });
    assert.equal(result.ok, true, String(status));
    if (result.ok) {
      const [view] = getHomelabServiceViews(result.inventory.services);
      assert.equal(view.status, 'unknown', String(status));
      assert.equal(view.statusLabel, 'Inconnu', String(status));
    }
  }
});

test('rejects unapproved metadata and malformed public values', () => {
  assert.equal(validateHomelabInventory(null).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, extra: 'ignored?' }).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, services: [{ ...legacyServices[0], vmid: 101 }] }).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, services: [{ ...legacyServices[0], token: 'secret' }] }).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, services: [{ ...legacyServices[0], type: 'server' }] }).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, services: [{ ...legacyServices[0], id: 'ct/103' }] }).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, services: [{ ...legacyServices[0], id: 'lxc/103' }] }).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, services: [{ ...legacyServices[0], description: 12 }] }).ok, false);
  assert.equal(validateHomelabInventory({ ...legacyInventory, services: [{ ...legacyServices[0], name: 'n'.repeat(81) }] }).ok, false);
});

test('handles malformed JSON and an unavailable endpoint', async () => {
  const malformed = await loadHomelabInventory(async () => ({ ok: true, json: async () => { throw new SyntaxError('bad json'); } }), Date.parse(collectedAt));
  assert.deepEqual(malformed, { ok: false, reason: 'invalid' });

  const unavailable = await loadHomelabInventory(async () => ({ ok: false, json: async () => enrichedInventory }), Date.parse(collectedAt));
  assert.deepEqual(unavailable, { ok: false, reason: 'unavailable' });

  const networkFailure = await loadHomelabInventory(async () => { throw new Error('network failure'); }, Date.parse(collectedAt));
  assert.deepEqual(networkFailure, { ok: false, reason: 'unavailable' });
});

test('requests only the public static JSON with caching disabled', async () => {
  let requestedUrl;
  let requestOptions;
  const result = await loadHomelabInventory(async (url, options) => {
    requestedUrl = url;
    requestOptions = options;
    return { ok: true, json: async () => enrichedInventory };
  }, Date.parse(collectedAt));

  assert.equal(result.ok, true);
  assert.equal(requestedUrl, HOMELAB_INVENTORY_ENDPOINT);
  assert.equal(requestOptions.cache, 'no-store');
  assert.equal(requestOptions.headers.Accept, 'application/json');
});

test('marks data stale at exactly fifteen minutes based only on collected_at', () => {
  const result = validateHomelabInventory(legacyInventory);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const collectedAtMs = Date.parse(collectedAt);
  assert.equal(getHomelabInventoryFreshness(result.inventory, collectedAtMs + HOMELAB_INVENTORY_MAX_AGE_MS - 1), 'current');
  assert.equal(getHomelabInventoryFreshness(result.inventory, collectedAtMs + HOMELAB_INVENTORY_MAX_AGE_MS), 'stale');
  assert.equal(getHomelabInventoryFreshness(result.inventory, collectedAtMs + HOMELAB_INVENTORY_MAX_AGE_MS + 1), 'stale');
});

test('rejects an inventory timestamp in the future as inconsistent', async () => {
  const now = Date.parse(collectedAt);
  const future = { ...legacyInventory, collected_at: '2026-10-26T15:15:08Z' };
  assert.equal(getHomelabInventoryFreshness(future, now), 'inconsistent');
  const result = await loadHomelabInventory(async () => ({ ok: true, json: async () => future }), now);
  assert.deepEqual(result, { ok: false, reason: 'future-timestamp' });
});

test('keeps a deliberately stopped VM distinct from a running service', () => {
  const result = validateHomelabInventory(legacyInventory);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const [lab] = getHomelabServiceViews(result.inventory.services);
  assert.equal(lab.typeLabel, 'VM');
  assert.equal(lab.statusLabel, 'Arrêté');
});
