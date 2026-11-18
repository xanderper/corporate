import { test } from 'node:test';
import assert from 'node:assert/strict';

import { computeAutoLayout, findFreePosition, fitBoundsTransform, computeBounds, zoomAround } from '../src/lib/layout';
import { getCardHeights, resolveLabelPositions } from '../src/lib/geometry';
import { instantiateTemplate } from '../src/lib/templates';
import * as M from '../src/lib/model';
import { loadDocument, saveDocument, loadViewport, saveViewport, CORRUPT_BACKUP_KEY, type StorageLike } from '../src/lib/persistence';
import { STORAGE_KEY } from '../src/lib/constants';
import type { LegalEntity } from '../src/lib/types';

function overlaps(a: LegalEntity, b: LegalEntity, w: number, h: (id: string) => number) {
  return a.x < b.x + w && a.x + w > b.x && a.y < b.y + h(b.id) && a.y + h(a.id) > b.y;
}

for (const direction of ['TB', 'LR'] as const) {
  test(`auto layout ${direction}: parents precede subsidiaries and cards never overlap`, () => {
    const doc = { ...instantiateTemplate('qorve'), preferences: { ...instantiateTemplate('qorve').preferences, mode: 'activities' as const } };
    const heights = getCardHeights(doc);
    const { positions } = computeAutoLayout(doc.entities, doc.relationships, doc.groups, { direction, cardWidth: 200, heights });
    const placed = M.moveEntities(doc, positions).entities;
    const byId = new Map(placed.map(e => [e.id, e]));
    for (const r of doc.relationships.filter(r => r.kind === 'ownership' || r.kind === 'certificates')) {
      const from = byId.get(r.from)!;
      const to = byId.get(r.to)!;
      if (direction === 'TB') assert.ok(from.y < to.y, `${from.name} above ${to.name}`);
      else assert.ok(from.x < to.x, `${from.name} left of ${to.name}`);
    }
    const h = (id: string) => heights.get(id) ?? 84;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        assert.ok(!overlaps(placed[i], placed[j], 200, h), `${placed[i].name} / ${placed[j].name} overlap`);
      }
    }
    // The custody foundation (arrangement-only) sits on the rank of the entity it serves.
    if (direction === 'TB') assert.equal(byId.get('q6')!.y, byId.get('q5')!.y);
  });
}

test('auto layout survives cycles and handles a large structure quickly', () => {
  const entities = Array.from({ length: 400 }, (_, i) => M.createEntity({ id: `e${i}`, x: 0, y: 0 }));
  const relationships = entities.slice(1).map((e, i) =>
    M.buildRelationship(`r${i}`, 'ownership', { from: `e${Math.floor(i / 3)}`, to: e.id, sharePct: 100 })
  );
  relationships.push(M.buildRelationship('cycle', 'ownership', { from: 'e399', to: 'e0', sharePct: 1 }));
  const t0 = performance.now();
  const { positions } = computeAutoLayout(entities, relationships, [], { direction: 'TB', cardWidth: 200 });
  const ms = performance.now() - t0;
  assert.equal(positions.size, 400);
  assert.ok(ms < 1500, `layout of 400 entities took ${ms.toFixed(0)}ms`);
});

test('findFreePosition avoids existing cards', () => {
  const entities = [M.createEntity({ id: 'a', x: 100, y: 100 })];
  const p = findFreePosition(entities, { x: 100, y: 100 }, 200);
  assert.ok(!overlaps({ ...entities[0], id: 'n', ...p }, entities[0], 200, () => 84));
});

test('findFreePosition allows placement in negative canvas space without artificial clamping', () => {
  const entities = [M.createEntity({ id: 'a', x: -100, y: -100 })];
  const p = findFreePosition(entities, { x: -100, y: -100 }, 200);
  assert.ok(!overlaps({ ...entities[0], id: 'n', ...p }, entities[0], 200, () => 84));
});

test('fit transform centres the bounds and zoomAround keeps the cursor point fixed', () => {
  const doc = instantiateTemplate('qorve');
  const t = fitBoundsTransform(computeBounds(doc.entities, doc.groups, 200), 1200, 800);
  const b = computeBounds(doc.entities, doc.groups, 200)!;
  const centreX = (b.minX + b.width / 2) * t.zoom + t.panX;
  assert.ok(Math.abs(centreX - 600) <= 1);

  const view = { zoom: 1, panX: 50, panY: 20 };
  const next = zoomAround(view, 2, 300, 200);
  const before = { x: (300 - view.panX) / view.zoom, y: (200 - view.panY) / view.zoom };
  const after = { x: (300 - next.panX) / next.zoom, y: (200 - next.panY) / next.zoom };
  assert.deepEqual(after, before);
  assert.equal(zoomAround(view, 99, 0, 0).zoom, 2.5, 'zoom is clamped');
});

