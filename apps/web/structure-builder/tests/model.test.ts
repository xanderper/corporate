import { test } from 'node:test';
import assert from 'node:assert/strict';

import * as M from '../src/lib/model';
import { instantiateTemplate } from '../src/lib/templates';
import type { StructureDocument } from '../src/lib/types';

function baseDoc(): StructureDocument {
  const doc = M.createEmptyDocument('Test');
  return {
    ...doc,
    entities: [
      M.createEntity({ id: 'h', name: 'Holding B.V.', type: 'BV', x: 0, y: 0 }),
      M.createEntity({ id: 's', name: 'Sub B.V.', type: 'BV', x: 0, y: 200 }),
      M.createEntity({ id: 't', name: 'Tech B.V.', type: 'BV', x: 300, y: 200 })
    ],
    relationships: [M.buildRelationship('r1', 'ownership', { from: 'h', to: 's', sharePct: 100 })]
  };
}

test('operations never mutate the input document', () => {
  const doc = baseDoc();
  const frozen = JSON.stringify(doc);
  M.updateEntity(doc, 'h', { name: 'Renamed' });
  M.deleteEntities(doc, ['h']);
  M.addActivity(doc, M.createActivity({ id: 'a' }));
  assert.equal(JSON.stringify(doc), frozen);
});

test('update with no matching id returns the same reference', () => {
  const doc = baseDoc();
  assert.equal(M.updateEntity(doc, 'missing', { name: 'x' }), doc);
  assert.equal(M.updateActivity(doc, 'missing', { name: 'x' }), doc);
});

test('creating, editing and deleting an activity cleans every reference', () => {
  let doc = baseDoc();
  doc = M.addActivity(doc, M.createActivity({ id: 'a1', name: 'Payment services', requiresLicence: true }));
  doc = M.addActivity(doc, M.createActivity({ id: 'a2', name: 'Checkout operations', relatedActivityIds: ['a1'] }));
  doc = M.assignActivity(doc, { id: 'aa1', activityId: 'a1', entityId: 's', role: 'performs' });
  doc = M.assignActivity(doc, { id: 'aa2', activityId: 'a1', entityId: 't', role: 'supports' });
  doc = M.addProduct(doc, M.createProduct({ id: 'p1', activityIds: ['a1'] }));
  doc = M.addLicence(doc, M.createLicence({ id: 'l1', holderEntityId: 's', activityIds: ['a1'] }));

  doc = M.updateActivity(doc, 'a1', { status: 'operational', name: 'Payments' });
  assert.equal(doc.activities.find(a => a.id === 'a1')?.name, 'Payments');

  doc = M.deleteActivity(doc, 'a1');
  assert.equal(doc.activities.length, 1);
  assert.deepEqual(doc.activities[0].relatedActivityIds, []);
  assert.equal(doc.activityAssignments.length, 0);
  assert.deepEqual(doc.products[0].activityIds, []);
  assert.deepEqual(doc.licences[0].activityIds, []);
});

test('assignActivity ignores exact duplicates but allows a second role', () => {
  let doc = M.addActivity(baseDoc(), M.createActivity({ id: 'a1' }));
  doc = M.assignActivity(doc, { id: 'x1', activityId: 'a1', entityId: 's', role: 'performs' });
  const same = M.assignActivity(doc, { id: 'x2', activityId: 'a1', entityId: 's', role: 'performs' });
  assert.equal(same, doc);
  doc = M.assignActivity(doc, { id: 'x3', activityId: 'a1', entityId: 's', role: 'supports' });
  assert.equal(doc.activityAssignments.length, 2);
});

test('reassigning an activity moves responsibility to another entity', () => {
  let doc = M.addActivity(baseDoc(), M.createActivity({ id: 'a1' }));
  doc = M.assignActivity(doc, { id: 'x1', activityId: 'a1', entityId: 's', role: 'performs' });
  doc = M.updateActivityAssignment(doc, 'x1', { entityId: 't' });
  assert.equal(doc.activityAssignments[0].entityId, 't');
  assert.equal(M.getEntityLinks(doc, 's').activities.length, 0);
  assert.equal(M.getEntityLinks(doc, 't').activities.length, 1);
});

test('products and product assignments are independent of entities', () => {
  let doc = M.addProduct(baseDoc(), M.createProduct({ id: 'p1', name: 'Qorve Checkout' }));
  doc = M.assignProduct(doc, { id: 'pa1', productId: 'p1', entityId: 's', role: 'provider' });
  doc = M.assignProduct(doc, { id: 'pa2', productId: 'p1', entityId: 't', role: 'dependency' });
  doc = M.updateProduct(doc, 'p1', { status: 'live' });
  assert.equal(doc.entities.length, 3, 'adding products never creates entities');
  assert.equal(doc.products[0].status, 'live');
  doc = M.deleteProduct(doc, 'p1');
  assert.equal(doc.productAssignments.length, 0);
});

