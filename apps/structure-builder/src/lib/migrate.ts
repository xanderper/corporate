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

import {
  CURRENT_SCHEMA_VERSION,
  type ActivityAssignment,
  type ActivityRole,
  type ActivityStatus,
  type BusinessActivity,
  type ColorTheme,
  type ConnectionStyle,
  type EntityStatus,
  type GridStyle,
  type GroupCluster,
  type LayoutDirection,
  type LegalEntity,
  type Licence,
  type LicenceStatus,
  type Product,
  type ProductAssignment,
  type ProductRole,
  type ProductStatus,
  type Relationship,
  type RelationshipKind,
  type StructureDocument,
  type ViewMode,
  type ViewPreferences
} from './types';
import {
  ACTIVITY_STATUSES,
  COLOR_THEMES,
  DEFAULT_PREFERENCES,
  DEFAULT_SETTINGS,
  ENTITY_STATUSES,
  LEGACY_ENTITY_TYPE_ALIASES,
  LICENCE_STATUSES,
  LICENCE_TYPES,
  PRODUCT_STATUSES,
  RELATIONSHIP_KINDS
} from './constants';
import { buildRelationship, createId, parsePct } from './model';

export class StructureParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StructureParseError';
  }
}

// ---------------------------------------------------------------------------
// Primitive readers
// ---------------------------------------------------------------------------

