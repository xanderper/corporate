import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as M from '../src/lib/model';
import { findOwnershipCycles, validateStructure } from '../src/lib/validation';
import { instantiateTemplate } from '../src/lib/templates';
import type { StructureDocument } from '../src/lib/types';

const TODAY = '2026-10-27';
const rules = (doc: StructureDocument) => validateStructure(doc, { today: TODAY }).map(d => d.ruleId);

function doc(partial: Partial<StructureDocument>): StructureDocument {
  return { ...M.createEmptyDocument(), ...partial };
}

const ent = (id: string, type = 'BV') => M.createEntity({ id, name: id.toUpperCase(), type, jurisdiction: 'NL' });

test('ownership totals: above expected is an error, below is a warning', () => {
  const base = doc({
    entities: [ent('a'), ent('b'), ent('c')],
    relationships: [
      M.buildRelationship('r1', 'ownership', { from: 'a', to: 'c', sharePct: 60 }),
      M.buildRelationship('r2', 'ownership', { from: 'b', to: 'c', sharePct: 50 })
    ]
  });
  assert.ok(rules(base).includes('ownership_exceeds_total'));

  const below = M.updateRelationship(base, 'r2', { sharePct: 30 });
  assert.ok(rules(below).includes('ownership_below_total'));

  const custom = { ...below, settings: { expectedOwnershipTotal: 90 } };
  assert.ok(!rules(custom).some(r => r.startsWith('ownership_')), 'expected total is configurable');
});

test('missing share percentage is flagged when there are several shareholders', () => {
  const d = doc({
    entities: [ent('a'), ent('b'), ent('c')],
    relationships: [
      M.buildRelationship('r1', 'ownership', { from: 'a', to: 'c', sharePct: 60 }),
      M.buildRelationship('r2', 'ownership', { from: 'b', to: 'c' })
    ]
  });
  const issue = validateStructure(d, { today: TODAY }).find(i => i.ruleId === 'ownership_pct_missing');
  assert.ok(issue);
  assert.deepEqual(issue.target, { type: 'relationship', id: 'r2' }, 'points at the relationship to fix');
});

test('foundations and persons cannot be owned; certificates must target a STAK', () => {
  const d = doc({
    entities: [ent('a'), ent('f', 'Stichting'), ent('p', 'NaturalPerson'), ent('b')],
    relationships: [
      M.buildRelationship('r1', 'ownership', { from: 'a', to: 'f', sharePct: 100 }),
      M.buildRelationship('r2', 'ownership', { from: 'a', to: 'p', sharePct: 100 }),
      M.buildRelationship('r3', 'certificates', { from: 'p', to: 'b', certificatePct: 100 })
    ]
  });
  const r = rules(d);
  assert.equal(r.filter(x => x === 'ownership_of_non_company').length, 2);
  assert.ok(r.includes('certificates_non_stak'));
});

test('a STAK separates legal title (shares) from depositary receipts', () => {
  const d = doc({
    entities: [ent('p', 'NaturalPerson'), ent('stak', 'STAK'), ent('h')],
    relationships: [
      M.buildRelationship('c', 'certificates', { from: 'p', to: 'stak', certificatePct: 100 }),
      M.buildRelationship('o', 'ownership', { from: 'stak', to: 'h', sharePct: 100 })
    ]
  });
  assert.deepEqual(validateStructure(d, { today: TODAY }).filter(i => i.severity === 'error'), []);
  const withoutShares = { ...d, relationships: d.relationships.filter(r => r.id !== 'o') };
  assert.ok(rules(withoutShares).includes('stak_no_shares'));
});

test('circular ownership is detected once per cycle', () => {
  const entities = [ent('a'), ent('b'), ent('c')];
  const relationships = [
    M.buildRelationship('1', 'ownership', { from: 'a', to: 'b', sharePct: 100 }),
    M.buildRelationship('2', 'ownership', { from: 'b', to: 'c', sharePct: 100 }),
    M.buildRelationship('3', 'control', { from: 'c', to: 'a' }),
    M.buildRelationship('4', 'service', { from: 'c', to: 'b' })
  ];
  const cycles = findOwnershipCycles(entities, relationships);
  assert.equal(cycles.length, 1);
  assert.deepEqual(cycles[0], ['a', 'b', 'c', 'a']);
  assert.equal(rules(doc({ entities, relationships })).filter(r => r === 'ownership_cycle').length, 1);
});