test('licences keep their record when the holder is deleted', () => {
  let doc = M.addLicence(baseDoc(), M.createLicence({ id: 'l1', holderEntityId: 's', licenceType: 'payment_institution' }));
  assert.equal(doc.licences[0].authority, 'De Nederlandsche Bank (DNB)', 'default authority from licence type metadata');
  doc = M.updateLicence(doc, 'l1', { status: 'submitted', applicationDate: '2026-01-10' });
  assert.equal(doc.licences[0].status, 'submitted');
  doc = M.deleteEntities(doc, ['s']);
  assert.equal(doc.licences.length, 1);
  assert.equal(doc.licences[0].holderEntityId, null);
});

test('deleting an entity cascades to relationships, assignments and group membership', () => {
  let doc = baseDoc();
  doc = M.addActivity(doc, M.createActivity({ id: 'a1' }));
  doc = M.assignActivity(doc, { id: 'aa1', activityId: 'a1', entityId: 's', role: 'performs' });
  doc = M.addGroup(doc, M.createGroup({ id: 'g', members: ['s', 't'] }));
  const impact = M.describeEntityDeletion(doc, ['s']);
  assert.deepEqual(impact, { relationships: 1, activityAssignments: 1, productAssignments: 0, licences: 0 });
  doc = M.deleteEntities(doc, ['s']);
  assert.equal(doc.relationships.length, 0);
  assert.equal(doc.activityAssignments.length, 0);
  assert.equal(doc.activities.length, 1, 'activity definitions are kept');
  assert.deepEqual(doc.groups[0].members, ['t']);
});

test('changing relationship kind rebuilds a valid union member and drops stale fields', () => {
  let doc = baseDoc();
  doc = M.updateRelationship(doc, 'r1', { kind: 'service', description: 'IT services' });
  const rel = doc.relationships[0];
  assert.equal(rel.kind, 'service');
  assert.ok(!('sharePct' in rel));
  assert.equal(rel.kind === 'service' && rel.description, 'IT services');

  doc = M.updateRelationship(doc, 'r1', { kind: 'ownership', sharePct: 60 });
  const own = doc.relationships[0];
  assert.equal(own.kind, 'ownership');
  assert.equal(own.kind === 'ownership' && own.sharePct, 60);
  assert.ok(!('description' in own));
});

test('reverseRelationship swaps endpoints', () => {
  const doc = M.reverseRelationship(baseDoc(), 'r1');
  assert.equal(doc.relationships[0].from, 's');
  assert.equal(doc.relationships[0].to, 'h');
});

test('relationship labels', () => {
  const own = M.buildRelationship('x', 'ownership', { from: 'a', to: 'b', sharePct: 60, votingPct: 80 });
  assert.equal(M.formatRelationshipLabel(own), '60% shares · 80% votes');
  const cert = M.buildRelationship('y', 'certificates', { from: 'a', to: 'b', certificatePct: 12.5 });
  assert.equal(M.formatRelationshipLabel(cert), '12.5% certificates');
  const custody = M.buildRelationship('z', 'custody', { from: 'a', to: 'b' });
  assert.equal(M.formatRelationshipLabel(custody), 'Custody');
});

test('duplicateEntity copies details but not relationships', () => {
  const { doc, entity } = M.duplicateEntity(baseDoc(), 'h', 'copy');
  assert.equal(entity?.name, 'Holding B.V. (copy)');
  assert.equal(doc.entities.length, 4);
  assert.equal(doc.relationships.filter(r => r.from === 'copy' || r.to === 'copy').length, 0);
});

test('entity index is memoised across position-only changes', () => {
  const doc = instantiateTemplate('qorve');
  const first = M.getEntityIndex(doc);
  const moved = M.moveEntities(doc, new Map([['q1', { x: 999, y: 999 }]]));
  assert.notEqual(moved.entities, doc.entities);
  assert.equal(M.getEntityIndex(moved), first, 'dragging must not rebuild the index');
  const links = M.getEntityLinks(doc, 'q3');
  assert.ok(links.activities.length >= 3);
  assert.equal(links.activities[0].assignment.role, 'performs');
});

test('isLicenceInForce respects status and dates', () => {
  const l = M.createLicence({ status: 'granted', effectiveDate: '2026-01-01', expiryDate: '2026-12-31' });
  assert.equal(M.isLicenceInForce(l, '2026-06-01'), true);
  assert.equal(M.isLicenceInForce(l, '2025-06-01'), false);
  assert.equal(M.isLicenceInForce(l, '2027-01-01'), false);
  assert.equal(M.isLicenceInForce({ ...l, status: 'submitted' }, '2026-06-01'), false);
});

test('reverseRelationship swaps fromPort and toPort', () => {
  const doc = baseDoc();
  const withPorts = M.updateRelationship(doc, 'r1', { fromPort: 'right', toPort: 'top' });
  assert.equal(withPorts.relationships[0].fromPort, 'right');
  assert.equal(withPorts.relationships[0].toPort, 'top');

  const reversed = M.reverseRelationship(withPorts, 'r1');
  assert.equal(reversed.relationships[0].from, 's');
  assert.equal(reversed.relationships[0].to, 'h');
  assert.equal(reversed.relationships[0].fromPort, 'top');
  assert.equal(reversed.relationships[0].toPort, 'right');
});

