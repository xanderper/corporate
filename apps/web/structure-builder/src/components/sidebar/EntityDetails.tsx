'use client';

import { useState } from 'react';
import type { ActivityRole, ColorTheme, EntityStatus, ProductRole, RelationshipKind } from '../../lib/types';
import {
  ACTIVITY_ROLES,
  ACTIVITY_STATUSES,
  COLOR_THEMES,
  ENTITY_STATUSES,
  ENTITY_TYPES,
  LICENCE_STATUSES,
  NODE_COLOR_PRESETS,
  PRODUCT_ROLES,
  PRODUCT_STATUSES,
  RELATIONSHIP_KINDS,
  RELATIONSHIP_KIND_KEYS,
  getEntityType
} from '../../lib/constants';
import { defaultRelationshipKind, describeEntityDeletion, formatRelationshipLabel, getEntityLinks } from '../../lib/model';
import { shallowArrayEqual, useActions, useEditor, useEditorContext, useUi, useUiActions } from '../editor-context';
import type { EntitySection } from '../ui-state';
import { CheckboxField, DateField, DeleteButton, Section, SelectField, StatusPill, TextAreaField, TextField } from './fields';
import { EmptyNote, ItemLink, entityOptionLabel, useEntity, useEntityOptions } from './shared';

const CUSTOM_TYPE = '__custom';
const JURISDICTIONS = ['Netherlands', 'Belgium', 'Luxembourg', 'Germany', 'Ireland', 'United Kingdom', 'Switzerland', 'United States'];

