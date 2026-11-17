"use strict";
/**
 * @file view-filters.ts
 * @description What each view mode shows. Hiding is display-only; data is never removed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIEW_MODES = void 0;
exports.isEdgeVisible = isEdgeVisible;
exports.isEdgeMuted = isEdgeMuted;
const constants_1 = require("./constants");
/** Ownership view hides arrangements (services, custody, …) unless enabled. */
function isEdgeVisible(rel, prefs) {
    if (prefs.mode === 'ownership')
        return (0, constants_1.isHierarchicalKind)(rel.kind) || prefs.showArrangements;
    return true;
}
/** Hierarchy recedes in the activities/products views so operational links stand out. */
function isEdgeMuted(rel, prefs) {
    return prefs.mode !== 'ownership' && (0, constants_1.isHierarchicalKind)(rel.kind);
}
exports.VIEW_MODES = {
    ownership: { label: 'Ownership', desc: 'Legal entities, shareholdings and control' },
    activities: { label: 'Activities', desc: 'Which entity performs or supports each activity, and licences' },
    products: { label: 'Products', desc: 'Products and services, their providers and dependencies' }
};
