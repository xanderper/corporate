/**
 * @file types.ts
 * @description Domain types for the Corporate Structure Builder (schema v4).
 *
 * The document separates five concepts that earlier schemas blended together:
 *   - legal entities (canvas nodes)
 *   - typed relationships between entities (canvas edges)
 *   - reusable business activities + per-entity activity assignments
 *   - products/services + per-entity product assignments
 *   - licences/permissions, linked to a holder entity and the activities they cover
 *
 * Transient UI state (selection, zoom, pan, open panels) is deliberately not part of
 * `StructureDocument`; see `editor-store.ts` and `viewport.ts`.
 */

// ---------------------------------------------------------------------------
// Legal entities
// ---------------------------------------------------------------------------

export type BuiltInEntityType =
  | 'BV'
  | 'NV'
  | 'Stichting'
  | 'STAK'
  | 'NaturalPerson'
  | 'ExternalOrg'
  | 'Holding'
  | 'Fund'
  | 'Group';

/** Built-in legal forms plus any custom legal form string (extensible). */
export type EntityType = BuiltInEntityType | (string & {});

export type ColorTheme = 'green' | 'blue' | 'purple' | 'dark' | 'amber' | 'ruby';

export type EntityStatus =
  | 'planned'
  | 'in_incorporation'
  | 'active'
  | 'dormant'
  | 'in_liquidation'
  | 'dissolved';

export interface LegalEntity {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  color: ColorTheme;
  description?: string;
  jurisdiction?: string;
  regNumber?: string;
  taxNumber?: string;
  incorporationDate?: string;
  notes?: string;
  /** Document references (file names, URLs or registry references), one per entry. */
  documents?: string[];
  x: number;
  y: number;
  locked?: boolean;
}

// ---------------------------------------------------------------------------
// Relationships (canvas edges)
// ---------------------------------------------------------------------------

/**
 * Direction convention for every kind: `from` is the holder/provider, `to` is the
 * held entity/recipient. For `certificates`, `from` holds depositary receipts issued
 * by the STAK in `to`.
 */
export type RelationshipKind =
  | 'ownership'
  | 'certificates'
  | 'control'
  | 'financing'
  | 'service'
  | 'personnel'
  | 'custody'
  | 'partner';

export type ArrangementKind = Extract<
  RelationshipKind,
  'financing' | 'service' | 'personnel' | 'custody' | 'partner'
>;

export type LineRouting = 'auto' | 'elbow' | 'bezier' | 'straight';
export type ConnectionStyle = Exclude<LineRouting, 'auto'>;
export type PortPosition = 'auto' | 'top' | 'bottom' | 'left' | 'right';

interface RelationshipBase {
  id: string;
  from: string;
  to: string;
  notes?: string;
  routing?: LineRouting;
  fromPort?: PortPosition;
  toPort?: PortPosition;
  /** Manual vertical offset of the routed mid-segment (canvas units). */
  midOffset?: number;
}

export interface OwnershipRelationship extends RelationshipBase {
  kind: 'ownership';
  sharePct: number | null;
  votingPct: number | null;
  economicPct: number | null;
  shareClass?: string;
}

export interface CertificateRelationship extends RelationshipBase {
  kind: 'certificates';
  /** Share of the depositary receipts issued by the STAK held by `from`. */
  certificatePct: number | null;
}

export interface ControlRelationship extends RelationshipBase {
  kind: 'control';
  votingPct: number | null;
  role: string;
}

export interface ArrangementRelationship extends RelationshipBase {
  kind: ArrangementKind;
  description: string;
  agreementRef?: string;
  startDate?: string;
}

export type Relationship =
  | OwnershipRelationship
  | CertificateRelationship
  | ControlRelationship
  | ArrangementRelationship;

/** Loose patch accepted by `normalizeRelationship`; the result is always a valid union member. */
export type RelationshipPatch = Partial<{
  from: string;
  to: string;
  kind: RelationshipKind;
  notes: string;
  routing: LineRouting;
  fromPort: PortPosition;
  toPort: PortPosition;
  midOffset: number;
  sharePct: number | null;
  votingPct: number | null;
  economicPct: number | null;
  shareClass: string;
  certificatePct: number | null;
  role: string;
  description: string;
  agreementRef: string;
  startDate: string;
}>;

// ---------------------------------------------------------------------------
// Groups (visual clusters only — no legal meaning)
// ---------------------------------------------------------------------------

