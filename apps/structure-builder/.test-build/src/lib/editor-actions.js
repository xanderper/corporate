"use strict";
/**
 * @file editor-actions.ts
 * @description User-level editing commands. Each command is one undo step built from
 * the pure operations in `model.ts`; the React layer only calls these.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.refToSelection = refToSelection;
exports.createEditorActions = createEditorActions;
const M = __importStar(require("./model"));
const constants_1 = require("./constants");
const layout_1 = require("./layout");
const geometry_1 = require("./geometry");
const templates_1 = require("./templates");
function plural(n, word) {
    return `${n} ${word}${n === 1 ? '' : 's'}`;
}
function refToSelection(ref) {
    return ref.type === 'entity' ? { type: 'entity', ids: [ref.id] } : { type: ref.type, id: ref.id };
}
function createEditorActions(store, notify) {
    const doc = () => store.getState().doc;
    const placeNear = (near) => {
        const d = doc();
        const heights = (0, geometry_1.getCardHeights)(d);
        return (0, layout_1.findFreePosition)(d.entities, near, d.preferences.cardWidth, id => heights.get(id) ?? constants_1.CARD_BASE_HEIGHT);
    };
    const undoAction = { label: 'Undo', run: () => actions.undo() };
    const actions = {
        // -- history ----------------------------------------------------------
        undo() {
            const entry = store.undo();
            if (entry)
                notify({ message: `Undid: ${entry.label}` });
        },
        redo() {
            const entry = store.redo();
            if (entry)
                notify({ message: `Redid: ${entry.label}` });
        },
        // -- selection --------------------------------------------------------
        select(selection) {
            store.select(selection);
        },
        selectRef(ref) {
            store.select(refToSelection(ref));
        },
        toggleEntitySelection(id, additive) {
            const sel = store.getState().selection;
            if (!additive || sel?.type !== 'entity') {
                store.select({ type: 'entity', ids: [id] });
                return;
            }
            const ids = sel.ids.includes(id) ? sel.ids.filter(x => x !== id) : [...sel.ids, id];
            store.select(ids.length ? { type: 'entity', ids } : null);
        },
        clearSelection() {
            store.select(null);
        },
        // -- document-level ---------------------------------------------------
        setTitle(chartTitle) {
            store.commit(d => (d.chartTitle === chartTitle ? d : { ...d, chartTitle }), { label: 'Rename structure', coalesce: 'title' });
        },
        setSubtitle(chartSubtitle) {
            store.commit(d => (d.chartSubtitle === chartSubtitle ? d : { ...d, chartSubtitle }), { label: 'Edit subtitle', coalesce: 'subtitle' });
        },
        /** View preferences are saved with the document but are not undoable edits. */
        setPreferences(patch) {
            store.commit(d => ({ ...d, preferences: { ...d.preferences, ...patch } }), { history: false });
        },
        setSettings(patch) {
            store.commit(d => ({ ...d, settings: { ...d.settings, ...patch } }), { label: 'Change settings', coalesce: 'settings' });
        },
        loadDocument(next, label = 'Import structure') {
            store.replace(next, { label });
            notify({ message: `Loaded “${next.chartTitle}”`, action: undoAction });
        },
        loadTemplate(key) {
            const next = (0, templates_1.instantiateTemplate)(key);
            store.replace(next, { label: 'Load template' });
            notify({ message: `Loaded template “${next.chartTitle}”`, action: undoAction });
        },
        // -- entities ---------------------------------------------------------
        createEntity(partial = {}, near) {
            const pos = placeNear(near ?? { x: partial.x ?? 200, y: partial.y ?? 160 });
            const entity = M.createEntity({ ...partial, ...pos });
            store.commit(d => M.addEntity(d, entity), {
                label: `Add ${(0, constants_1.getEntityType)(entity.type).short}`,
                select: { type: 'entity', ids: [entity.id] }
            });
            return entity.id;
        },
        addSubsidiary(parentId) {
            const d = doc();
            const parent = d.entities.find(e => e.id === parentId);
            if (!parent)
                return null;
            const heights = (0, geometry_1.getCardHeights)(d);
            const near = d.preferences.layoutDirection === 'LR'
                ? { x: parent.x + d.preferences.cardWidth + 90, y: parent.y }
                : { x: parent.x, y: parent.y + (heights.get(parent.id) ?? constants_1.CARD_BASE_HEIGHT) + 90 };
            const pos = placeNear(near);
            const child = M.createEntity({ name: 'New subsidiary B.V.', type: 'BV', jurisdiction: parent.jurisdiction, ...pos });
            const rel = M.buildRelationship(M.createId('rel'), 'ownership', { from: parentId, to: child.id, sharePct: 100 });
            store.commit(x => M.addRelationship(M.addEntity(x, child), rel), {
                label: 'Add subsidiary',
                select: { type: 'entity', ids: [child.id] }
            });
            return child.id;
        },
        updateEntity(id, patch, field = Object.keys(patch).join(',')) {
            store.commit(d => M.updateEntity(d, id, patch), { label: 'Edit entity', coalesce: `entity:${id}:${field}` });
        },
        /** Call once when a drag actually starts moving; subsequent `dragEntities` calls are free of history. */
        beginDrag(label = 'Move') {
            store.checkpoint(label);
        },
        dragEntities(positions) {
            store.commit(d => M.moveEntities(d, positions), { history: false });
        },
        nudgeSelection(dx, dy) {
            const sel = store.getState().selection;
            if (sel?.type !== 'entity')
                return;
            const d = doc();
            const positions = new Map();
            for (const e of d.entities) {
                if (sel.ids.includes(e.id) && !e.locked)
                    positions.set(e.id, { x: e.x + dx, y: e.y + dy });
            }
            store.commit(x => M.moveEntities(x, positions), { label: 'Move', coalesce: 'nudge' });
        },
        deleteEntities(ids) {
            if (ids.length === 0)
                return;
            const impact = M.describeEntityDeletion(doc(), ids);
            const what = ids.length === 1 ? 'entity' : `${ids.length} entities`;
            store.commit(d => M.deleteEntities(d, ids), { label: `Delete ${what}`, select: null });
            const assignments = impact.activityAssignments + impact.productAssignments;
            const extras = [];
            if (impact.relationships)
                extras.push(plural(impact.relationships, 'relationship'));
            if (assignments)
                extras.push(plural(assignments, 'assignment'));
            notify({ message: `Deleted ${what}${extras.length ? ` and ${extras.join(', ')}` : ''}`, action: undoAction });
        },
        duplicateEntities(ids) {
            const created = [];
            store.commit(d => {
                let next = d;
                for (const id of ids) {
                    const result = M.duplicateEntity(next, id);
                    next = result.doc;
                    if (result.entity)
                        created.push(result.entity.id);
                }
                return next;
            }, { label: 'Duplicate' });
            if (created.length)
                store.select({ type: 'entity', ids: created });
        },
        // -- relationships ----------------------------------------------------
        connect(from, to, kind = 'ownership', patch = {}) {
            if (from === to)
                return null;
            const rel = M.buildRelationship(M.createId('rel'), kind, {
                ...patch,
                from,
                to,
                sharePct: kind === 'ownership' ? (patch.sharePct ?? 100) : null
            });
            store.commit(d => M.addRelationship(d, rel), { label: 'Add relationship', select: { type: 'relationship', id: rel.id } });
            return rel.id;
        },
        updateRelationship(id, patch, field = Object.keys(patch).join(',')) {
            store.commit(d => M.updateRelationship(d, id, patch), { label: 'Edit relationship', coalesce: `rel:${id}:${field}` });
        },
        /** Adjusts a routed edge's mid segment while dragging its handle; call `beginDrag` first. */
        dragRelationshipOffset(id, midOffset) {
            store.commit(d => M.updateRelationship(d, id, { midOffset }), { history: false });
        },
        reverseRelationship(id) {
            store.commit(d => M.reverseRelationship(d, id), { label: 'Reverse relationship' });
        },
        deleteRelationship(id) {
            store.commit(d => M.deleteRelationships(d, [id]), { label: 'Delete relationship', select: null });
            notify({ message: 'Deleted relationship', action: undoAction });
        },
        // -- activities -------------------------------------------------------
        createActivity(partial = {}, assignTo) {
            const activity = M.createActivity(partial);
            store.commit(d => {
                let next = M.addActivity(d, activity);
                if (assignTo) {
                    next = M.assignActivity(next, { id: M.createId('aa'), activityId: activity.id, entityId: assignTo.entityId, role: assignTo.role ?? 'performs' });
                }
                return next;
            }, { label: 'Add activity', select: { type: 'activity', id: activity.id } });
            return activity.id;
        },
        updateActivity(id, patch, field = Object.keys(patch).join(',')) {
            store.commit(d => M.updateActivity(d, id, patch), { label: 'Edit activity', coalesce: `act:${id}:${field}` });
        },
        deleteActivity(id) {
            store.commit(d => M.deleteActivity(d, id), { label: 'Delete activity', select: null });
            notify({ message: 'Deleted activity and its assignments', action: undoAction });
        },
        assignActivity(activityId, entityId, role = 'performs') {
            const assignment = { id: M.createId('aa'), activityId, entityId, role };
            const changed = store.commit(d => M.assignActivity(d, assignment), { label: 'Assign activity' });
            if (!changed)
                notify({ message: 'That assignment already exists' });
        },
        updateActivityAssignment(id, patch) {
            store.commit(d => M.updateActivityAssignment(d, id, patch), { label: 'Edit assignment', coalesce: `aa:${id}:${Object.keys(patch).join(',')}` });
        },
        unassignActivity(id) {
            store.commit(d => M.removeActivityAssignment(d, id), { label: 'Remove assignment' });
        },
        setRelatedActivity(activityId, relatedId, on) {
            store.commit(d => {
                const a = d.activities.find(x => x.id === activityId);
                return a ? M.updateActivity(d, activityId, { relatedActivityIds: M.toggleId(a.relatedActivityIds, relatedId, on) }) : d;
            }, { label: 'Link activities' });
        },
        // -- products ---------------------------------------------------------
        createProduct(partial = {}, assignTo) {
            const product = M.createProduct(partial);
            store.commit(d => {
                let next = M.addProduct(d, product);
                if (assignTo) {
                    next = M.assignProduct(next, { id: M.createId('pa'), productId: product.id, entityId: assignTo.entityId, role: assignTo.role ?? 'provider' });
                }
                return next;
            }, { label: 'Add product', select: { type: 'product', id: product.id } });
            return product.id;
        },
        updateProduct(id, patch, field = Object.keys(patch).join(',')) {
            store.commit(d => M.updateProduct(d, id, patch), { label: 'Edit product', coalesce: `prod:${id}:${field}` });
        },
        deleteProduct(id) {
            store.commit(d => M.deleteProduct(d, id), { label: 'Delete product', select: null });
            notify({ message: 'Deleted product', action: undoAction });
        },
        assignProduct(productId, entityId, role = 'provider') {
            const assignment = { id: M.createId('pa'), productId, entityId, role };
            const changed = store.commit(d => M.assignProduct(d, assignment), { label: 'Assign product' });
            if (!changed)
                notify({ message: 'That assignment already exists' });
        },
        updateProductAssignment(id, patch) {
            store.commit(d => M.updateProductAssignment(d, id, patch), { label: 'Edit assignment' });
        },
        unassignProduct(id) {
            store.commit(d => M.removeProductAssignment(d, id), { label: 'Remove assignment' });
        },
        setProductActivity(productId, activityId, on) {
            store.commit(d => {
                const p = d.products.find(x => x.id === productId);
                return p ? M.updateProduct(d, productId, { activityIds: M.toggleId(p.activityIds, activityId, on) }) : d;
            }, { label: 'Link product to activity' });
        },
        // -- licences ---------------------------------------------------------
        createLicence(partial = {}) {
            const licence = M.createLicence(partial);
            store.commit(d => M.addLicence(d, licence), { label: 'Add licence', select: { type: 'licence', id: licence.id } });
            return licence.id;
        },
        updateLicence(id, patch, field = Object.keys(patch).join(',')) {
            store.commit(d => M.updateLicence(d, id, patch), { label: 'Edit licence', coalesce: `lic:${id}:${field}` });
        },
        deleteLicence(id) {
            store.commit(d => M.deleteLicence(d, id), { label: 'Delete licence', select: null });
            notify({ message: 'Deleted licence', action: undoAction });
        },
        setLicenceActivity(licenceId, activityId, on) {
            store.commit(d => {
                const l = d.licences.find(x => x.id === licenceId);
                return l ? M.updateLicence(d, licenceId, { activityIds: M.toggleId(l.activityIds, activityId, on) }) : d;
            }, { label: 'Link licence to activity' });
        },
        // -- groups -----------------------------------------------------------
        createGroup(partial = {}) {
            const sel = store.getState().selection;
            const d = doc();
            const members = sel?.type === 'entity' ? sel.ids : [];
            let group = M.createGroup({ ...partial, members });
            if (members.length) {
                const heights = (0, geometry_1.getCardHeights)(d);
                const memberEntities = d.entities.filter(e => members.includes(e.id));
                const minX = Math.min(...memberEntities.map(e => e.x));
                const minY = Math.min(...memberEntities.map(e => e.y));
                const maxX = Math.max(...memberEntities.map(e => e.x + d.preferences.cardWidth));
                const maxY = Math.max(...memberEntities.map(e => e.y + (heights.get(e.id) ?? constants_1.CARD_BASE_HEIGHT)));
                group = { ...group, x: minX - 28, y: minY - 44, w: maxX - minX + 56, h: maxY - minY + 72 };
            }
            store.commit(x => M.addGroup(x, group), { label: 'Add group', select: { type: 'group', id: group.id } });
            return group.id;
        },
        updateGroup(id, patch, field = Object.keys(patch).join(',')) {
            store.commit(d => M.updateGroup(d, id, patch), { label: 'Edit group', coalesce: `grp:${id}:${field}` });
        },
        /** Moves a group box together with its (unlocked) members; call `beginDrag` first. */
        dragGroup(id, x, y, memberPositions) {
            store.commit(d => M.moveEntities(M.updateGroup(d, id, { x, y }), memberPositions), { history: false });
        },
        deleteGroup(id) {
            store.commit(d => M.deleteGroup(d, id), { label: 'Delete group', select: null });
            notify({ message: 'Deleted group (entities kept)', action: undoAction });
        },
        // -- layout -----------------------------------------------------------
        autoLayout(direction) {
            const d = doc();
            const dir = direction ?? d.preferences.layoutDirection;
            const heights = (0, geometry_1.getCardHeights)(d);
            const result = (0, layout_1.computeAutoLayout)(d.entities, d.relationships, d.groups, {
                direction: dir,
                cardWidth: d.preferences.cardWidth,
                heights
            });
            store.commit(x => ({
                ...M.moveEntities(x, result.positions),
                groups: result.groups,
                preferences: { ...x.preferences, layoutDirection: dir }
            }), { label: 'Auto layout' });
            const locked = d.entities.filter(e => e.locked).length;
            notify({ message: `Arranged ${dir === 'TB' ? 'top to bottom' : 'left to right'}${locked ? ` · ${locked} locked kept in place` : ''}`, action: undoAction });
        }
    };
    return actions;
}
