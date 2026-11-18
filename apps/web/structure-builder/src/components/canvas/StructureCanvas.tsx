'use client';

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PortPosition, RelationshipKind } from '../../lib/types';
import { CARD_BASE_HEIGHT, RELATIONSHIP_KINDS, RELATIONSHIP_KIND_KEYS } from '../../lib/constants';
import { createExternalStore, type ExternalStore } from '../../lib/editor-store';
import { defaultRelationshipKind, getEntityIndex, getEntityMap } from '../../lib/model';
import { getCardHeight, getCardHeights, getPortPosition } from '../../lib/geometry';
import { computeBounds, fitBoundsTransform, zoomAround, type ViewTransform } from '../../lib/layout';
import { VIEW_MODES } from '../../lib/view-filters';
import { shallowArrayEqual, useEditor, useEditorContext, useStoreSelector, useUi, useViewport } from '../editor-context';
import { useEditorShortcuts } from '../use-shortcuts';
import { CanvasContext, isInteractiveTarget, type CanvasApi } from './canvas-context';
import { EntityCard } from './EntityCard';
import { EdgeLayer } from './EdgeLayer';
import { GroupLayer } from './GroupLayer';

interface ConnectDraft {
  fromId: string;
  port: PortPosition;
  x: number;
  y: number;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function StructureCanvas({ fitOnMount }: { fitOnMount: boolean }) {
  const { store, actions, ui, uiActions, viewport } = useEditorContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gridStyle = useEditor(s => s.doc.preferences.gridStyle);
  const isEmpty = useEditor(s => s.doc.entities.length === 0);
  const connecting = useUi(s => s.connect !== null);
  const [draftStore] = useState(() => createExternalStore<ConnectDraft | null>(null));
  const animation = useRef(0);
  const pan = useRef<{ pointerId: number; startX: number; startY: number; origin: ViewTransform; moved: boolean; background: boolean } | null>(null);
  const spaceDown = useRef(false);

  // Pan/zoom never goes through React rendering: the stage transform is applied directly.
  useLayoutEffect(() => {
    const apply = () => {
      const v = viewport.getState();
      if (stageRef.current) stageRef.current.style.transform = `translate3d(${v.panX}px, ${v.panY}px, 0) scale(${v.zoom})`;
      if (containerRef.current) {
        containerRef.current.style.backgroundPosition = `${v.panX}px ${v.panY}px`;
        containerRef.current.style.backgroundSize = `${20 * v.zoom}px ${20 * v.zoom}px`;
      }
    };
    apply();
    return viewport.subscribe(apply);
  }, [viewport]);

  const animateTo = useCallback(
    (target: ViewTransform) => {
      cancelAnimationFrame(animation.current);
      const from = viewport.getState();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        viewport.setState(target);
        return;
      }
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 220);
        const k = easeOut(t);
        viewport.setState({
          zoom: from.zoom + (target.zoom - from.zoom) * k,
          panX: from.panX + (target.panX - from.panX) * k,
          panY: from.panY + (target.panY - from.panY) * k
        });
        if (t < 1) animation.current = requestAnimationFrame(step);
      };
      animation.current = requestAnimationFrame(step);
    },
    [viewport]
  );

  const fitTo = useCallback(
    (ids?: string[], animate = true) => {
      const el = containerRef.current;
      if (!el) return;
      const doc = store.getState().doc;
      const heights = getCardHeights(doc);
      const entities = ids ? doc.entities.filter(e => ids.includes(e.id)) : doc.entities;
      const bounds = computeBounds(entities, ids ? [] : doc.groups, doc.preferences.cardWidth, id => heights.get(id) ?? CARD_BASE_HEIGHT);
      const target = fitBoundsTransform(bounds, el.clientWidth, el.clientHeight, ids ? 120 : 60, ids ? 1.1 : 1.2);
      if (animate) animateTo(target);
      else viewport.setState(target);
    },
    [store, viewport, animateTo]
  );

  const zoomAtCentre = useCallback(
    (nextZoom: (z: number) => number) => {
      const el = containerRef.current;
      if (!el) return;
      const v = viewport.getState();
      animateTo(zoomAround(v, nextZoom(v.zoom), el.clientWidth / 2, el.clientHeight / 2));
    },
    [viewport, animateTo]
  );

  const controls = useMemo(
    () => ({
      fit: () => fitTo(),
      zoomBy: (factor: number) => zoomAtCentre(z => z * factor),
      resetZoom: () => zoomAtCentre(() => 1)
    }),
    [fitTo, zoomAtCentre]
  );
  useEditorShortcuts(controls);

  // Keyboard focus on an off-screen card makes the browser scroll this overflow-hidden
  // container. Convert that scroll into a viewport pan so the canvas never drifts.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollLeft, scrollTop } = el;
      if (!scrollLeft && !scrollTop) return;
      el.scrollLeft = 0;
      el.scrollTop = 0;
      viewport.setState(v => ({ ...v, panX: v.panX - scrollLeft, panY: v.panY - scrollTop }));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [viewport]);

  useEffect(() => {
    if (fitOnMount) fitTo(undefined, false);
  }, [fitOnMount, fitTo]);

  // Focus requests (validation issue, browse list, "zoom to selection").
  useEffect(() => {
    let lastNonce = ui.getState().focus?.nonce ?? 0;
    return ui.subscribe(() => {
      const focus = ui.getState().focus;
      if (focus && focus.nonce !== lastNonce) {
        lastNonce = focus.nonce;
        fitTo(focus.ids);
      }
    });
  }, [ui, fitTo]);

  // Wheel / pinch zoom around the cursor. Registered natively: React wheel listeners are passive.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (isInteractiveTarget(e.target) && (e.target as Element).closest('.canvas-overlay')) return;
      e.preventDefault();
      cancelAnimationFrame(animation.current);
      const rect = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015));
      viewport.setState(v => zoomAround(v, v.zoom * factor, e.clientX - rect.left, e.clientY - rect.top));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [viewport]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLElement && e.target.closest('input, textarea, select, button, [role="button"]'))) {
        spaceDown.current = true;
        containerRef.current?.classList.add('space-pan');
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDown.current = false;
        containerRef.current?.classList.remove('space-pan');
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const isBackground = (target: EventTarget | null) =>
    target === containerRef.current || target === stageRef.current || (target instanceof Element && target.classList.contains('svg-edges-layer'));

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const background = isBackground(e.target);
    if (!(e.button === 1 || (e.button === 0 && (spaceDown.current || background)))) return;
    e.preventDefault();
    cancelAnimationFrame(animation.current);
    containerRef.current?.focus({ preventScroll: true });
    pan.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, origin: viewport.getState(), moved: false, background };
    e.currentTarget.setPointerCapture(e.pointerId);
    containerRef.current?.classList.add('panning');
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    if (!p || p.pointerId !== e.pointerId) return;
    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (!p.moved && Math.hypot(dx, dy) < 3) return;
    p.moved = true;
    viewport.setState({ ...p.origin, panX: p.origin.panX + dx, panY: p.origin.panY + dy });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    if (!p || p.pointerId !== e.pointerId) return;
    pan.current = null;
    containerRef.current?.classList.remove('panning');
    if (!p.moved && p.background) {
      actions.clearSelection();
      uiActions.cancelConnect();
    }
  };

  // Drag from a port to another card to create a relationship.
  const canvasApi = useMemo<CanvasApi>(
    () => ({
      startConnectDrag(fromId, port, event) {
        const el = containerRef.current;
        if (!el) return;
        event.preventDefault();
        const toCanvas = (clientX: number, clientY: number) => {
          const rect = el.getBoundingClientRect();
          const v = viewport.getState();
          return { x: (clientX - rect.left - v.panX) / v.zoom, y: (clientY - rect.top - v.panY) / v.zoom };
        };
        draftStore.setState({ fromId, port, ...toCanvas(event.clientX, event.clientY) });
        const move = (e: PointerEvent) => draftStore.setState(d => (d ? { ...d, ...toCanvas(e.clientX, e.clientY) } : d));
        const up = (e: PointerEvent) => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          draftStore.setState(null);
          const targetEl = document.elementFromPoint(e.clientX, e.clientY);
          const portEl = targetEl?.closest<HTMLElement>('.port-handle');
          const card = targetEl?.closest<HTMLElement>('[data-entity-id]');
          const toId = card?.dataset.entityId;
          if (!toId || toId === fromId) return;
          const byId = getEntityMap(store.getState().doc.entities);
          const kind = defaultRelationshipKind(byId.get(fromId)?.type ?? 'BV', byId.get(toId)?.type ?? 'BV');

          let toPort: PortPosition = 'auto';
          if (portEl) {
            if (portEl.classList.contains('port-top')) toPort = 'top';
            else if (portEl.classList.contains('port-bottom')) toPort = 'bottom';
            else if (portEl.classList.contains('port-left')) toPort = 'left';
            else if (portEl.classList.contains('port-right')) toPort = 'right';
          }

          actions.connect(fromId, toId, kind, { fromPort: port, toPort });
          uiActions.showSidebar('inspector');
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      }
    }),
    [actions, draftStore, store, uiActions, viewport]
  );

  return (
    <CanvasContext.Provider value={canvasApi}>
      <div
        ref={containerRef}
        className={`canvas-viewport-container grid-${gridStyle}${connecting ? ' is-connecting' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        tabIndex={-1}
        aria-label="Structure canvas"
      >
        <div ref={stageRef} className="canvas-stage">
          <GroupLayer />
          <EdgeLayer />
          <DraftLine draftStore={draftStore} />
          <NodeLayer />
        </div>

        {isEmpty && <EmptyCanvas />}
        <ConnectBanner />
        <CanvasControls controls={controls} fitSelection={() => {
          const sel = store.getState().selection;
          if (sel?.type === 'entity') uiActions.focusEntities(sel.ids);
        }} />
      </div>
    </CanvasContext.Provider>
  );
}

const NodeLayer = memo(function NodeLayer() {
  const ids = useEditor(s => s.doc.entities.map(e => e.id), shallowArrayEqual);
  return (
    <div className="canvas-nodes-layer">
      {ids.map(id => (
        <EntityCard key={id} id={id} />
      ))}
    </div>
  );
});

function DraftLine({ draftStore }: { draftStore: ExternalStore<ConnectDraft | null> }) {
  const draft = useStoreSelector(draftStore, d => d);
  const from = useEditor(s => (draft ? getEntityMap(s.doc.entities).get(draft.fromId) : undefined));
  const cardWidth = useEditor(s => s.doc.preferences.cardWidth);
  const prefs = useEditor(s => s.doc.preferences);
  const index = useEditor(s => getEntityIndex(s.doc));
  if (!draft || !from) return null;
  const height = getCardHeight(prefs.mode, index.get(from.id) ?? { activities: [], products: [], licences: [] }, prefs.showLicenceBadges);
  const start = getPortPosition(from, draft.port, cardWidth, height);
  return (
    <svg className="svg-edges-layer draft-layer" aria-hidden="true">
      <path d={`M ${start.x} ${start.y} L ${draft.x} ${draft.y}`} className="connecting-draft-line" />
    </svg>
  );
}

function ConnectBanner() {
  const { uiActions } = useEditorContext();
  const connect = useUi(s => s.connect);
  const fromName = useEditor(s => (connect ? getEntityMap(s.doc.entities).get(connect.fromId)?.name : undefined));
  if (!connect) return null;
  return (
    <div className="canvas-overlay connect-banner" role="status">
      <span>
        Select the entity that <strong>{fromName}</strong>
      </span>
      <select
        className="form-select form-select-sm"
        aria-label="Relationship type"
        value={connect.kind}
        onChange={e => uiActions.startConnect(connect.fromId, e.target.value as RelationshipKind)}
      >
        {RELATIONSHIP_KIND_KEYS.map(kind => (
          <option key={kind} value={kind}>{RELATIONSHIP_KINDS[kind].verb}</option>
        ))}
      </select>
      <button type="button" className="btn-ghost btn-sm" onClick={uiActions.cancelConnect}>Cancel (Esc)</button>
    </div>
  );
}

function EmptyCanvas() {
  const { actions, uiActions } = useEditorContext();
  return (
    <div className="canvas-overlay canvas-empty">
      <h2 className="empty-title">An empty structure</h2>
      <p className="empty-desc">Add a first legal entity, or start from a template.</p>
      <div className="canvas-empty-actions">
        <button type="button" className="btn-primary" onClick={() => actions.createEntity({ name: 'Holding B.V.', type: 'BV' }, { x: 200, y: 120 })}>
          Add holding B.V.
        </button>
        <button type="button" className="btn-secondary" onClick={() => uiActions.openModal('templates')}>Templates</button>
      </div>
    </div>
  );
}

function CanvasControls({ controls, fitSelection }: { controls: { fit(): void; zoomBy(f: number): void; resetZoom(): void }; fitSelection: () => void }) {
  const { actions } = useEditorContext();
  const zoom = useViewport(v => Math.round(v.zoom * 100));
  const mode = useEditor(s => s.doc.preferences.mode);
  const showArrangements = useEditor(s => s.doc.preferences.showArrangements);
  const hasSelection = useEditor(s => s.selection?.type === 'entity');

  return (
    <>
      <div className="canvas-overlay floating-canvas-controls" role="toolbar" aria-label="Zoom and view">
        <button type="button" className="canvas-control-btn" onClick={() => controls.zoomBy(1 / 1.2)} aria-label="Zoom out" title="Zoom out (−)">−</button>
        <button type="button" className="canvas-control-btn zoom-display-btn" onClick={controls.resetZoom} aria-label={`Zoom ${zoom}%, reset to 100%`} title="Reset to 100% (0)">{zoom}%</button>
        <button type="button" className="canvas-control-btn" onClick={() => controls.zoomBy(1.2)} aria-label="Zoom in" title="Zoom in (+)">+</button>
        <div className="canvas-control-sep" />
        <button type="button" className="canvas-control-btn" onClick={controls.fit} aria-label="Fit structure to screen" title="Fit to screen (F)">⊡</button>
        <button type="button" className="canvas-control-btn" onClick={fitSelection} disabled={!hasSelection} aria-label="Zoom to selection" title="Zoom to selection (Shift F)">◎</button>
      </div>
      <div className="canvas-overlay floating-mode-indicator">
        <span className="mode-dot" />
        <span className="mode-label">{VIEW_MODES[mode].desc}</span>
        {mode === 'ownership' && (
          <label className="mode-toggle">
            <input type="checkbox" checked={showArrangements} onChange={e => actions.setPreferences({ showArrangements: e.target.checked })} />
            <span>Show arrangements</span>
          </label>
        )}
      </div>
    </>
  );
}
