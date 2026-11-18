/**
 * @file constants.ts
 * @description Registries (entity types, relationship kinds, statuses, licence types)
 * and default preferences. Registries are plain data so new legal forms, licence
 * types or categories can be added without touching rendering or validation code.
 */

import type {
  ActivityRole,
  ActivityStatus,
  ColorTheme,
  EntityStatus,
  LicenceStatus,
  ProductRole,
  ProductStatus,
  RelationshipKind,
  StructureSettings,
  ViewPreferences
} from './types';

export const STORAGE_KEY = 'virex_structure_builder_v4';
export const VIEWPORT_STORAGE_KEY = 'virex_structure_builder_viewport_v1';
/** Keys written by earlier versions; read once for backward compatibility. */
export const LEGACY_STORAGE_KEYS = ['virex_structure_builder_v3', 'org_builder_state_v3'];

// ---------------------------------------------------------------------------
// Entity types
// ---------------------------------------------------------------------------

export type EntityCategory = 'company' | 'foundation' | 'person' | 'external' | 'other';

export interface EntityTypeDefinition {
  label: string;
  short: string;
  glyph: string;
  category: EntityCategory;
  /** Has share capital, so it can be the target of share ownership. */
  hasShareCapital: boolean;
  /** Issues depositary receipts (certificaten) for shares it holds. */
  issuesCertificates?: boolean;
  desc: string;
  defaultColor: ColorTheme;
  /** Kept for backward compatibility; not offered when creating new entities. */
  legacy?: boolean;
}

export const ENTITY_TYPES: Record<string, EntityTypeDefinition> = {
  BV: {
    label: 'Besloten vennootschap (B.V.)',
    short: 'B.V.',
    glyph: '▤',
    category: 'company',
    hasShareCapital: true,
    desc: 'Dutch private company with limited liability',
    defaultColor: 'green'
  },
  NV: {
    label: 'Naamloze vennootschap (N.V.)',
    short: 'N.V.',
    glyph: '▥',
    category: 'company',
    hasShareCapital: true,
    desc: 'Dutch public limited company',
    defaultColor: 'blue'
  },
  Stichting: {
    label: 'Stichting (foundation)',
    short: 'Stichting',
    glyph: '⚖',
    category: 'foundation',
    hasShareCapital: false,
    desc: 'Independent foundation without members or shareholders, e.g. for asset segregation',
    defaultColor: 'purple'
  },
  STAK: {
    label: 'Stichting administratiekantoor (STAK)',
    short: 'STAK',
    glyph: '♧',
    category: 'foundation',
    hasShareCapital: false,
    issuesCertificates: true,
    desc: 'Holds legal title to shares and issues depositary receipts for the economic rights',
    defaultColor: 'purple'
  },
  NaturalPerson: {
    label: 'Natural person',
    short: 'Person',
    glyph: '♙',
    category: 'person',
    hasShareCapital: false,
    desc: 'Founder, shareholder, ultimate beneficial owner or director',
    defaultColor: 'amber'
  },
  ExternalOrg: {
    label: 'External organisation / partner',
    short: 'External',
    glyph: '◎',
    category: 'external',
    hasShareCapital: true,
    desc: 'Third-party bank, custodian, investor or strategic partner',
    defaultColor: 'dark'
  },
  Holding: {
    label: 'Holding company',
    short: 'Holding',
    glyph: '▤',
    category: 'company',
    hasShareCapital: true,
    desc: 'Holding vehicle (any legal form)',
    defaultColor: 'green'
  },
  Fund: {
    label: 'Fund / SPV',
    short: 'Fund',
    glyph: '⚑',
    category: 'company',
    hasShareCapital: true,
    desc: 'Investment vehicle or special purpose entity',
    defaultColor: 'amber'
  },
  Group: {
    label: 'Group / division',
    short: 'Group',
    glyph: '⬡',
    category: 'other',
    hasShareCapital: true,
    desc: 'Corporate cluster or division',
    defaultColor: 'dark'
  }
};

