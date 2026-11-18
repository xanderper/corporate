'use client';

import { useId, useState } from 'react';
import type { ItemRef } from '../../lib/types';
import { getEntityType } from '../../lib/constants';
import { useEditorContext } from '../editor-context';

interface Command {
  id: string;
  title: string;
  category: string;
  icon: string;
  run: () => void;
}

export function CommandPalette() {
  const { store, actions, uiActions } = useEditorContext();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const doc = store.getState().doc;

  const open = (ref: ItemRef) => {
    actions.selectRef(ref);
    uiActions.showSidebar('inspector');
    if (ref.type === 'entity') uiActions.focusEntities([ref.id]);
  };

  const commands: Command[] = [
    { id: 'new', title: 'Create…', category: 'Create', icon: '+', run: () => uiActions.setQuickCreate(true) },
    { id: 'layout', title: 'Auto layout', category: 'Layout', icon: '⚡', run: () => actions.autoLayout() },
    { id: 'layout-tb', title: 'Auto layout top to bottom', category: 'Layout', icon: '↓', run: () => actions.autoLayout('TB') },
    { id: 'layout-lr', title: 'Auto layout left to right', category: 'Layout', icon: '→', run: () => actions.autoLayout('LR') },
    { id: 'view-own', title: 'Ownership view', category: 'View', icon: '1', run: () => actions.setPreferences({ mode: 'ownership' }) },
    { id: 'view-act', title: 'Activities view', category: 'View', icon: '2', run: () => actions.setPreferences({ mode: 'activities' }) },
    { id: 'view-prod', title: 'Products view', category: 'View', icon: '3', run: () => actions.setPreferences({ mode: 'products' }) },
    { id: 'checks', title: 'Show checks', category: 'Validation', icon: '✓', run: () => uiActions.showSidebar('checks') },
    { id: 'export', title: 'Export…', category: 'File', icon: '↓', run: () => uiActions.openModal('export') },
    { id: 'import', title: 'Import…', category: 'File', icon: '↑', run: () => uiActions.openModal('import') },
    { id: 'templates', title: 'Templates…', category: 'File', icon: '▤', run: () => uiActions.openModal('templates') },
    { id: 'shortcuts', title: 'Keyboard shortcuts', category: 'Help', icon: '⌨', run: () => uiActions.openModal('shortcuts') },
    { id: 'undo', title: 'Undo', category: 'Edit', icon: '↩', run: actions.undo },
    { id: 'redo', title: 'Redo', category: 'Edit', icon: '↪', run: actions.redo }
  ];

  const q = query.trim().toLowerCase();
  const hit = (...s: (string | undefined)[]) => s.some(x => x?.toLowerCase().includes(q));
  const items: Command[] = [
    ...commands.filter(c => !q || hit(c.title, c.category)),
    ...(q
      ? [
          ...doc.entities.filter(e => hit(e.name, e.regNumber, getEntityType(e.type).label)).map(e => ({ id: `e-${e.id}`, title: e.name, category: getEntityType(e.type).short, icon: getEntityType(e.type).glyph, run: () => open({ type: 'entity', id: e.id }) })),
          ...doc.activities.filter(a => hit(a.name, a.category)).map(a => ({ id: `a-${a.id}`, title: a.name, category: 'Activity', icon: '●', run: () => open({ type: 'activity', id: a.id }) })),
          ...doc.products.filter(p => hit(p.name)).map(p => ({ id: `p-${p.id}`, title: p.name, category: 'Product', icon: '◆', run: () => open({ type: 'product', id: p.id }) })),
          ...doc.licences.filter(l => hit(l.name, l.authority)).map(l => ({ id: `l-${l.id}`, title: l.name, category: 'Licence', icon: '⚖', run: () => open({ type: 'licence', id: l.id }) }))
        ]
      : [])
  ];
  const index = Math.min(active, Math.max(0, items.length - 1));

  const run = (item: Command | undefined) => {
    if (!item) return;
    uiActions.closeModal();
    item.run();
  };

  return (
    <div className="modal-backdrop command-palette-backdrop" onPointerDown={e => e.target === e.currentTarget && uiActions.closeModal()}>
      <div className="command-palette-dialog" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="command-search-header">
          <input
            className="command-search-input"
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={items[index] ? `${listId}-${items[index].id}` : undefined}
            value={query}
            placeholder="Search the structure or type a command…"
            onChange={e => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive(i => Math.min(items.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive(i => Math.max(0, i - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                run(items[index]);
              }
            }}
          />
          <kbd className="command-esc-badge">Esc</kbd>
        </div>
        <ul className="command-results-list" id={listId} role="listbox">
          {items.length === 0 ? (
            <li className="command-empty-state">No results for “{query}”.</li>
          ) : (
            items.map((item, i) => (
              <li
                key={item.id}
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={i === index}
                className={`command-item ${i === index ? 'active' : ''}`}
                onClick={() => run(item)}
                onPointerEnter={() => setActive(i)}
              >
                <span className="command-item-icon" aria-hidden="true">{item.icon}</span>
                <span className="command-item-text">
                  <span className="command-item-title">{item.title}</span>
                  <span className="command-item-cat">{item.category}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default CommandPalette;
