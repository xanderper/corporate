import { test } from 'node:test';
import assert from 'node:assert/strict';

import { StructureParseError, parseStructureDocument, parseStructureJSON, serializeDocument } from '../src/lib/migrate';
import { instantiateTemplate } from '../src/lib/templates';
import { parseMermaid, exportMermaid } from '../src/lib/mermaid';

/** Shape written by the previous (schema v3) builder, including its quirks. */
const V3_DOCUMENT = {
  schemaVersion: 3,
  chartTitle: 'Legacy',
  chartSubtitle: '',
  nodes: [
    { id: 'q1', name: 'Holding B.V.', type: 'BV', color: 'green', x: 380, y: 60 },
    { id: 'q3', name: 'Bank N.V.', type: 'NV', color: 'blue', x: 60, y: 440 },
    { id: 'q4', name: 'Tech B.V.', type: 'Company', color: 'blue', x: 300, y: 440 },
    { id: 'q6', name: 'Stichting Safekeeping', type: 'Stichting', color: 'purple', x: 780, y: 440 },
    { id: 'p1', name: 'Founder', type: 'Person', color: 'not-a-colour', x: 'oops', y: null }
  ],
  edges: [
    { id: 'qe1', from: 'q1', to: 'q3', kind: 'ownership', sharePct: 100, label: '100% shares', style: 'solid' },
    { id: 'qe5', from: 'q4', to: 'q3', kind: 'service', role: 'Technology services', style: 'dashed' },
    { id: 'qe7', from: 'p1', to: 'q1', label: '60%' },
    { id: 'qe8', from: 'p1', to: 'q6', kind: 'certificate', certificatePct: '25' },
    { id: 'qe1', from: 'q1', to: 'q4', kind: 'ownership', sharePct: 100 }
  ],
  groups: [],
  activities: [
    { id: 'qa1', name: 'Banking', category: 'Financial services', status: 'planned', responsibleEntityId: 'q3', requiredLicenceId: 'ql1', requirements: 'DNB banking licence' },
    { id: 'qa5', name: 'Hosting', category: 'Technology', status: 'operational', responsibleEntityId: 'q4', dependentEntityIds: ['q3', 'q4'] }
  ],
  products: [{ id: 'qp1', name: 'Prime Account', status: 'operational', responsibleEntityIds: ['q3'], dependsOnEntityIds: ['q4'] }],
  licences: [{ id: 'ql1', name: 'Banking licence', type: 'Banking licence (credit institution)', authority: 'DNB', holderEntityId: 'q3', status: 'planned', documents: 'file-a.pdf\nfile-b.pdf' }],
  view: { zoom: 0.9, panX: 60, panY: 40, cardWidth: 200, mode: 'operational', layoutDirection: 'TB', connectionStyle: 'elbow' }
};

test('v3 documents migrate to v4 with explicit assignments', () => {
  const doc = parseStructureDocument(V3_DOCUMENT);
  assert.equal(doc.schemaVersion, 4);
  assert.equal(doc.entities.length, 5);
  assert.equal(doc.preferences.mode, 'activities', 'operational view becomes activities view');

  const tech = doc.entities.find(e => e.id === 'q4')!;
  assert.equal(tech.type, 'BV', 'legacy "Company" maps to BV');
  const founder = doc.entities.find(e => e.id === 'p1')!;
  assert.equal(founder.type, 'NaturalPerson');
  assert.equal(founder.color, 'green', 'invalid colour falls back');
  assert.equal(founder.x, 100, 'invalid coordinates fall back');

  const banking = doc.activityAssignments.filter(a => a.activityId === 'qa1');
  assert.deepEqual(banking.map(a => [a.entityId, a.role]), [['q3', 'performs']]);
  const hosting = doc.activityAssignments.filter(a => a.activityId === 'qa5');
  assert.deepEqual(
    hosting.map(a => [a.entityId, a.role]).sort(),
    [['q3', 'supports'], ['q4', 'performs']],
    'responsible entity is not duplicated as a supporter'
  );

  const act = doc.activities.find(a => a.id === 'qa1')!;
  assert.equal(act.requiresLicence, true);
  assert.equal(act.regulatoryRequirements, 'DNB banking licence');
  const lic = doc.licences[0];
  assert.deepEqual(lic.activityIds, ['qa1'], 'requiredLicenceId becomes licence coverage');
  assert.equal(lic.licenceType, 'credit_institution', 'licence type label maps to its key');
  assert.deepEqual(lic.documents, ['file-a.pdf', 'file-b.pdf']);

  assert.equal(doc.products[0].status, 'live');
  assert.deepEqual(
    doc.productAssignments.map(a => [a.entityId, a.role]),
    [['q3', 'provider'], ['q4', 'dependency']]
  );
});

