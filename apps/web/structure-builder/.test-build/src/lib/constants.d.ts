/**
 * @file constants.ts
 * @description Registries (entity types, relationship kinds, statuses, licence types)
 * and default preferences. Registries are plain data so new legal forms, licence
 * types or categories can be added without touching rendering or validation code.
 */
import type { ActivityRole, ActivityStatus, ColorTheme, EntityStatus, LicenceStatus, ProductRole, ProductStatus, RelationshipKind, StructureSettings, ViewPreferences } from './types';
export declare const STORAGE_KEY = "virex_structure_builder_v4";
export declare const VIEWPORT_STORAGE_KEY = "virex_structure_builder_viewport_v1";
/** Keys written by earlier versions; read once for backward compatibility. */
export declare const LEGACY_STORAGE_KEYS: string[];
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
export declare const ENTITY_TYPES: Record<string, EntityTypeDefinition>;
/** Legacy type keys mapped onto their v4 equivalent during migration. */
export declare const LEGACY_ENTITY_TYPE_ALIASES: Record<string, string>;
export declare function getEntityType(type: string): EntityTypeDefinition;
export declare const ENTITY_STATUSES: Record<EntityStatus, {
    label: string;
}>;
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
export declare const RELATIONSHIP_KINDS: Record<RelationshipKind, RelationshipKindDefinition>;
export declare const RELATIONSHIP_KIND_KEYS: RelationshipKind[];
export declare function isHierarchicalKind(kind: RelationshipKind): boolean;
export declare const ACTIVITY_CATEGORIES: string[];
export declare const ACTIVITY_STATUSES: Record<ActivityStatus, {
    label: string;
    color: string;
}>;
export declare const ACTIVITY_ROLES: Record<ActivityRole, {
    label: string;
    marker: string;
    desc: string;
}>;
/** Suggested activity definitions offered in quick create. */
export declare const ACTIVITY_PRESETS: {
    name: string;
    category: string;
    requiresLicence: boolean;
    requiredLicenceType?: string;
}[];
export declare const PRODUCT_STATUSES: Record<ProductStatus, {
    label: string;
    color: string;
}>;
export declare const PRODUCT_ROLES: Record<ProductRole, {
    label: string;
    marker: string;
    desc: string;
}>;
export declare const LICENCE_STATUSES: Record<LicenceStatus, {
    label: string;
    color: string;
    inForce: boolean;
    pending: boolean;
}>;
/**
 * Configurable licence type metadata. These are suggestions, not an exhaustive or
 * authoritative list: any free-text licence type is accepted.
 */
export declare const LICENCE_TYPES: Record<string, {
    label: string;
    defaultAuthority?: string;
}>;
export declare function getLicenceTypeLabel(type: string | undefined): string;
export declare const REGULATORY_AUTHORITIES: string[];
export declare const NODE_COLOR_PRESETS: Record<ColorTheme, {
    label: string;
    hex: string;
    bg: string;
    border: string;
}>;
export declare const COLOR_THEMES: ColorTheme[];
export declare const DEFAULT_PREFERENCES: ViewPreferences;
export declare const DEFAULT_SETTINGS: StructureSettings;
export declare const CARD_BASE_HEIGHT = 84;
export declare const ZOOM_MIN = 0.2;
export declare const ZOOM_MAX = 2.5;
//# sourceMappingURL=constants.d.ts.map