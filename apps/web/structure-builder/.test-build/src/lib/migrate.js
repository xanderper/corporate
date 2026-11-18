"use strict";
/**
 * @file migrate.ts
 * @description Runtime parsing of untrusted structure data (localStorage, JSON import)
 * into a valid schema v4 `StructureDocument`.
 *
 * Accepts schema v1–v3 (`nodes`/`edges`, activities with `responsibleEntityId`,
 * products with entity id arrays, licences with a free-text `documents` field) and
 * schema v4. Unknown fields are dropped, invalid enum values fall back to defaults and
 * duplicate ids are re-keyed so every identifier in the result is unique.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureParseError = void 0;
exports.isRecord = isRecord;
exports.parseLegacyEdgeLabel = parseLegacyEdgeLabel;
exports.parseStructureDocument = parseStructureDocument;
exports.extractLegacyViewport = extractLegacyViewport;
exports.parseStructureJSON = parseStructureJSON;
exports.serializeDocument = serializeDocument;
const types_1 = require("./types");
const constants_1 = require("./constants");
const model_1 = require("./model");
class StructureParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StructureParseError';
    }
}
exports.StructureParseError = StructureParseError;
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function records(value) {
    return Array.isArray(value) ? value.filter(isRecord) : [];
}
function str(value, fallback = '') {
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number' && Number.isFinite(value))
        return String(value);
    return fallback;
}
function idOf(value) {
    const s = str(value).trim();
    return s ? s : null;
}
function num(value, fallback) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
function bool(value, fallback) {
    return typeof value === 'boolean' ? value : fallback;
}
function oneOf(value, allowed, fallback) {
    return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}
function idList(value) {
    if (!Array.isArray(value))
        return [];
    const out = [];
    for (const v of value) {
        const id = idOf(v);
        if (id && !out.includes(id))
            out.push(id);
    }
    return out;
}
function stringList(value) {
    if (Array.isArray(value))
        return value.map(v => str(v).trim()).filter(Boolean);
    if (typeof value === 'string')
        return value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return [];
}
/** Ensures ids are unique within a collection; duplicates and blanks get a fresh id. */
function uniqueIds(prefix) {
    const seen = new Set();
    return (raw) => {
        let id = idOf(raw);
        if (!id || seen.has(id))
            id = (0, model_1.createId)(prefix);
        seen.add(id);
        return id;
    };
}
const ENTITY_STATUS_KEYS = Object.keys(constants_1.ENTITY_STATUSES);
const ACTIVITY_STATUS_KEYS = Object.keys(constants_1.ACTIVITY_STATUSES);
const PRODUCT_STATUS_KEYS = Object.keys(constants_1.PRODUCT_STATUSES);
const LICENCE_STATUS_KEYS = Object.keys(constants_1.LICENCE_STATUSES);
const KIND_KEYS = Object.keys(constants_1.RELATIONSHIP_KINDS);
function parseLegacyEdgeLabel(label = '') {
    const raw = String(label || '').trim();
    const pctMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*%/);
    const pct = pctMatch ? parseFloat(pctMatch[1].replace(',', '.')) : null;
    if (!raw)
        return { kind: 'ownership', pct: null, role: '' };
    if (/certificat|stak|deposit(ar|or)y|receipt/i.test(raw))
        return { kind: 'certificates', pct, role: '' };
    if (/voting|stemrecht/i.test(raw))
        return { kind: 'control', pct, role: '' };
    if (/director|board|bestuur|management|supervisory|commissaris|control/i.test(raw))
        return { kind: 'control', pct: null, role: raw };
    if (/custody|safekeeping|bewaar|segregat/i.test(raw))
        return { kind: 'custody', pct: null, role: raw };
    if (/personnel|staff|secondment|personeel/i.test(raw))
        return { kind: 'personnel', pct: null, role: raw };
    if (/debt|credit|financ|lening|facility|loan/i.test(raw))
        return { kind: 'financing', pct: null, role: raw };
    if (/partner/i.test(raw))
        return { kind: 'partner', pct: null, role: raw };
    if (/service|outsourc|dienstverlening|sla|licen[cs]e|technology/i.test(raw))
        return { kind: 'service', pct: null, role: raw };
    return { kind: 'ownership', pct, role: '' };
}
function relationshipKind(raw) {
    const declared = str(raw.kind) || str(raw.type);
    if (declared === 'certificate')
        return 'certificates';
    if (KIND_KEYS.includes(declared))
        return declared;
    return parseLegacyEdgeLabel(str(raw.label)).kind;
}
// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------
function parseEntities(raw) {
    const nextId = uniqueIds('ent');
    return records(raw).map(n => {
        const declaredType = str(n.type, 'BV').trim() || 'BV';
        const type = constants_1.LEGACY_ENTITY_TYPE_ALIASES[declaredType] ?? declaredType;
        return {
            id: nextId(n.id),
            name: str(n.name, 'Untitled entity').trim(),
            type,
            status: oneOf(n.status, ENTITY_STATUS_KEYS, 'active'),
            color: oneOf(n.color, constants_1.COLOR_THEMES, 'green'),
            description: str(n.description),
            jurisdiction: str(n.jurisdiction),
            regNumber: str(n.regNumber),
            taxNumber: str(n.taxNumber),
            incorporationDate: str(n.incorporationDate),
            notes: str(n.notes),
            documents: stringList(n.documents),
            x: num(n.x, 100),
            y: num(n.y, 100),
            locked: bool(n.locked, false)
        };
    });
}
function parseRelationships(raw) {
    const nextId = uniqueIds('rel');
    const out = [];
    for (const e of records(raw)) {
        const from = idOf(e.from);
        const to = idOf(e.to);
        if (!from || !to)
            continue;
        const kind = relationshipKind(e);
        const legacy = parseLegacyEdgeLabel(str(e.label));
        const legacyPct = legacy.kind === kind ? legacy.pct : null;
        const role = str(e.role) || (kind !== 'ownership' && kind !== 'certificates' ? legacy.role || str(e.label) : '');
        out.push((0, model_1.buildRelationship)(nextId(e.id), kind, {
            from,
            to,
            notes: str(e.notes),
            routing: oneOf(e.routing, ['auto', 'elbow', 'bezier', 'straight'], 'auto'),
            fromPort: oneOf(e.fromPort, ['auto', 'top', 'bottom', 'left', 'right'], 'auto'),
            toPort: oneOf(e.toPort, ['auto', 'top', 'bottom', 'left', 'right'], 'auto'),
            midOffset: num(e.midOffset, 0),
            sharePct: 'sharePct' in e ? (0, model_1.parsePct)(e.sharePct) : kind === 'ownership' ? legacyPct : null,
            votingPct: 'votingPct' in e ? (0, model_1.parsePct)(e.votingPct) : kind === 'control' ? legacyPct : null,
            economicPct: (0, model_1.parsePct)(e.economicPct),
            certificatePct: 'certificatePct' in e ? (0, model_1.parsePct)(e.certificatePct) : kind === 'certificates' ? legacyPct : null,
            shareClass: str(e.shareClass),
            role,
            description: str(e.description) || role,
            agreementRef: str(e.agreementRef),
            startDate: str(e.startDate)
        }));
    }
    return out;
}
function parseGroups(raw) {
    const nextId = uniqueIds('grp');
    return records(raw).map(g => ({
        id: nextId(g.id),
        name: str(g.name, 'Group'),
        color: oneOf(g.color, constants_1.COLOR_THEMES, 'green'),
        x: num(g.x, 40),
        y: num(g.y, 40),
        w: Math.max(80, num(g.w, 400)),
        h: Math.max(60, num(g.h, 200)),
        members: idList(g.members)
    }));
}
function licenceTypeKey(value) {
    if (!value || constants_1.LICENCE_TYPES[value])
        return value;
    const match = Object.entries(constants_1.LICENCE_TYPES).find(([, def]) => def.label.toLowerCase() === value.toLowerCase());
    return match ? match[0] : value;
}
function parseActivities(raw) {
    const nextId = uniqueIds('act');
    const activities = [];
    const assignments = [];
    const licenceIdByActivity = new Map();
    for (const a of records(raw)) {
        const id = nextId(a.id);
        const requiredLicenceId = idOf(a.requiredLicenceId);
        if (requiredLicenceId)
            licenceIdByActivity.set(id, requiredLicenceId);
        activities.push({
            id,
            name: str(a.name, 'Untitled activity').trim(),
            description: str(a.description),
            category: str(a.category, 'Operations & administration') || 'Operations & administration',
            status: oneOf(a.status, ACTIVITY_STATUS_KEYS, 'planned'),
            startDate: str(a.startDate),
            endDate: str(a.endDate),
            requiresLicence: bool(a.requiresLicence, Boolean(requiredLicenceId)),
            requiredLicenceType: licenceTypeKey(str(a.requiredLicenceType)),
            regulatoryRequirements: str(a.regulatoryRequirements) || str(a.requirements),
            relatedActivityIds: idList(a.relatedActivityIds),
            notes: str(a.notes)
        });
        // v3 → v4: inline entity references become explicit assignments.
        const responsible = idOf(a.responsibleEntityId);
        if (responsible) {
            assignments.push({ id: (0, model_1.createId)('aa'), activityId: id, entityId: responsible, role: 'performs' });
        }
        for (const entityId of idList(a.dependentEntityIds)) {
            if (entityId !== responsible) {
                assignments.push({ id: (0, model_1.createId)('aa'), activityId: id, entityId, role: 'supports' });
            }
        }
    }
    return { activities, assignments, legacy: { licenceIdByActivity } };
}
function parseActivityAssignments(raw) {
    const nextId = uniqueIds('aa');
    const out = [];
    for (const a of records(raw)) {
        const activityId = idOf(a.activityId);
        const entityId = idOf(a.entityId);
        if (!activityId || !entityId)
            continue;
        out.push({
            id: nextId(a.id),
            activityId,
            entityId,
            role: oneOf(a.role, ['performs', 'supports'], 'performs'),
            notes: str(a.notes)
        });
    }
    return out;
}
function parseProducts(raw) {
    const nextId = uniqueIds('prod');
    const products = [];
    const assignments = [];
    for (const p of records(raw)) {
        const id = nextId(p.id);
        const rawStatus = str(p.status);
        products.push({
            id,
            name: str(p.name, 'Untitled product').trim(),
            description: str(p.description),
            status: oneOf(rawStatus === 'operational' ? 'live' : rawStatus, PRODUCT_STATUS_KEYS, 'concept'),
            activityIds: idList(p.activityIds),
            notes: str(p.notes)
        });
        const providers = idList(p.responsibleEntityIds);
        const singleProvider = idOf(p.responsibleEntityId);
        if (singleProvider && !providers.includes(singleProvider))
            providers.push(singleProvider);
        for (const entityId of providers) {
            assignments.push({ id: (0, model_1.createId)('pa'), productId: id, entityId, role: 'provider' });
        }
        for (const entityId of idList(p.dependsOnEntityIds)) {
            if (!providers.includes(entityId)) {
                assignments.push({ id: (0, model_1.createId)('pa'), productId: id, entityId, role: 'dependency' });
            }
        }
    }
    return { products, assignments };
}
function parseProductAssignments(raw) {
    const nextId = uniqueIds('pa');
    const out = [];
    for (const a of records(raw)) {
        const productId = idOf(a.productId);
        const entityId = idOf(a.entityId);
        if (!productId || !entityId)
            continue;
        out.push({
            id: nextId(a.id),
            productId,
            entityId,
            role: oneOf(a.role, ['provider', 'dependency'], 'provider'),
            notes: str(a.notes)
        });
    }
    return out;
}
function parseLicences(raw) {
    const nextId = uniqueIds('lic');
    return records(raw).map(l => ({
        id: nextId(l.id),
        name: str(l.name, 'Untitled licence').trim(),
        licenceType: licenceTypeKey(str(l.licenceType) || str(l.type)),
        authority: str(l.authority),
        holderEntityId: idOf(l.holderEntityId),
        status: oneOf(l.status, LICENCE_STATUS_KEYS, 'planned'),
        reference: str(l.reference) || str(l.refNumber),
        applicationDate: str(l.applicationDate),
        grantDate: str(l.grantDate),
        effectiveDate: str(l.effectiveDate),
        expiryDate: str(l.expiryDate),
        activityIds: idList(l.activityIds),
        documents: stringList(l.documents),
        notes: str(l.notes)
    }));
}
function parsePreferences(raw) {
    const p = isRecord(raw) ? raw : {};
    const rawMode = str(p.mode);
    const mode = rawMode === 'operational' ? 'activities' : oneOf(rawMode, ['ownership', 'activities', 'products'], constants_1.DEFAULT_PREFERENCES.mode);
    return {
        mode,
        layoutDirection: oneOf(p.layoutDirection, ['TB', 'LR'], constants_1.DEFAULT_PREFERENCES.layoutDirection),
        cardWidth: Math.min(280, Math.max(160, num(p.cardWidth, constants_1.DEFAULT_PREFERENCES.cardWidth))),
        connectionStyle: oneOf(p.connectionStyle, ['elbow', 'bezier', 'straight'], constants_1.DEFAULT_PREFERENCES.connectionStyle),
        gridStyle: oneOf(p.gridStyle, ['dots', 'lines', 'blank'], constants_1.DEFAULT_PREFERENCES.gridStyle),
        snapToGrid: bool(p.snapToGrid, constants_1.DEFAULT_PREFERENCES.snapToGrid),
        gridSize: Math.min(40, Math.max(5, num(p.gridSize, constants_1.DEFAULT_PREFERENCES.gridSize))),
        showArrangements: bool(p.showArrangements, constants_1.DEFAULT_PREFERENCES.showArrangements),
        showLicenceBadges: bool(p.showLicenceBadges, constants_1.DEFAULT_PREFERENCES.showLicenceBadges)
    };
}
function dedupeAssignments(items, key) {
    const seen = new Set();
    return items.filter(item => {
        const k = `${key(item)}|${item.entityId}|${item.role}`;
        if (seen.has(k))
            return false;
        seen.add(k);
        return true;
    });
}
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Parses any supported schema version into a v4 document.
 * @throws StructureParseError when the input is not a structure document at all.
 */
