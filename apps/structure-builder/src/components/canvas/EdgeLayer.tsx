'use client';

import { memo, useMemo, useRef } from 'react';
import type { Relationship } from '../../lib/types';
import { CARD_BASE_HEIGHT, RELATIONSHIP_KINDS, RELATIONSHIP_KIND_KEYS } from '../../lib/constants';
import { formatRelationshipLabel, getEntityIndex, getEntityMap, type EntityLinks } from '../../lib/model';
import {
  LABEL_HEIGHT,
  calculateEdgePath,
  estimateLabelWidth,
  getCardHeight,
  prepareEdgeRouting,
  resolveLabelPositions,
  type EdgePathData
} from '../../lib/geometry';
import { isEdgeMuted, isEdgeVisible } from '../../lib/view-filters';
import { useEditor, useEditorContext } from '../editor-context';

const EMPTY_LINKS: EntityLinks = { activities: [], products: [], licences: [] };

interface EdgeGeometry {
  rel: Relationship;
  path: EdgePathData;
  label: string;
  labelX: number;
  labelY: number;
  labelW: number;
  /** False when the label could not be placed without covering a card or another label. */
  labelClear: boolean;
  muted: boolean;
}

/** All relationship lines and labels. Re-renders when entities move (paths depend on positions). */
export const EdgeLayer = memo(function EdgeLayer() {
  const { actions, uiActions, viewport } = useEditorContext();
  const entities = useEditor(s => s.doc.entities);
  const relationships = useEditor(s => s.doc.relationships);
  const prefs = useEditor(s => s.doc.preferences);
  const index = useEditor(s => getEntityIndex(s.doc));
  const selection = useEditor(s => s.selection);
  const routeDrag = useRef<{ id: string; pointerId: number; startY: number; startOffset: number; started: boolean } | null>(null);

  const geometry = useMemo<EdgeGeometry[]>(() => {
    const heights = new Map(entities.map(e => [e.id, getCardHeight(prefs.mode, index.get(e.id) ?? EMPTY_LINKS, prefs.showLicenceBadges)]));
    const heightOf = (id: string) => heights.get(id) ?? CARD_BASE_HEIGHT;
    const byId = getEntityMap(entities);
    const visible = relationships.filter(r => isEdgeVisible(r, prefs) && byId.has(r.from) && byId.has(r.to) && r.from !== r.to);
    const hints = prepareEdgeRouting(entities, visible, prefs.cardWidth, heights);

    const items = visible.map(rel => {
      const path = calculateEdgePath(byId.get(rel.from)!, byId.get(rel.to)!, rel, prefs.connectionStyle, prefs.cardWidth, heightOf(rel.from), heightOf(rel.to), hints.get(rel.id) ?? null);
      const label = formatRelationshipLabel(rel);
      return { rel, path, label, labelX: path.midX, labelY: path.midY, labelW: estimateLabelWidth(label), labelClear: true, muted: isEdgeMuted(rel, prefs) };
    });

    const cardBoxes = entities.map(e => ({ id: e.id, x: e.x + prefs.cardWidth / 2, y: e.y + heightOf(e.id) / 2, w: prefs.cardWidth, h: heightOf(e.id) }));
    const placed = resolveLabelPositions(
      items.filter(i => i.label).map(i => ({ id: i.rel.id, x: i.labelX, y: i.labelY, w: i.labelW, h: LABEL_HEIGHT })),
      cardBoxes
    );
    for (const item of items) {
      const p = placed.get(item.rel.id);
      if (p) {
        item.labelX = p.x;
        item.labelY = p.y;
        item.labelClear = p.clear;
      }
    }
    return items;
  }, [entities, relationships, prefs, index]);

  const selectedEdgeId = selection?.type === 'relationship' ? selection.id : null;
  const focusEntities = selection?.type === 'entity' ? new Set(selection.ids) : null;

  const select = (id: string) => {
    actions.select({ type: 'relationship', id });
    uiActions.showSidebar('inspector');
  };

  return (
    <>
    <svg className="svg-edges-layer" aria-hidden="true">
      <defs>
        {RELATIONSHIP_KIND_KEYS.map(kind => (
          <marker key={kind} id={`marker-${kind}`} markerWidth="9" markerHeight="9" refX="7.8" refY="4" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,1 L8,4 L0,7 Z" fill={RELATIONSHIP_KINDS[kind].color} />
          </marker>
        ))}
      </defs>

      {geometry.map(({ rel, path, muted }) => {
        const def = RELATIONSHIP_KINDS[rel.kind];
        const isSelected = selectedEdgeId === rel.id;
        const related = focusEntities !== null && (focusEntities.has(rel.from) || focusEntities.has(rel.to));
        return (
          <g
            key={rel.id}
            className={['edge-group', `kind-${rel.kind}`, isSelected && 'selected', muted && 'muted', related && 'related', focusEntities && !related && 'dimmed'].filter(Boolean).join(' ')}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => select(rel.id)}
          >
            <path d={path.d} className="edge-hit-area">
              <title>{`${RELATIONSHIP_KINDS[rel.kind].label}: ${formatRelationshipLabel(rel)}`}</title>
            </path>
            <path
              d={path.d}
              className="edge-path"
              stroke={def.color}
              strokeDasharray={def.dash || undefined}
              markerEnd={`url(#marker-${rel.kind})`}
            />
          </g>
        );
      })}

      </svg>
      {/* Labels sit above the cards; uncluttered labels never overlap a card by construction. */}
      <svg className="svg-edges-layer svg-labels-layer" aria-hidden="true">
      {geometry.filter(g => g.label).map(({ rel, label, labelX, labelY, labelW, labelClear, muted }) => {
        const isSelected = selectedEdgeId === rel.id;
        const related = focusEntities !== null && (focusEntities.has(rel.from) || focusEntities.has(rel.to));
        // Crowded labels appear only in context instead of covering cards.
        if (!labelClear && !isSelected && !related) return null;
        return (
          <g
            key={`label-${rel.id}`}
            className={['edge-label-group', isSelected && 'selected', muted && 'muted', focusEntities && !related && 'dimmed'].filter(Boolean).join(' ')}
            transform={`translate(${labelX}, ${labelY})`}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => select(rel.id)}
          >
            <rect className="edge-label-bg" x={-labelW / 2} y={-LABEL_HEIGHT / 2} width={labelW} height={LABEL_HEIGHT} rx="4" />
            <text className="edge-label-text" y="3.5" textAnchor="middle">{label}</text>
          </g>
        );
      })}

      {selectedEdgeId && (() => {
        const item = geometry.find(g => g.rel.id === selectedEdgeId);
        if (!item) return null;
        return (
          <circle
            className="waypoint-handle"
            cx={item.path.waypointX}
            cy={item.path.waypointY}
            r="6"
            role="presentation"
            onPointerDown={e => {
              e.stopPropagation();
              (e.currentTarget as Element).setPointerCapture(e.pointerId);
              routeDrag.current = { id: item.rel.id, pointerId: e.pointerId, startY: e.clientY, startOffset: item.rel.midOffset ?? 0, started: false };
            }}
            onPointerMove={e => {
              const d = routeDrag.current;
              if (!d || d.pointerId !== e.pointerId) return;
              if (!d.started) {
                d.started = true;
                actions.beginDrag('Adjust route');
              }
              const offset = Math.round((d.startOffset + (e.clientY - d.startY) / viewport.getState().zoom) / 5) * 5;
              actions.dragRelationshipOffset(d.id, offset);
            }}
            onPointerUp={() => {
              routeDrag.current = null;
            }}
            onDoubleClick={() => actions.updateRelationship(item.rel.id, { midOffset: 0 })}
          >
            <title>Drag to move the route; double-click to reset</title>
          </circle>
        );
      })()}
    </svg>
    </>
  );
});