/** Legacy type keys mapped onto their v4 equivalent during migration. */
export const LEGACY_ENTITY_TYPE_ALIASES: Record<string, string> = {
  Person: 'NaturalPerson',
  Trust: 'STAK',
  External: 'ExternalOrg',
  Foundation: 'Stichting',
  Company: 'BV'
};

export function getEntityType(type: string): EntityTypeDefinition {
  return (
    ENTITY_TYPES[type] || {
      label: type || 'Entity',
      short: type || 'Entity',
      glyph: '▤',
      category: 'other',
      hasShareCapital: true,
      desc: 'Custom legal form',
      defaultColor: 'green'
    }
  );
}

export const ENTITY_STATUSES: Record<EntityStatus, { label: string }> = {
  planned: { label: 'Planned' },
  in_incorporation: { label: 'In incorporation' },
  active: { label: 'Active' },
  dormant: { label: 'Dormant' },
  in_liquidation: { label: 'In liquidation' },
  dissolved: { label: 'Dissolved' }
};

// ---------------------------------------------------------------------------
// Relationship kinds
// ---------------------------------------------------------------------------

export interface RelationshipKindDefinition {
  label: string;
  short: string;
  /** Defines the legal hierarchy (used for ranks in auto layout and cycle checks). */
  hierarchical: boolean;
  dash: string;
  color: string;
  desc: string;
  /** How to read `from → to` in the UI. */
  verb: string;
}

export const RELATIONSHIP_KINDS: Record<RelationshipKind, RelationshipKindDefinition> = {
  ownership: {
    label: 'Share ownership',
    short: 'Shares',
    hierarchical: true,
    dash: '',
    color: '#214c40',
    desc: 'Shareholder relationship with voting and economic rights',
    verb: 'holds shares in'
  },
  certificates: {
    label: 'Depositary receipts (certificaten)',
    short: 'Certificates',
    hierarchical: true,
    dash: '9 3 2 3',
    color: '#5c3b99',
    desc: 'Holder of depositary receipts issued by a STAK',
    verb: 'holds depositary receipts of'
  },
  control: {
    label: 'Governance & control',
    short: 'Control',
    hierarchical: true,
    dash: '2 4',
    color: '#8c5b16',
    desc: 'Board appointment, voting agreement or other control right',
    verb: 'controls'
  },
  financing: {
    label: 'Financing',
    short: 'Financing',
    hierarchical: false,
    dash: '5 5',
    color: '#476a73',
    desc: 'Intercompany loan, credit facility or shareholder funding',
    verb: 'finances'
  },
  service: {
    label: 'Intercompany services',
    short: 'Services',
    hierarchical: false,
    dash: '4 4',
    color: '#1e4d7a',
    desc: 'Service agreement, IP licence or outsourcing',
    verb: 'provides services to'
  },
  personnel: {
    label: 'Personnel / shared services',
    short: 'Personnel',
    hierarchical: false,
    dash: '1 4',
    color: '#4a5c54',
    desc: 'Staff secondment or shared-services arrangement',
    verb: 'provides staff to'
  },
  custody: {
    label: 'Asset custody',
    short: 'Custody',
    hierarchical: false,
    dash: '8 3',
    color: '#5c3b99',
    desc: 'Safekeeping of client assets (e.g. by a segregation foundation)',
    verb: 'holds assets in custody for'
  },
  partner: {
    label: 'External partnership',
    short: 'Partner',
    hierarchical: false,
    dash: '3 3 8 3',
    color: '#677e74',
    desc: 'Commercial or strategic relationship with an external party',
    verb: 'partners with'
  }
};

export const RELATIONSHIP_KIND_KEYS = Object.keys(RELATIONSHIP_KINDS) as RelationshipKind[];