function parseStructureDocument(raw) {
    if (!isRecord(raw)) {
        throw new StructureParseError('Expected a structure document object.');
    }
    const hasContent = ['entities', 'nodes', 'relationships', 'edges', 'activities'].some(k => Array.isArray(raw[k]));
    if (!hasContent) {
        throw new StructureParseError('The data does not contain entities, relationships or activities.');
    }
    const version = num(raw.schemaVersion, 3);
    if (version > types_1.CURRENT_SCHEMA_VERSION) {
        throw new StructureParseError(`This structure was saved by a newer version (schema v${version}). Update the application to open it.`);
    }
    const entities = parseEntities(raw.entities ?? raw.nodes);
    const relationships = parseRelationships(raw.relationships ?? raw.edges);
    const parsedActivities = parseActivities(raw.activities);
    const parsedProducts = parseProducts(raw.products);
    let licences = parseLicences(raw.licences);
    // v3 `requiredLicenceId` → licence covers activity.
    if (parsedActivities.legacy.licenceIdByActivity.size > 0) {
        licences = licences.map(l => {
            const extra = [...parsedActivities.legacy.licenceIdByActivity]
                .filter(([activityId, licenceId]) => licenceId === l.id && !l.activityIds.includes(activityId))
                .map(([activityId]) => activityId);
            return extra.length ? { ...l, activityIds: [...l.activityIds, ...extra] } : l;
        });
    }
    const activityAssignments = dedupeAssignments([...parsedActivities.assignments, ...parseActivityAssignments(raw.activityAssignments)], a => a.activityId);
    const productAssignments = dedupeAssignments([...parsedProducts.assignments, ...parseProductAssignments(raw.productAssignments)], a => a.productId);
    const settings = isRecord(raw.settings) ? raw.settings : {};
    return {
        schemaVersion: types_1.CURRENT_SCHEMA_VERSION,
        chartTitle: str(raw.chartTitle, 'Corporate structure') || 'Corporate structure',
        chartSubtitle: str(raw.chartSubtitle),
        entities,
        relationships,
        groups: parseGroups(raw.groups),
        activities: parsedActivities.activities,
        activityAssignments,
        products: parsedProducts.products,
        productAssignments,
        licences,
        preferences: parsePreferences(raw.preferences ?? raw.view),
        settings: {
            expectedOwnershipTotal: Math.min(100, Math.max(1, num(settings.expectedOwnershipTotal, constants_1.DEFAULT_SETTINGS.expectedOwnershipTotal)))
        }
    };
}
/** Zoom/pan stored inside the document by schema v1–v3 (`view.zoom` etc.). */
function extractLegacyViewport(raw) {
    if (!isRecord(raw) || !isRecord(raw.view))
        return null;
    const v = raw.view;
    if (typeof v.zoom !== 'number')
        return null;
    return { zoom: num(v.zoom, 1), panX: num(v.panX, 60), panY: num(v.panY, 60) };
}
function parseStructureJSON(json) {
    let raw;
    try {
        raw = JSON.parse(json);
    }
    catch {
        throw new StructureParseError('The text is not valid JSON.');
    }
    return parseStructureDocument(raw);
}
function serializeDocument(doc) {
    return JSON.stringify({ ...doc, exportedAt: new Date().toISOString() }, null, 2);
}
