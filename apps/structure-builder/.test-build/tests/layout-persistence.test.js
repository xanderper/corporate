"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const layout_1 = require("../src/lib/layout");
const geometry_1 = require("../src/lib/geometry");
const templates_1 = require("../src/lib/templates");
const M = __importStar(require("../src/lib/model"));
const persistence_1 = require("../src/lib/persistence");
const constants_1 = require("../src/lib/constants");
function overlaps(a, b, w, h) {
    return a.x < b.x + w && a.x + w > b.x && a.y < b.y + h(b.id) && a.y + h(a.id) > b.y;
}
for (const direction of ['TB', 'LR']) {
    (0, node_test_1.test)(`auto layout ${direction}: parents precede subsidiaries and cards never overlap`, () => {
        const doc = { ...(0, templates_1.instantiateTemplate)('qorve'), preferences: { ...(0, templates_1.instantiateTemplate)('qorve').preferences, mode: 'activities' } };
        const heights = (0, geometry_1.getCardHeights)(doc);
        const { positions } = (0, layout_1.computeAutoLayout)(doc.entities, doc.relationships, doc.groups, { direction, cardWidth: 200, heights });
        const placed = M.moveEntities(doc, positions).entities;
        const byId = new Map(placed.map(e => [e.id, e]));
        for (const r of doc.relationships.filter(r => r.kind === 'ownership' || r.kind === 'certificates')) {
            const from = byId.get(r.from);
            const to = byId.get(r.to);
            if (direction === 'TB')
                strict_1.default.ok(from.y < to.y, `${from.name} above ${to.name}`);
            else
                strict_1.default.ok(from.x < to.x, `${from.name} left of ${to.name}`);
        }
        const h = (id) => heights.get(id) ?? 84;
        for (let i = 0; i < placed.length; i++) {
            for (let j = i + 1; j < placed.length; j++) {
                strict_1.default.ok(!overlaps(placed[i], placed[j], 200, h), `${placed[i].name} / ${placed[j].name} overlap`);
            }
        }
        // The custody foundation (arrangement-only) sits on the rank of the entity it serves.
        if (direction === 'TB')
            strict_1.default.equal(byId.get('q6').y, byId.get('q5').y);
    });
}
(0, node_test_1.test)('auto layout survives cycles and handles a large structure quickly', () => {
    const entities = Array.from({ length: 400 }, (_, i) => M.createEntity({ id: `e${i}`, x: 0, y: 0 }));
    const relationships = entities.slice(1).map((e, i) => M.buildRelationship(`r${i}`, 'ownership', { from: `e${Math.floor(i / 3)}`, to: e.id, sharePct: 100 }));
    relationships.push(M.buildRelationship('cycle', 'ownership', { from: 'e399', to: 'e0', sharePct: 1 }));
    const t0 = performance.now();
    const { positions } = (0, layout_1.computeAutoLayout)(entities, relationships, [], { direction: 'TB', cardWidth: 200 });
    const ms = performance.now() - t0;
    strict_1.default.equal(positions.size, 400);
    strict_1.default.ok(ms < 1500, `layout of 400 entities took ${ms.toFixed(0)}ms`);
});
(0, node_test_1.test)('findFreePosition avoids existing cards', () => {
    const entities = [M.createEntity({ id: 'a', x: 100, y: 100 })];
    const p = (0, layout_1.findFreePosition)(entities, { x: 100, y: 100 }, 200);
    strict_1.default.ok(!overlaps({ ...entities[0], id: 'n', ...p }, entities[0], 200, () => 84));
});
(0, node_test_1.test)('findFreePosition allows placement in negative canvas space without artificial clamping', () => {
    const entities = [M.createEntity({ id: 'a', x: -100, y: -100 })];
    const p = (0, layout_1.findFreePosition)(entities, { x: -100, y: -100 }, 200);
    strict_1.default.ok(!overlaps({ ...entities[0], id: 'n', ...p }, entities[0], 200, () => 84));
});
(0, node_test_1.test)('fit transform centres the bounds and zoomAround keeps the cursor point fixed', () => {
    const doc = (0, templates_1.instantiateTemplate)('qorve');
    const t = (0, layout_1.fitBoundsTransform)((0, layout_1.computeBounds)(doc.entities, doc.groups, 200), 1200, 800);
    const b = (0, layout_1.computeBounds)(doc.entities, doc.groups, 200);
    const centreX = (b.minX + b.width / 2) * t.zoom + t.panX;
    strict_1.default.ok(Math.abs(centreX - 600) <= 1);
    const view = { zoom: 1, panX: 50, panY: 20 };
    const next = (0, layout_1.zoomAround)(view, 2, 300, 200);
    const before = { x: (300 - view.panX) / view.zoom, y: (200 - view.panY) / view.zoom };
    const after = { x: (300 - next.panX) / next.zoom, y: (200 - next.panY) / next.zoom };
    strict_1.default.deepEqual(after, before);
    strict_1.default.equal((0, layout_1.zoomAround)(view, 99, 0, 0).zoom, 2.5, 'zoom is clamped');
});
(0, node_test_1.test)('edge labels that would collide are separated', () => {
    const placed = (0, geometry_1.resolveLabelPositions)([
        { id: 'a', x: 100, y: 100, w: 80, h: 20 },
        { id: 'b', x: 110, y: 102, w: 80, h: 20 }
    ]);
    const a = placed.get('a');
    const b = placed.get('b');
    strict_1.default.ok(Math.abs(a.y - b.y) >= 20);
});
class MemoryStorage {
    data = new Map();
    failNext = null;
    getItem(key) {
        return this.data.get(key) ?? null;
    }
    setItem(key, value) {
        if (this.failNext) {
            const err = this.failNext;
            this.failNext = null;
            throw err;
        }
        this.data.set(key, value);
    }
}
(0, node_test_1.test)('save and reload restores activities, products and licences', () => {
    const storage = new MemoryStorage();
    const doc = (0, templates_1.instantiateTemplate)('qorve');
    const saved = (0, persistence_1.saveDocument)(storage, doc, 0, 'tab-a');
    strict_1.default.equal(saved.ok, true);
    const loaded = (0, persistence_1.loadDocument)(storage);
    strict_1.default.equal(loaded.status, 'loaded');
    if (loaded.status !== 'loaded')
        return;
    strict_1.default.equal(loaded.doc.activities.length, doc.activities.length);
    strict_1.default.equal(loaded.doc.activityAssignments.length, doc.activityAssignments.length);
    strict_1.default.equal(loaded.doc.productAssignments.length, doc.productAssignments.length);
    strict_1.default.deepEqual(loaded.doc.licences.map(l => l.status), doc.licences.map(l => l.status));
    strict_1.default.equal(loaded.migratedFrom, null);
});
(0, node_test_1.test)('a newer save from another tab is never silently overwritten', () => {
    const storage = new MemoryStorage();
    const doc = (0, templates_1.instantiateTemplate)('blank');
    const a = (0, persistence_1.saveDocument)(storage, doc, 0, 'tab-a');
    strict_1.default.ok(a.ok);
    const b = (0, persistence_1.saveDocument)(storage, { ...doc, chartTitle: 'B' }, a.ok ? a.revision : 0, 'tab-b');
    strict_1.default.ok(b.ok);
    const conflict = (0, persistence_1.saveDocument)(storage, { ...doc, chartTitle: 'A again' }, a.ok ? a.revision : 0, 'tab-a');
    strict_1.default.equal(conflict.ok, false);
    strict_1.default.equal(!conflict.ok && conflict.reason, 'conflict');
    const loaded = (0, persistence_1.loadDocument)(storage);
    strict_1.default.equal(loaded.status === 'loaded' && loaded.doc.chartTitle, 'B');
    const forced = (0, persistence_1.saveDocument)(storage, { ...doc, chartTitle: 'A wins' }, a.ok ? a.revision : 0, 'tab-a', { force: true });
    strict_1.default.ok(forced.ok);
});
(0, node_test_1.test)('storage quota errors are reported, not thrown', () => {
    const storage = new MemoryStorage();
    const err = new Error('exceeded');
    err.name = 'QuotaExceededError';
    storage.failNext = err;
    const result = (0, persistence_1.saveDocument)(storage, (0, templates_1.instantiateTemplate)('blank'), 0, 'tab');
    strict_1.default.equal(!result.ok && result.reason, 'quota');
});
(0, node_test_1.test)('legacy v3 storage keys are migrated and unreadable data is backed up', () => {
    const storage = new MemoryStorage();
    storage.setItem('virex_structure_builder_v3', JSON.stringify({
        schemaVersion: 3,
        nodes: [{ id: 'a', name: 'A B.V.', type: 'BV', x: 1, y: 2 }],
        edges: [],
        activities: [{ id: 'x', name: 'Payments', responsibleEntityId: 'a' }],
        view: { zoom: 0.5, panX: 10, panY: 20 }
    }));
    const loaded = (0, persistence_1.loadDocument)(storage);
    strict_1.default.equal(loaded.status, 'loaded');
    if (loaded.status === 'loaded') {
        strict_1.default.equal(loaded.migratedFrom, 3);
        strict_1.default.deepEqual(loaded.legacyViewport, { zoom: 0.5, panX: 10, panY: 20 });
        strict_1.default.equal(loaded.doc.activityAssignments[0].entityId, 'a');
    }
    storage.setItem(constants_1.STORAGE_KEY, '{broken');
    const broken = (0, persistence_1.loadDocument)(storage);
    strict_1.default.equal(broken.status, 'error');
    strict_1.default.equal(storage.getItem(persistence_1.CORRUPT_BACKUP_KEY), '{broken');
});
(0, node_test_1.test)('viewport is stored separately from the document', () => {
    const storage = new MemoryStorage();
    strict_1.default.equal((0, persistence_1.loadViewport)(storage), null);
    (0, persistence_1.saveViewport)(storage, { zoom: 1.5, panX: 3, panY: 4 });
    strict_1.default.deepEqual((0, persistence_1.loadViewport)(storage), { zoom: 1.5, panX: 3, panY: 4 });
    storage.setItem('virex_structure_builder_viewport_v1', '{"zoom":"x"}');
    strict_1.default.equal((0, persistence_1.loadViewport)(storage), null);
});
