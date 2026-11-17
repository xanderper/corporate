"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.COALESCE_WINDOW_MS = exports.HISTORY_LIMIT = void 0;
exports.createExternalStore = createExternalStore;
exports.createEditorStore = createEditorStore;
exports.sameSelection = sameSelection;
exports.pruneSelection = pruneSelection;
function createExternalStore(initial) {
    let state = initial;
    const listeners = new Set();
    return {
        getState: () => state,
        setState(next) {
            const value = typeof next === 'function' ? next(state) : next;
            if (Object.is(value, state))
                return;
            state = value;
            listeners.forEach(l => l());
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
}
exports.HISTORY_LIMIT = 100;
exports.COALESCE_WINDOW_MS = 1200;
function createEditorStore(initialDoc, now = Date.now) {
    const store = createExternalStore({
        doc: initialDoc,
        selection: null,
        past: [],
        future: [],
        revision: 0
    });
    let lastCoalesce = null;
    const pushPast = (past, entry) => {
        const next = [...past, entry];
        return next.length > exports.HISTORY_LIMIT ? next.slice(next.length - exports.HISTORY_LIMIT) : next;
    };
    return {
        ...store,
        commit(recipe, options = {}) {
            const state = store.getState();
            const nextDoc = recipe(state.doc);
            if (nextDoc === state.doc) {
                if (options.select !== undefined)
                    store.setState({ ...state, selection: options.select });
                return false;
            }
            const t = now();
            const coalesced = options.coalesce !== undefined &&
                lastCoalesce !== null &&
                lastCoalesce.key === options.coalesce &&
                t - lastCoalesce.at < exports.COALESCE_WINDOW_MS;
            lastCoalesce = options.coalesce !== undefined ? { key: options.coalesce, at: t } : null;
            const recordHistory = options.history !== false && !coalesced;
            store.setState({
                doc: nextDoc,
                selection: options.select !== undefined ? options.select : state.selection,
                past: recordHistory
                    ? pushPast(state.past, { doc: state.doc, selection: state.selection, label: options.label ?? 'Edit' })
                    : state.past,
                // Any new change invalidates the redo stack.
                future: state.future.length ? [] : state.future,
                revision: state.revision + 1
            });
            return true;
        },
        checkpoint(label) {
            lastCoalesce = null;
            const state = store.getState();
            store.setState({
                ...state,
                past: pushPast(state.past, { doc: state.doc, selection: state.selection, label }),
                future: []
            });
        },
        select(selection) {
            const state = store.getState();
            if (sameSelection(state.selection, selection))
                return;
            store.setState({ ...state, selection });
        },
        undo() {
            lastCoalesce = null;
            const state = store.getState();
            const entry = state.past[state.past.length - 1];
            if (!entry)
                return null;
            store.setState({
                doc: entry.doc,
                selection: pruneSelection(entry.selection, entry.doc),
                past: state.past.slice(0, -1),
                future: [{ doc: state.doc, selection: state.selection, label: entry.label }, ...state.future],
                revision: state.revision + 1
            });
            return entry;
        },
        redo() {
            lastCoalesce = null;
            const state = store.getState();
            const entry = state.future[0];
            if (!entry)
                return null;
            store.setState({
                doc: entry.doc,
                selection: pruneSelection(entry.selection, entry.doc),
                past: pushPast(state.past, { doc: state.doc, selection: state.selection, label: entry.label }),
                future: state.future.slice(1),
                revision: state.revision + 1
            });
            return entry;
        },
        replace(doc, options = {}) {
            lastCoalesce = null;
            const state = store.getState();
            store.setState({
                doc,
                selection: null,
                past: options.resetHistory ? [] : pushPast(state.past, { doc: state.doc, selection: state.selection, label: options.label ?? 'Replace structure' }),
                future: [],
                revision: state.revision + 1
            });
        }
    };
}
function sameSelection(a, b) {
    if (a === b)
        return true;
    if (!a || !b || a.type !== b.type)
        return false;
    if (a.type === 'entity' && b.type === 'entity') {
        return a.ids.length === b.ids.length && a.ids.every((id, i) => id === b.ids[i]);
    }
    return 'id' in a && 'id' in b && a.id === b.id;
}
/** Drops selected ids that do not exist in `doc` (e.g. after undoing a creation). */
function pruneSelection(selection, doc) {
    if (!selection)
        return null;
    switch (selection.type) {
        case 'entity': {
            const ids = selection.ids.filter(id => doc.entities.some(e => e.id === id));
            return ids.length ? { type: 'entity', ids } : null;
        }
        case 'relationship':
            return doc.relationships.some(r => r.id === selection.id) ? selection : null;
        case 'group':
            return doc.groups.some(g => g.id === selection.id) ? selection : null;
        case 'activity':
            return doc.activities.some(a => a.id === selection.id) ? selection : null;
        case 'product':
            return doc.products.some(p => p.id === selection.id) ? selection : null;
        case 'licence':
            return doc.licences.some(l => l.id === selection.id) ? selection : null;
    }
}
