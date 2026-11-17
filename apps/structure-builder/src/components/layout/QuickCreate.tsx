'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ACTIVITY_PRESETS, ENTITY_TYPES, LICENCE_TYPES } from '../../lib/constants';
import { defaultRelationshipKind, getEntityMap } from '../../lib/model';
import { useEditor, useEditorContext, useUi } from '../editor-context';

interface CreateItem {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: string;
  disabled?: boolean;
  run: () => void;
}

const DEFAULT_NAMES: Record<string, string> = {
  BV: 'New B.V.',
  NV: 'New N.V.',
  Stichting: 'Stichting',
  STAK: 'Stichting Administratiekantoor',
  NaturalPerson: 'New person',
  ExternalOrg: 'External partner',
  Holding: 'New Holding',
  Fund: 'New Fund / SPV',
  Group: 'New Group / Division'
};

/** Searchable creation menu for every kind of item (button or the N key). */
export function QuickCreate() {
  const { store, actions, viewport, uiActions } = useEditorContext();
  const open = useUi(s => s.quickCreateOpen);
  const selectedEntityIds = useEditor(s => (s.selection?.type === 'entity' ? s.selection.ids : null));
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) uiActions.setQuickCreate(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open, uiActions]);

  const single = selectedEntityIds?.length === 1 ? selectedEntityIds[0] : null;
  const selectedName = useEditor(s => (single ? getEntityMap(s.doc.entities).get(single)?.name : undefined));
  const existingActivities = useEditor(s => s.doc.activities);

  /** Centre of the visible canvas in canvas coordinates. */
  const viewCentre = () => {
    const el = document.querySelector<HTMLElement>('.canvas-viewport-container');
    const v = viewport.getState();
    const w = el?.clientWidth ?? 1000;
    const h = el?.clientHeight ?? 700;
    return { x: (w / 2 - v.panX) / v.zoom - 100, y: (h / 2 - v.panY) / v.zoom - 42 };
  };

  const items: CreateItem[] = [
    ...Object.entries(ENTITY_TYPES)
      .filter(([, def]) => !def.legacy)
      .map(([type, def]) => ({
        id: `entity-${type}`,
        group: def.category === 'person' ? 'Person' : 'Legal entity',
        label: def.label,
        icon: def.glyph,
        run: () => {
          const near = single ? getEntityMap(store.getState().doc.entities).get(single) : undefined;
          actions.createEntity({ type, name: DEFAULT_NAMES[type] ?? `New ${def.short}` }, near ? { x: near.x + 240, y: near.y } : viewCentre());
        }
      })),
    {
      id: 'activity-blank',
      group: 'Business activity',
      label: 'New activity',
      hint: selectedName ? `performed by ${selectedName}` : undefined,
      icon: '●',
      run: () => actions.createActivity({}, single ? { entityId: single } : undefined)
    },
    // Existing activity definitions are reused (assigned) rather than duplicated.
    ...existingActivities.map(a => ({
      id: `activity-existing-${a.id}`,
      group: 'Business activity',
      label: a.name,
      hint: single ? `assign existing activity to ${selectedName}` : 'existing activity',
      icon: '●',
      run: () => {
        if (single) actions.assignActivity(a.id, single, 'performs');
        actions.selectRef({ type: 'activity', id: a.id });
      }
    })),
    ...ACTIVITY_PRESETS.filter(p => !existingActivities.some(a => a.name.toLowerCase() === p.name.toLowerCase())).map(p => ({
      id: `activity-${p.name}`,
      group: 'Business activity',
      label: p.name,
      hint: [p.category, p.requiresLicence ? 'requires licence' : '', selectedName ? `→ ${selectedName}` : ''].filter(Boolean).join(' · '),
      icon: '●',
      run: () => actions.createActivity({ ...p }, single ? { entityId: single } : undefined)
    })),
    {
      id: 'product',
      group: 'Product or service',
      label: 'New product',
      hint: selectedName ? `provided by ${selectedName}` : undefined,
      icon: '◆',
      run: () => actions.createProduct({}, single ? { entityId: single } : undefined)
    },
    {
      id: 'licence-blank',
      group: 'Licence or permission',
      label: 'New licence',
      hint: selectedName ? `held by ${selectedName}` : undefined,
      icon: '⚖',
      run: () => actions.createLicence({ holderEntityId: single })
    },
    ...Object.entries(LICENCE_TYPES).map(([key, def]) => ({
      id: `licence-${key}`,
      group: 'Licence or permission',
      label: def.label,
      hint: [def.defaultAuthority, selectedName ? `held by ${selectedName}` : ''].filter(Boolean).join(' · '),
      icon: '⚖',
      run: () => actions.createLicence({ name: def.label, licenceType: key, holderEntityId: single })
    })),
    {
      id: 'relationship',
      group: 'Relationship',
      label: selectedEntityIds?.length === 2 ? 'Connect the two selected entities' : 'New relationship',
      hint: selectedEntityIds?.length === 2 ? undefined : single ? `from ${selectedName}` : 'Select one or two entities first',
      icon: '→',
      disabled: !selectedEntityIds || selectedEntityIds.length > 2,
      run: () => {
        if (selectedEntityIds?.length === 2) {
          const [a, b] = selectedEntityIds;
          const byId = getEntityMap(store.getState().doc.entities);
          actions.connect(a, b, defaultRelationshipKind(byId.get(a)?.type ?? 'BV', byId.get(b)?.type ?? 'BV'));
        } else if (single) {
          uiActions.showEntitySection('relations');
        }
      }
    },
    {
      id: 'group',
      group: 'Group',
      label: selectedEntityIds?.length ? 'Group selected entities' : 'New group box',
      icon: '▣',
      run: () => actions.createGroup({ name: 'New group' })
    }
  ];

  const q = query.trim().toLowerCase();
  const filtered = items.filter(i => !q || `${i.group} ${i.label} ${i.hint ?? ''}`.toLowerCase().includes(q));
  const index = Math.min(active, Math.max(0, filtered.length - 1));

  const run = (item: CreateItem | undefined) => {
    if (!item || item.disabled) return;
    item.run();
    uiActions.setQuickCreate(false);
    uiActions.showSidebar('inspector');
    setQuery('');
    setActive(0);
  };

  return (
    <div className="quick-create" ref={rootRef}>
      <button
        type="button"
        className="btn-primary"
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Create an entity, activity, product, licence or relationship (N)"
        onClick={() => uiActions.setQuickCreate(!open)}
      >
        + New
      </button>
      {open && (
        <div className="quick-create-popover" role="dialog" aria-label="Create">
          <input
            className="command-search-input"
            autoFocus
            role="combobox"
            aria-controls={listId}
            aria-expanded="true"
            aria-activedescendant={filtered[index] ? `${listId}-${filtered[index].id}` : undefined}
            placeholder={selectedName ? `Create for ${selectedName}…` : 'What do you want to create?'}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive(i => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive(i => Math.max(0, i - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                run(filtered[index]);
              } else if (e.key === 'Escape') {
                e.stopPropagation();
                uiActions.setQuickCreate(false);
              }
            }}
          />
          <ul className="quick-create-list" id={listId} role="listbox" aria-label="Items to create">
            {filtered.map((item, i) => {
              const showGroup = i === 0 || filtered[i - 1].group !== item.group;
              return (
                <li key={item.id} role="presentation">
                  {showGroup && <div className="quick-create-group" role="presentation">{item.group}</div>}
                  <div
                    id={`${listId}-${item.id}`}
                    role="option"
                    aria-selected={i === index}
                    aria-disabled={item.disabled}
                    className={`command-item ${i === index ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => run(item)}
                  >
                    <span className="command-item-icon" aria-hidden="true">{item.icon}</span>
                    <span className="command-item-text">
                      <span className="command-item-title">{item.label}</span>
                      {item.hint && <span className="command-item-cat">{item.hint}</span>}
                    </span>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && <li className="command-empty-state">Nothing matches “{query}”.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