export function EntityDetails({ id }: { id: string }) {
  const entity = useEntity(id);
  const links = useEditor(s => getEntityLinks(s.doc, id));
  const relCount = useEditor(s => s.doc.relationships.filter(r => r.from === id || r.to === id).length);
  const section = useUi(s => s.entitySection);
  const uiActions = useUiActions();
  if (!entity) return null;

  const typeDef = getEntityType(entity.type);
  const sections: { key: EntitySection; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'relations', label: 'Relations', count: relCount },
    { key: 'activities', label: 'Activities', count: links.activities.length },
    { key: 'products', label: 'Products', count: links.products.length },
    { key: 'licences', label: 'Licences', count: links.licences.length }
  ];

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div className="header-title-row">
          <span className="type-badge"><span aria-hidden="true">{typeDef.glyph}</span> {typeDef.short}</span>
          <h3 className="inspector-title" title={entity.name}>{entity.name || 'Unnamed entity'}</h3>
        </div>
        <EntityActions id={id} />
        <div className="subtab-pills" role="tablist" aria-label="Entity sections">
          {sections.map(s => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={section === s.key}
              className={`subtab-pill ${section === s.key ? 'active' : ''}`}
              onClick={() => uiActions.patch({ entitySection: s.key })}
            >
              {s.label}
              {s.count !== undefined && <span className="subtab-count">{s.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="inspector-content" role="tabpanel">
        {section === 'overview' && <EntityOverview id={id} />}
        {section === 'relations' && <EntityRelations id={id} />}
        {section === 'activities' && <EntityActivities id={id} />}
        {section === 'products' && <EntityProducts id={id} />}
        {section === 'licences' && <EntityLicences id={id} />}
      </div>
    </div>
  );
}

function EntityActions({ id }: { id: string }) {
  const { actions, uiActions } = useEditorContext();
  const items: { label: string; icon: string; title: string; run: () => void }[] = [
    { label: 'Subsidiary', icon: '↳', title: 'Add a subsidiary held 100% by this entity', run: () => actions.addSubsidiary(id) },
    { label: 'Activity', icon: '●', title: 'Create an activity performed by this entity', run: () => actions.createActivity({}, { entityId: id }) },
    { label: 'Product', icon: '◆', title: 'Create a product provided by this entity', run: () => actions.createProduct({}, { entityId: id }) },
    { label: 'Licence', icon: '⚖', title: 'Register a licence held by this entity', run: () => actions.createLicence({ holderEntityId: id }) },
    {
      label: 'Connect',
      icon: '→',
      title: 'Create a relationship by selecting the other entity on the canvas',
      run: () => uiActions.startConnect(id)
    },
    { label: 'Duplicate', icon: '⧉', title: 'Duplicate details (⌘D)', run: () => actions.duplicateEntities([id]) },
    { label: 'Zoom to', icon: '◎', title: 'Zoom the canvas to this entity (Shift F)', run: () => uiActions.focusEntities([id]) }
  ];
  return (
    <div className="contextual-actions" role="toolbar" aria-label="Entity actions">
      {items.map(item => (
        <button key={item.label} type="button" className="ctx-action" title={item.title} onClick={item.run}>
          <span aria-hidden="true">{item.icon}</span> {item.label}
        </button>
      ))}
    </div>
  );
}

function EntityOverview({ id }: { id: string }) {
  const actions = useActions();
  const entity = useEntity(id);
  const impact = useEditor(s => describeEntityDeletion(s.doc, [id]), (a, b) => JSON.stringify(a) === JSON.stringify(b));
  const [customType, setCustomType] = useState(false);
  if (!entity) return null;

  const update = actions.updateEntity.bind(null, id);
  const known = Boolean(ENTITY_TYPES[entity.type]);
  const typeDef = getEntityType(entity.type);
  const typeOptions = Object.entries(ENTITY_TYPES)
    .filter(([key, def]) => !def.legacy || key === entity.type)
    .map(([key, def]) => ({ value: key, label: def.label }));
  typeOptions.push({ value: CUSTOM_TYPE, label: 'Other legal form…' });
  const showCustom = customType || !known;
  const assignments = impact.activityAssignments + impact.productAssignments;
  const consequences: string[] = [];
  if (impact.relationships) consequences.push(`${impact.relationships} relationship(s)`);
  if (assignments) consequences.push(`${assignments} activity/product assignment(s)`);

  return (
    <>
      <TextField label="Legal name" value={entity.name} onChange={v => update({ name: v }, 'name')} placeholder="e.g. Qorve Technology B.V." />
      <div className="form-row">
        <SelectField
          className="flex-1"
          label="Legal form"
          value={showCustom ? CUSTOM_TYPE : entity.type}
          options={typeOptions}
          onChange={v => {
            if (v === CUSTOM_TYPE) {
              setCustomType(true);
              return;
            }
            setCustomType(false);
            update({ type: v, color: ENTITY_TYPES[v]?.defaultColor ?? entity.color }, 'type');
          }}
        />
        <SelectField<EntityStatus>
          className="flex-1"
          label="Status"
          value={entity.status}
          options={Object.entries(ENTITY_STATUSES).map(([value, def]) => ({ value: value as EntityStatus, label: def.label }))}
          onChange={v => update({ status: v }, 'status')}
        />
      </div>
      {showCustom && (
        <TextField label="Custom legal form" value={known ? '' : entity.type} onChange={v => update({ type: v || 'BV' }, 'type')} placeholder="e.g. GmbH, Ltd, Coöperatie" autoFocus />
      )}
      {typeDef.category === 'foundation' && (
        <p className="notice-box notice-info">
          {typeDef.issuesCertificates
            ? 'A STAK holds the legal title to shares (model as share ownership from the STAK) and issues depositary receipts (model as certificates towards the STAK).'
            : 'A foundation has no shareholders. Model board appointment as control and safekeeping as asset custody.'}
        </p>
      )}
      <div className="form-row">
        <TextField className="flex-1" label="Jurisdiction" value={entity.jurisdiction ?? ''} onChange={v => update({ jurisdiction: v }, 'jurisdiction')} list="jurisdiction-options" />
        <TextField className="flex-1" label="Registration no." value={entity.regNumber ?? ''} onChange={v => update({ regNumber: v }, 'regNumber')} placeholder="KvK / company no." />
      </div>
      <datalist id="jurisdiction-options">
        {JURISDICTIONS.map(j => <option key={j} value={j} />)}
      </datalist>
      <div className="form-row">
        <DateField className="flex-1" label="Incorporation date" value={entity.incorporationDate ?? ''} onChange={v => update({ incorporationDate: v }, 'incorporationDate')} />
        <TextField className="flex-1" label="Tax number" value={entity.taxNumber ?? ''} onChange={v => update({ taxNumber: v }, 'taxNumber')} />
      </div>
      <TextAreaField label="Description" rows={2} value={entity.description ?? ''} onChange={v => update({ description: v }, 'description')} placeholder="Purpose and role in the group" />

      <Section title="Documents & notes">
        <TextAreaField label="Notes" rows={3} value={entity.notes ?? ''} onChange={v => update({ notes: v }, 'notes')} placeholder="Governance, tax residency, UBO notes…" />
        <TextAreaField
          label="Document references"
          hint="One per line: file name, URL or registry reference."
          rows={2}
          value={(entity.documents ?? []).join('\n')}
          onChange={v => update({ documents: v.split('\n') }, 'documents')}
        />
      </Section>

      <Section title="Appearance">
        <div className="color-presets-row" role="radiogroup" aria-label="Card colour">
          {COLOR_THEMES.map(c => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={entity.color === c}
              aria-label={NODE_COLOR_PRESETS[c].label}
              title={NODE_COLOR_PRESETS[c].label}
              className={`color-btn color-${c} ${entity.color === c ? 'selected' : ''}`}
              onClick={() => update({ color: c as ColorTheme }, 'color')}
            />
          ))}
        </div>
        <CheckboxField label="Lock position" hint="Auto layout and dragging leave it in place." checked={Boolean(entity.locked)} onChange={v => update({ locked: v }, 'locked')} />
      </Section>

      <div className="inspector-actions">
        <DeleteButton
          label="Delete entity"
          consequence={`Also removes ${consequences.length ? consequences.join(' and ') : 'nothing else'}${impact.licences ? `; ${impact.licences} licence(s) become unassigned` : ''}. Activity, product and licence records are kept. Undo with ⌘Z.`}
          onConfirm={() => actions.deleteEntities([id])}
        />
      </div>
    </>
  );
}

function EntityRelations({ id }: { id: string }) {
  const { actions, uiActions } = useEditorContext();
  const rels = useEditor(s => s.doc.relationships.filter(r => r.from === id || r.to === id), shallowArrayEqual);
  const allOptions = useEntityOptions();
  const names = new Map(allOptions.map(o => [o.id, o]));
  const entityType = names.get(id)?.type ?? 'BV';
  const options = allOptions.filter(o => o.id !== id);
  const [direction, setDirection] = useState<'out' | 'in'>('out');
  const [otherId, setOtherId] = useState('');
  const [kind, setKind] = useState<RelationshipKind | ''>('');

  const incoming = rels.filter(r => r.to === id);
  const outgoing = rels.filter(r => r.from === id);
  const other = otherId || options[0]?.id || '';
  const otherType = names.get(other)?.type ?? 'BV';
  const effectiveKind: RelationshipKind = kind || (direction === 'out' ? defaultRelationshipKind(entityType, otherType) : defaultRelationshipKind(otherType, entityType));

  const renderList = (list: typeof rels, side: 'from' | 'to') =>
    list.length === 0 ? null : (
      <ul className="rel-list">
        {list.map(r => {
          const otherEnd = names.get(side === 'from' ? r.from : r.to);
          return (
            <li key={r.id} className="rel-card">
              <ItemLink target={{ type: 'entity', id: otherEnd?.id ?? '' }} className="rel-parent">{otherEnd?.name ?? 'Missing entity'}</ItemLink>
              <ItemLink target={{ type: 'relationship', id: r.id }} className="rel-label">
                <span className={`kind-swatch kind-${r.kind}`} aria-hidden="true" /> {RELATIONSHIP_KINDS[r.kind].short} · {formatRelationshipLabel(r)}
              </ItemLink>
            </li>
          );
        })}
      </ul>
    );

  return (
    <>
      <Section title={`Held by / provided to this entity (${incoming.length})`}>
        {renderList(incoming, 'from') ?? <EmptyNote>No shareholders or incoming relationships.</EmptyNote>}
      </Section>
      <Section title={`Held / provided by this entity (${outgoing.length})`}>
        {renderList(outgoing, 'to') ?? <EmptyNote>No participations or outgoing relationships.</EmptyNote>}
      </Section>

      <Section title="New relationship">
        {options.length === 0 ? (
          <EmptyNote>Add another entity first.</EmptyNote>
        ) : (
          <form
            className="inline-form"
            onSubmit={e => {
              e.preventDefault();
              if (!other) return;
              if (direction === 'out') actions.connect(id, other, effectiveKind);
              else actions.connect(other, id, effectiveKind);
              setKind('');
            }}
          >
            <SelectField<'out' | 'in'>
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={[
                { value: 'out', label: 'This entity → other entity' },
                { value: 'in', label: 'Other entity → this entity' }
              ]}
            />
            <SelectField label="Other entity" value={other} onChange={setOtherId} options={options.map(o => ({ value: o.id, label: entityOptionLabel(o) }))} />
            <SelectField<RelationshipKind>
              label="Type"
              value={effectiveKind}
              onChange={setKind}
              options={RELATIONSHIP_KIND_KEYS.map(k => ({ value: k, label: RELATIONSHIP_KINDS[k].label }))}
              hint={`${direction === 'out' ? names.get(id)?.name : names.get(other)?.name} ${RELATIONSHIP_KINDS[effectiveKind].verb} ${direction === 'out' ? names.get(other)?.name : names.get(id)?.name}.`}
            />
            <div className="inline-form-actions">
              <button type="submit" className="btn-primary btn-sm">Add relationship</button>
              <button type="button" className="btn-ghost btn-sm" onClick={() => uiActions.startConnect(id, effectiveKind)}>Pick on canvas</button>
            </div>
          </form>
        )}
      </Section>
    </>
  );
}

function AssignForm<R extends string>({
  options,
  roles,
  defaultRole,
  onAssign,
  emptyText,
  placeholder
}: {
  options: { value: string; label: string }[];
  roles: Record<R, { label: string }>;
  defaultRole: R;
  onAssign: (targetId: string, role: R) => void;
  emptyText: string;
  placeholder: string;
}) {
  const [target, setTarget] = useState('');
  const [role, setRole] = useState<R>(defaultRole);
  if (options.length === 0) return <EmptyNote>{emptyText}</EmptyNote>;
  return (
    <form
      className="assign-form"
      onSubmit={e => {
        e.preventDefault();
        if (target) onAssign(target, role);
        setTarget('');
      }}
    >
      <select className="form-select" aria-label={placeholder} value={target} onChange={e => setTarget(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <select className="form-select" aria-label="Role" value={role} onChange={e => setRole(e.target.value as R)}>
        {(Object.keys(roles) as R[]).map(r => <option key={r} value={r}>{roles[r].label}</option>)}
      </select>
      <button type="submit" className="btn-secondary btn-sm" disabled={!target}>Assign</button>
    </form>
  );
}

function EntityActivities({ id }: { id: string }) {
  const actions = useActions();
  const links = useEditor(s => getEntityLinks(s.doc, id));
  const allActivities = useEditor(s => s.doc.activities);
  const covering = useEditor(s => s.doc.licences);
  const assigned = new Set(links.activities.map(a => a.activity.id));

  return (
    <>
      <Section title="Activities" actions={<button type="button" className="btn-secondary btn-sm" onClick={() => actions.createActivity({}, { entityId: id })}>+ New activity</button>}>
        {links.activities.length === 0 ? (
          <EmptyNote>No activities assigned. Assign an existing activity or create a new one.</EmptyNote>
        ) : (
          <ul className="assignment-list">
            {links.activities.map(({ activity, assignment }) => {
              const needsLicence = activity.requiresLicence && assignment.role === 'performs';
              const held = covering.filter(l => l.holderEntityId === id && l.activityIds.includes(activity.id));
              return (
                <li key={assignment.id} className="assignment-row">
                  <div className="assignment-main">
                    <ItemLink target={{ type: 'activity', id: activity.id }} className="assignment-name">{activity.name}</ItemLink>
                    <span className="assignment-meta">
                      <StatusPill label={ACTIVITY_STATUSES[activity.status].label} color={ACTIVITY_STATUSES[activity.status].color} />
                      {needsLicence && (
                        <span className={`licence-flag ${held.some(l => LICENCE_STATUSES[l.status].inForce) ? 'ok' : 'pending'}`}>
                          ⚖ {held.length ? held.map(l => LICENCE_STATUSES[l.status].label).join(', ') : 'licence required'}
                        </span>
                      )}
                    </span>
                  </div>
                  <select
                    className="form-select form-select-sm"
                    aria-label={`Role for ${activity.name}`}
                    value={assignment.role}
                    onChange={e => actions.updateActivityAssignment(assignment.id, { role: e.target.value as ActivityRole })}
                  >
                    {(Object.keys(ACTIVITY_ROLES) as ActivityRole[]).map(r => <option key={r} value={r}>{ACTIVITY_ROLES[r].label}</option>)}
                  </select>
                  <button type="button" className="icon-btn-sm" aria-label={`Remove ${activity.name} from this entity`} title="Remove assignment" onClick={() => actions.unassignActivity(assignment.id)}>×</button>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
      <Section title="Assign existing activity">
        <AssignForm<ActivityRole>
          options={allActivities.map(a => ({ value: a.id, label: assigned.has(a.id) ? `${a.name} (already assigned)` : a.name }))}
          roles={ACTIVITY_ROLES}
          defaultRole="performs"
          placeholder="Choose activity…"
          emptyText="No activities defined yet."
          onAssign={(activityId, role) => actions.assignActivity(activityId, id, role)}
        />
        <p className="form-hint">“Performs” = carries out and is responsible for the activity. “Supports” = only provides software, staff or operations.</p>
      </Section>
    </>
  );
}

function EntityProducts({ id }: { id: string }) {
  const actions = useActions();
  const links = useEditor(s => getEntityLinks(s.doc, id));
  const allProducts = useEditor(s => s.doc.products);
  return (
    <>
      <Section title="Products & services" actions={<button type="button" className="btn-secondary btn-sm" onClick={() => actions.createProduct({}, { entityId: id })}>+ New product</button>}>
        {links.products.length === 0 ? (
          <EmptyNote>No products linked to this entity.</EmptyNote>
        ) : (
          <ul className="assignment-list">
            {links.products.map(({ product, assignment }) => (
              <li key={assignment.id} className="assignment-row">
                <div className="assignment-main">
                  <ItemLink target={{ type: 'product', id: product.id }} className="assignment-name">{product.name}</ItemLink>
                  <span className="assignment-meta"><StatusPill label={PRODUCT_STATUSES[product.status].label} color={PRODUCT_STATUSES[product.status].color} /></span>
                </div>
                <select
                  className="form-select form-select-sm"
                  aria-label={`Role for ${product.name}`}
                  value={assignment.role}
                  onChange={e => actions.updateProductAssignment(assignment.id, { role: e.target.value as ProductRole })}
                >
                  {(Object.keys(PRODUCT_ROLES) as ProductRole[]).map(r => <option key={r} value={r}>{PRODUCT_ROLES[r].label}</option>)}
                </select>
                <button type="button" className="icon-btn-sm" aria-label={`Remove ${product.name} from this entity`} title="Remove assignment" onClick={() => actions.unassignProduct(assignment.id)}>×</button>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title="Link existing product">
        <AssignForm<ProductRole>
          options={allProducts.map(p => ({ value: p.id, label: p.name }))}
          roles={PRODUCT_ROLES}
          defaultRole="provider"
          placeholder="Choose product…"
          emptyText="No products defined yet."
          onAssign={(productId, role) => actions.assignProduct(productId, id, role)}
        />
        <p className="form-hint">“Provider” offers the product to customers. “Dependency” means the product relies on this entity without it legally providing the product.</p>
      </Section>
    </>
  );
}

function EntityLicences({ id }: { id: string }) {
  const actions = useActions();
  const links = useEditor(s => getEntityLinks(s.doc, id));
  const regulated = links.activities.filter(a => a.assignment.role === 'performs' && a.activity.requiresLicence);
  return (
    <>
      <Section title="Licences held" actions={<button type="button" className="btn-secondary btn-sm" onClick={() => actions.createLicence({ holderEntityId: id })}>+ New licence</button>}>
        {links.licences.length === 0 ? (
          <EmptyNote>No licences or permissions recorded for this entity.</EmptyNote>
        ) : (
          <ul className="assignment-list">
            {links.licences.map(l => (
              <li key={l.id} className="assignment-row">
                <div className="assignment-main">
                  <ItemLink target={{ type: 'licence', id: l.id }} className="assignment-name">{l.name}</ItemLink>
                  <span className="assignment-meta">
                    <StatusPill label={LICENCE_STATUSES[l.status].label} color={LICENCE_STATUSES[l.status].color} />
                    <span>{l.authority}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title="Licence requirements of performed activities">
        {regulated.length === 0 ? (
          <EmptyNote>This entity performs no activities configured as requiring a licence.</EmptyNote>
        ) : (
          <ul className="assignment-list">
            {regulated.map(({ activity }) => {
              const held = links.licences.filter(l => l.activityIds.includes(activity.id));
              const inForce = held.some(l => LICENCE_STATUSES[l.status].inForce);
              return (
                <li key={activity.id} className="assignment-row">
                  <div className="assignment-main">
                    <ItemLink target={{ type: 'activity', id: activity.id }} className="assignment-name">{activity.name}</ItemLink>
                    <span className={`licence-flag ${inForce ? 'ok' : 'pending'}`}>
                      {held.length === 0 ? 'No licence record' : held.map(l => `${l.name}: ${LICENCE_STATUSES[l.status].label}`).join(' · ')}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="form-hint">Modelling aid only — not a determination of legal compliance.</p>
      </Section>
    </>
  );
}
