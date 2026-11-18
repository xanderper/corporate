'use client';

import type { ColorTheme, LineRouting, PortPosition, RelationshipKind } from '../../lib/types';
import { COLOR_THEMES, NODE_COLOR_PRESETS, RELATIONSHIP_KINDS, RELATIONSHIP_KIND_KEYS, getEntityType } from '../../lib/constants';
import { useActions, useEditor, useUiActions } from '../editor-context';
import { DateField, DeleteButton, PercentField, Section, SelectField, TextAreaField, TextField } from './fields';
import { ItemLink, useEntityOptions } from './shared';

const PORT_OPTIONS: { value: PortPosition; label: string }[] = [
  { value: 'auto', label: 'Auto (smart)' },
  { value: 'top', label: 'Top (↑)' },
  { value: 'bottom', label: 'Bottom (↓)' },
  { value: 'left', label: 'Left (←)' },
  { value: 'right', label: 'Right (→)' }
];

export function RelationshipDetails({ id }: { id: string }) {
  const actions = useActions();
  const rel = useEditor(s => s.doc.relationships.find(r => r.id === id));
  const entities = useEntityOptions();
  if (!rel) return null;

  const names = new Map(entities.map(e => [e.id, e]));
  const from = names.get(rel.from);
  const to = names.get(rel.to);
  const def = RELATIONSHIP_KINDS[rel.kind];
  const update = (patch: Parameters<typeof actions.updateRelationship>[1], field?: string) => actions.updateRelationship(id, patch, field);

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div className="header-title-row">
          <span className="type-badge"><span className={`kind-swatch kind-${rel.kind}`} aria-hidden="true" /> Relationship</span>
          <h3 className="inspector-title">{def.label}</h3>
        </div>
        <p className="edge-endpoints">
          <ItemLink target={{ type: 'entity', id: rel.from }}>{from?.name ?? 'Missing entity'}</ItemLink>
          <span> {def.verb} </span>
          <ItemLink target={{ type: 'entity', id: rel.to }}>{to?.name ?? 'Missing entity'}</ItemLink>
        </p>
      </div>

      <div className="inspector-content">
        <SelectField<RelationshipKind>
          label="Type"
          value={rel.kind}
          options={RELATIONSHIP_KIND_KEYS.map(k => ({ value: k, label: RELATIONSHIP_KINDS[k].label }))}
          hint={def.desc}
          onChange={kind => update({ kind }, 'kind')}
        />

        {rel.kind === 'ownership' && (
          <>
            <div className="form-row">
              <PercentField className="flex-1" label="Shares" value={rel.sharePct} onChange={v => update({ sharePct: v }, 'sharePct')} placeholder="100" />
              <PercentField className="flex-1" label="Voting rights" value={rel.votingPct} onChange={v => update({ votingPct: v }, 'votingPct')} placeholder="= shares" />
            </div>
            <div className="form-row">
              <PercentField className="flex-1" label="Economic interest" value={rel.economicPct} onChange={v => update({ economicPct: v }, 'economicPct')} placeholder="= shares" />
              <TextField className="flex-1" label="Share class" value={rel.shareClass ?? ''} onChange={v => update({ shareClass: v }, 'shareClass')} placeholder="e.g. A shares" />
            </div>
            {to && !getEntityType(to.type).hasShareCapital && (
              <p className="notice-box notice-error">{to.name} has no share capital. Consider control or an arrangement instead.</p>
            )}
          </>
        )}

        {rel.kind === 'certificates' && (
          <>
            <PercentField label="Share of depositary receipts" value={rel.certificatePct} onChange={v => update({ certificatePct: v }, 'certificatePct')} placeholder="100" />
            <p className="form-hint">The holder receives the economic rights; the STAK keeps the legal title and voting rights of the underlying shares.</p>
          </>
        )}

        {rel.kind === 'control' && (
          <div className="form-row">
            <PercentField className="flex-1" label="Voting control" value={rel.votingPct} onChange={v => update({ votingPct: v }, 'votingPct')} />
            <TextField className="flex-1" label="Role" value={rel.role} onChange={v => update({ role: v }, 'role')} placeholder="e.g. Sole director" />
          </div>
        )}

        {'description' in rel && (
          <>
            <TextField label="Description" value={rel.description} onChange={v => update({ description: v }, 'description')} placeholder={def.desc} />
            <div className="form-row">
              <TextField className="flex-1" label="Agreement reference" value={rel.agreementRef ?? ''} onChange={v => update({ agreementRef: v }, 'agreementRef')} />
              <DateField className="flex-1" label="Start date" value={rel.startDate ?? ''} onChange={v => update({ startDate: v }, 'startDate')} />
            </div>
          </>
        )}

        <TextAreaField label="Notes" rows={2} value={rel.notes ?? ''} onChange={v => update({ notes: v }, 'notes')} />

        <Section title="Line & connection sides">
          <SelectField<LineRouting>
            label="Routing"
            value={rel.routing ?? 'auto'}
            options={[
              { value: 'auto', label: 'Canvas default' },
              { value: 'elbow', label: 'Orthogonal' },
              { value: 'bezier', label: 'Curved' },
              { value: 'straight', label: 'Straight' }
            ]}
            onChange={routing => update({ routing }, 'routing')}
          />
          <div className="form-row">
            <SelectField<PortPosition>
              className="flex-1"
              label={`Connect from (${from?.name ? from.name.slice(0, 10) : 'Source'})`}
              value={rel.fromPort ?? 'auto'}
              options={PORT_OPTIONS}
              onChange={fromPort => update({ fromPort }, 'fromPort')}
            />
            <SelectField<PortPosition>
              className="flex-1"
              label={`Connect to (${to?.name ? to.name.slice(0, 10) : 'Target'})`}
              value={rel.toPort ?? 'auto'}
              options={PORT_OPTIONS}
              onChange={toPort => update({ toPort }, 'toPort')}
            />
          </div>
          <div className="inline-form-actions">
            <button type="button" className="btn-secondary btn-sm" onClick={() => actions.reverseRelationship(id)}>⇄ Reverse direction</button>
            {((rel.midOffset ?? 0) !== 0 || (rel.fromPort && rel.fromPort !== 'auto') || (rel.toPort && rel.toPort !== 'auto')) && (
              <button type="button" className="btn-ghost btn-sm" onClick={() => update({ midOffset: 0, fromPort: 'auto', toPort: 'auto' })}>Reset line</button>
            )}
          </div>
        </Section>

        <div className="inspector-actions">
          <DeleteButton label="Delete relationship" onConfirm={() => actions.deleteRelationship(id)} />
        </div>
      </div>
    </div>
  );
}

