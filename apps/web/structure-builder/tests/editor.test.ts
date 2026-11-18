import { test } from 'node:test';
import assert from 'node:assert/strict';

import { COALESCE_WINDOW_MS, createEditorStore } from '../src/lib/editor-store';
import { createEditorActions, type Notice } from '../src/lib/editor-actions';
import { instantiateTemplate } from '../src/lib/templates';
import { getCardHeights } from '../src/lib/geometry';
import { CARD_BASE_HEIGHT } from '../src/lib/constants';

function setup() {
  let clock = 1_000;
  const store = createEditorStore(instantiateTemplate('qorve'), () => clock);
  const notices: Notice[] = [];
  const actions = createEditorActions(store, n => notices.push(n));
  return { store, actions, notices, tick: (ms: number) => (clock += ms) };
}

test('typing is coalesced into one undo step; a pause starts a new one', () => {
  const { store, actions, tick } = setup();
  actions.updateEntity('q1', { name: 'V' }, 'name');
  tick(100);
  actions.updateEntity('q1', { name: 'Vi' }, 'name');
  tick(100);
  actions.updateEntity('q1', { name: 'Vir' }, 'name');
  assert.equal(store.getState().past.length, 1);
  tick(COALESCE_WINDOW_MS + 1);
  actions.updateEntity('q1', { name: 'Virex' }, 'name');
  assert.equal(store.getState().past.length, 2);

  actions.undo();
  assert.equal(store.getState().doc.entities.find(e => e.id === 'q1')!.name, 'Vir');
  actions.undo();
  assert.equal(store.getState().doc.entities.find(e => e.id === 'q1')!.name, 'Virex Holding Group B.V.');
  actions.redo();
  assert.equal(store.getState().doc.entities.find(e => e.id === 'q1')!.name, 'Vir');
});

test('a drag is a single undo step regardless of the number of moves', () => {
  const { store, actions } = setup();
  const before = store.getState().doc.entities.find(e => e.id === 'q4')!;
  actions.beginDrag();
  for (let i = 1; i <= 30; i++) actions.dragEntities(new Map([['q4', { x: before.x + i * 10, y: before.y }]]));
  assert.equal(store.getState().past.length, 1);
  assert.equal(store.getState().doc.entities.find(e => e.id === 'q4')!.x, before.x + 300);
  actions.undo();
  assert.equal(store.getState().doc.entities.find(e => e.id === 'q4')!.x, before.x);
});

test('adding a subsidiary creates entity + 100% ownership in one step and selects it', () => {
  const { store, actions } = setup();
  const before = store.getState().doc;
  const id = actions.addSubsidiary('q4')!;
  const after = store.getState().doc;
  assert.equal(after.entities.length, before.entities.length + 1);
  const rel = after.relationships.find(r => r.to === id)!;
  assert.equal(rel.from, 'q4');
  assert.equal(rel.kind === 'ownership' && rel.sharePct, 100);
  assert.deepEqual(store.getState().selection, { type: 'entity', ids: [id] });

  const child = after.entities.find(e => e.id === id)!;
  const parent = after.entities.find(e => e.id === 'q4')!;
  assert.ok(child.y > parent.y, 'placed below its parent');
  const heights = getCardHeights(after);
  for (const e of after.entities) {
    if (e.id === id) continue;
    const overlap =
      child.x < e.x + after.preferences.cardWidth && child.x + after.preferences.cardWidth > e.x &&
      child.y < e.y + (heights.get(e.id) ?? CARD_BASE_HEIGHT) && child.y + CARD_BASE_HEIGHT > e.y;
    assert.ok(!overlap, `new card does not overlap ${e.name}`);
  }

  actions.undo();
  assert.equal(store.getState().doc, before);
  assert.equal(store.getState().selection, null, 'selection of an undone creation is cleared');
});

test('creating an activity from an entity preselects that entity as performer, without new entities', () => {
  const { store, actions } = setup();
  const entityCount = store.getState().doc.entities.length;
  const id = actions.createActivity({ name: 'Merchant services' }, { entityId: 'q3' });
  const doc = store.getState().doc;
  assert.equal(doc.entities.length, entityCount);
  assert.deepEqual(
    doc.activityAssignments.filter(a => a.activityId === id).map(a => [a.entityId, a.role]),
    [['q3', 'performs']]
  );
  assert.deepEqual(store.getState().selection, { type: 'activity', id });
});

test('deleting entities is undoable and reports the impact', () => {
  const { store, actions, notices } = setup();
  const before = store.getState().doc;
  actions.deleteEntities(['q3']);
  assert.match(notices.at(-1)!.message, /Deleted entity and \d+ relationships?, \d+ assignments?/);
  notices.at(-1)!.action!.run();
  assert.equal(store.getState().doc, before);
});

test('view preference changes are saved but not undoable', () => {
  const { store, actions } = setup();
  const pastBefore = store.getState().past.length;
  actions.setPreferences({ mode: 'activities' });
  assert.equal(store.getState().doc.preferences.mode, 'activities');
  assert.equal(store.getState().past.length, pastBefore);
  assert.ok(store.getState().revision > 0, 'revision bumps so autosave persists it');
});

test('a new edit clears the redo stack', () => {
  const { store, actions } = setup();
  actions.updateEntity('q1', { name: 'A' });
  actions.undo();
  assert.equal(store.getState().future.length, 1);
  actions.updateEntity('q2', { name: 'B' });
  assert.equal(store.getState().future.length, 0);
});

test('auto layout is one undoable step and keeps locked entities in place', () => {
  const { store, actions } = setup();
  actions.updateEntity('q6', { locked: true, x: 1234, y: 567 });
  actions.autoLayout('LR');
  const doc = store.getState().doc;
  const locked = doc.entities.find(e => e.id === 'q6')!;
  assert.deepEqual([locked.x, locked.y], [1234, 567]);
  assert.equal(doc.preferences.layoutDirection, 'LR');
  const pastAfterLayout = store.getState().past.length;
  actions.undo();
  assert.equal(store.getState().past.length, pastAfterLayout - 1);
  assert.equal(store.getState().doc.preferences.layoutDirection, 'TB');
});
