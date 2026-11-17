'use client';

import { getEntityType } from '../../lib/constants';
import type { ItemRef, LegalEntity } from '../../lib/types';
import { getEntityMap } from '../../lib/model';
import { useEditor, useEditorContext } from '../editor-context';

export interface EntityOption {
  id: string;
  name: string;
  type: string;
}

const sameOptions = (a: EntityOption[], b: EntityOption[]) =>
  a.length === b.length && a.every((o, i) => o.id === b[i].id && o.name === b[i].name && o.type === b[i].type);

/** Entity id/name list for pickers; stable while only positions change. */
export function useEntityOptions(): EntityOption[] {
  return useEditor(
    s => s.doc.entities.map(e => ({ id: e.id, name: e.name || 'Unnamed entity', type: e.type })).sort((a, b) => a.name.localeCompare(b.name)),
    sameOptions
  );
}

export function entityOptionLabel(o: EntityOption): string {
  return `${o.name} · ${getEntityType(o.type).short}`;
}

/** Inline link that selects another item in the inspector. */
export function ItemLink({ target, children, className }: { target: ItemRef; children: React.ReactNode; className?: string }) {
  const { actions, uiActions } = useEditorContext();
  return (
    <button
      type="button"
      className={`item-link ${className ?? ''}`}
      onClick={() => {
        actions.selectRef(target);
        if (target.type === 'entity') uiActions.focusEntities([target.id]);
      }}
    >
      {children}
    </button>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="empty-note">{children}</p>;
}

function sameExceptPosition(a: LegalEntity | undefined, b: LegalEntity | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])) as (keyof LegalEntity)[];
  for (const k of keys) {
    if (k === 'x' || k === 'y') continue;
    if (!Object.is(a[k], b[k])) return false;
  }
  return true;
}

/** The entity's details; does not re-render while the entity is only being moved. */
export function useEntity(id: string): LegalEntity | undefined {
  return useEditor(s => getEntityMap(s.doc.entities).get(id), sameExceptPosition);
}
