/**
 * @file model.ts
 * @description Factories, normalisation and pure document operations.
 *
 * Every operation takes a `StructureDocument` and returns a new one without mutating
 * the input, so the editor store can keep cheap structural-sharing snapshots for
 * undo/redo and React can compare collections by reference.
 */

import {
  CURRENT_SCHEMA_VERSION,
  type ActivityAssignment,
  type ArrangementKind,
  type BusinessActivity,
  type GroupCluster,
  type LegalEntity,
  type Licence,
  type LineRouting,
  type PortPosition,
  type Product,
  type ProductAssignment,
  type Relationship,
  type RelationshipKind,
  type RelationshipPatch,
  type StructureDocument
} from './types';
import {
  DEFAULT_PREFERENCES,
  DEFAULT_SETTINGS,
  LICENCE_TYPES,
  RELATIONSHIP_KINDS,
  getEntityType
} from './constants';

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

export function createId(prefix = 'id'): string {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return `${prefix}_${cryptoApi.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36).slice(-4);
  return `${prefix}_${ts}${rand}`;
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

export function createEmptyDocument(title = 'New corporate structure', subtitle = ''): StructureDocument {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    chartTitle: title,
    chartSubtitle: subtitle,
    entities: [],
    relationships: [],
    groups: [],
    activities: [],
    activityAssignments: [],
    products: [],
    productAssignments: [],
    licences: [],
    preferences: { ...DEFAULT_PREFERENCES },
    settings: { ...DEFAULT_SETTINGS }
  };
}

export function createEntity(partial: Partial<LegalEntity> = {}): LegalEntity {
  const type = partial.type || 'BV';
  return {
    id: partial.id || createId('ent'),
    name: partial.name ?? 'New entity',
    type,
    status: partial.status || 'active',
    color: partial.color || getEntityType(type).defaultColor,
    description: partial.description ?? '',
    jurisdiction: partial.jurisdiction ?? 'Netherlands',
    regNumber: partial.regNumber ?? '',
    taxNumber: partial.taxNumber ?? '',
    incorporationDate: partial.incorporationDate ?? '',
    notes: partial.notes ?? '',
    documents: partial.documents ?? [],
    x: partial.x ?? 200,
    y: partial.y ?? 160,
    locked: Boolean(partial.locked)
  };
}

export function createActivity(partial: Partial<BusinessActivity> = {}): BusinessActivity {
  return {
    id: partial.id || createId('act'),
    name: partial.name ?? 'New activity',
    description: partial.description ?? '',
    category: partial.category || 'Operations & administration',
    status: partial.status || 'planned',
    startDate: partial.startDate ?? '',
    endDate: partial.endDate ?? '',
    requiresLicence: Boolean(partial.requiresLicence),
    requiredLicenceType: partial.requiredLicenceType ?? '',
    regulatoryRequirements: partial.regulatoryRequirements ?? '',
    relatedActivityIds: partial.relatedActivityIds ?? [],
    notes: partial.notes ?? ''
  };
}

export function createProduct(partial: Partial<Product> = {}): Product {
  return {
    id: partial.id || createId('prod'),
    name: partial.name ?? 'New product',
    description: partial.description ?? '',
    status: partial.status || 'concept',
    activityIds: partial.activityIds ?? [],
    notes: partial.notes ?? ''
  };
}

export function createLicence(partial: Partial<Licence> = {}): Licence {
  const licenceType = partial.licenceType ?? '';
  return {
    id: partial.id || createId('lic'),
    name: partial.name ?? 'New licence',
    licenceType,
    authority: partial.authority ?? LICENCE_TYPES[licenceType]?.defaultAuthority ?? '',
    holderEntityId: partial.holderEntityId ?? null,
    status: partial.status || 'planned',
    reference: partial.reference ?? '',
    applicationDate: partial.applicationDate ?? '',
    grantDate: partial.grantDate ?? '',
    effectiveDate: partial.effectiveDate ?? '',
    expiryDate: partial.expiryDate ?? '',
    activityIds: partial.activityIds ?? [],
    documents: partial.documents ?? [],
    notes: partial.notes ?? ''
  };
}

export function createGroup(partial: Partial<GroupCluster> = {}): GroupCluster {
  return {
    id: partial.id || createId('grp'),
    name: partial.name ?? 'New group',
    color: partial.color || 'green',
    x: partial.x ?? 100,
    y: partial.y ?? 100,
    w: partial.w ?? 440,
    h: partial.h ?? 240,
    members: partial.members ?? []
  };
}

// ---------------------------------------------------------------------------
// Relationship normalisation (discriminated union construction)
// ---------------------------------------------------------------------------

const ROUTINGS: readonly LineRouting[] = ['auto', 'elbow', 'bezier', 'straight'];
const PORTS: readonly PortPosition[] = ['auto', 'top', 'bottom', 'left', 'right'];

export function parsePct(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Builds a valid `Relationship` for `kind` from a loose record. Fields that do not
 * belong to the kind are dropped, so switching kind never leaves stale metadata.
 */
export function buildRelationship(
  id: string,
  kind: RelationshipKind,
  source: RelationshipPatch & { from: string; to: string }
): Relationship {
  const base = {
    id,
    from: source.from,
    to: source.to,
    notes: text(source.notes),
    routing: source.routing && ROUTINGS.includes(source.routing) ? source.routing : 'auto',
    fromPort: source.fromPort && PORTS.includes(source.fromPort) ? source.fromPort : 'auto',
    toPort: source.toPort && PORTS.includes(source.toPort) ? source.toPort : 'auto',
    midOffset: typeof source.midOffset === 'number' && Number.isFinite(source.midOffset) ? source.midOffset : 0
  };

  switch (kind) {
    case 'ownership':
      return {
        ...base,
        kind,
        sharePct: parsePct(source.sharePct),
        votingPct: parsePct(source.votingPct),
        economicPct: parsePct(source.economicPct),
        shareClass: text(source.shareClass)
      };
    case 'certificates':
      return { ...base, kind, certificatePct: parsePct(source.certificatePct) };
    case 'control':
      return { ...base, kind, votingPct: parsePct(source.votingPct), role: text(source.role) };
    default: {
      const arrangementKind: ArrangementKind = kind;
      return {
        ...base,
        kind: arrangementKind,
        description: text(source.description) || text(source.role),
        agreementRef: text(source.agreementRef),
        startDate: text(source.startDate)
      };
    }
  }
}

export function applyRelationshipPatch(rel: Relationship, patch: RelationshipPatch): Relationship {
  const merged: RelationshipPatch & { from: string; to: string } = { ...rel, ...patch };
  // Carry the human description across kinds where the field name differs.
  if (patch.kind && patch.kind !== rel.kind) {
    if (rel.kind === 'control' && !merged.description) merged.description = rel.role;
    if ('description' in rel && !merged.role) merged.role = rel.description;
  }
  return buildRelationship(rel.id, patch.kind ?? rel.kind, merged);
}

export function formatPct(value: number | null): string {
  if (value === null) return '';
  return `${Number.isInteger(value) ? value : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`;
}

export function formatRelationshipLabel(rel: Relationship): string {
  switch (rel.kind) {
    case 'ownership': {
      const parts: string[] = [];
      if (rel.sharePct !== null) parts.push(`${formatPct(rel.sharePct)} shares`);
      if (rel.votingPct !== null && rel.votingPct !== rel.sharePct) parts.push(`${formatPct(rel.votingPct)} votes`);
      if (rel.economicPct !== null && rel.economicPct !== rel.sharePct) parts.push(`${formatPct(rel.economicPct)} economic`);
      if (rel.shareClass) parts.push(rel.shareClass);
      return parts.join(' · ') || 'Shares';
    }
    case 'certificates':
      return rel.certificatePct !== null ? `${formatPct(rel.certificatePct)} certificates` : 'Certificates';
    case 'control': {
      const parts: string[] = [];
      if (rel.votingPct !== null) parts.push(`${formatPct(rel.votingPct)} voting control`);
      if (rel.role) parts.push(rel.role);
      return parts.join(' · ') || 'Control';
    }
    default:
      return rel.description || RELATIONSHIP_KINDS[rel.kind].short;
  }
}

// ---------------------------------------------------------------------------
// Small immutable helpers
// ---------------------------------------------------------------------------

function patchById<T extends { id: string }>(items: T[], id: string, patch: Partial<Omit<T, 'id'>>): T[] {
  let changed = false;
  const next = items.map(item => {
    if (item.id !== id) return item;
    changed = true;
    return { ...item, ...patch, id: item.id };
  });
  return changed ? next : items;
}

function removeIds(ids: string[], remove: ReadonlySet<string>): string[] {
  return ids.some(id => remove.has(id)) ? ids.filter(id => !remove.has(id)) : ids;
}

export function toggleId(ids: string[], id: string, on: boolean): string[] {
  const has = ids.includes(id);
  if (on && !has) return [...ids, id];
  if (!on && has) return ids.filter(x => x !== id);
  return ids;
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export function addEntity(doc: StructureDocument, entity: LegalEntity): StructureDocument {
  return { ...doc, entities: [...doc.entities, entity] };
}

export function updateEntity(
  doc: StructureDocument,
  id: string,
  patch: Partial<Omit<LegalEntity, 'id'>>
): StructureDocument {
  const entities = patchById(doc.entities, id, patch);
  return entities === doc.entities ? doc : { ...doc, entities };
}

export function moveEntities(
  doc: StructureDocument,
  positions: ReadonlyMap<string, { x: number; y: number }>
): StructureDocument {
  if (positions.size === 0) return doc;
  let changed = false;
  const entities = doc.entities.map(e => {
    const p = positions.get(e.id);
    if (!p || (p.x === e.x && p.y === e.y)) return e;
    changed = true;
    return { ...e, x: p.x, y: p.y };
  });
  return changed ? { ...doc, entities } : doc;
}

export interface EntityDeletionImpact {
  relationships: number;
  activityAssignments: number;
  productAssignments: number;
  licences: number;
}

export function describeEntityDeletion(doc: StructureDocument, ids: string[]): EntityDeletionImpact {
  const set = new Set(ids);
  return {
    relationships: doc.relationships.filter(r => set.has(r.from) || set.has(r.to)).length,
    activityAssignments: doc.activityAssignments.filter(a => set.has(a.entityId)).length,
    productAssignments: doc.productAssignments.filter(a => set.has(a.entityId)).length,
    licences: doc.licences.filter(l => l.holderEntityId !== null && set.has(l.holderEntityId)).length
  };
}

/**
 * Deletion rules: relationships touching the entity and its activity/product
 * assignments are removed; activity, product and licence definitions are kept
 * (licences become unassigned so the record and its history are preserved).
 */
export function deleteEntities(doc: StructureDocument, ids: string[]): StructureDocument {
  if (ids.length === 0) return doc;
  const set = new Set(ids);
  return {
    ...doc,
    entities: doc.entities.filter(e => !set.has(e.id)),
    relationships: doc.relationships.filter(r => !set.has(r.from) && !set.has(r.to)),
    groups: doc.groups.map(g => {
      const members = removeIds(g.members, set);
      return members === g.members ? g : { ...g, members };
    }),
    activityAssignments: doc.activityAssignments.filter(a => !set.has(a.entityId)),
    productAssignments: doc.productAssignments.filter(a => !set.has(a.entityId)),
    licences: doc.licences.map(l =>
      l.holderEntityId !== null && set.has(l.holderEntityId) ? { ...l, holderEntityId: null } : l
    )
  };
}

/** Copies the entity's own details (not its relationships or assignments). */
export function duplicateEntity(
  doc: StructureDocument,
  id: string,
  newId: string = createId('ent')
): { doc: StructureDocument; entity: LegalEntity | null } {
  const source = doc.entities.find(e => e.id === id);
  if (!source) return { doc, entity: null };
  const entity: LegalEntity = {
    ...source,
    id: newId,
    name: `${source.name} (copy)`,
    regNumber: '',
    x: source.x + 40,
    y: source.y + 40,
    locked: false
  };
  return { doc: addEntity(doc, entity), entity };
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------

export function addRelationship(doc: StructureDocument, rel: Relationship): StructureDocument {
  return { ...doc, relationships: [...doc.relationships, rel] };
}

export function updateRelationship(doc: StructureDocument, id: string, patch: RelationshipPatch): StructureDocument {
  let changed = false;
  const relationships = doc.relationships.map(r => {
    if (r.id !== id) return r;
    changed = true;
    return applyRelationshipPatch(r, patch);
  });
  return changed ? { ...doc, relationships } : doc;
}

export function reverseRelationship(doc: StructureDocument, id: string): StructureDocument {
  const rel = doc.relationships.find(r => r.id === id);
  if (!rel) return doc;
  return updateRelationship(doc, id, {
    from: rel.to,
    to: rel.from,
    fromPort: rel.toPort ?? 'auto',
    toPort: rel.fromPort ?? 'auto'
  });
}

export function deleteRelationships(doc: StructureDocument, ids: string[]): StructureDocument {
  const set = new Set(ids);
  return { ...doc, relationships: doc.relationships.filter(r => !set.has(r.id)) };
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export function addActivity(doc: StructureDocument, activity: BusinessActivity): StructureDocument {
  return { ...doc, activities: [...doc.activities, activity] };
}

export function updateActivity(
  doc: StructureDocument,
  id: string,
  patch: Partial<Omit<BusinessActivity, 'id'>>
): StructureDocument {
  const activities = patchById(doc.activities, id, patch);
  return activities === doc.activities ? doc : { ...doc, activities };
}

export function deleteActivity(doc: StructureDocument, id: string): StructureDocument {
  const set = new Set([id]);
  return {
    ...doc,
    activities: doc.activities
      .filter(a => a.id !== id)
      .map(a => {
        const relatedActivityIds = removeIds(a.relatedActivityIds, set);
        return relatedActivityIds === a.relatedActivityIds ? a : { ...a, relatedActivityIds };
      }),
    activityAssignments: doc.activityAssignments.filter(a => a.activityId !== id),
    products: doc.products.map(p => {
      const activityIds = removeIds(p.activityIds, set);
      return activityIds === p.activityIds ? p : { ...p, activityIds };
    }),
    licences: doc.licences.map(l => {
      const activityIds = removeIds(l.activityIds, set);
      return activityIds === l.activityIds ? l : { ...l, activityIds };
    })
  };
}

/** Adds the assignment unless an identical (activity, entity, role) one exists. */
export function assignActivity(doc: StructureDocument, assignment: ActivityAssignment): StructureDocument {
  const exists = doc.activityAssignments.some(
    a => a.activityId === assignment.activityId && a.entityId === assignment.entityId && a.role === assignment.role
  );
  return exists ? doc : { ...doc, activityAssignments: [...doc.activityAssignments, assignment] };
}

export function updateActivityAssignment(
  doc: StructureDocument,
  id: string,
  patch: Partial<Omit<ActivityAssignment, 'id'>>
): StructureDocument {
  const activityAssignments = patchById(doc.activityAssignments, id, patch);
  return activityAssignments === doc.activityAssignments ? doc : { ...doc, activityAssignments };
}

export function removeActivityAssignment(doc: StructureDocument, id: string): StructureDocument {
  return { ...doc, activityAssignments: doc.activityAssignments.filter(a => a.id !== id) };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function addProduct(doc: StructureDocument, product: Product): StructureDocument {
  return { ...doc, products: [...doc.products, product] };
}

export function updateProduct(
  doc: StructureDocument,
  id: string,
  patch: Partial<Omit<Product, 'id'>>
): StructureDocument {
  const products = patchById(doc.products, id, patch);
  return products === doc.products ? doc : { ...doc, products };
}

export function deleteProduct(doc: StructureDocument, id: string): StructureDocument {
  return {
    ...doc,
    products: doc.products.filter(p => p.id !== id),
    productAssignments: doc.productAssignments.filter(a => a.productId !== id)
  };
}

export function assignProduct(doc: StructureDocument, assignment: ProductAssignment): StructureDocument {
  const exists = doc.productAssignments.some(
    a => a.productId === assignment.productId && a.entityId === assignment.entityId && a.role === assignment.role
  );
  return exists ? doc : { ...doc, productAssignments: [...doc.productAssignments, assignment] };
}

export function updateProductAssignment(
  doc: StructureDocument,
  id: string,
  patch: Partial<Omit<ProductAssignment, 'id'>>
): StructureDocument {
  const productAssignments = patchById(doc.productAssignments, id, patch);
  return productAssignments === doc.productAssignments ? doc : { ...doc, productAssignments };
}

export function removeProductAssignment(doc: StructureDocument, id: string): StructureDocument {
  return { ...doc, productAssignments: doc.productAssignments.filter(a => a.id !== id) };
}

// ---------------------------------------------------------------------------
// Licences
// ---------------------------------------------------------------------------

export function addLicence(doc: StructureDocument, licence: Licence): StructureDocument {
  return { ...doc, licences: [...doc.licences, licence] };
}

export function updateLicence(
  doc: StructureDocument,
  id: string,
  patch: Partial<Omit<Licence, 'id'>>
): StructureDocument {
  const licences = patchById(doc.licences, id, patch);
  return licences === doc.licences ? doc : { ...doc, licences };
}

export function deleteLicence(doc: StructureDocument, id: string): StructureDocument {
  return { ...doc, licences: doc.licences.filter(l => l.id !== id) };
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export function addGroup(doc: StructureDocument, group: GroupCluster): StructureDocument {
  return { ...doc, groups: [...doc.groups, group] };
}

export function updateGroup(
  doc: StructureDocument,
  id: string,
  patch: Partial<Omit<GroupCluster, 'id'>>
): StructureDocument {
  const groups = patchById(doc.groups, id, patch);
  return groups === doc.groups ? doc : { ...doc, groups };
}

export function deleteGroup(doc: StructureDocument, id: string): StructureDocument {
  return { ...doc, groups: doc.groups.filter(g => g.id !== id) };
}

// ---------------------------------------------------------------------------
// Derived per-entity index
// ---------------------------------------------------------------------------

export interface EntityLinks {
  activities: { assignment: ActivityAssignment; activity: BusinessActivity }[];
  products: { assignment: ProductAssignment; product: Product }[];
  licences: Licence[];
}

const EMPTY_LINKS: EntityLinks = { activities: [], products: [], licences: [] };

let indexCache: {
  activities: BusinessActivity[];
  activityAssignments: ActivityAssignment[];
  products: Product[];
  productAssignments: ProductAssignment[];
  licences: Licence[];
  index: Map<string, EntityLinks>;
} | null = null;

/**
 * Per-entity view of activities, products and licences. Memoised on the source
 * collections (not on entity positions), so dragging does not rebuild it and
 * entity cards keep referentially stable link objects.
 */
export function getEntityIndex(doc: StructureDocument): Map<string, EntityLinks> {
  const c = indexCache;
  if (
    c &&
    c.activities === doc.activities &&
    c.activityAssignments === doc.activityAssignments &&
    c.products === doc.products &&
    c.productAssignments === doc.productAssignments &&
    c.licences === doc.licences
  ) {
    return c.index;
  }

  const index = new Map<string, EntityLinks>();
  const entry = (id: string) => {
    let links = index.get(id);
    if (!links) {
      links = { activities: [], products: [], licences: [] };
      index.set(id, links);
    }
    return links;
  };

  const activityById = new Map(doc.activities.map(a => [a.id, a]));
  for (const assignment of doc.activityAssignments) {
    const activity = activityById.get(assignment.activityId);
    if (activity) entry(assignment.entityId).activities.push({ assignment, activity });
  }
  const productById = new Map(doc.products.map(p => [p.id, p]));
  for (const assignment of doc.productAssignments) {
    const product = productById.get(assignment.productId);
    if (product) entry(assignment.entityId).products.push({ assignment, product });
  }
  for (const licence of doc.licences) {
    if (licence.holderEntityId) entry(licence.holderEntityId).licences.push(licence);
  }
  // Performing roles first so cards show the most relevant rows.
  for (const links of Array.from(index.values())) {
    links.activities.sort((a: { assignment: ActivityAssignment; activity: BusinessActivity }, b: { assignment: ActivityAssignment; activity: BusinessActivity }) => (a.assignment.role === b.assignment.role ? 0 : a.assignment.role === 'performs' ? -1 : 1));
    links.products.sort((a: { assignment: ProductAssignment; product: Product }, b: { assignment: ProductAssignment; product: Product }) => (a.assignment.role === b.assignment.role ? 0 : a.assignment.role === 'provider' ? -1 : 1));
  }

  indexCache = {
    activities: doc.activities,
    activityAssignments: doc.activityAssignments,
    products: doc.products,
    productAssignments: doc.productAssignments,
    licences: doc.licences,
    index
  };
  return index;
}

export function getEntityLinks(doc: StructureDocument, entityId: string): EntityLinks {
  return getEntityIndex(doc).get(entityId) ?? EMPTY_LINKS;
}

export function isLicenceInForce(licence: Licence, today: string): boolean {
  if (licence.status !== 'granted') return false;
  if (licence.effectiveDate && today < licence.effectiveDate) return false;
  if (licence.expiryDate && today > licence.expiryDate) return false;
  return true;
}

/** ISO date (YYYY-MM-DD) in local time. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const entityMapCache = new WeakMap<LegalEntity[], Map<string, LegalEntity>>();

/** id → entity lookup, memoised per `entities` array. */
export function getEntityMap(entities: LegalEntity[]): Map<string, LegalEntity> {
  let map = entityMapCache.get(entities);
  if (!map) {
    map = new Map(entities.map(e => [e.id, e]));
    entityMapCache.set(entities, map);
  }
  return map;
}

/** Sensible relationship kind when connecting two entities by dragging. */
export function defaultRelationshipKind(fromType: string, toType: string): RelationshipKind {
  const to = getEntityType(toType);
  if (to.issuesCertificates && getEntityType(fromType).category !== 'foundation') return 'certificates';
  if (to.hasShareCapital) return 'ownership';
  return 'service';
}

export { exportMermaid, parseMermaid } from './mermaid';
export { parseStructureDocument as parseJSON } from './migrate';

export function exportJSON(doc: any): string {
  return JSON.stringify(doc, null, 2);
}
