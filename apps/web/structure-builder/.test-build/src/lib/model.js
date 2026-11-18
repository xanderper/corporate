"use strict";
/**
 * @file model.ts
 * @description Factories, normalisation and pure document operations.
 *
 * Every operation takes a `StructureDocument` and returns a new one without mutating
 * the input, so the editor store can keep cheap structural-sharing snapshots for
 * undo/redo and React can compare collections by reference.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJSON = exports.parseMermaid = exports.exportMermaid = void 0;
exports.createId = createId;
exports.createEmptyDocument = createEmptyDocument;
exports.createEntity = createEntity;
exports.createActivity = createActivity;
exports.createProduct = createProduct;
exports.createLicence = createLicence;
exports.createGroup = createGroup;
exports.parsePct = parsePct;
exports.buildRelationship = buildRelationship;
exports.applyRelationshipPatch = applyRelationshipPatch;
exports.formatPct = formatPct;
exports.formatRelationshipLabel = formatRelationshipLabel;
exports.toggleId = toggleId;
exports.addEntity = addEntity;
exports.updateEntity = updateEntity;
exports.moveEntities = moveEntities;
exports.describeEntityDeletion = describeEntityDeletion;
exports.deleteEntities = deleteEntities;
exports.duplicateEntity = duplicateEntity;
exports.addRelationship = addRelationship;
exports.updateRelationship = updateRelationship;
exports.reverseRelationship = reverseRelationship;
exports.deleteRelationships = deleteRelationships;
exports.addActivity = addActivity;
exports.updateActivity = updateActivity;
exports.deleteActivity = deleteActivity;
exports.assignActivity = assignActivity;
exports.updateActivityAssignment = updateActivityAssignment;
exports.removeActivityAssignment = removeActivityAssignment;
exports.addProduct = addProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.assignProduct = assignProduct;
exports.updateProductAssignment = updateProductAssignment;
exports.removeProductAssignment = removeProductAssignment;
exports.addLicence = addLicence;
exports.updateLicence = updateLicence;
exports.deleteLicence = deleteLicence;
exports.addGroup = addGroup;
exports.updateGroup = updateGroup;
exports.deleteGroup = deleteGroup;
exports.getEntityIndex = getEntityIndex;
exports.getEntityLinks = getEntityLinks;
exports.isLicenceInForce = isLicenceInForce;
exports.todayIso = todayIso;
exports.getEntityMap = getEntityMap;
exports.defaultRelationshipKind = defaultRelationshipKind;
exports.exportJSON = exportJSON;
const types_1 = require("./types");
const constants_1 = require("./constants");
// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------
function createId(prefix = 'id') {
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
function createEmptyDocument(title = 'New corporate structure', subtitle = '') {
    return {
        schemaVersion: types_1.CURRENT_SCHEMA_VERSION,
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
        preferences: { ...constants_1.DEFAULT_PREFERENCES },
        settings: { ...constants_1.DEFAULT_SETTINGS }
    };
}
function createEntity(partial = {}) {
    const type = partial.type || 'BV';
    return {
        id: partial.id || createId('ent'),
        name: partial.name ?? 'New entity',
        type,
        status: partial.status || 'active',
        color: partial.color || (0, constants_1.getEntityType)(type).defaultColor,
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
function createActivity(partial = {}) {
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
function createProduct(partial = {}) {
    return {
        id: partial.id || createId('prod'),
        name: partial.name ?? 'New product',
        description: partial.description ?? '',
        status: partial.status || 'concept',
        activityIds: partial.activityIds ?? [],
        notes: partial.notes ?? ''
    };
}
function createLicence(partial = {}) {
    const licenceType = partial.licenceType ?? '';
    return {
        id: partial.id || createId('lic'),
        name: partial.name ?? 'New licence',
        licenceType,
        authority: partial.authority ?? constants_1.LICENCE_TYPES[licenceType]?.defaultAuthority ?? '',
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
function createGroup(partial = {}) {
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
const ROUTINGS = ['auto', 'elbow', 'bezier', 'straight'];
const PORTS = ['auto', 'top', 'bottom', 'left', 'right'];
function parsePct(value) {
    if (value === null || value === undefined || value === '')
        return null;
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
}
function text(value) {
    return typeof value === 'string' ? value : '';
}
/**
 * Builds a valid `Relationship` for `kind` from a loose record. Fields that do not
 * belong to the kind are dropped, so switching kind never leaves stale metadata.
 */