test('edge labels that would collide are separated', () => {
  const placed = resolveLabelPositions([
    { id: 'a', x: 100, y: 100, w: 80, h: 20 },
    { id: 'b', x: 110, y: 102, w: 80, h: 20 }
  ]);
  const a = placed.get('a')!;
  const b = placed.get('b')!;
  assert.ok(Math.abs(a.y - b.y) >= 20);
});

class MemoryStorage implements StorageLike {
  data = new Map<string, string>();
  failNext: Error | null = null;
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failNext) {
      const err = this.failNext;
      this.failNext = null;
      throw err;
    }
    this.data.set(key, value);
  }
}

test('save and reload restores activities, products and licences', () => {
  const storage = new MemoryStorage();
  const doc = instantiateTemplate('qorve');
  const saved = saveDocument(storage, doc, 0, 'tab-a');
  assert.equal(saved.ok, true);
  const loaded = loadDocument(storage);
  assert.equal(loaded.status, 'loaded');
  if (loaded.status !== 'loaded') return;
  assert.equal(loaded.doc.activities.length, doc.activities.length);
  assert.equal(loaded.doc.activityAssignments.length, doc.activityAssignments.length);
  assert.equal(loaded.doc.productAssignments.length, doc.productAssignments.length);
  assert.deepEqual(loaded.doc.licences.map(l => l.status), doc.licences.map(l => l.status));
  assert.equal(loaded.migratedFrom, null);
});

test('a newer save from another tab is never silently overwritten', () => {
  const storage = new MemoryStorage();
  const doc = instantiateTemplate('blank');
  const a = saveDocument(storage, doc, 0, 'tab-a');
  assert.ok(a.ok);
  const b = saveDocument(storage, { ...doc, chartTitle: 'B' }, a.ok ? a.revision : 0, 'tab-b');
  assert.ok(b.ok);
  const conflict = saveDocument(storage, { ...doc, chartTitle: 'A again' }, a.ok ? a.revision : 0, 'tab-a');
  assert.equal(conflict.ok, false);
  assert.equal(!conflict.ok && conflict.reason, 'conflict');
  const loaded = loadDocument(storage);
  assert.equal(loaded.status === 'loaded' && loaded.doc.chartTitle, 'B');
  const forced = saveDocument(storage, { ...doc, chartTitle: 'A wins' }, a.ok ? a.revision : 0, 'tab-a', { force: true });
  assert.ok(forced.ok);
});

test('storage quota errors are reported, not thrown', () => {
  const storage = new MemoryStorage();
  const err = new Error('exceeded');
  err.name = 'QuotaExceededError';
  storage.failNext = err;
  const result = saveDocument(storage, instantiateTemplate('blank'), 0, 'tab');
  assert.equal(!result.ok && result.reason, 'quota');
});

test('legacy v3 storage keys are migrated and unreadable data is backed up', () => {
  const storage = new MemoryStorage();
  storage.setItem('virex_structure_builder_v3', JSON.stringify({
    schemaVersion: 3,
    nodes: [{ id: 'a', name: 'A B.V.', type: 'BV', x: 1, y: 2 }],
    edges: [],
    activities: [{ id: 'x', name: 'Payments', responsibleEntityId: 'a' }],
    view: { zoom: 0.5, panX: 10, panY: 20 }
  }));
  const loaded = loadDocument(storage);
  assert.equal(loaded.status, 'loaded');
  if (loaded.status === 'loaded') {
    assert.equal(loaded.migratedFrom, 3);
    assert.deepEqual(loaded.legacyViewport, { zoom: 0.5, panX: 10, panY: 20 });
    assert.equal(loaded.doc.activityAssignments[0].entityId, 'a');
  }

  storage.setItem(STORAGE_KEY, '{broken');
  const broken = loadDocument(storage);
  assert.equal(broken.status, 'error');
  assert.equal(storage.getItem(CORRUPT_BACKUP_KEY), '{broken');
});

test('viewport is stored separately from the document', () => {
  const storage = new MemoryStorage();
  assert.equal(loadViewport(storage), null);
  saveViewport(storage, { zoom: 1.5, panX: 3, panY: 4 });
  assert.deepEqual(loadViewport(storage), { zoom: 1.5, panX: 3, panY: 4 });
  storage.setItem('virex_structure_builder_viewport_v1', '{"zoom":"x"}');
  assert.equal(loadViewport(storage), null);
});