test('legacy relationships are typed and ids made unique', () => {
  const doc = parseStructureDocument(V3_DOCUMENT);
  const ids = doc.relationships.map(r => r.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate edge id was re-keyed');
  const labelled = doc.relationships.find(r => r.from === 'p1' && r.to === 'q1')!;
  assert.equal(labelled.kind, 'ownership');
  assert.equal(labelled.kind === 'ownership' && labelled.sharePct, 60, 'percentage parsed from legacy label');
  const cert = doc.relationships.find(r => r.to === 'q6')!;
  assert.equal(cert.kind, 'certificates');
  assert.equal(cert.kind === 'certificates' && cert.certificatePct, 25, 'numeric strings are coerced');
  const service = doc.relationships.find(r => r.id === 'qe5')!;
  assert.equal(service.kind === 'service' && service.description, 'Technology services');
});

test('v4 documents round-trip through JSON unchanged', () => {
  const doc = instantiateTemplate('qorve');
  const restored = parseStructureJSON(serializeDocument(doc));
  assert.deepEqual(restored.entities.map(e => e.id), doc.entities.map(e => e.id));
  assert.deepEqual(restored.activityAssignments, doc.activityAssignments.map(a => ({ ...a, notes: a.notes ?? '' })));
  assert.equal(restored.productAssignments.length, doc.productAssignments.length);
  assert.deepEqual(restored.licences.map(l => l.activityIds), doc.licences.map(l => l.activityIds));
  assert.deepEqual(restored.relationships.map(r => r.kind), doc.relationships.map(r => r.kind));
  // A second round-trip is a fixed point.
  assert.deepEqual(parseStructureJSON(serializeDocument(restored)), restored);
});

test('invalid input is rejected with a readable error', () => {
  assert.throws(() => parseStructureJSON('not json'), StructureParseError);
  assert.throws(() => parseStructureDocument([1, 2]), StructureParseError);
  assert.throws(() => parseStructureDocument({ hello: 'world' }), StructureParseError);
  assert.throws(() => parseStructureDocument({ schemaVersion: 99, entities: [] }), /newer version/);
});

test('unknown enum values and dangling references do not crash parsing', () => {
  const doc = parseStructureDocument({
    schemaVersion: 4,
    entities: [{ id: 'a', name: 'A', status: 'weird' }],
    relationships: [{ id: 'r', from: 'a', to: 'ghost', kind: 'teleport' }, { id: 'r2', from: '', to: 'a' }],
    activityAssignments: [{ activityId: 'nope', entityId: 'a', role: 'boss' }],
    licences: [{ name: 'L', status: 'maybe' }]
  });
  assert.equal(doc.entities[0].status, 'active');
  assert.equal(doc.relationships.length, 1, 'relationship without endpoint is dropped');
  assert.equal(doc.relationships[0].kind, 'ownership');
  assert.equal(doc.activityAssignments[0].role, 'performs');
  assert.equal(doc.licences[0].status, 'planned');
  assert.ok(doc.licences[0].id, 'missing ids are generated');
});

test('Mermaid import types edges, places nodes and round-trips', () => {
  const doc = parseMermaid(`flowchart TD
    founder[Jane Doe] -->|"100% shares"| hold["Holding B.V."]
    hold -->|60%| bank["Bank N.V."]
    tech["Tech B.V."] -.->|Technology services| bank
    found["Stichting Custody"] -.->|Custody| bank`);
  assert.equal(doc.entities.length, 5);
  assert.equal(doc.entities.find(e => e.name === 'Jane Doe')?.type, 'NaturalPerson');
  assert.equal(doc.entities.find(e => e.name === 'Stichting Custody')?.type, 'Stichting');
  const kinds = doc.relationships.map(r => r.kind);
  assert.deepEqual(kinds, ['ownership', 'ownership', 'service', 'custody']);
  const positions = new Set(doc.entities.map(e => `${e.x},${e.y}`));
  assert.equal(positions.size, doc.entities.length, 'every imported entity gets its own position');

  const again = parseMermaid(exportMermaid(doc));
  assert.deepEqual(again.relationships.map(r => r.kind), kinds);
});
