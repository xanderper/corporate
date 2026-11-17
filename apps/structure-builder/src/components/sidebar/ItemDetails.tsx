'use client';

import { useState } from 'react';
import type { ActivityRole, ActivityStatus, LicenceStatus, ProductRole, ProductStatus } from '../../lib/types';
import {
  ACTIVITY_CATEGORIES,
  ACTIVITY_ROLES,
  ACTIVITY_STATUSES,
  LICENCE_STATUSES,
  LICENCE_TYPES,
  PRODUCT_ROLES,
  PRODUCT_STATUSES,
  REGULATORY_AUTHORITIES,
  getLicenceTypeLabel
} from '../../lib/constants';
import { shallowArrayEqual, useActions, useEditor } from '../editor-context';
import { CheckboxField, DateField, DeleteButton, Section, SelectField, StatusPill, TextAreaField, TextField } from './fields';
import { EmptyNote, ItemLink, entityOptionLabel, useEntityOptions } from './shared';

const CUSTOM = '__custom';

function Header({ badge, title }: { badge: React.ReactNode; title: string }) {
  return (
    <div className="inspector-header">
      <div className="header-title-row">
        <span className="type-badge">{badge}</span>
        <h3 className="inspector-title" title={title}>{title}</h3>
      </div>
    </div>
  );
}

