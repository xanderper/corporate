'use client';

import { memo, useRef, useState } from 'react';
import type { GroupCluster } from '../../lib/types';
import { getEntityMap } from '../../lib/model';
import { useEditor, useEditorContext } from '../editor-context';
import { isInteractiveTarget } from './canvas-context';

export const GroupLayer = memo(function GroupLayer() {
  const groups = useEditor(s => s.doc.groups);
  const selectedId = useEditor(s => (s.selection?.type === 'group' ? s.selection.id : null));
  return (
    <div className="canvas-groups-layer">
      {groups.map(g => (
        <GroupBox key={g.id} group={g} selected={selectedId === g.id} />
      ))}
    </div>
  );
});

const GroupBox = memo(function GroupBox({ group, selected }: { group: GroupCluster; selected: boolean }) {
  const { store, actions, uiActions, viewport } = useEditorContext();
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origin: { x: number; y: number };
    members: Map<string, { x: number; y: number }>;
    started: boolean;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isInteractiveTarget(e.target)) return;
    e.stopPropagation();
    actions.select({ type: 'group', id: group.id });
    uiActions.patch({ sidebarTab: 'inspector' });
    const byId = getEntityMap(store.getState().doc.entities);
    const members = new Map<string, { x: number; y: number }>();
    for (const id of group.members) {
      const ent = byId.get(id);
      if (ent && !ent.locked) members.set(id, { x: ent.x, y: ent.y });
    }
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, origin: { x: group.x, y: group.y }, members, started: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const zoom = viewport.getState().zoom;
    const { snapToGrid, gridSize } = store.getState().doc.preferences;
    const snap = (v: number) => (snapToGrid ? Math.round(v / gridSize) * gridSize : Math.round(v));
    const dx = snap((e.clientX - d.startX) / zoom);
    const dy = snap((e.clientY - d.startY) / zoom);
    if (!d.started) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return;
      d.started = true;
      actions.beginDrag('Move group');
      setDragging(true);
    }
    const members = new Map<string, { x: number; y: number }>();
    for (const [id, p] of d.members) members.set(id, { x: p.x + dx, y: p.y + dy });
    actions.dragGroup(group.id, d.origin.x + dx, d.origin.y + dy, members);
  };

  const end = () => {
    drag.current = null;
    setDragging(false);
  };

  return (
    <div
      className={`group-box color-${group.color || 'green'} ${selected ? 'selected' : ''} ${dragging ? 'dragging' : ''}`}
      style={{ transform: `translate3d(${group.x}px, ${group.y}px, 0)`, width: group.w, height: group.h }}
    >
      {/* Only the header grabs the group (the body has pointer-events: none), so the
          canvas stays pannable and the entities inside remain usable. */}
      <div
        className="group-header"
        title="Drag to move the group and its entities"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <span className="group-title">{group.name}</span>
        <span className="group-count">{group.members.length} {group.members.length === 1 ? 'entity' : 'entities'}</span>
      </div>
    </div>
  );
});