export function isHierarchicalKind(kind: RelationshipKind): boolean {
  return RELATIONSHIP_KINDS[kind].hierarchical;
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export const ACTIVITY_CATEGORIES = [
  'Financial services',
  'Payments',
  'Crypto-assets',
  'Lending & credit',
  'Custody & treasury',
  'Technology & infrastructure',
  'Compliance, risk & legal',
  'Operations & administration',
  'Commercial & distribution',
  'Corporate & holding'
];

export const ACTIVITY_STATUSES: Record<ActivityStatus, { label: string; color: string }> = {
  operational: { label: 'Operational', color: '#2d6b55' },
  in_development: { label: 'In development', color: '#c98216' },
  planned: { label: 'Planned', color: '#5a6b63' },
  paused: { label: 'Paused', color: '#8c5b16' },
  discontinued: { label: 'Discontinued', color: '#942b32' }
};

export const ACTIVITY_ROLES: Record<ActivityRole, { label: string; marker: string; desc: string }> = {
  performs: {
    label: 'Performs',
    marker: '●',
    desc: 'Carries out the activity and is responsible for it'
  },
  supports: {
    label: 'Supports',
    marker: '○',
    desc: 'Provides software, staff or operational support only'
  }
};

/** Suggested activity definitions offered in quick create. */
export const ACTIVITY_PRESETS: { name: string; category: string; requiresLicence: boolean; requiredLicenceType?: string }[] = [
  { name: 'Banking', category: 'Financial services', requiresLicence: true, requiredLicenceType: 'credit_institution' },
  { name: 'Accepting deposits', category: 'Financial services', requiresLicence: true, requiredLicenceType: 'credit_institution' },
  { name: 'Payment services', category: 'Payments', requiresLicence: true, requiredLicenceType: 'payment_institution' },
  { name: 'Crypto-asset custody', category: 'Crypto-assets', requiresLicence: true, requiredLicenceType: 'mica_casp' },
  { name: 'Crypto exchange', category: 'Crypto-assets', requiresLicence: true, requiredLicenceType: 'mica_casp' },
  { name: 'Wallet services', category: 'Payments', requiresLicence: false },
  { name: 'Merchant services', category: 'Payments', requiresLicence: false },
  { name: 'Checkout operations', category: 'Payments', requiresLicence: false },
  { name: 'Lending and credit services', category: 'Lending & credit', requiresLicence: true, requiredLicenceType: 'credit_institution' },
  { name: 'Customer onboarding', category: 'Compliance, risk & legal', requiresLicence: false },
  { name: 'KYC and transaction monitoring', category: 'Compliance, risk & legal', requiresLicence: false },
  { name: 'Compliance and risk management', category: 'Compliance, risk & legal', requiresLicence: false },
  { name: 'Treasury operations', category: 'Custody & treasury', requiresLicence: false },
  { name: 'Software development', category: 'Technology & infrastructure', requiresLicence: false },
  { name: 'ICT infrastructure', category: 'Technology & infrastructure', requiresLicence: false },
  { name: 'Intellectual property management', category: 'Technology & infrastructure', requiresLicence: false },
  { name: 'Shared personnel services', category: 'Operations & administration', requiresLicence: false }
];

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const PRODUCT_STATUSES: Record<ProductStatus, { label: string; color: string }> = {
  concept: { label: 'Concept', color: '#5a6b63' },
  in_development: { label: 'In development', color: '#c98216' },
  live: { label: 'Live', color: '#2d6b55' },
  deprecated: { label: 'Deprecated', color: '#942b32' }
};

export const PRODUCT_ROLES: Record<ProductRole, { label: string; marker: string; desc: string }> = {
  provider: {
    label: 'Provider',
    marker: '◆',
    desc: 'Offers the product to customers and is the contracting party'
  },
  dependency: {
    label: 'Dependency',
    marker: '◇',
    desc: 'The product depends on this entity without it legally providing the product'
  }
};

// ---------------------------------------------------------------------------
// Licences
// ---------------------------------------------------------------------------

export const LICENCE_STATUSES: Record<LicenceStatus, { label: string; color: string; inForce: boolean; pending: boolean }> = {
  planned: { label: 'Planned', color: '#5a6b63', inForce: false, pending: true },
  in_preparation: { label: 'In preparation', color: '#8c5b16', inForce: false, pending: true },
  submitted: { label: 'Submitted', color: '#1e4d7a', inForce: false, pending: true },
  granted: { label: 'Granted', color: '#2d6b55', inForce: true, pending: false },
  suspended: { label: 'Suspended', color: '#942b32', inForce: false, pending: false },
  expired: { label: 'Expired', color: '#942b32', inForce: false, pending: false },
  rejected: { label: 'Rejected', color: '#942b32', inForce: false, pending: false },
  withdrawn: { label: 'Withdrawn', color: '#73847c', inForce: false, pending: false }
};

/**
 * Configurable licence type metadata. These are suggestions, not an exhaustive or
 * authoritative list: any free-text licence type is accepted.
 */
export const LICENCE_TYPES: Record<string, { label: string; defaultAuthority?: string }> = {
  credit_institution: { label: 'Banking licence (credit institution)', defaultAuthority: 'De Nederlandsche Bank (DNB) / ECB' },
  payment_institution: { label: 'Payment institution licence (PSD2)', defaultAuthority: 'De Nederlandsche Bank (DNB)' },
  emoney_institution: { label: 'Electronic money institution licence', defaultAuthority: 'De Nederlandsche Bank (DNB)' },
  mica_casp: { label: 'Crypto-asset service provider (MiCA)', defaultAuthority: 'Autoriteit Financiële Markten (AFM)' },
  investment_firm: { label: 'Investment firm licence (MiFID II)', defaultAuthority: 'Autoriteit Financiële Markten (AFM)' },
  consumer_credit: { label: 'Consumer credit licence', defaultAuthority: 'Autoriteit Financiële Markten (AFM)' },
  trust_office: { label: 'Trust office licence', defaultAuthority: 'De Nederlandsche Bank (DNB)' },
  registration: { label: 'Registration / notification', defaultAuthority: '' }
};

export function getLicenceTypeLabel(type: string | undefined): string {
  if (!type) return '';
  return LICENCE_TYPES[type]?.label ?? type;
}

export const REGULATORY_AUTHORITIES = [
  'De Nederlandsche Bank (DNB)',
  'De Nederlandsche Bank (DNB) / ECB',
  'Autoriteit Financiële Markten (AFM)',
  'European Central Bank (ECB)',
  'Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin)',
  'Financial Conduct Authority (FCA)',
  'Commission de Surveillance du Secteur Financier (CSSF)',
  'Central Bank of Ireland (CBI)',
  'Swiss Financial Market Supervisory Authority (FINMA)'
];

// ---------------------------------------------------------------------------
// Appearance & defaults
// ---------------------------------------------------------------------------

export const NODE_COLOR_PRESETS: Record<ColorTheme, { label: string; hex: string; bg: string; border: string }> = {
  green: { label: 'Forest green', hex: '#214c40', bg: '#eaf5f0', border: '#b6d9ca' },
  blue: { label: 'Steel blue', hex: '#1e4d7a', bg: '#eaf3ff', border: '#b8d4f8' },
  purple: { label: 'Royal purple', hex: '#5c3b99', bg: '#f4efff', border: '#d5c4ff' },
  dark: { label: 'Deep forest', hex: '#16201c', bg: '#1c2b25', border: '#2a473d' },
  amber: { label: 'Amber', hex: '#8c5b16', bg: '#fff8eb', border: '#ebd09e' },
  ruby: { label: 'Ruby', hex: '#942b32', bg: '#fdf0f1', border: '#f0bec3' }
};

export const COLOR_THEMES = Object.keys(NODE_COLOR_PRESETS) as ColorTheme[];

export const DEFAULT_PREFERENCES: ViewPreferences = {
  mode: 'ownership',
  layoutDirection: 'TB',
  cardWidth: 200,
  connectionStyle: 'elbow',
  gridStyle: 'dots',
  snapToGrid: true,
  gridSize: 10,
  showArrangements: true,
  showLicenceBadges: true
};

export const DEFAULT_SETTINGS: StructureSettings = {
  expectedOwnershipTotal: 100
};

export const CARD_BASE_HEIGHT = 84;
export const ZOOM_MIN = 0.2;
export const ZOOM_MAX = 2.5;
