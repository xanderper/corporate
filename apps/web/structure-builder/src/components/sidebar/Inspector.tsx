'use client';

import { getDiagnostics } from '../../lib/validation';
import { useEditor, useUiActions } from '../editor-context';
import { EntityDetails } from './EntityDetails';
import { ActivityDetails, LicenceDetails, ProductDetails } from './ItemDetails';
import { GroupDetails, MultiSelection, RelationshipDetails } from './RelationshipDetails';

export function Inspector() {
  const selection = useEditor(s => s.selection);
  if (!selection) return <EmptyInspector />;
  switch (selection.type) {
    case 'entity':
      return selection.ids.length === 1 ? <EntityDetails key={selection.ids[0]} id={selection.ids[0]} /> : <MultiSelection ids={selection.ids} />;
    case 'relationship':
      return <RelationshipDetails key={selection.id} id={selection.id} />;
    case 'group':
      return <GroupDetails key={selection.id} id={selection.id} />;
    case 'activity':
      return <ActivityDetails key={selection.id} id={selection.id} />;
    case 'product':
      return <ProductDetails key={selection.id} id={selection.id} />;
    case 'licence':
      return <LicenceDetails key={selection.id} id={selection.id} />;
  }
}

function EmptyInspector() {
  const uiActions = useUiActions();
  const counts = useEditor(
    s => [s.doc.entities.length, s.doc.relationships.length, s.doc.activities.length, s.doc.products.length, s.doc.licences.length].join(','),
  );
  const issueCount = useEditor(s => getDiagnostics(s.doc).filter(d => d.severity !== 'info').length);
  const [entities, relationships, activities, products, licences] = counts.split(',').map(Number);
  const stats = [
    { n: entities, label: 'Entities' },
    { n: relationships, label: 'Relationships' },
    { n: activities, label: 'Activities' },
    { n: products, label: 'Products' },
    { n: licences, label: 'Licences' }
  ];
  return (
    <div className="inspector-panel empty">
      <div className="empty-state-box">
        <h4 className="empty-title">Nothing selected</h4>
        <p className="empty-desc">Select an entity, relationship or group on the canvas, or find an item under Browse.</p>
        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-num">{s.n}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="empty-actions">
          <button type="button" className="btn-secondary btn-sm" onClick={() => uiActions.setQuickCreate(true)}>+ New… <kbd>N</kbd></button>
          {issueCount > 0 && (
            <button type="button" className="btn-ghost btn-sm" onClick={() => uiActions.showSidebar('checks')}>
              Review {issueCount} issue{issueCount === 1 ? '' : 's'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
