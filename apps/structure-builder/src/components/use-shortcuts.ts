'use client';

import { useEffect } from 'react';
import { useEditorContext } from './editor-context';

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

export const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: '⌘K', desc: 'Command palette and search' },
  { keys: 'N', desc: 'Quick create' },
  { keys: '⌘Z / ⌘⇧Z', desc: 'Undo / redo' },
  { keys: 'Delete', desc: 'Delete the selection' },
  { keys: '⌘D', desc: 'Duplicate selected entities' },
  { keys: 'Arrow keys', desc: 'Nudge selected entities (Shift: 10×)' },
  { keys: 'F', desc: 'Fit structure to screen' },
  { keys: 'Shift F', desc: 'Zoom to selection' },
  { keys: '+ / − / 0', desc: 'Zoom in / out / reset to 100%' },
  { keys: '1 / 2 / 3', desc: 'Ownership / activities / products view' },
  { keys: 'L', desc: 'Auto layout' },
  { keys: 'Esc', desc: 'Cancel connecting, close dialog or clear selection' },
  { keys: 'Drag background', desc: 'Pan (also middle mouse or Space + drag)' },
  { keys: 'Scroll / pinch', desc: 'Zoom around the cursor' },
  { keys: 'Shift click', desc: 'Add entity to selection' },
  { keys: '?', desc: 'Show keyboard shortcuts' }
];

/** Global editor keyboard shortcuts; ignored while typing in form fields. */
export function useEditorShortcuts(canvas: { fit(): void; zoomBy(factor: number): void; resetZoom(): void }) {
  const { store, actions, ui, uiActions } = useEditorContext();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key;

      if (mod && key.toLowerCase() === 'k') {
        e.preventDefault();
        if (ui.getState().modal === 'command') uiActions.closeModal();
        else uiActions.openModal('command');
        return;
      }
      if (key === 'Escape') {
        const s = ui.getState();
        if (s.modal) uiActions.closeModal();
        else if (s.quickCreateOpen) uiActions.setQuickCreate(false);
        else if (s.connect) uiActions.cancelConnect();
        else if (!isEditableTarget(e.target)) actions.clearSelection();
        return;
      }
      if (ui.getState().modal || isEditableTarget(e.target)) return;

      if (mod && key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) actions.redo();
        else actions.undo();
        return;
      }
      if (mod && key.toLowerCase() === 'y') {
        e.preventDefault();
        actions.redo();
        return;
      }

      const sel = store.getState().selection;
      if (mod && key.toLowerCase() === 'd') {
        if (sel?.type === 'entity') {
          e.preventDefault();
          actions.duplicateEntities(sel.ids);
        }
        return;
      }
      if (mod || e.altKey) return;

      if (key === 'Delete' || key === 'Backspace') {
        if (!sel) return;
        e.preventDefault();
        switch (sel.type) {
          case 'entity': actions.deleteEntities(sel.ids); break;
          case 'relationship': actions.deleteRelationship(sel.id); break;
          case 'group': actions.deleteGroup(sel.id); break;
          case 'activity': actions.deleteActivity(sel.id); break;
          case 'product': actions.deleteProduct(sel.id); break;
          case 'licence': actions.deleteLicence(sel.id); break;
        }
        return;
      }
      if (key.startsWith('Arrow') && sel?.type === 'entity') {
        e.preventDefault();
        const step = e.shiftKey ? 50 : store.getState().doc.preferences.gridSize;
        const dx = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0;
        const dy = key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0;
        actions.nudgeSelection(dx, dy);
        return;
      }
      switch (key) {
        case 'f':
          canvas.fit();
          break;
        case 'F':
          if (sel?.type === 'entity') uiActions.focusEntities(sel.ids);
          break;
        case '+':
        case '=':
          canvas.zoomBy(1.2);
          break;
        case '-':
          canvas.zoomBy(1 / 1.2);
          break;
        case '0':
          canvas.resetZoom();
          break;
        case '1':
          actions.setPreferences({ mode: 'ownership' });
          break;
        case '2':
          actions.setPreferences({ mode: 'activities' });
          break;
        case '3':
          actions.setPreferences({ mode: 'products' });
          break;
        case 'l':
        case 'L':
          actions.autoLayout();
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          uiActions.setQuickCreate(true);
          break;
        case '?':
          uiActions.openModal('shortcuts');
          break;
        default:
          return;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store, actions, ui, uiActions, canvas]);
}
