"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const editor_store_1 = require("../src/lib/editor-store");
const editor_actions_1 = require("../src/lib/editor-actions");
const templates_1 = require("../src/lib/templates");
const geometry_1 = require("../src/lib/geometry");
const constants_1 = require("../src/lib/constants");
function setup() {
    let clock = 1_000;
    const store = (0, editor_store_1.createEditorStore)((0, templates_1.instantiateTemplate)('qorve'), () => clock);
    const notices = [];
    const actions = (0, editor_actions_1.createEditorActions)(store, n => notices.push(n));
    return { store, actions, notices, tick: (ms) => (clock += ms) };
}
(0, node_test_1.test)('typing is coalesced into one undo step; a pause starts a new one', () => {
    const { store, actions, tick } = setup();
    actions.updateEntity('q1', { name: 'V' }, 'name');
    tick(100);
    actions.updateEntity('q1', { name: 'Vi' }, 'name');
    tick(100);
    actions.updateEntity('q1', { name: 'Vir' }, 'name');
    strict_1.default.equal(store.getState().past.length, 1);
    tick(editor_store_1.COALESCE_WINDOW_MS + 1);
    actions.updateEntity('q1', { name: 'Virex' }, 'name');
    strict_1.default.equal(store.getState().past.length, 2);
    actions.undo();
    strict_1.default.equal(store.getState().doc.entities.find(e => e.id === 'q1').name, 'Vir');
    actions.undo();
    strict_1.default.equal(store.getState().doc.entities.find(e => e.id === 'q1').name, 'Virex Holding Group B.V.');
    actions.redo();
    strict_1.default.equal(store.getState().doc.entities.find(e => e.id === 'q1').name, 'Vir');
});
(0, node_test_1.test)('a drag is a single undo step regardless of the number of moves', () => {
    const { store, actions } = setup();
    const before = store.getState().doc.entities.find(e => e.id === 'q4');
    actions.beginDrag();
    for (let i = 1; i <= 30; i++)
        actions.dragEntities(new Map([['q4', { x: before.x + i * 10, y: before.y }]]));
    strict_1.default.equal(store.getState().past.length, 1);
    strict_1.default.equal(store.getState().doc.entities.find(e => e.id === 'q4').x, before.x + 300);
    actions.undo();
    strict_1.default.equal(store.getState().doc.entities.find(e => e.id === 'q4').x, before.x);
});
(0, node_test_1.test)('adding a subsidiary creates entity + 100% ownership in one step and selects it', () => {
    const { store, actions } = setup();
    const before = store.getState().doc;
    const id = actions.addSubsidiary('q4');
    const after = store.getState().doc;
    strict_1.default.equal(after.entities.length, before.entities.length + 1);
    const rel = after.relationships.find(r => r.to === id);
    strict_1.default.equal(rel.from, 'q4');
    strict_1.default.equal(rel.kind === 'ownership' && rel.sharePct, 100);
    strict_1.default.deepEqual(store.getState().selection, { type: 'entity', ids: [id] });
    const child = after.entities.find(e => e.id === id);
    const parent = after.entities.find(e => e.id === 'q4');
    strict_1.default.ok(child.y > parent.y, 'placed below its parent');
    const heights = (0, geometry_1.getCardHeights)(after);
    for (const e of after.entities) {
        if (e.id === id)
            continue;
        const overlap = child.x < e.x + after.preferences.cardWidth && child.x + after.preferences.cardWidth > e.x &&
            child.y < e.y + (heights.get(e.id) ?? constants_1.CARD_BASE_HEIGHT) && child.y + constants_1.CARD_BASE_HEIGHT > e.y;
        strict_1.default.ok(!overlap, `new card does not overlap ${e.name}`);
    }
    actions.undo();
    strict_1.default.equal(store.getState().doc, before);
    strict_1.default.equal(store.getState().selection, null, 'selection of an undone creation is cleared');
});
(0, node_test_1.test)('creating an activity from an entity preselects that entity as performer, without new entities', () => {
    const { store, actions } = setup();
    const entityCount = store.getState().doc.entities.length;
    const id = actions.createActivity({ name: 'Merchant services' }, { entityId: 'q3' });
    const doc = store.getState().doc;
    strict_1.default.equal(doc.entities.length, entityCount);
    strict_1.default.deepEqual(doc.activityAssignments.filter(a => a.activityId === id).map(a => [a.entityId, a.role]), [['q3', 'performs']]);
    strict_1.default.deepEqual(store.getState().selection, { type: 'activity', id });
});
(0, node_test_1.test)('deleting entities is undoable and reports the impact', () => {
    const { store, actions, notices } = setup();
    const before = store.getState().doc;
    actions.deleteEntities(['q3']);
    strict_1.default.match(notices.at(-1).message, /Deleted entity and \d+ relationships?, \d+ assignments?/);
    notices.at(-1).action.run();
    strict_1.default.equal(store.getState().doc, before);
});
(0, node_test_1.test)('view preference changes are saved but not undoable', () => {
    const { store, actions } = setup();
    const pastBefore = store.getState().past.length;
    actions.setPreferences({ mode: 'activities' });
    strict_1.default.equal(store.getState().doc.preferences.mode, 'activities');
    strict_1.default.equal(store.getState().past.length, pastBefore);
    strict_1.default.ok(store.getState().revision > 0, 'revision bumps so autosave persists it');
});
(0, node_test_1.test)('a new edit clears the redo stack', () => {
    const { store, actions } = setup();
    actions.updateEntity('q1', { name: 'A' });
    actions.undo();
    strict_1.default.equal(store.getState().future.length, 1);
    actions.updateEntity('q2', { name: 'B' });
    strict_1.default.equal(store.getState().future.length, 0);
});
(0, node_test_1.test)('auto layout is one undoable step and keeps locked entities in place', () => {
    const { store, actions } = setup();
    actions.updateEntity('q6', { locked: true, x: 1234, y: 567 });
    actions.autoLayout('LR');
    const doc = store.getState().doc;
    const locked = doc.entities.find(e => e.id === 'q6');
    strict_1.default.deepEqual([locked.x, locked.y], [1234, 567]);
    strict_1.default.equal(doc.preferences.layoutDirection, 'LR');
    const pastAfterLayout = store.getState().past.length;
    actions.undo();
    strict_1.default.equal(store.getState().past.length, pastAfterLayout - 1);
    strict_1.default.equal(store.getState().doc.preferences.layoutDirection, 'TB');
});
