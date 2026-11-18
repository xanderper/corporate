/**
 * @file ui-state.ts
 * @description Transient editor UI state (panels, dialogs, toasts, save status).
 * Never persisted with the document and never part of undo history.
 */

import type { ExternalStore } from '../lib/editor-store';
import type { Notice } from '../lib/editor-actions';
import type { RelationshipKind } from '../lib/types';

export type SidebarTab = 'inspector' | 'browse' | 'checks' | 'style';
export type EntitySection = 'overview' | 'relations' | 'activities' | 'products' | 'licences';
export type ModalName = 'command' | 'export' | 'import' | 'templates' | 'shortcuts';
export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error' | 'conflict';

export interface UiState {
  sidebarTab: SidebarTab;
  /** Only relevant on narrow screens, where the sidebar is an overlay drawer. */
  sidebarOpen: boolean;
  entitySection: EntitySection;
  modal: ModalName | null;
  quickCreateOpen: boolean;
  /** Click-to-connect mode started from the inspector (keyboard/touch friendly). */
  connect: { fromId: string; kind: RelationshipKind } | null;
  toast: (Notice & { id: number }) | null;
  save: { status: SaveStatus; message?: string; savedAt?: string };
  /** Canvas zooms to these entities when `nonce` changes. */
  focus: { ids: string[]; nonce: number } | null;
}

export const INITIAL_UI_STATE: UiState = {
  sidebarTab: 'inspector',
  sidebarOpen: false,
  entitySection: 'overview',
  modal: null,
  quickCreateOpen: false,
  connect: null,
  toast: null,
  save: { status: 'saved' },
  focus: null
};

export function createUiActions(ui: ExternalStore<UiState>) {
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  let toastSeq = 0;
  let focusSeq = 0;
  const patch = (p: Partial<UiState>) => ui.setState(s => ({ ...s, ...p }));

  return {
    patch,
    showSidebar(tab: SidebarTab) {
      patch({ sidebarTab: tab, sidebarOpen: true });
    },
    closeSidebar() {
      patch({ sidebarOpen: false });
    },
    showEntitySection(section: EntitySection) {
      patch({ sidebarTab: 'inspector', sidebarOpen: true, entitySection: section });
    },
    openModal(modal: ModalName) {
      patch({ modal, quickCreateOpen: false });
    },
    closeModal() {
      patch({ modal: null });
    },
    setQuickCreate(open: boolean) {
      patch({ quickCreateOpen: open });
    },
    startConnect(fromId: string, kind: RelationshipKind = 'ownership') {
      patch({ connect: { fromId, kind } });
    },
    cancelConnect() {
      patch({ connect: null });
    },
    notify(notice: Notice) {
      const id = ++toastSeq;
      patch({ toast: { ...notice, id } });
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => ui.setState(s => (s.toast?.id === id ? { ...s, toast: null } : s)), notice.action ? 6000 : 3000);
    },
    dismissToast() {
      patch({ toast: null });
    },
    focusEntities(ids: string[]) {
      if (ids.length) patch({ focus: { ids, nonce: ++focusSeq } });
    }
  };
}

export type UiActions = ReturnType<typeof createUiActions>;