/** Select with registry options plus free text, for extensible types (licence types). */
function RegistrySelect({
  label,
  value,
  registry,
  onChange,
  emptyLabel
}: {
  label: string;
  value: string;
  registry: Record<string, { label: string }>;
  onChange: (v: string) => void;
  emptyLabel: string;
}) {
  const [custom, setCustom] = useState(false);
  const known = value === '' || Boolean(registry[value]);
  const showCustom = custom || !known;
  return (
    <>
      <SelectField
        label={label}
        value={showCustom ? CUSTOM : value}
        options={[{ value: '', label: emptyLabel }, ...Object.entries(registry).map(([k, d]) => ({ value: k, label: d.label })), { value: CUSTOM, label: 'Other…' }]}
        onChange={v => {
          setCustom(v === CUSTOM);
          if (v !== CUSTOM) onChange(v);
        }}
      />
      {showCustom && <TextField label={`${label} (custom)`} value={known ? '' : value} onChange={onChange} autoFocus={custom} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export function ActivityDetails({ id }: { id: string }) {
  const actions = useActions();
  const activity = useEditor(s => s.doc.activities.find(a => a.id === id));
  const assignments = useEditor(s => s.doc.activityAssignments.filter(a => a.activityId === id), shallowArrayEqual);
  const licences = useEditor(s => s.doc.licences);
  const products = useEditor(s => s.doc.products);
  const activities = useEditor(s => s.doc.activities);
  const entities = useEntityOptions();
  if (!activity) return null;

  const update = actions.updateActivity.bind(null, id);
  const names = new Map(entities.map(e => [e.id, e.name]));
  const performers = new Set(assignments.filter(a => a.role === 'performs').map(a => a.entityId));

  return (
    <div className="inspector-panel">
      <Header badge={<><span aria-hidden="true">●</span> Activity</>} title={activity.name || 'Unnamed activity'} />
      <div className="inspector-content">
        <TextField label="Name" value={activity.name} onChange={v => update({ name: v }, 'name')} />
        <div className="form-row">
          <TextField className="flex-1" label="Category" value={activity.category} onChange={v => update({ category: v }, 'category')} list="activity-categories" />
          <SelectField<ActivityStatus>
            className="flex-1"
            label="Status"
            value={activity.status}
            options={Object.entries(ACTIVITY_STATUSES).map(([value, d]) => ({ value: value as ActivityStatus, label: d.label }))}
            onChange={v => update({ status: v }, 'status')}
          />
        </div>
        <datalist id="activity-categories">
          {ACTIVITY_CATEGORIES.map(c => <option key={c} value={c} />)}
        </datalist>
        <div className="form-row">
          <DateField className="flex-1" label="Start date" value={activity.startDate ?? ''} onChange={v => update({ startDate: v }, 'startDate')} />
          <DateField className="flex-1" label="End date" value={activity.endDate ?? ''} onChange={v => update({ endDate: v }, 'endDate')} />
        </div>
        <TextAreaField label="Description" rows={2} value={activity.description ?? ''} onChange={v => update({ description: v }, 'description')} />

        <Section title="Responsibility">
          {assignments.length === 0 ? (
            <EmptyNote>No entity performs or supports this activity yet.</EmptyNote>
          ) : (
            <ul className="assignment-list">
              {assignments.map(a => (
                <li key={a.id} className="assignment-row">
                  <div className="assignment-main">
                    <ItemLink target={{ type: 'entity', id: a.entityId }} className="assignment-name">{names.get(a.entityId) ?? 'Missing entity'}</ItemLink>
                    <span className="assignment-meta">{ACTIVITY_ROLES[a.role].desc}</span>
                  </div>
                  <select className="form-select form-select-sm" aria-label="Role" value={a.role} onChange={e => actions.updateActivityAssignment(a.id, { role: e.target.value as ActivityRole })}>
                    {(Object.keys(ACTIVITY_ROLES) as ActivityRole[]).map(r => <option key={r} value={r}>{ACTIVITY_ROLES[r].label}</option>)}
                  </select>
                  <button type="button" className="icon-btn-sm" aria-label={`Remove ${names.get(a.entityId) ?? 'entity'}`} title="Remove assignment" onClick={() => actions.unassignActivity(a.id)}>×</button>
                </li>
              ))}
            </ul>
          )}
          <AssignEntityForm<ActivityRole>
            entities={entities.map(e => ({ value: e.id, label: entityOptionLabel(e) }))}
            roles={ACTIVITY_ROLES}
            defaultRole={performers.size ? 'supports' : 'performs'}
            onAssign={(entityId, role) => actions.assignActivity(id, entityId, role)}
          />
        </Section>

        <Section title="Regulation">
          <CheckboxField
            label="Requires a licence or permission"
            hint="Flags performing entities without a covering licence record."
            checked={activity.requiresLicence}
            onChange={v => update({ requiresLicence: v }, 'requiresLicence')}
          />
          {activity.requiresLicence && (
            <>
              <RegistrySelect
                label="Required licence type"
                value={activity.requiredLicenceType ?? ''}
                registry={LICENCE_TYPES}
                emptyLabel="Not specified"
                onChange={v => update({ requiredLicenceType: v }, 'requiredLicenceType')}
              />
              <TextAreaField label="Regulatory requirements" rows={2} value={activity.regulatoryRequirements ?? ''} onChange={v => update({ regulatoryRequirements: v }, 'regulatoryRequirements')} />
            </>
          )}
          <div className="form-group">
            <span className="form-label">Covered by licences</span>
            {licences.length === 0 ? (
              <EmptyNote>No licences recorded.</EmptyNote>
            ) : (
              <div className="checkbox-list">
                {licences.map(l => {
                  const holderMismatch = l.holderEntityId !== null && performers.size > 0 && !performers.has(l.holderEntityId);
                  return (
                    <label key={l.id} className="checkbox-item">
                      <input type="checkbox" checked={l.activityIds.includes(id)} onChange={e => actions.setLicenceActivity(l.id, id, e.target.checked)} />
                      <span>
                        {l.name} <StatusPill label={LICENCE_STATUSES[l.status].label} color={LICENCE_STATUSES[l.status].color} />
                        <span className="checkbox-hint">
                          Held by {l.holderEntityId ? names.get(l.holderEntityId) ?? 'missing entity' : 'nobody'}
                          {holderMismatch && ' — not the performing entity'}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </Section>

        <Section title="Related products">
          {products.length === 0 ? <EmptyNote>No products defined.</EmptyNote> : (
            <div className="checkbox-list">
              {products.map(p => (
                <label key={p.id} className="checkbox-item">
                  <input type="checkbox" checked={p.activityIds.includes(id)} onChange={e => actions.setProductActivity(p.id, id, e.target.checked)} />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          )}
        </Section>

        <Section title="Related activities">
          {activities.length <= 1 ? <EmptyNote>No other activities.</EmptyNote> : (
            <div className="checkbox-list">
              {activities.filter(a => a.id !== id).map(a => (
                <label key={a.id} className="checkbox-item">
                  <input type="checkbox" checked={activity.relatedActivityIds.includes(a.id)} onChange={e => actions.setRelatedActivity(id, a.id, e.target.checked)} />
                  <span>{a.name}</span>
                </label>
              ))}
            </div>
          )}
        </Section>

        <TextAreaField label="Notes" rows={2} value={activity.notes ?? ''} onChange={v => update({ notes: v }, 'notes')} />
        <div className="inspector-actions">
          <DeleteButton label="Delete activity" consequence={`Removes the activity, its ${assignments.length} assignment(s) and its links from products and licences. Undo with ⌘Z.`} onConfirm={() => actions.deleteActivity(id)} />
        </div>
      </div>
    </div>
  );
}

function AssignEntityForm<R extends string>({
  entities,
  roles,
  defaultRole,
  onAssign
}: {
  entities: { value: string; label: string }[];
  roles: Record<R, { label: string }>;
  defaultRole: R;
  onAssign: (entityId: string, role: R) => void;
}) {
  const [entityId, setEntityId] = useState('');
  const [role, setRole] = useState<R | ''>('');
  const effectiveRole = role || defaultRole;
  return (
    <form
      className="assign-form"
      onSubmit={e => {
        e.preventDefault();
        if (entityId) onAssign(entityId, effectiveRole);
        setEntityId('');
        setRole('');
      }}
    >
      <select className="form-select" aria-label="Entity to assign" value={entityId} onChange={e => setEntityId(e.target.value)}>
        <option value="">Add entity…</option>
        {entities.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select className="form-select" aria-label="Role" value={effectiveRole} onChange={e => setRole(e.target.value as R)}>
        {(Object.keys(roles) as R[]).map(r => <option key={r} value={r}>{roles[r].label}</option>)}
      </select>
      <button type="submit" className="btn-secondary btn-sm" disabled={!entityId}>Assign</button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export function ProductDetails({ id }: { id: string }) {
  const actions = useActions();
  const product = useEditor(s => s.doc.products.find(p => p.id === id));
  const assignments = useEditor(s => s.doc.productAssignments.filter(a => a.productId === id), shallowArrayEqual);
  const activities = useEditor(s => s.doc.activities);
  const entities = useEntityOptions();
  if (!product) return null;
  const update = actions.updateProduct.bind(null, id);
  const names = new Map(entities.map(e => [e.id, e.name]));

  return (
    <div className="inspector-panel">
      <Header badge={<><span aria-hidden="true">◆</span> Product</>} title={product.name || 'Unnamed product'} />
      <div className="inspector-content">
        <TextField label="Name" value={product.name} onChange={v => update({ name: v }, 'name')} />
        <SelectField<ProductStatus>
          label="Status"
          value={product.status}
          options={Object.entries(PRODUCT_STATUSES).map(([value, d]) => ({ value: value as ProductStatus, label: d.label }))}
          onChange={v => update({ status: v }, 'status')}
        />
        <TextAreaField label="Description" rows={2} value={product.description ?? ''} onChange={v => update({ description: v }, 'description')} />

        <Section title="Entities">
          {assignments.length === 0 ? (
            <EmptyNote>No providing or supporting entities.</EmptyNote>
          ) : (
            <ul className="assignment-list">
              {assignments.map(a => (
                <li key={a.id} className="assignment-row">
                  <div className="assignment-main">
                    <ItemLink target={{ type: 'entity', id: a.entityId }} className="assignment-name">{names.get(a.entityId) ?? 'Missing entity'}</ItemLink>
                    <span className="assignment-meta">{PRODUCT_ROLES[a.role].desc}</span>
                  </div>
                  <select className="form-select form-select-sm" aria-label="Role" value={a.role} onChange={e => actions.updateProductAssignment(a.id, { role: e.target.value as ProductRole })}>
                    {(Object.keys(PRODUCT_ROLES) as ProductRole[]).map(r => <option key={r} value={r}>{PRODUCT_ROLES[r].label}</option>)}
                  </select>
                  <button type="button" className="icon-btn-sm" aria-label={`Remove ${names.get(a.entityId) ?? 'entity'}`} title="Remove assignment" onClick={() => actions.unassignProduct(a.id)}>×</button>
                </li>
              ))}
            </ul>
          )}
          <AssignEntityForm<ProductRole>
            entities={entities.map(e => ({ value: e.id, label: entityOptionLabel(e) }))}
            roles={PRODUCT_ROLES}
            defaultRole={assignments.some(a => a.role === 'provider') ? 'dependency' : 'provider'}
            onAssign={(entityId, role) => actions.assignProduct(id, entityId, role)}
          />
        </Section>

        <Section title="Underlying activities">
          {activities.length === 0 ? <EmptyNote>No activities defined.</EmptyNote> : (
            <div className="checkbox-list">
              {activities.map(a => (
                <label key={a.id} className="checkbox-item">
                  <input type="checkbox" checked={product.activityIds.includes(a.id)} onChange={e => actions.setProductActivity(id, a.id, e.target.checked)} />
                  <span>{a.name}{a.requiresLicence && <span className="checkbox-hint">requires licence</span>}</span>
                </label>
              ))}
            </div>
          )}
        </Section>

        <TextAreaField label="Notes" rows={2} value={product.notes ?? ''} onChange={v => update({ notes: v }, 'notes')} />
        <div className="inspector-actions">
          <DeleteButton label="Delete product" consequence={`Removes the product and its ${assignments.length} entity assignment(s). Undo with ⌘Z.`} onConfirm={() => actions.deleteProduct(id)} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Licence
// ---------------------------------------------------------------------------

export function LicenceDetails({ id }: { id: string }) {
  const actions = useActions();
  const licence = useEditor(s => s.doc.licences.find(l => l.id === id));
  const activities = useEditor(s => s.doc.activities);
  const assignments = useEditor(s => s.doc.activityAssignments);
  const entities = useEntityOptions();
  if (!licence) return null;
  const update = actions.updateLicence.bind(null, id);
  const names = new Map(entities.map(e => [e.id, e.name]));
  const status = LICENCE_STATUSES[licence.status];

  return (
    <div className="inspector-panel">
      <Header badge={<><span aria-hidden="true">⚖</span> Licence</>} title={licence.name || 'Unnamed licence'} />
      <div className="inspector-content">
        <TextField label="Name" value={licence.name} onChange={v => update({ name: v }, 'name')} />
        <RegistrySelect
          label="Licence type"
          value={licence.licenceType}
          registry={LICENCE_TYPES}
          emptyLabel="Not specified"
          onChange={v => update({ licenceType: v, ...(LICENCE_TYPES[v]?.defaultAuthority && !licence.authority ? { authority: LICENCE_TYPES[v].defaultAuthority } : {}) }, 'licenceType')}
        />
        <TextField label="Authority" value={licence.authority} onChange={v => update({ authority: v }, 'authority')} list="authority-options" />
        <datalist id="authority-options">
          {REGULATORY_AUTHORITIES.map(a => <option key={a} value={a} />)}
        </datalist>
        <SelectField
          label="Holder (responsible entity)"
          value={licence.holderEntityId ?? ''}
          options={[{ value: '', label: '— Not assigned —' }, ...entities.map(e => ({ value: e.id, label: entityOptionLabel(e) }))]}
          onChange={v => update({ holderEntityId: v || null }, 'holderEntityId')}
        />
        <div className="form-row">
          <SelectField<LicenceStatus>
            className="flex-1"
            label="Status"
            value={licence.status}
            options={Object.entries(LICENCE_STATUSES).map(([value, d]) => ({ value: value as LicenceStatus, label: d.label }))}
            onChange={v => update({ status: v }, 'status')}
          />
          <TextField className="flex-1" label="Reference" value={licence.reference ?? ''} onChange={v => update({ reference: v }, 'reference')} />
        </div>
        {!status.inForce && (
          <p className={`notice-box ${status.pending ? 'notice-warning' : 'notice-error'}`}>
            {status.pending
              ? `${status.label}: this licence is not granted. Activities it covers are not authorised by it.`
              : `${status.label}: this licence does not currently authorise any activity.`}
          </p>
        )}
        <div className="form-row">
          <DateField className="flex-1" label="Application date" value={licence.applicationDate ?? ''} onChange={v => update({ applicationDate: v }, 'applicationDate')} />
          <DateField className="flex-1" label="Grant date" value={licence.grantDate ?? ''} onChange={v => update({ grantDate: v }, 'grantDate')} />
        </div>
        <div className="form-row">
          <DateField className="flex-1" label="Effective date" value={licence.effectiveDate ?? ''} onChange={v => update({ effectiveDate: v }, 'effectiveDate')} />
          <DateField className="flex-1" label="Expiry date" value={licence.expiryDate ?? ''} onChange={v => update({ expiryDate: v }, 'expiryDate')} />
        </div>

        <Section title="Covered activities">
          {activities.length === 0 ? <EmptyNote>No activities defined.</EmptyNote> : (
            <div className="checkbox-list">
              {activities.map(a => {
                const performers = assignments.filter(x => x.activityId === a.id && x.role === 'performs').map(x => x.entityId);
                const mismatch = licence.holderEntityId !== null && performers.length > 0 && !performers.includes(licence.holderEntityId);
                return (
                  <label key={a.id} className="checkbox-item">
                    <input type="checkbox" checked={licence.activityIds.includes(a.id)} onChange={e => actions.setLicenceActivity(id, a.id, e.target.checked)} />
                    <span>
                      {a.name}
                      <span className="checkbox-hint">
                        {performers.length ? `Performed by ${performers.map(p => names.get(p) ?? '?').join(', ')}` : 'No performing entity'}
                        {a.requiredLicenceType && ` · requires ${getLicenceTypeLabel(a.requiredLicenceType)}`}
                        {mismatch && licence.activityIds.includes(a.id) && ' — performed by a different entity than the holder'}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </Section>

        <TextAreaField label="Document references" hint="One per line: file name, URL or register entry." rows={2} value={licence.documents.join('\n')} onChange={v => update({ documents: v.split('\n') }, 'documents')} />
        <TextAreaField label="Notes & conditions" rows={3} value={licence.notes ?? ''} onChange={v => update({ notes: v }, 'notes')} />
        <div className="inspector-actions">
          <DeleteButton label="Delete licence" onConfirm={() => actions.deleteLicence(id)} />
        </div>
      </div>
    </div>
  );
}
