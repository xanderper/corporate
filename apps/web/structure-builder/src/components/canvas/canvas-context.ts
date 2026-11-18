'use client';

import { createContext, useContext } from 'react';
import type { PortPosition } from '../../lib/types';

/** Stable canvas callbacks shared with cards without prop drilling (never changes identity). */
export interface CanvasApi {
  startConnectDrag(fromId: string, port: PortPosition, event: React.PointerEvent): void;
}

export const CanvasContext = createContext<CanvasApi | null>(null);

export function useCanvasApi(): CanvasApi {
  const api = useContext(CanvasContext);
  if (!api) throw new Error('useCanvasApi must be used inside <StructureCanvas>.');
  return api;
}

/** Pointer-downs on these elements must not start a card or canvas drag. */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('button, input, select, textarea, a, label, [data-no-drag]'));
}
