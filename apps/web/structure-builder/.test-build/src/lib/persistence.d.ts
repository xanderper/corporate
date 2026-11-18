/**
 * @file persistence.ts
 * @description Browser persistence (localStorage, the application's existing storage)
 * with a versioned envelope, backward-compatible loading and optimistic concurrency:
 * a save is refused when another tab/session stored a newer revision in the meantime,
 * so newer edits are never silently overwritten.
 *
 * All functions take a `StorageLike` so they are testable without a browser.
 */
import type { StructureDocument } from './types';
import type { ViewTransform } from './layout';
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
export declare const CORRUPT_BACKUP_KEY = "virex_structure_builder_v4_unreadable_backup";
interface StoredMeta {
    revision: number;
    sessionId: string;
    savedAt: string;
}
export type LoadResult = {
    status: 'empty';
} | {
    status: 'loaded';
    doc: StructureDocument;
    meta: StoredMeta;
    migratedFrom: number | null;
    legacyViewport: ViewTransform | null;
} | {
    status: 'error';
    message: string;
};
export type SaveResult = {
    ok: true;
    revision: number;
    savedAt: string;
} | {
    ok: false;
    reason: 'conflict';
    storedRevision: number;
    savedAt: string;
} | {
    ok: false;
    reason: 'quota' | 'error';
    message: string;
};
export declare function readStoredMeta(storage: StorageLike): StoredMeta | null;
export declare function loadDocument(storage: StorageLike): LoadResult;
export declare function saveDocument(storage: StorageLike, doc: StructureDocument, baseRevision: number, sessionId: string, options?: {
    force?: boolean;
    now?: Date;
}): SaveResult;
export declare function loadViewport(storage: StorageLike): ViewTransform | null;
export declare function saveViewport(storage: StorageLike, view: ViewTransform): void;
export {};
//# sourceMappingURL=persistence.d.ts.map