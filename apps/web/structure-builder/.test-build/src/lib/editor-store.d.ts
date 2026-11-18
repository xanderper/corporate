/**
 * @file editor-store.ts
 * @description Framework-agnostic stores for the editor.
 *
 * - `createExternalStore`: minimal subscribe/getState/setState container consumed by
 *   React through `useSyncExternalStore` (see components/editor-context.tsx), so
 *   components subscribe to slices instead of re-rendering on every change.
 * - `createEditorStore`: the persistent document plus selection and undo/redo.
 *   Snapshots are the immutable documents themselves (structural sharing), so history
 *   is cheap; continuous edits (typing, dragging) are coalesced into one undo step.
 */
import type { Selection, StructureDocument } from './types';
export type Listener = () => void;
export interface ExternalStore<T> {
    getState(): T;
    setState(next: T | ((prev: T) => T)): void;
    subscribe(listener: Listener): () => void;
}
export declare function createExternalStore<T>(initial: T): ExternalStore<T>;
export interface HistoryEntry {
    doc: StructureDocument;
    selection: Selection;
    label: string;
}
export interface EditorState {
    doc: StructureDocument;
    selection: Selection;
    past: HistoryEntry[];
    future: HistoryEntry[];
    /** Incremented on every document change; used by persistence. */
    revision: number;
}
export interface CommitOptions {
    /** Human-readable label for undo/redo feedback. */
    label?: string;
    /**
     * Consecutive commits with the same key inside `COALESCE_WINDOW_MS` share one undo
     * step (e.g. typing into a field).
     */
    coalesce?: string;
    /** `false` skips history entirely (use after `checkpoint()` for drags). */
    history?: boolean;
    /** Selection to apply together with the change (part of the same undo step). */
    select?: Selection;
}
export declare const HISTORY_LIMIT = 100;
export declare const COALESCE_WINDOW_MS = 1200;
export interface EditorStore extends ExternalStore<EditorState> {
    commit(recipe: (doc: StructureDocument) => StructureDocument, options?: CommitOptions): boolean;
    /** Records the current document as an undo step without changing it. */
    checkpoint(label: string): void;
    select(selection: Selection): void;
    undo(): HistoryEntry | null;
    redo(): HistoryEntry | null;
    /** Replaces the document (load/import/template). Undoable unless `resetHistory`. */
    replace(doc: StructureDocument, options?: {
        label?: string;
        resetHistory?: boolean;
    }): void;
}
export declare function createEditorStore(initialDoc: StructureDocument, now?: () => number): EditorStore;
export declare function sameSelection(a: Selection, b: Selection): boolean;
/** Drops selected ids that do not exist in `doc` (e.g. after undoing a creation). */
export declare function pruneSelection(selection: Selection, doc: StructureDocument): Selection;
//# sourceMappingURL=editor-store.d.ts.map