export interface GroupCluster {
  id: string;
  name: string;
  color?: ColorTheme;
  x: number;
  y: number;
  w: number;
  h: number;
  members: string[];
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export type ActivityStatus =
  | 'planned'
  | 'in_development'
  | 'operational'
  | 'paused'
  | 'discontinued';

export interface BusinessActivity {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: ActivityStatus;
  startDate?: string;
  endDate?: string;
  /** Configured as requiring a licence/permission before it may be performed. */
  requiresLicence: boolean;
  /** Optional licence type key (see LICENCE_TYPES) or free text. */
  requiredLicenceType?: string;
  regulatoryRequirements?: string;
  relatedActivityIds: string[];
  notes?: string;
}

/**
 * `performs`: the entity carries out the activity and is legally responsible for it
 *             (for a regulated activity: the entity that needs the authorisation).
 * `supports`: the entity only provides software, staff or operational support.
 */
export type ActivityRole = 'performs' | 'supports';

export interface ActivityAssignment {
  id: string;
  activityId: string;
  entityId: string;
  role: ActivityRole;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Products & services
// ---------------------------------------------------------------------------

export type ProductStatus = 'concept' | 'in_development' | 'live' | 'deprecated';

export interface Product {
  id: string;
  name: string;
  description?: string;
  status: ProductStatus;
  /** Underlying activities the product relies on. */
  activityIds: string[];
  notes?: string;
}

/**
 * `provider`: the entity offers the product/service to customers (contracting party).
 * `dependency`: the product depends on the entity without it legally providing it.
 */
export type ProductRole = 'provider' | 'dependency';

export interface ProductAssignment {
  id: string;
  productId: string;
  entityId: string;
  role: ProductRole;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Licences & permissions
// ---------------------------------------------------------------------------

export type LicenceStatus =
  | 'planned'
  | 'in_preparation'
  | 'submitted'
  | 'granted'
  | 'suspended'
  | 'expired'
  | 'rejected'
  | 'withdrawn';

export interface Licence {
  id: string;
  name: string;
  /** Licence type key (see LICENCE_TYPES) or custom free text. */
  licenceType: string;
  authority: string;
  holderEntityId: string | null;
  status: LicenceStatus;
  reference?: string;
  applicationDate?: string;
  grantDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  /** Activities this licence (once granted) is intended to cover. */
  activityIds: string[];
  documents: string[];
  notes?: string;
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export type ViewMode = 'ownership' | 'activities' | 'products';
export type LayoutDirection = 'TB' | 'LR';
export type GridStyle = 'dots' | 'lines' | 'blank';

/** Saved view preferences (intentionally persisted with the document). */
export interface ViewPreferences {
  mode: ViewMode;
  layoutDirection: LayoutDirection;
  cardWidth: number;
  connectionStyle: ConnectionStyle;
  gridStyle: GridStyle;
  snapToGrid: boolean;
  gridSize: number;
  /** Show service/financing/custody/... relationships in the ownership view. */
  showArrangements: boolean;
  showLicenceBadges: boolean;
}

export interface StructureSettings {
  /** Expected sum of share percentages for an entity with share capital. */
  expectedOwnershipTotal: number;
}

export const CURRENT_SCHEMA_VERSION = 4;

export interface StructureDocument {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  chartTitle: string;
  chartSubtitle: string;
  entities: LegalEntity[];
  relationships: Relationship[];
  groups: GroupCluster[];
  activities: BusinessActivity[];
  activityAssignments: ActivityAssignment[];
  products: Product[];
  productAssignments: ProductAssignment[];
  licences: Licence[];
  preferences: ViewPreferences;
  settings: StructureSettings;
}

// ---------------------------------------------------------------------------
// Editor references & diagnostics
// ---------------------------------------------------------------------------

export type ItemType = 'entity' | 'relationship' | 'group' | 'activity' | 'product' | 'licence';

export interface ItemRef {
  type: ItemType;
  id: string;
}

export type Selection =
  | null
  | { type: 'entity'; ids: string[] }
  | { type: Exclude<ItemType, 'entity'>; id: string };

export type DiagnosticSeverity = 'error' | 'warning' | 'regulatory' | 'info';

export interface Diagnostic {
  id: string;
  ruleId: string;
  severity: DiagnosticSeverity;
  title: string;
  message: string;
  target: ItemRef | null;
  remediation?: string;
}
