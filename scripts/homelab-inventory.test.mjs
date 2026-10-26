import assert from 'node:assert/strict';
import test from 'node:test';
import { getHomelabServiceViews } from '../src/data/homelab-service-descriptions.ts';
import {
  getHomelabInventoryFreshness,
  HOMELAB_INVENTORY_ENDPOINT,
  HOMELAB_INVENTORY_MAX_AGE_MS,
  loadHomelabInventory,
  validateHomelabInventory,
} from '../src/lib/homelab-inventory.ts';

const collectedAt = '2026-10-26T15:15:07Z';
const services = [
  { name: 'Laboratoire d expérimentation', type: 'vm', status: 'stopped' },
  { name: 'Accès distant sécurisé', type: 'lxc', status: 'running' },
  { name: 'Supervision', type: 'lxc', status: 'running' },
];
const validInventory = { collected_at: collectedAt, services };

test('validates an inventory containing the three public services', () => {
  const result = validateHomelabInventory(validInventory);
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.inventory, validInventory);
});

test('adds the known public descriptions without changing inventory discovery', () => {
  const result = validateHomelabInventory(validInventory);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const [lab, vpn, monitoring] = getHomelabServiceViews(result.inventory.services);
  assert.equal(lab.name, 'Laboratoire d’expérimentation');
  assert.match(lab.description, /Debian Linux.*Docker.*DevOps/);
  assert.match(lab.note, /état arrêté est normal/);
  assert.equal(vpn.typeLabel, 'LXC');
  assert.match(vpn.description, /Alpine Linux.*WireGuard/);
  assert.match(vpn.note, /ne confirme pas.*bout en bout/);
  assert.match(monitoring.description, /métriques Proxmox.*OVHcloud/);
});

test('accepts a valid empty inventory without restoring previous services', () => {
  const result = validateHomelabInventory({ collected_at: collectedAt, services: [] });
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(getHomelabServiceViews(result.inventory.services), []);
});

test('renders new services automatically and uses a generic description when needed', () => {
  const fourth = { name: 'Nouvel environnement public', type: 'vm', status: 'running' };
  const result = validateHomelabInventory({ collected_at: collectedAt, services: [...services, fourth] });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const views = getHomelabServiceViews(result.inventory.services);
  assert.equal(views.length, 4);
  assert.equal(views[3].name, fourth.name);
  assert.equal(views[3].typeLabel, 'VM');
  assert.equal(views[3].statusLabel, 'Actif');
  assert.match(views[3].description, /rôle n’est pas décrit/);
});

test('removing a service from the inventory removes its view', () => {
  const result = validateHomelabInventory({ collected_at: collectedAt, services: services.slice(1) });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(getHomelabServiceViews(result.inventory.services).length, 2);
});

test('keeps duplicate service names as separate entries', () => {
  const result = validateHomelabInventory({ collected_at: collectedAt, services: [services[1], services[1]] });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(getHomelabServiceViews(result.inventory.services).length, 2);
});

test('maps unknown and invalid status values to the accessible unknown label', () => {
  for (const status of ['unknown', 'paused', 'RUNNING', null, 42]) {
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

test('rejects malformed inventory shapes and unapproved metadata', () => {
  assert.equal(validateHomelabInventory(null).ok, false);
  assert.equal(validateHomelabInventory({ ...validInventory, extra: 'ignored?' }).ok, false);
  assert.equal(validateHomelabInventory({ ...validInventory, services: [{ ...services[0], vmid: 101 }] }).ok, false);
  assert.equal(validateHomelabInventory({ ...validInventory, services: [{ ...services[0], type: 'server' }] }).ok, false);
});

test('handles malformed JSON and an unavailable endpoint', async () => {
  const malformed = await loadHomelabInventory(async () => ({ ok: true, json: async () => { throw new SyntaxError('bad json'); } }), Date.parse(collectedAt));
  assert.deepEqual(malformed, { ok: false, reason: 'invalid' });

  const unavailable = await loadHomelabInventory(async () => ({ ok: false, json: async () => validInventory }), Date.parse(collectedAt));
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
    return { ok: true, json: async () => validInventory };
  }, Date.parse(collectedAt));

  assert.equal(result.ok, true);
  assert.equal(requestedUrl, HOMELAB_INVENTORY_ENDPOINT);
  assert.equal(requestOptions.cache, 'no-store');
  assert.equal(requestOptions.headers.Accept, 'application/json');
});

test('marks data stale at exactly fifteen minutes based only on collected_at', () => {
  const result = validateHomelabInventory(validInventory);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const collectedAtMs = Date.parse(collectedAt);
  assert.equal(getHomelabInventoryFreshness(result.inventory, collectedAtMs + HOMELAB_INVENTORY_MAX_AGE_MS - 1), 'current');
  assert.equal(getHomelabInventoryFreshness(result.inventory, collectedAtMs + HOMELAB_INVENTORY_MAX_AGE_MS), 'stale');
  assert.equal(getHomelabInventoryFreshness(result.inventory, collectedAtMs + HOMELAB_INVENTORY_MAX_AGE_MS + 1), 'stale');
});

test('rejects an inventory timestamp in the future as inconsistent', async () => {
  const now = Date.parse(collectedAt);
  const future = { ...validInventory, collected_at: '2026-10-26T15:15:08Z' };
  assert.equal(getHomelabInventoryFreshness(future, now), 'inconsistent');
  const result = await loadHomelabInventory(async () => ({ ok: true, json: async () => future }), now);
  assert.deepEqual(result, { ok: false, reason: 'future-timestamp' });
});

test('shows a deliberately stopped VM as stopped, with its on-demand explanation', () => {
  const result = validateHomelabInventory(validInventory);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const [lab] = getHomelabServiceViews(result.inventory.services);
  assert.equal(lab.typeLabel, 'VM');
  assert.equal(lab.statusLabel, 'Arrêté');
  assert.match(lab.note, /Démarrée à la demande/);
});