type UnknownRecord = Record<string, unknown>;

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function str(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function idOf(value: unknown): string | null {
  const s = str(value).trim();
  return s ? s : null;
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function idList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    const id = idOf(v);
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(v => str(v).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  return [];
}

/** Ensures ids are unique within a collection; duplicates and blanks get a fresh id. */
function uniqueIds(prefix: string) {
  const seen = new Set<string>();
  return (raw: unknown): string => {
    let id = idOf(raw);
    if (!id || seen.has(id)) id = createId(prefix);
    seen.add(id);
    return id;
  };
}

const ENTITY_STATUS_KEYS = Object.keys(ENTITY_STATUSES) as EntityStatus[];
const ACTIVITY_STATUS_KEYS = Object.keys(ACTIVITY_STATUSES) as ActivityStatus[];
const PRODUCT_STATUS_KEYS = Object.keys(PRODUCT_STATUSES) as ProductStatus[];
const LICENCE_STATUS_KEYS = Object.keys(LICENCE_STATUSES) as LicenceStatus[];
const KIND_KEYS = Object.keys(RELATIONSHIP_KINDS) as RelationshipKind[];

// ---------------------------------------------------------------------------
// Legacy relationship labels (schema v1/v2 and Mermaid)
// ---------------------------------------------------------------------------

export interface ParsedEdgeLabel {
  kind: RelationshipKind;
  pct: number | null;
  role: string;
}

export function parseLegacyEdgeLabel(label = ''): ParsedEdgeLabel {
  const raw = String(label || '').trim();
  const pctMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*%/);
  const pct = pctMatch ? parseFloat(pctMatch[1].replace(',', '.')) : null;

  if (!raw) return { kind: 'ownership', pct: null, role: '' };
  if (/certificat|stak|deposit(ar|or)y|receipt/i.test(raw)) return { kind: 'certificates', pct, role: '' };
  if (/voting|stemrecht/i.test(raw)) return { kind: 'control', pct, role: '' };
  if (/director|board|bestuur|management|supervisory|commissaris|control/i.test(raw)) return { kind: 'control', pct: null, role: raw };
  if (/custody|safekeeping|bewaar|segregat/i.test(raw)) return { kind: 'custody', pct: null, role: raw };
  if (/personnel|staff|secondment|personeel/i.test(raw)) return { kind: 'personnel', pct: null, role: raw };
  if (/debt|credit|financ|lening|facility|loan/i.test(raw)) return { kind: 'financing', pct: null, role: raw };
  if (/partner/i.test(raw)) return { kind: 'partner', pct: null, role: raw };
  if (/service|outsourc|dienstverlening|sla|licen[cs]e|technology/i.test(raw)) return { kind: 'service', pct: null, role: raw };
  return { kind: 'ownership', pct, role: '' };
}

function relationshipKind(raw: UnknownRecord): RelationshipKind {
  const declared = str(raw.kind) || str(raw.type);
  if (declared === 'certificate') return 'certificates';
  if ((KIND_KEYS as string[]).includes(declared)) return declared as RelationshipKind;
  return parseLegacyEdgeLabel(str(raw.label)).kind;
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

function parseEntities(raw: unknown): LegalEntity[] {
  const nextId = uniqueIds('ent');
  return records(raw).map(n => {
    const declaredType = str(n.type, 'BV').trim() || 'BV';
    const type = LEGACY_ENTITY_TYPE_ALIASES[declaredType] ?? declaredType;
    return {
      id: nextId(n.id),
      name: str(n.name, 'Untitled entity').trim(),
      type,
      status: oneOf(n.status, ENTITY_STATUS_KEYS, 'active'),
      color: oneOf<ColorTheme>(n.color, COLOR_THEMES, 'green'),
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

function parseRelationships(raw: unknown): Relationship[] {
  const nextId = uniqueIds('rel');
  const out: Relationship[] = [];
  for (const e of records(raw)) {
    const from = idOf(e.from);
    const to = idOf(e.to);
    if (!from || !to) continue;
    const kind = relationshipKind(e);
    const legacy = parseLegacyEdgeLabel(str(e.label));
    const legacyPct = legacy.kind === kind ? legacy.pct : null;
    const role = str(e.role) || (kind !== 'ownership' && kind !== 'certificates' ? legacy.role || str(e.label) : '');

    out.push(
      buildRelationship(nextId(e.id), kind, {
        from,
        to,
        notes: str(e.notes),
        routing: oneOf(e.routing, ['auto', 'elbow', 'bezier', 'straight'] as const, 'auto'),
        fromPort: oneOf(e.fromPort, ['auto', 'top', 'bottom', 'left', 'right'] as const, 'auto'),
        toPort: oneOf(e.toPort, ['auto', 'top', 'bottom', 'left', 'right'] as const, 'auto'),
        midOffset: num(e.midOffset, 0),
        sharePct: 'sharePct' in e ? parsePct(e.sharePct) : kind === 'ownership' ? legacyPct : null,
        votingPct: 'votingPct' in e ? parsePct(e.votingPct) : kind === 'control' ? legacyPct : null,
        economicPct: parsePct(e.economicPct),
        certificatePct: 'certificatePct' in e ? parsePct(e.certificatePct) : kind === 'certificates' ? legacyPct : null,
        shareClass: str(e.shareClass),
        role,
        description: str(e.description) || role,
        agreementRef: str(e.agreementRef),
        startDate: str(e.startDate)
      })
    );
  }
  return out;
}

function parseGroups(raw: unknown): GroupCluster[] {
  const nextId = uniqueIds('grp');
  return records(raw).map(g => ({
    id: nextId(g.id),
    name: str(g.name, 'Group'),
    color: oneOf<ColorTheme>(g.color, COLOR_THEMES, 'green'),
    x: num(g.x, 40),
    y: num(g.y, 40),
    w: Math.max(80, num(g.w, 400)),
    h: Math.max(60, num(g.h, 200)),
    members: idList(g.members)
  }));
}

function licenceTypeKey(value: string): string {
  if (!value || LICENCE_TYPES[value]) return value;
  const match = Object.entries(LICENCE_TYPES).find(([, def]) => def.label.toLowerCase() === value.toLowerCase());
  return match ? match[0] : value;
}

interface LegacyActivityLinks {
  /** v3 `requiredLicenceId`: the licence that should cover this activity. */
  licenceIdByActivity: Map<string, string>;
}

function parseActivities(raw: unknown): {
  activities: BusinessActivity[];
  assignments: ActivityAssignment[];
  legacy: LegacyActivityLinks;
} {
  const nextId = uniqueIds('act');
  const activities: BusinessActivity[] = [];
  const assignments: ActivityAssignment[] = [];
  const licenceIdByActivity = new Map<string, string>();

  for (const a of records(raw)) {
    const id = nextId(a.id);
    const requiredLicenceId = idOf(a.requiredLicenceId);
    if (requiredLicenceId) licenceIdByActivity.set(id, requiredLicenceId);

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
      assignments.push({ id: createId('aa'), activityId: id, entityId: responsible, role: 'performs' });
    }
    for (const entityId of idList(a.dependentEntityIds)) {
      if (entityId !== responsible) {
        assignments.push({ id: createId('aa'), activityId: id, entityId, role: 'supports' });
      }
    }
  }
  return { activities, assignments, legacy: { licenceIdByActivity } };
}

function parseActivityAssignments(raw: unknown): ActivityAssignment[] {
  const nextId = uniqueIds('aa');
  const out: ActivityAssignment[] = [];
  for (const a of records(raw)) {
    const activityId = idOf(a.activityId);
    const entityId = idOf(a.entityId);
    if (!activityId || !entityId) continue;
    out.push({
      id: nextId(a.id),
      activityId,
      entityId,
      role: oneOf<ActivityRole>(a.role, ['performs', 'supports'], 'performs'),
      notes: str(a.notes)
    });
  }
  return out;
}

function parseProducts(raw: unknown): { products: Product[]; assignments: ProductAssignment[] } {
  const nextId = uniqueIds('prod');
  const products: Product[] = [];
  const assignments: ProductAssignment[] = [];

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
    if (singleProvider && !providers.includes(singleProvider)) providers.push(singleProvider);
    for (const entityId of providers) {
      assignments.push({ id: createId('pa'), productId: id, entityId, role: 'provider' });
    }
    for (const entityId of idList(p.dependsOnEntityIds)) {
      if (!providers.includes(entityId)) {
        assignments.push({ id: createId('pa'), productId: id, entityId, role: 'dependency' });
      }
    }
  }
  return { products, assignments };
}

function parseProductAssignments(raw: unknown): ProductAssignment[] {
  const nextId = uniqueIds('pa');
  const out: ProductAssignment[] = [];
  for (const a of records(raw)) {
    const productId = idOf(a.productId);
    const entityId = idOf(a.entityId);
    if (!productId || !entityId) continue;
    out.push({
      id: nextId(a.id),
      productId,
      entityId,
      role: oneOf<ProductRole>(a.role, ['provider', 'dependency'], 'provider'),
      notes: str(a.notes)
    });
  }
  return out;
}

function parseLicences(raw: unknown): Licence[] {
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

function parsePreferences(raw: unknown): ViewPreferences {
  const p = isRecord(raw) ? raw : {};
  const rawMode = str(p.mode);
  const mode: ViewMode = rawMode === 'operational' ? 'activities' : oneOf(rawMode, ['ownership', 'activities', 'products'] as const, DEFAULT_PREFERENCES.mode);
  return {
    mode,
    layoutDirection: oneOf<LayoutDirection>(p.layoutDirection, ['TB', 'LR'], DEFAULT_PREFERENCES.layoutDirection),
    cardWidth: Math.min(280, Math.max(160, num(p.cardWidth, DEFAULT_PREFERENCES.cardWidth))),
    connectionStyle: oneOf<ConnectionStyle>(p.connectionStyle, ['elbow', 'bezier', 'straight'], DEFAULT_PREFERENCES.connectionStyle),
    gridStyle: oneOf<GridStyle>(p.gridStyle, ['dots', 'lines', 'blank'], DEFAULT_PREFERENCES.gridStyle),
    snapToGrid: bool(p.snapToGrid, DEFAULT_PREFERENCES.snapToGrid),
    gridSize: Math.min(40, Math.max(5, num(p.gridSize, DEFAULT_PREFERENCES.gridSize))),
    showArrangements: bool(p.showArrangements, DEFAULT_PREFERENCES.showArrangements),
    showLicenceBadges: bool(p.showLicenceBadges, DEFAULT_PREFERENCES.showLicenceBadges)
  };
}

function dedupeAssignments<T extends { entityId: string; role: string }>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const k = `${key(item)}|${item.entityId}|${item.role}`;
    if (seen.has(k)) return false;
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
export function parseStructureDocument(raw: unknown): StructureDocument {
  if (!isRecord(raw)) {
    throw new StructureParseError('Expected a structure document object.');
  }
  const hasContent = ['entities', 'nodes', 'relationships', 'edges', 'activities'].some(k => Array.isArray(raw[k]));
  if (!hasContent) {
    throw new StructureParseError('The data does not contain entities, relationships or activities.');
  }

  const version = num(raw.schemaVersion, 3);
  if (version > CURRENT_SCHEMA_VERSION) {
    throw new StructureParseError(
      `This structure was saved by a newer version (schema v${version}). Update the application to open it.`
    );
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

  const activityAssignments = dedupeAssignments(
    [...parsedActivities.assignments, ...parseActivityAssignments(raw.activityAssignments)],
    a => a.activityId
  );
  const productAssignments = dedupeAssignments(
    [...parsedProducts.assignments, ...parseProductAssignments(raw.productAssignments)],
    a => a.productId
  );

  const settings = isRecord(raw.settings) ? raw.settings : {};

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
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
      expectedOwnershipTotal: Math.min(100, Math.max(1, num(settings.expectedOwnershipTotal, DEFAULT_SETTINGS.expectedOwnershipTotal)))
    }
  };
}

/** Zoom/pan stored inside the document by schema v1–v3 (`view.zoom` etc.). */
export function extractLegacyViewport(raw: unknown): { zoom: number; panX: number; panY: number } | null {
  if (!isRecord(raw) || !isRecord(raw.view)) return null;
  const v = raw.view;
  if (typeof v.zoom !== 'number') return null;
  return { zoom: num(v.zoom, 1), panX: num(v.panX, 60), panY: num(v.panY, 60) };
}

export function parseStructureJSON(json: string): StructureDocument {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new StructureParseError('The text is not valid JSON.');
  }
  return parseStructureDocument(raw);
}

export function serializeDocument(doc: StructureDocument): string {
  return JSON.stringify({ ...doc, exportedAt: new Date().toISOString() }, null, 2);
}
