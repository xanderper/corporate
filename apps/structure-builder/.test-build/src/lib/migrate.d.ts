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
import { type RelationshipKind, type StructureDocument } from './types';
export declare class StructureParseError extends Error {
    constructor(message: string);
}
type UnknownRecord = Record<string, unknown>;
export declare function isRecord(value: unknown): value is UnknownRecord;
export interface ParsedEdgeLabel {
    kind: RelationshipKind;
    pct: number | null;
    role: string;
}
export declare function parseLegacyEdgeLabel(label?: string): ParsedEdgeLabel;
/**
 * Parses any supported schema version into a v4 document.
 * @throws StructureParseError when the input is not a structure document at all.
 */
export declare function parseStructureDocument(raw: unknown): StructureDocument;
/** Zoom/pan stored inside the document by schema v1–v3 (`view.zoom` etc.). */
export declare function extractLegacyViewport(raw: unknown): {
    zoom: number;
    panX: number;
    panY: number;
} | null;
export declare function parseStructureJSON(json: string): StructureDocument;
export declare function serializeDocument(doc: StructureDocument): string;
export {};
//# sourceMappingURL=migrate.d.ts.map