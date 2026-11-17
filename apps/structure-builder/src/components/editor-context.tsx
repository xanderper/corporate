'use client';

import { createContext, useContext, useRef, useSyncExternalStore } from 'react';
import type { EditorState, EditorStore, ExternalStore } from '../lib/editor-store';
import type { EditorActions } from '../lib/editor-actions';
import type { ViewTransform } from '../lib/layout';
import type { UiActions, UiState } from './ui-state';

export interface PersistenceControls {
  retry(): void;
  loadLatest(): void;
  keepMine(): void;
}

export interface EditorContextValue {
  store: EditorStore;
  actions: EditorActions;
  ui: ExternalStore<UiState>;
  uiActions: UiActions;
  viewport: ExternalStore<ViewTransform>;
  persistence: PersistenceControls;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('Editor hooks must be used inside <StructureBuilder>.');
  return ctx;
}

/**
 * Subscribes to a slice of an external store. The component re-renders only when the
 * selected value changes according to `isEqual`, which keeps e.g. every entity card
 * from re-rendering while another card is dragged.
 */
export function useStoreSelector<S, T>(
  store: ExternalStore<S>,
  selector: (state: S) => T,
  isEqual: (a: T, b: T) => boolean = Object.is
): T {
  const cache = useRef<{ state: S; selector: (state: S) => T; value: T } | null>(null);
  const getSnapshot = () => {
    const state = store.getState();
    const c = cache.current;
    if (c && c.state === state && c.selector === selector) return c.value;
    const value = selector(state);
    if (c && isEqual(c.value, value)) {
      cache.current = { state, selector, value: c.value };
      return c.value;
    }
    cache.current = { state, selector, value };
    return value;
  };
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

export function useEditor<T>(selector: (state: EditorState) => T, isEqual?: (a: T, b: T) => boolean): T {
  return useStoreSelector(useEditorContext().store, selector, isEqual);
}

export function useUi<T>(selector: (state: UiState) => T, isEqual?: (a: T, b: T) => boolean): T {
  return useStoreSelector(useEditorContext().ui, selector, isEqual);
}

export function useViewport<T>(selector: (state: ViewTransform) => T): T {
  return useStoreSelector(useEditorContext().viewport, selector);
}

export function useActions(): EditorActions {
  return useEditorContext().actions;
}

export function useUiActions(): UiActions {
  return useEditorContext().uiActions;
}

export function shallowArrayEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  return a === b || (a.length === b.length && a.every((v, i) => Object.is(v, b[i])));
}
