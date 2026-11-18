'use client';

import { memo, useRef, useState } from 'react';
import type { PortPosition } from '../../lib/types';
import {
  ACTIVITY_ROLES,
  ACTIVITY_STATUSES,
  ENTITY_STATUSES,
  LICENCE_STATUSES,
  PRODUCT_ROLES,
  PRODUCT_STATUSES,
  getEntityType
} from '../../lib/constants';
import { getEntityLinks, getEntityMap } from '../../lib/model';
import { CARD_MAX_ROWS, getCardHeight } from '../../lib/geometry';
import { useEditor, useEditorContext, useUi } from '../editor-context';
import { isInteractiveTarget, useCanvasApi } from './canvas-context';

const PORTS: PortPosition[] = ['top', 'right', 'bottom', 'left'];

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  starts: Map<string, { x: number; y: number }>;
  started: boolean;
  wasSelected: boolean;
  pending: Map<string, { x: number; y: number }> | null;
  raf: number;
}

/**
 * One entity on the canvas. Subscribes only to its own entity, its links and the view
 * preferences, so dragging or editing another entity does not re-render it.
 */
export const EntityCard = memo(function EntityCard({ id }: { id: string }) {
  const { store, actions, ui, uiActions, viewport } = useEditorContext();
  const canvas = useCanvasApi();
  const entity = useEditor(s => getEntityMap(s.doc.entities).get(id));
  const links = useEditor(s => getEntityLinks(s.doc, id));
  const prefs = useEditor(s => s.doc.preferences);
  const selected = useEditor(s => s.selection?.type === 'entity' && s.selection.ids.includes(id));
  const isConnectSource = useUi(s => s.connect?.fromId === id);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<DragState | null>(null);

  if (!entity) return null;

  const typeDef = getEntityType(entity.type);
  const height = getCardHeight(prefs.mode, links, prefs.showLicenceBadges);
  const rows =
    prefs.mode === 'activities'
      ? links.activities.map(({ activity, assignment }) => ({
          key: assignment.id,
          targetId: activity.id,
          type: 'activity' as const,
          name: activity.name,
          marker: ACTIVITY_ROLES[assignment.role].marker,
          roleLabel: ACTIVITY_ROLES[assignment.role].label,
          status: ACTIVITY_STATUSES[activity.status]
        }))
      : prefs.mode === 'products'
        ? links.products.map(({ product, assignment }) => ({
            key: assignment.id,
            targetId: product.id,
            type: 'product' as const,
            name: product.name,
            marker: PRODUCT_ROLES[assignment.role].marker,
            roleLabel: PRODUCT_ROLES[assignment.role].label,
            status: PRODUCT_STATUSES[product.status]
          }))
        : [];
  const grantedCount = links.licences.filter(l => LICENCE_STATUSES[l.status].inForce).length;
  const showLicences = prefs.mode === 'activities' && prefs.showLicenceBadges && links.licences.length > 0;

  const flush = (d: DragState) => {
    if (d.raf) cancelAnimationFrame(d.raf);
    d.raf = 0;
    if (d.pending) actions.dragEntities(d.pending);
    d.pending = null;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isInteractiveTarget(e.target)) return;
    e.stopPropagation();
    // Default focus handling would scroll the overflow-hidden canvas; focus without scrolling.
    e.preventDefault();
    e.currentTarget.focus({ preventScroll: true });

    const connect = ui.getState().connect;
    if (connect) {
      if (connect.fromId !== id) actions.connect(connect.fromId, id, connect.kind);
      uiActions.cancelConnect();
      return;
    }

    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    const sel = store.getState().selection;
    const wasSelected = sel?.type === 'entity' && sel.ids.includes(id);
    if (additive) {
      actions.toggleEntitySelection(id, true);
      return;
    }
    if (!wasSelected) actions.select({ type: 'entity', ids: [id] });
    uiActions.patch({ sidebarTab: 'inspector' });

    const ids = wasSelected && sel?.type === 'entity' ? sel.ids : [id];
    const byId = getEntityMap(store.getState().doc.entities);
    const starts = new Map<string, { x: number; y: number }>();
    for (const eid of ids) {
      const ent = byId.get(eid);
      if (ent && !ent.locked) starts.set(eid, { x: ent.x, y: ent.y });
    }
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, starts, started: false, wasSelected, pending: null, raf: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId || d.starts.size === 0) return;
    const dxScreen = e.clientX - d.startX;
    const dyScreen = e.clientY - d.startY;
    if (!d.started) {
      if (Math.hypot(dxScreen, dyScreen) < 4) return;
      d.started = true;
      actions.beginDrag(d.starts.size > 1 ? 'Move entities' : 'Move entity');
      setDragging(true);
    }
    const { zoom } = viewport.getState();
    const { snapToGrid, gridSize } = store.getState().doc.preferences;
    const snap = (v: number) => (snapToGrid ? Math.round(v / gridSize) * gridSize : Math.round(v));
    const positions = new Map<string, { x: number; y: number }>();
    for (const [eid, start] of d.starts) {
      positions.set(eid, { x: snap(start.x + dxScreen / zoom), y: snap(start.y + dyScreen / zoom) });
    }
    d.pending = positions;
    // Coalesce pointer events into one store update per animation frame.
    if (!d.raf) {
      d.raf = requestAnimationFrame(() => {
        d.raf = 0;
        if (d.pending) actions.dragEntities(d.pending);
        d.pending = null;
      });
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    flush(d);
    if (!d.started && d.wasSelected) {
      // Plain click on a member of a multi-selection narrows the selection to it.
      actions.select({ type: 'entity', ids: [id] });
    }
    drag.current = null;
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const connect = ui.getState().connect;
      if (connect) {
        if (connect.fromId !== id) actions.connect(connect.fromId, id, connect.kind);
        uiActions.cancelConnect();
        return;
      }
      actions.toggleEntitySelection(id, e.shiftKey);
      uiActions.showSidebar('inspector');
    }
  };

  const meta = entity.regNumber ? `Reg. ${entity.regNumber}` : entity.description || entity.notes || '';
  const rowLabel = prefs.mode === 'activities' ? 'Activities' : 'Products';

  return (
    <div
      className={[
        'entity-card',
        `color-${entity.color}`,
        `category-${typeDef.category}`,
        selected && 'selected',
        dragging && 'dragging',
        entity.locked && 'locked',
        isConnectSource && 'connect-source',
        entity.status === 'dissolved' && 'is-dissolved'
      ].filter(Boolean).join(' ')}
      style={{ transform: `translate3d(${entity.x}px, ${entity.y}px, 0)`, width: prefs.cardWidth, height }}
      data-entity-id={id}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${typeDef.label}: ${entity.name || 'Unnamed'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      {PORTS.map(port => (
        <button
          key={port}
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className={`port-handle port-${port}`}
          title="Drag to another entity to create a relationship"
          onPointerDown={e => {
            e.stopPropagation();
            canvas.startConnectDrag(id, port, e);
          }}
        />
      ))}

      <div className="card-top">
        <div className="card-glyph-lockup">
          <span className="type-glyph" aria-hidden="true">{typeDef.glyph}</span>
          <span className="type-name">{typeDef.short}</span>
          {entity.status !== 'active' && <span className={`card-status status-${entity.status}`}>{ENTITY_STATUSES[entity.status].label}</span>}
        </div>
        <span className="card-top-right">
          {entity.locked && <span className="card-lock" title="Position locked" aria-label="Position locked">⌗</span>}
          {entity.jurisdiction && (
            <span className="jurisdiction-tag" title={`Jurisdiction: ${entity.jurisdiction}`}>
              {entity.jurisdiction.slice(0, 3).toUpperCase()}
            </span>
          )}
        </span>
      </div>

      <div className="card-name-row">
        <h3 className="card-name" title={entity.name}>{entity.name || 'Unnamed entity'}</h3>
      </div>
      {meta && <div className="card-meta" title={meta}>{meta}</div>}

      {rows.length > 0 && (
        <div className="card-rows">
          <div className="card-rows-header">
            <span>{rowLabel}</span>
            <span>{rows.length}</span>
          </div>
          {rows.slice(0, CARD_MAX_ROWS).map(row => (
            <button
              key={row.key}
              type="button"
              className="card-row"
              title={`${row.name} — ${row.roleLabel.toLowerCase()} · ${row.status.label}`}
              onClick={e => {
                e.stopPropagation();
                actions.selectRef({ type: row.type, id: row.targetId });
                uiActions.showSidebar('inspector');
              }}
            >
              <span className="card-row-marker" style={{ color: row.status.color }} aria-label={row.roleLabel}>{row.marker}</span>
              <span className="card-row-name">{row.name}</span>
            </button>
          ))}
          {rows.length > CARD_MAX_ROWS && <span className="card-rows-more">+{rows.length - CARD_MAX_ROWS} more</span>}
        </div>
      )}

      {showLicences && (
        <div className="card-licence-row" title={links.licences.map(l => `${l.name}: ${LICENCE_STATUSES[l.status].label}`).join('\n')}>
          <span aria-hidden="true">⚖</span> {links.licences.length} licence{links.licences.length === 1 ? '' : 's'} · {grantedCount} granted
        </div>
      )}
    </div>
  );
});