function buildRelationship(id, kind, source) {
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
            const arrangementKind = kind;
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
function applyRelationshipPatch(rel, patch) {
    const merged = { ...rel, ...patch };
    // Carry the human description across kinds where the field name differs.
    if (patch.kind && patch.kind !== rel.kind) {
        if (rel.kind === 'control' && !merged.description)
            merged.description = rel.role;
        if ('description' in rel && !merged.role)
            merged.role = rel.description;
    }
    return buildRelationship(rel.id, patch.kind ?? rel.kind, merged);
}
function formatPct(value) {
    if (value === null)
        return '';
    return `${Number.isInteger(value) ? value : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`;
}
function formatRelationshipLabel(rel) {
    switch (rel.kind) {
        case 'ownership': {
            const parts = [];
            if (rel.sharePct !== null)
                parts.push(`${formatPct(rel.sharePct)} shares`);
            if (rel.votingPct !== null && rel.votingPct !== rel.sharePct)
                parts.push(`${formatPct(rel.votingPct)} votes`);
            if (rel.economicPct !== null && rel.economicPct !== rel.sharePct)
                parts.push(`${formatPct(rel.economicPct)} economic`);
            if (rel.shareClass)
                parts.push(rel.shareClass);
            return parts.join(' · ') || 'Shares';
        }
        case 'certificates':
            return rel.certificatePct !== null ? `${formatPct(rel.certificatePct)} certificates` : 'Certificates';
        case 'control': {
            const parts = [];
            if (rel.votingPct !== null)
                parts.push(`${formatPct(rel.votingPct)} voting control`);
            if (rel.role)
                parts.push(rel.role);
            return parts.join(' · ') || 'Control';
        }
        default:
            return rel.description || constants_1.RELATIONSHIP_KINDS[rel.kind].short;
    }
}
// ---------------------------------------------------------------------------
// Small immutable helpers
// ---------------------------------------------------------------------------
function patchById(items, id, patch) {
    let changed = false;
    const next = items.map(item => {
        if (item.id !== id)
            return item;
        changed = true;
        return { ...item, ...patch, id: item.id };
    });
    return changed ? next : items;
}
function removeIds(ids, remove) {
    return ids.some(id => remove.has(id)) ? ids.filter(id => !remove.has(id)) : ids;
}
function toggleId(ids, id, on) {
    const has = ids.includes(id);
    if (on && !has)
        return [...ids, id];
    if (!on && has)
        return ids.filter(x => x !== id);
    return ids;
}
// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------
function addEntity(doc, entity) {
    return { ...doc, entities: [...doc.entities, entity] };
}
function updateEntity(doc, id, patch) {
    const entities = patchById(doc.entities, id, patch);
    return entities === doc.entities ? doc : { ...doc, entities };
}
function moveEntities(doc, positions) {
    if (positions.size === 0)
        return doc;
    let changed = false;
    const entities = doc.entities.map(e => {
        const p = positions.get(e.id);
        if (!p || (p.x === e.x && p.y === e.y))
            return e;
        changed = true;
        return { ...e, x: p.x, y: p.y };
    });
    return changed ? { ...doc, entities } : doc;
}
function describeEntityDeletion(doc, ids) {
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
function deleteEntities(doc, ids) {
    if (ids.length === 0)
        return doc;
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
        licences: doc.licences.map(l => l.holderEntityId !== null && set.has(l.holderEntityId) ? { ...l, holderEntityId: null } : l)
    };
}
/** Copies the entity's own details (not its relationships or assignments). */
function duplicateEntity(doc, id, newId = createId('ent')) {
    const source = doc.entities.find(e => e.id === id);
    if (!source)
        return { doc, entity: null };
    const entity = {
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
function addRelationship(doc, rel) {
    return { ...doc, relationships: [...doc.relationships, rel] };
}
function updateRelationship(doc, id, patch) {
    let changed = false;
    const relationships = doc.relationships.map(r => {
        if (r.id !== id)
            return r;
        changed = true;
        return applyRelationshipPatch(r, patch);
    });
    return changed ? { ...doc, relationships } : doc;
}
function reverseRelationship(doc, id) {
    const rel = doc.relationships.find(r => r.id === id);
    if (!rel)
        return doc;
    return updateRelationship(doc, id, {
        from: rel.to,
        to: rel.from,
        fromPort: rel.toPort ?? 'auto',
        toPort: rel.fromPort ?? 'auto'
    });
}
function deleteRelationships(doc, ids) {
    const set = new Set(ids);
    return { ...doc, relationships: doc.relationships.filter(r => !set.has(r.id)) };
}
// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------
function addActivity(doc, activity) {
    return { ...doc, activities: [...doc.activities, activity] };
}
function updateActivity(doc, id, patch) {
    const activities = patchById(doc.activities, id, patch);
    return activities === doc.activities ? doc : { ...doc, activities };
}
function deleteActivity(doc, id) {
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
function assignActivity(doc, assignment) {
    const exists = doc.activityAssignments.some(a => a.activityId === assignment.activityId && a.entityId === assignment.entityId && a.role === assignment.role);
    return exists ? doc : { ...doc, activityAssignments: [...doc.activityAssignments, assignment] };
}
function updateActivityAssignment(doc, id, patch) {
    const activityAssignments = patchById(doc.activityAssignments, id, patch);
    return activityAssignments === doc.activityAssignments ? doc : { ...doc, activityAssignments };
}
function removeActivityAssignment(doc, id) {
    return { ...doc, activityAssignments: doc.activityAssignments.filter(a => a.id !== id) };
}
// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
function addProduct(doc, product) {
    return { ...doc, products: [...doc.products, product] };
}
function updateProduct(doc, id, patch) {
    const products = patchById(doc.products, id, patch);
    return products === doc.products ? doc : { ...doc, products };
}
function deleteProduct(doc, id) {
    return {
        ...doc,
        products: doc.products.filter(p => p.id !== id),
        productAssignments: doc.productAssignments.filter(a => a.productId !== id)
    };
}
function assignProduct(doc, assignment) {
    const exists = doc.productAssignments.some(a => a.productId === assignment.productId && a.entityId === assignment.entityId && a.role === assignment.role);
    return exists ? doc : { ...doc, productAssignments: [...doc.productAssignments, assignment] };
}
function updateProductAssignment(doc, id, patch) {
    const productAssignments = patchById(doc.productAssignments, id, patch);
    return productAssignments === doc.productAssignments ? doc : { ...doc, productAssignments };
}
function removeProductAssignment(doc, id) {
    return { ...doc, productAssignments: doc.productAssignments.filter(a => a.id !== id) };
}
// ---------------------------------------------------------------------------
// Licences
// ---------------------------------------------------------------------------
function addLicence(doc, licence) {
    return { ...doc, licences: [...doc.licences, licence] };
}
function updateLicence(doc, id, patch) {
    const licences = patchById(doc.licences, id, patch);
    return licences === doc.licences ? doc : { ...doc, licences };
}
function deleteLicence(doc, id) {
    return { ...doc, licences: doc.licences.filter(l => l.id !== id) };
}
// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------
function addGroup(doc, group) {
    return { ...doc, groups: [...doc.groups, group] };
}
function updateGroup(doc, id, patch) {
    const groups = patchById(doc.groups, id, patch);
    return groups === doc.groups ? doc : { ...doc, groups };
}
function deleteGroup(doc, id) {
    return { ...doc, groups: doc.groups.filter(g => g.id !== id) };
}
const EMPTY_LINKS = { activities: [], products: [], licences: [] };
let indexCache = null;
/**
 * Per-entity view of activities, products and licences. Memoised on the source
 * collections (not on entity positions), so dragging does not rebuild it and
 * entity cards keep referentially stable link objects.
 */
function getEntityIndex(doc) {
    const c = indexCache;
    if (c &&
        c.activities === doc.activities &&
        c.activityAssignments === doc.activityAssignments &&
        c.products === doc.products &&
        c.productAssignments === doc.productAssignments &&
        c.licences === doc.licences) {
        return c.index;
    }
    const index = new Map();
    const entry = (id) => {
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
        if (activity)
            entry(assignment.entityId).activities.push({ assignment, activity });
    }
    const productById = new Map(doc.products.map(p => [p.id, p]));
    for (const assignment of doc.productAssignments) {
        const product = productById.get(assignment.productId);
        if (product)
            entry(assignment.entityId).products.push({ assignment, product });
    }
    for (const licence of doc.licences) {
        if (licence.holderEntityId)
            entry(licence.holderEntityId).licences.push(licence);
    }
    // Performing roles first so cards show the most relevant rows.
    for (const links of Array.from(index.values())) {
        links.activities.sort((a, b) => (a.assignment.role === b.assignment.role ? 0 : a.assignment.role === 'performs' ? -1 : 1));
        links.products.sort((a, b) => (a.assignment.role === b.assignment.role ? 0 : a.assignment.role === 'provider' ? -1 : 1));
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
function getEntityLinks(doc, entityId) {
    return getEntityIndex(doc).get(entityId) ?? EMPTY_LINKS;
}
function isLicenceInForce(licence, today) {
    if (licence.status !== 'granted')
        return false;
    if (licence.effectiveDate && today < licence.effectiveDate)
        return false;
    if (licence.expiryDate && today > licence.expiryDate)
        return false;
    return true;
}
/** ISO date (YYYY-MM-DD) in local time. */
function todayIso(now = new Date()) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
const entityMapCache = new WeakMap();
/** id → entity lookup, memoised per `entities` array. */
function getEntityMap(entities) {
    let map = entityMapCache.get(entities);
    if (!map) {
        map = new Map(entities.map(e => [e.id, e]));
        entityMapCache.set(entities, map);
    }
    return map;
}
/** Sensible relationship kind when connecting two entities by dragging. */
function defaultRelationshipKind(fromType, toType) {
    const to = (0, constants_1.getEntityType)(toType);
    if (to.issuesCertificates && (0, constants_1.getEntityType)(fromType).category !== 'foundation')
        return 'certificates';
    if (to.hasShareCapital)
        return 'ownership';
    return 'service';
}
var mermaid_1 = require("./mermaid");
Object.defineProperty(exports, "exportMermaid", { enumerable: true, get: function () { return mermaid_1.exportMermaid; } });
Object.defineProperty(exports, "parseMermaid", { enumerable: true, get: function () { return mermaid_1.parseMermaid; } });
var migrate_1 = require("./migrate");
Object.defineProperty(exports, "parseJSON", { enumerable: true, get: function () { return migrate_1.parseStructureDocument; } });
function exportJSON(doc) {
    return JSON.stringify(doc, null, 2);
}
