/**
 * @file view-filters.ts
 * @description What each view mode shows. Hiding is display-only; data is never removed.
 */

import type { Relationship, ViewPreferences } from './types';
import { isHierarchicalKind } from './constants';

/** Ownership view hides arrangements (services, custody, …) unless enabled. */
export function isEdgeVisible(rel: Relationship, prefs: ViewPreferences): boolean {
  if (prefs.mode === 'ownership') return isHierarchicalKind(rel.kind) || prefs.showArrangements;
  return true;
}

/** Hierarchy recedes in the activities/products views so operational links stand out. */
export function isEdgeMuted(rel: Relationship, prefs: ViewPreferences): boolean {
  return prefs.mode !== 'ownership' && isHierarchicalKind(rel.kind);
}

export const VIEW_MODES: Record<ViewPreferences['mode'], { label: string; desc: string }> = {
  ownership: { label: 'Ownership', desc: 'Legal entities, shareholdings and control' },
  activities: { label: 'Activities', desc: 'Which entity performs or supports each activity, and licences' },
  products: { label: 'Products', desc: 'Products and services, their providers and dependencies' }
};
