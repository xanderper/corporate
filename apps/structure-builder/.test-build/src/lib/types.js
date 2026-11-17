"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_SCHEMA_VERSION = void 0;
exports.CURRENT_SCHEMA_VERSION = 4;
