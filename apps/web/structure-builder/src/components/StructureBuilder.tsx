'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { createEditorStore, createExternalStore } from '../lib/editor-store';
import { createEditorActions } from '../lib/editor-actions';
import { createId } from '../lib/model';
import { instantiateTemplate } from '../lib/templates';
import { loadDocument, loadViewport, saveViewport, type StorageLike } from '../lib/persistence';
import type { ViewTransform } from '../lib/layout';
import { EditorContext, useUi, type EditorContextValue } from './editor-context';
import { INITIAL_UI_STATE, createUiActions, type ModalName, type UiState } from './ui-state';
import { useAutosave } from './use-autosave';
import { StructureCanvas } from './canvas/StructureCanvas';
import { Sidebar } from './sidebar/Sidebar';
import { Topbar } from './layout/Topbar';
import { Toast } from './layout/Toast';

// Dialogs are only needed on demand; keep them (and the exporter) out of the initial bundle.
const MODALS: Record<ModalName, React.ComponentType> = {
  command: dynamic(() => import('./modals/CommandPalette')),
  export: dynamic(() => import('./modals/ExportModal')),
  import: dynamic(() => import('./modals/ImportModal')),
  templates: dynamic(() => import('./modals/TemplatesModal')),
  shortcuts: dynamic(() => import('./modals/ShortcutsModal'))
};

function getStorage(): StorageLike | null {
  try {
    const probe = '__virex_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Reads persisted state once. Runs only in the browser (this tree is loaded with ssr: false). */
function initialise() {
  const storage = getStorage();
  const loaded = storage ? loadDocument(storage) : ({ status: 'empty' } as const);
  const doc = loaded.status === 'loaded' ? loaded.doc : instantiateTemplate('qorve');
  const storedViewport = storage ? loadViewport(storage) : null;
  const viewport = storedViewport ?? (loaded.status === 'loaded' ? loaded.legacyViewport : null);

  let startupNotice: string | null = null;
  if (!storage) startupNotice = 'Browser storage is unavailable — changes will not be kept. Use Export to save your work.';
  else if (loaded.status === 'error') startupNotice = 'The saved structure could not be read. A backup copy was kept in browser storage; started from the template.';
  else if (loaded.status === 'loaded' && loaded.migratedFrom !== null) startupNotice = `Upgraded a structure saved by an earlier version (schema v${loaded.migratedFrom}).`;

  return {
    storage,
    store: createEditorStore(doc),
    ui: createExternalStore<UiState>(INITIAL_UI_STATE),
    viewport: createExternalStore<ViewTransform>(viewport ?? { zoom: 1, panX: 60, panY: 60 }),
    fitOnMount: viewport === null,
    sessionId: createId('session'),
    savedRevision: loaded.status === 'loaded' ? loaded.meta.revision : 0,
    savedDoc: loaded.status === 'loaded' && loaded.migratedFrom === null ? loaded.doc : null,
    startupNotice
  };
}

export default function StructureBuilder() {
  const [init] = useState(initialise);
  const { store, ui, viewport, storage } = init;

  const uiActions = useMemo(() => createUiActions(ui), [ui]);
  const actions = useMemo(() => createEditorActions(store, uiActions.notify), [store, uiActions]);
  const persistence = useAutosave({
    store,
    ui,
    uiActions,
    storage,
    sessionId: init.sessionId,
    initialRevision: init.savedRevision,
    initialSavedDoc: init.savedDoc
  });

  const context = useMemo<EditorContextValue>(
    () => ({ store, actions, ui, uiActions, viewport, persistence }),
    [store, actions, ui, uiActions, viewport, persistence]
  );

  useEffect(() => {
    if (init.startupNotice) uiActions.notify({ message: init.startupNotice });
  }, [init.startupNotice, uiActions]);

  // Persist zoom/pan as a view preference, separately from the document and its history.
  useEffect(() => {
    if (!storage) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = viewport.subscribe(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => saveViewport(storage, viewport.getState()), 400);
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [storage, viewport]);

  return (
    <EditorContext.Provider value={context}>
      <div className="app-container">
        <Topbar />
        <main className="app-body">
          <StructureCanvas fitOnMount={init.fitOnMount} />
          <Sidebar />
        </main>
        <ActiveModal />
        <Toast />
      </div>
    </EditorContext.Provider>
  );
}

function ActiveModal() {
  const modal = useUi(s => s.modal);
  if (!modal) return null;
  const Component = MODALS[modal];
  return <Component />;
}