test('dangling, self and duplicate relationships', () => {
  const d = doc({
    entities: [ent('a'), ent('b')],
    relationships: [
      M.buildRelationship('1', 'service', { from: 'a', to: 'ghost' }),
      M.buildRelationship('2', 'service', { from: 'a', to: 'a' }),
      M.buildRelationship('3', 'service', { from: 'a', to: 'b' }),
      M.buildRelationship('4', 'service', { from: 'a', to: 'b' })
    ]
  });
  const r = rules(d);
  assert.ok(r.includes('relationship_dangling'));
  assert.ok(r.includes('relationship_self'));
  assert.ok(r.includes('relationship_duplicate'));
});

test('activity without performer, and a supporting entity does not count as responsible', () => {
  let d = doc({ entities: [ent('t')], activities: [M.createActivity({ id: 'a', name: 'Payments' })] });
  assert.ok(rules(d).includes('activity_no_performer'));
  d = M.assignActivity(d, { id: 'x', activityId: 'a', entityId: 't', role: 'supports' });
  assert.ok(rules(d).includes('activity_no_performer'));
  d = M.updateActivityAssignment(d, 'x', { role: 'performs' });
  assert.ok(!rules(d).includes('activity_no_performer'));
});

test('licence requirement checks: missing record, holder mismatch, operational without grant', () => {
  let d = doc({
    entities: [ent('bank'), ent('tech')],
    activities: [M.createActivity({ id: 'pay', name: 'Payments', requiresLicence: true, status: 'operational' })],
    activityAssignments: [{ id: 'x', activityId: 'pay', entityId: 'bank', role: 'performs' }]
  });
  assert.ok(rules(d).includes('licence_missing'));

  d = M.addLicence(d, M.createLicence({ id: 'l', name: 'PI licence', holderEntityId: 'tech', status: 'granted', grantDate: '2026-01-01', activityIds: ['pay'] }));
  assert.ok(rules(d).includes('licence_holder_mismatch'));

  d = M.updateLicence(d, 'l', { holderEntityId: 'bank', status: 'submitted' });
  const r = rules(d);
  assert.ok(r.includes('operational_without_granted_licence'), 'a submitted licence does not authorise');
  assert.ok(r.includes('licence_pending'));

  d = M.updateLicence(d, 'l', { status: 'granted' });
  assert.ok(!rules(d).some(x => x.startsWith('licence_') || x.startsWith('operational_')));
});

test('creating a licence never marks the activity as authorised by itself', () => {
  const d = doc({
    entities: [ent('bank')],
    activities: [M.createActivity({ id: 'dep', name: 'Deposits', requiresLicence: true, status: 'operational' })],
    activityAssignments: [{ id: 'x', activityId: 'dep', entityId: 'bank', role: 'performs' }],
    licences: [M.createLicence({ id: 'l', holderEntityId: 'bank', activityIds: ['dep'] })]
  });
  assert.equal(d.licences[0].status, 'planned', 'new licences default to planned');
  assert.ok(rules(d).includes('operational_without_granted_licence'));
});

test('licence data-quality: granted without date, expired by date, inconsistent dates', () => {
  const d = doc({
    entities: [ent('a')],
    licences: [
      M.createLicence({ id: 'l1', holderEntityId: 'a', status: 'granted' }),
      M.createLicence({ id: 'l2', holderEntityId: 'a', status: 'granted', grantDate: '2020-01-01', expiryDate: '2025-01-01' }),
      M.createLicence({ id: 'l3', holderEntityId: 'a', status: 'planned', effectiveDate: '2027-01-01', expiryDate: '2026-01-01' }),
      M.createLicence({ id: 'l4', holderEntityId: null })
    ]
  });
  const r = rules(d);
  assert.ok(r.includes('licence_granted_no_date'));
  assert.ok(r.includes('licence_expired_date'));
  assert.ok(r.includes('licence_dates'));
  assert.ok(r.includes('licence_no_holder'));
});

test('every diagnostic is actionable (has a target) and severities are ordered', () => {
  const issues = validateStructure(instantiateTemplate('qorve'), { today: TODAY });
  assert.ok(issues.length > 0);
  for (const i of issues) assert.ok(i.target, `${i.ruleId} has a navigation target`);
  const order = { error: 0, warning: 1, regulatory: 2, info: 3 };
  for (let k = 1; k < issues.length; k++) assert.ok(order[issues[k - 1].severity] <= order[issues[k].severity]);
});

test('the Qorve template has no structural errors', () => {
  const errors = validateStructure(instantiateTemplate('qorve'), { today: TODAY }).filter(i => i.severity === 'error');
  assert.deepEqual(errors, []);
});