export function GroupDetails({ id }: { id: string }) {
  const actions = useActions();
  const group = useEditor(s => s.doc.groups.find(g => g.id === id));
  const entities = useEntityOptions();
  if (!group) return null;
  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div className="header-title-row">
          <span className="type-badge">Group</span>
          <h3 className="inspector-title">{group.name}</h3>
        </div>
        <p className="form-hint">Groups are visual only and have no legal meaning.</p>
      </div>
      <div className="inspector-content">
        <TextField label="Name" value={group.name} onChange={v => actions.updateGroup(id, { name: v }, 'name')} />
        <div className="form-group">
          <span className="form-label">Colour</span>
          <div className="color-presets-row" role="radiogroup" aria-label="Group colour">
            {COLOR_THEMES.map(c => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={group.color === c}
                aria-label={NODE_COLOR_PRESETS[c].label}
                className={`color-btn color-${c} ${group.color === c ? 'selected' : ''}`}
                onClick={() => actions.updateGroup(id, { color: c as ColorTheme }, 'color')}
              />
            ))}
          </div>
        </div>
        <Section title="Members">
          <div className="checkbox-list">
            {entities.map(e => (
              <label key={e.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={group.members.includes(e.id)}
                  onChange={ev =>
                    actions.updateGroup(id, { members: ev.target.checked ? [...group.members, e.id] : group.members.filter(m => m !== e.id) }, 'members')
                  }
                />
                <span>{e.name}</span>
              </label>
            ))}
          </div>
        </Section>
        <div className="inspector-actions">
          <DeleteButton label="Delete group" consequence="Removes the box only; its entities are kept." onConfirm={() => actions.deleteGroup(id)} />
        </div>
      </div>
    </div>
  );
}

export function MultiSelection({ ids }: { ids: string[] }) {
  const actions = useActions();
  const uiActions = useUiActions();
  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div className="header-title-row">
          <span className="type-badge">Selection</span>
          <h3 className="inspector-title">{ids.length} entities</h3>
        </div>
      </div>
      <div className="inspector-content">
        <p className="form-hint">Drag any selected card to move them together, or use the arrow keys.</p>
        <div className="action-buttons-col">
          <button type="button" className="btn-secondary w-full" onClick={() => actions.createGroup({ name: 'New group' })}>▣ Group selected entities</button>
          <button type="button" className="btn-secondary w-full" onClick={() => actions.duplicateEntities(ids)}>⧉ Duplicate</button>
          <button type="button" className="btn-secondary w-full" onClick={() => uiActions.focusEntities(ids)}>◎ Zoom to selection</button>
        </div>
        <div className="inspector-actions">
          <DeleteButton label={`Delete ${ids.length} entities`} consequence="Also removes their relationships and assignments. Undo with ⌘Z." onConfirm={() => actions.deleteEntities(ids)} />
        </div>
      </div>
    </div>
  );
}
