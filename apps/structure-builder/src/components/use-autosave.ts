'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { EditorStore, ExternalStore } from '../lib/editor-store';
import type { StructureDocument } from '../lib/types';
import { STORAGE_KEY } from '../lib/constants';
import { loadDocument, readStoredMeta, saveDocument, type StorageLike } from '../lib/persistence';
import type { PersistenceControls } from './editor-context';
import type { UiActions, UiState } from './ui-state';

const SAVE_DELAY_MS = 700;

interface AutosaveOptions {
  store: EditorStore;
  ui: ExternalStore<UiState>;
  uiActions: UiActions;
  storage: StorageLike | null;
  sessionId: string;
  initialRevision: number;
  /** Document that is already in storage (null when nothing has been saved yet). */
  initialSavedDoc: StructureDocument | null;
}

/**
 * Debounced autosave of the document to the existing localStorage persistence.
 * - Repeated edits are written at most once per `SAVE_DELAY_MS`.
 * - A newer revision written by another tab is never overwritten silently: without
 *   local unsaved changes the newer version is loaded, otherwise status → 'conflict'.
 * - Pending changes are flushed when the page is hidden or closed.
 */
export function useAutosave(options: AutosaveOptions): PersistenceControls {
  const opts = useRef(options);
  const state = useRef({
    baseRevision: options.initialRevision,
    lastSavedDoc: options.initialSavedDoc,
    timer: null as ReturnType<typeof setTimeout> | null,
    conflict: false
  });

  const controls = useMemo<PersistenceControls & { save(force?: boolean): void }>(() => {
    const setStatus = (save: UiState['save']) => opts.current.ui.setState(s => ({ ...s, save }));

    const save = (force = false) => {
      const { store, storage, sessionId } = opts.current;
      const s = state.current;
      if (s.timer) {
        clearTimeout(s.timer);
        s.timer = null;
      }
      if (!storage) {
        setStatus({ status: 'error', message: 'Browser storage is unavailable; export the structure to keep your work.' });
        return;
      }
      const doc = store.getState().doc;
      if (doc === s.lastSavedDoc && !force) return;
      if (s.conflict && !force) return;

      setStatus({ status: 'saving' });
      const result = saveDocument(storage, doc, s.baseRevision, sessionId, { force });
      if (result.ok) {
        s.baseRevision = result.revision;
        s.lastSavedDoc = doc;
        s.conflict = false;
        setStatus({ status: 'saved', savedAt: result.savedAt });
      } else if (result.reason === 'conflict') {
        s.conflict = true;
        setStatus({ status: 'conflict', message: 'This structure was changed in another tab.' });
      } else {
        setStatus({ status: 'error', message: result.message });
      }
    };

    const loadLatest = () => {
      const { store, storage, uiActions } = opts.current;
      if (!storage) return;
      const result = loadDocument(storage);
      if (result.status !== 'loaded') {
        setStatus({ status: 'error', message: 'The newer version could not be read.' });
        return;
      }
      state.current.baseRevision = result.meta.revision;
      state.current.lastSavedDoc = result.doc;
      state.current.conflict = false;
      store.replace(result.doc, { label: 'Load newer version' });
      setStatus({ status: 'saved', savedAt: result.meta.savedAt });
      uiActions.notify({ message: 'Loaded the newer version from another tab' });
    };

    return {
      save,
      retry: () => save(false),
      loadLatest,
      keepMine: () => save(true)
    };
  }, []);

  useEffect(() => {
    opts.current = options;
  });

  useEffect(() => {
    const { store, storage, sessionId } = opts.current;
    const s = state.current;

    // Mark unsaved and schedule a write whenever the document changes.
    let lastDoc = store.getState().doc;
    if (lastDoc !== s.lastSavedDoc) {
      s.timer = setTimeout(() => controls.save(), SAVE_DELAY_MS);
    }
    const unsubscribe = store.subscribe(() => {
      const doc = store.getState().doc;
      if (doc === lastDoc) return;
      lastDoc = doc;
      if (!s.conflict) opts.current.ui.setState(u => (u.save.status === 'unsaved' ? u : { ...u, save: { status: 'unsaved' } }));
      if (s.timer) clearTimeout(s.timer);
      s.timer = setTimeout(() => controls.save(), SAVE_DELAY_MS);
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !storage) return;
      const meta = readStoredMeta(storage);
      if (!meta || meta.sessionId === sessionId || meta.revision <= s.baseRevision) return;
      const hasLocalChanges = store.getState().doc !== s.lastSavedDoc;
      if (hasLocalChanges) {
        s.conflict = true;
        opts.current.ui.setState(u => ({ ...u, save: { status: 'conflict', message: 'This structure was changed in another tab.' } }));
      } else {
        controls.loadLatest();
      }
    };
    const flush = () => {
      if (s.timer) controls.save();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      unsubscribe();
      flush();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [controls]);

  return controls;
}
