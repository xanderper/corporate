/**
 * @file view-filters.ts
 * @description What each view mode shows. Hiding is display-only; data is never removed.
 */
import type { Relationship, ViewPreferences } from './types';
/** Ownership view hides arrangements (services, custody, …) unless enabled. */
export declare function isEdgeVisible(rel: Relationship, prefs: ViewPreferences): boolean;
/** Hierarchy recedes in the activities/products views so operational links stand out. */
export declare function isEdgeMuted(rel: Relationship, prefs: ViewPreferences): boolean;
export declare const VIEW_MODES: Record<ViewPreferences['mode'], {
    label: string;
    desc: string;
}>;
//# sourceMappingURL=view-filters.d.ts.map