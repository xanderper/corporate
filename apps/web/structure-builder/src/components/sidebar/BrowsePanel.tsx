'use client';

import { useDeferredValue, useState } from 'react';
import type { ItemRef } from '../../lib/types';
import { ACTIVITY_STATUSES, LICENCE_STATUSES, PRODUCT_STATUSES, getEntityType } from '../../lib/constants';
import { useActions, useEditor, useUiActions } from '../editor-context';
import { StatusPill } from './fields';

type Filter = 'all' | 'entities' | 'activities' | 'products' | 'licences';

interface Row {
  ref: ItemRef;
  title: string;
  sub: string;
  icon: string;
  status?: { label: string; color: string };
}

export function BrowsePanel() {
  const actions = useActions();
  const uiActions = useUiActions();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const deferredQuery = useDeferredValue(query);
  const entities = useEditor(s => s.doc.entities);
  const activities = useEditor(s => s.doc.activities);
  const assignments = useEditor(s => s.doc.activityAssignments);
  const products = useEditor(s => s.doc.products);
  const licences = useEditor(s => s.doc.licences);

  const names = new Map(entities.map(e => [e.id, e.name]));
  const q = deferredQuery.trim().toLowerCase();
  const match = (...fields: (string | undefined)[]) => !q || fields.some(f => f?.toLowerCase().includes(q));

  const groups: { key: Filter; label: string; rows: Row[] }[] = [
    {
      key: 'entities',
      label: 'Legal entities',
      rows: entities
        .filter(e => match(e.name, e.type, e.jurisdiction, e.regNumber, getEntityType(e.type).label))
        .map(e => ({ ref: { type: 'entity', id: e.id }, title: e.name || 'Unnamed entity', sub: `${getEntityType(e.type).short} · ${e.jurisdiction || '—'}`, icon: getEntityType(e.type).glyph }))
    },
    {
      key: 'activities',
      label: 'Activities',
      rows: activities
        .filter(a => match(a.name, a.category))
        .map(a => {
          const performers = assignments.filter(x => x.activityId === a.id && x.role === 'performs').map(x => names.get(x.entityId) ?? '?');
          return { ref: { type: 'activity', id: a.id }, title: a.name, sub: performers.length ? `Performed by ${performers.join(', ')}` : 'No responsible entity', icon: '●', status: ACTIVITY_STATUSES[a.status] };
        })
    },
    {
      key: 'products',
      label: 'Products & services',
      rows: products.filter(p => match(p.name, p.description)).map(p => ({ ref: { type: 'product', id: p.id }, title: p.name, sub: p.description || '', icon: '◆', status: PRODUCT_STATUSES[p.status] }))
    },
    {
      key: 'licences',
      label: 'Licences',
      rows: licences
        .filter(l => match(l.name, l.authority, l.licenceType))
        .map(l => ({ ref: { type: 'licence', id: l.id }, title: l.name, sub: `${l.authority || 'No authority'} · ${l.holderEntityId ? names.get(l.holderEntityId) ?? '?' : 'no holder'}`, icon: '⚖', status: LICENCE_STATUSES[l.status] }))
    }
  ];
  const visible = groups.filter(g => filter === 'all' || g.key === filter);
  const total = visible.reduce((n, g) => n + g.rows.length, 0);

  const open = (ref: ItemRef) => {
    actions.selectRef(ref);
    uiActions.patch({ sidebarTab: 'inspector' });
    if (ref.type === 'entity') uiActions.focusEntities([ref.id]);
  };

  return (
    <div className="browse-panel">
      <div className="panel-header">
        <div className="search-box">
          <input type="search" className="search-input" aria-label="Search the structure" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search entities, activities, products, licences…" />
        </div>
        <div className="filter-chips-row" role="radiogroup" aria-label="Filter">
          {(['all', 'entities', 'activities', 'products', 'licences'] as Filter[]).map(f => (
            <button key={f} type="button" role="radio" aria-checked={filter === f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="browse-content">
        {visible.map(g =>
          g.rows.length === 0 ? null : (
            <div key={g.key} className="browse-section">
              <span className="section-label">{g.label} ({g.rows.length})</span>
              <ul className="directory-list">
                {g.rows.map(r => (
                  <li key={r.ref.id}>
                    <button type="button" className="directory-item" onClick={() => open(r.ref)}>
                      <span className="dir-icon" aria-hidden="true">{r.icon}</span>
                      <span className="dir-text">
                        <span className="dir-title">{r.title}</span>
                        {r.sub && <span className="dir-sub">{r.sub}</span>}
                      </span>
                      {r.status && <StatusPill label={r.status.label} color={r.status.color} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        {total === 0 && <div className="empty-subpanel"><p>{q ? `No matches for “${deferredQuery}”.` : 'Nothing here yet.'}</p></div>}
      </div>
    </div>
  );
}
