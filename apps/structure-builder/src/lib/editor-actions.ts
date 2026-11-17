/**
 * @file editor-actions.ts
 * @description User-level editing commands. Each command is one undo step built from
 * the pure operations in `model.ts`; the React layer only calls these.
 */

import type {
  ActivityAssignment,
  ActivityRole,
  BusinessActivity,
  GroupCluster,
  ItemRef,
  LayoutDirection,
  LegalEntity,
  Licence,
  Product,
  ProductAssignment,
  ProductRole,
  RelationshipKind,
  RelationshipPatch,
  Selection,
  StructureDocument,
  StructureSettings,
  ViewPreferences
} from './types';
import * as M from './model';
import { CARD_BASE_HEIGHT, getEntityType } from './constants';
import { computeAutoLayout, findFreePosition } from './layout';
import { getCardHeights } from './geometry';
import type { EditorStore } from './editor-store';
import { instantiateTemplate, type TemplateKey } from './templates';

export interface Notice {
  message: string;
  action?: { label: string; run: () => void };
}

export type Notify = (notice: Notice) => void;

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function refToSelection(ref: ItemRef): Selection {
  return ref.type === 'entity' ? { type: 'entity', ids: [ref.id] } : { type: ref.type, id: ref.id };
}

export function createEditorActions(store: EditorStore, notify: Notify) {
  const doc = () => store.getState().doc;

  const placeNear = (near: { x: number; y: number }) => {
    const d = doc();
    const heights = getCardHeights(d);
    return findFreePosition(d.entities, near, d.preferences.cardWidth, id => heights.get(id) ?? CARD_BASE_HEIGHT);
  };

  const undoAction = { label: 'Undo', run: () => actions.undo() };

  const actions = {
    // -- history ----------------------------------------------------------
    undo() {
      const entry = store.undo();
      if (entry) notify({ message: `Undid: ${entry.label}` });
    },
    redo() {
      const entry = store.redo();
      if (entry) notify({ message: `Redid: ${entry.label}` });
    },

    // -- selection --------------------------------------------------------
    select(selection: Selection) {
      store.select(selection);
    },
    selectRef(ref: ItemRef) {
      store.select(refToSelection(ref));
    },
    toggleEntitySelection(id: string, additive: boolean) {
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
    setTitle(chartTitle: string) {
      store.commit(d => (d.chartTitle === chartTitle ? d : { ...d, chartTitle }), { label: 'Rename structure', coalesce: 'title' });
    },
    setSubtitle(chartSubtitle: string) {
      store.commit(d => (d.chartSubtitle === chartSubtitle ? d : { ...d, chartSubtitle }), { label: 'Edit subtitle', coalesce: 'subtitle' });
    },
    /** View preferences are saved with the document but are not undoable edits. */
    setPreferences(patch: Partial<ViewPreferences>) {
      store.commit(d => ({ ...d, preferences: { ...d.preferences, ...patch } }), { history: false });
    },
    setSettings(patch: Partial<StructureSettings>) {
      store.commit(d => ({ ...d, settings: { ...d.settings, ...patch } }), { label: 'Change settings', coalesce: 'settings' });
    },
    loadDocument(next: StructureDocument, label = 'Import structure') {
      store.replace(next, { label });
      notify({ message: `Loaded “${next.chartTitle}”`, action: undoAction });
    },
    loadTemplate(key: TemplateKey) {
      const next = instantiateTemplate(key);
      store.replace(next, { label: 'Load template' });
      notify({ message: `Loaded template “${next.chartTitle}”`, action: undoAction });
    },

    // -- entities ---------------------------------------------------------
    createEntity(partial: Partial<LegalEntity> = {}, near?: { x: number; y: number }): string {
      const pos = placeNear(near ?? { x: partial.x ?? 200, y: partial.y ?? 160 });
      const entity = M.createEntity({ ...partial, ...pos });
      store.commit(d => M.addEntity(d, entity), {
        label: `Add ${getEntityType(entity.type).short}`,
        select: { type: 'entity', ids: [entity.id] }
      });
      return entity.id;
    },
    addSubsidiary(parentId: string): string | null {
      const d = doc();
      const parent = d.entities.find(e => e.id === parentId);
      if (!parent) return null;
      const heights = getCardHeights(d);
      const near =
        d.preferences.layoutDirection === 'LR'
          ? { x: parent.x + d.preferences.cardWidth + 90, y: parent.y }
          : { x: parent.x, y: parent.y + (heights.get(parent.id) ?? CARD_BASE_HEIGHT) + 90 };
      const pos = placeNear(near);
      const child = M.createEntity({ name: 'New subsidiary B.V.', type: 'BV', jurisdiction: parent.jurisdiction, ...pos });
      const rel = M.buildRelationship(M.createId('rel'), 'ownership', { from: parentId, to: child.id, sharePct: 100 });
      store.commit(x => M.addRelationship(M.addEntity(x, child), rel), {
        label: 'Add subsidiary',
        select: { type: 'entity', ids: [child.id] }
      });
      return child.id;
    },
    updateEntity(id: string, patch: Partial<Omit<LegalEntity, 'id'>>, field = Object.keys(patch).join(',')) {
      store.commit(d => M.updateEntity(d, id, patch), { label: 'Edit entity', coalesce: `entity:${id}:${field}` });
    },
    /** Call once when a drag actually starts moving; subsequent `dragEntities` calls are free of history. */
    beginDrag(label = 'Move') {
      store.checkpoint(label);
    },
    dragEntities(positions: ReadonlyMap<string, { x: number; y: number }>) {
      store.commit(d => M.moveEntities(d, positions), { history: false });
    },
    nudgeSelection(dx: number, dy: number) {
      const sel = store.getState().selection;
      if (sel?.type !== 'entity') return;
      const d = doc();
      const positions = new Map<string, { x: number; y: number }>();
      for (const e of d.entities) {
        if (sel.ids.includes(e.id) && !e.locked) positions.set(e.id, { x: e.x + dx, y: e.y + dy });
      }
      store.commit(x => M.moveEntities(x, positions), { label: 'Move', coalesce: 'nudge' });
    },
    deleteEntities(ids: string[]) {
      if (ids.length === 0) return;
      const impact = M.describeEntityDeletion(doc(), ids);
      const what = ids.length === 1 ? 'entity' : `${ids.length} entities`;
      store.commit(d => M.deleteEntities(d, ids), { label: `Delete ${what}`, select: null });
      const assignments = impact.activityAssignments + impact.productAssignments;
      const extras: string[] = [];
      if (impact.relationships) extras.push(plural(impact.relationships, 'relationship'));
      if (assignments) extras.push(plural(assignments, 'assignment'));
      notify({ message: `Deleted ${what}${extras.length ? ` and ${extras.join(', ')}` : ''}`, action: undoAction });
    },
    duplicateEntities(ids: string[]) {
      const created: string[] = [];
      store.commit(
        d => {
          let next = d;
          for (const id of ids) {
            const result = M.duplicateEntity(next, id);
            next = result.doc;
            if (result.entity) created.push(result.entity.id);
          }
          return next;
        },
        { label: 'Duplicate' }
      );
      if (created.length) store.select({ type: 'entity', ids: created });
    },

    // -- relationships ----------------------------------------------------
    connect(from: string, to: string, kind: RelationshipKind = 'ownership', patch: RelationshipPatch = {}): string | null {
      if (from === to) return null;
      const rel = M.buildRelationship(M.createId('rel'), kind, {
        ...patch,
        from,
        to,
        sharePct: kind === 'ownership' ? (patch.sharePct ?? 100) : null
      });
      store.commit(d => M.addRelationship(d, rel), { label: 'Add relationship', select: { type: 'relationship', id: rel.id } });
      return rel.id;
    },
    updateRelationship(id: string, patch: RelationshipPatch, field = Object.keys(patch).join(',')) {
      store.commit(d => M.updateRelationship(d, id, patch), { label: 'Edit relationship', coalesce: `rel:${id}:${field}` });
    },
    /** Adjusts a routed edge's mid segment while dragging its handle; call `beginDrag` first. */
    dragRelationshipOffset(id: string, midOffset: number) {
      store.commit(d => M.updateRelationship(d, id, { midOffset }), { history: false });
    },
    reverseRelationship(id: string) {
      store.commit(d => M.reverseRelationship(d, id), { label: 'Reverse relationship' });
    },
    deleteRelationship(id: string) {
      store.commit(d => M.deleteRelationships(d, [id]), { label: 'Delete relationship', select: null });
      notify({ message: 'Deleted relationship', action: undoAction });
    },

    // -- activities -------------------------------------------------------
    createActivity(partial: Partial<BusinessActivity> = {}, assignTo?: { entityId: string; role?: ActivityRole }): string {
      const activity = M.createActivity(partial);
      store.commit(
        d => {
          let next = M.addActivity(d, activity);
          if (assignTo) {
            next = M.assignActivity(next, { id: M.createId('aa'), activityId: activity.id, entityId: assignTo.entityId, role: assignTo.role ?? 'performs' });
          }
          return next;
        },
        { label: 'Add activity', select: { type: 'activity', id: activity.id } }
      );
      return activity.id;
    },
    updateActivity(id: string, patch: Partial<Omit<BusinessActivity, 'id'>>, field = Object.keys(patch).join(',')) {
      store.commit(d => M.updateActivity(d, id, patch), { label: 'Edit activity', coalesce: `act:${id}:${field}` });
    },
    deleteActivity(id: string) {
      store.commit(d => M.deleteActivity(d, id), { label: 'Delete activity', select: null });
      notify({ message: 'Deleted activity and its assignments', action: undoAction });
    },
    assignActivity(activityId: string, entityId: string, role: ActivityRole = 'performs') {
      const assignment: ActivityAssignment = { id: M.createId('aa'), activityId, entityId, role };
      const changed = store.commit(d => M.assignActivity(d, assignment), { label: 'Assign activity' });
      if (!changed) notify({ message: 'That assignment already exists' });
    },
    updateActivityAssignment(id: string, patch: Partial<Omit<ActivityAssignment, 'id'>>) {
      store.commit(d => M.updateActivityAssignment(d, id, patch), { label: 'Edit assignment', coalesce: `aa:${id}:${Object.keys(patch).join(',')}` });
    },
    unassignActivity(id: string) {
      store.commit(d => M.removeActivityAssignment(d, id), { label: 'Remove assignment' });
    },
    setRelatedActivity(activityId: string, relatedId: string, on: boolean) {
      store.commit(
        d => {
          const a = d.activities.find(x => x.id === activityId);
          return a ? M.updateActivity(d, activityId, { relatedActivityIds: M.toggleId(a.relatedActivityIds, relatedId, on) }) : d;
        },
        { label: 'Link activities' }
      );
    },

    // -- products ---------------------------------------------------------
    createProduct(partial: Partial<Product> = {}, assignTo?: { entityId: string; role?: ProductRole }): string {
      const product = M.createProduct(partial);
      store.commit(
        d => {
          let next = M.addProduct(d, product);
          if (assignTo) {
            next = M.assignProduct(next, { id: M.createId('pa'), productId: product.id, entityId: assignTo.entityId, role: assignTo.role ?? 'provider' });
          }
          return next;
        },
        { label: 'Add product', select: { type: 'product', id: product.id } }
      );
      return product.id;
    },
    updateProduct(id: string, patch: Partial<Omit<Product, 'id'>>, field = Object.keys(patch).join(',')) {
      store.commit(d => M.updateProduct(d, id, patch), { label: 'Edit product', coalesce: `prod:${id}:${field}` });
    },
    deleteProduct(id: string) {
      store.commit(d => M.deleteProduct(d, id), { label: 'Delete product', select: null });
      notify({ message: 'Deleted product', action: undoAction });
    },
    assignProduct(productId: string, entityId: string, role: ProductRole = 'provider') {
      const assignment: ProductAssignment = { id: M.createId('pa'), productId, entityId, role };
      const changed = store.commit(d => M.assignProduct(d, assignment), { label: 'Assign product' });
      if (!changed) notify({ message: 'That assignment already exists' });
    },
    updateProductAssignment(id: string, patch: Partial<Omit<ProductAssignment, 'id'>>) {
      store.commit(d => M.updateProductAssignment(d, id, patch), { label: 'Edit assignment' });
    },
    unassignProduct(id: string) {
      store.commit(d => M.removeProductAssignment(d, id), { label: 'Remove assignment' });
    },
    setProductActivity(productId: string, activityId: string, on: boolean) {
      store.commit(
        d => {
          const p = d.products.find(x => x.id === productId);
          return p ? M.updateProduct(d, productId, { activityIds: M.toggleId(p.activityIds, activityId, on) }) : d;
        },
        { label: 'Link product to activity' }
      );
    },

    // -- licences ---------------------------------------------------------
    createLicence(partial: Partial<Licence> = {}): string {
      const licence = M.createLicence(partial);
      store.commit(d => M.addLicence(d, licence), { label: 'Add licence', select: { type: 'licence', id: licence.id } });
      return licence.id;
    },
    updateLicence(id: string, patch: Partial<Omit<Licence, 'id'>>, field = Object.keys(patch).join(',')) {
      store.commit(d => M.updateLicence(d, id, patch), { label: 'Edit licence', coalesce: `lic:${id}:${field}` });
    },
    deleteLicence(id: string) {
      store.commit(d => M.deleteLicence(d, id), { label: 'Delete licence', select: null });
      notify({ message: 'Deleted licence', action: undoAction });
    },
    setLicenceActivity(licenceId: string, activityId: string, on: boolean) {
      store.commit(
        d => {
          const l = d.licences.find(x => x.id === licenceId);
          return l ? M.updateLicence(d, licenceId, { activityIds: M.toggleId(l.activityIds, activityId, on) }) : d;
        },
        { label: 'Link licence to activity' }
      );
    },

    // -- groups -----------------------------------------------------------
    createGroup(partial: Partial<GroupCluster> = {}): string {
      const sel = store.getState().selection;
      const d = doc();
      const members = sel?.type === 'entity' ? sel.ids : [];
      let group = M.createGroup({ ...partial, members });
      if (members.length) {
        const heights = getCardHeights(d);
        const memberEntities = d.entities.filter(e => members.includes(e.id));
        const minX = Math.min(...memberEntities.map(e => e.x));
        const minY = Math.min(...memberEntities.map(e => e.y));
        const maxX = Math.max(...memberEntities.map(e => e.x + d.preferences.cardWidth));
        const maxY = Math.max(...memberEntities.map(e => e.y + (heights.get(e.id) ?? CARD_BASE_HEIGHT)));
        group = { ...group, x: minX - 28, y: minY - 44, w: maxX - minX + 56, h: maxY - minY + 72 };
      }
      store.commit(x => M.addGroup(x, group), { label: 'Add group', select: { type: 'group', id: group.id } });
      return group.id;
    },
    updateGroup(id: string, patch: Partial<Omit<GroupCluster, 'id'>>, field = Object.keys(patch).join(',')) {
      store.commit(d => M.updateGroup(d, id, patch), { label: 'Edit group', coalesce: `grp:${id}:${field}` });
    },
    /** Moves a group box together with its (unlocked) members; call `beginDrag` first. */
    dragGroup(id: string, x: number, y: number, memberPositions: ReadonlyMap<string, { x: number; y: number }>) {
      store.commit(d => M.moveEntities(M.updateGroup(d, id, { x, y }), memberPositions), { history: false });
    },
    deleteGroup(id: string) {
      store.commit(d => M.deleteGroup(d, id), { label: 'Delete group', select: null });
      notify({ message: 'Deleted group (entities kept)', action: undoAction });
    },

    // -- layout -----------------------------------------------------------
    autoLayout(direction?: LayoutDirection) {
      const d = doc();
      const dir = direction ?? d.preferences.layoutDirection;
      const heights = getCardHeights(d);
      const result = computeAutoLayout(d.entities, d.relationships, d.groups, {
        direction: dir,
        cardWidth: d.preferences.cardWidth,
        heights
      });
      store.commit(
        x => ({
          ...M.moveEntities(x, result.positions),
          groups: result.groups,
          preferences: { ...x.preferences, layoutDirection: dir }
        }),
        { label: 'Auto layout' }
      );
      const locked = d.entities.filter(e => e.locked).length;
      notify({ message: `Arranged ${dir === 'TB' ? 'top to bottom' : 'left to right'}${locked ? ` · ${locked} locked kept in place` : ''}`, action: undoAction });
    }
  };

  return actions;
}

export type EditorActions = ReturnType<typeof createEditorActions>;
