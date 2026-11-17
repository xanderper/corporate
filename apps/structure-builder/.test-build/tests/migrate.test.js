"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const migrate_1 = require("../src/lib/migrate");
const templates_1 = require("../src/lib/templates");
const mermaid_1 = require("../src/lib/mermaid");
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
(0, node_test_1.test)('v3 documents migrate to v4 with explicit assignments', () => {
    const doc = (0, migrate_1.parseStructureDocument)(V3_DOCUMENT);
    strict_1.default.equal(doc.schemaVersion, 4);
    strict_1.default.equal(doc.entities.length, 5);
    strict_1.default.equal(doc.preferences.mode, 'activities', 'operational view becomes activities view');
    const tech = doc.entities.find(e => e.id === 'q4');
    strict_1.default.equal(tech.type, 'BV', 'legacy "Company" maps to BV');
    const founder = doc.entities.find(e => e.id === 'p1');
    strict_1.default.equal(founder.type, 'NaturalPerson');
    strict_1.default.equal(founder.color, 'green', 'invalid colour falls back');
    strict_1.default.equal(founder.x, 100, 'invalid coordinates fall back');
    const banking = doc.activityAssignments.filter(a => a.activityId === 'qa1');
    strict_1.default.deepEqual(banking.map(a => [a.entityId, a.role]), [['q3', 'performs']]);
    const hosting = doc.activityAssignments.filter(a => a.activityId === 'qa5');
    strict_1.default.deepEqual(hosting.map(a => [a.entityId, a.role]).sort(), [['q3', 'supports'], ['q4', 'performs']], 'responsible entity is not duplicated as a supporter');
    const act = doc.activities.find(a => a.id === 'qa1');
    strict_1.default.equal(act.requiresLicence, true);
    strict_1.default.equal(act.regulatoryRequirements, 'DNB banking licence');
    const lic = doc.licences[0];
    strict_1.default.deepEqual(lic.activityIds, ['qa1'], 'requiredLicenceId becomes licence coverage');
    strict_1.default.equal(lic.licenceType, 'credit_institution', 'licence type label maps to its key');
    strict_1.default.deepEqual(lic.documents, ['file-a.pdf', 'file-b.pdf']);
    strict_1.default.equal(doc.products[0].status, 'live');
    strict_1.default.deepEqual(doc.productAssignments.map(a => [a.entityId, a.role]), [['q3', 'provider'], ['q4', 'dependency']]);
});
(0, node_test_1.test)('legacy relationships are typed and ids made unique', () => {
    const doc = (0, migrate_1.parseStructureDocument)(V3_DOCUMENT);
    const ids = doc.relationships.map(r => r.id);
    strict_1.default.equal(new Set(ids).size, ids.length, 'duplicate edge id was re-keyed');
    const labelled = doc.relationships.find(r => r.from === 'p1' && r.to === 'q1');
    strict_1.default.equal(labelled.kind, 'ownership');
    strict_1.default.equal(labelled.kind === 'ownership' && labelled.sharePct, 60, 'percentage parsed from legacy label');
    const cert = doc.relationships.find(r => r.to === 'q6');
    strict_1.default.equal(cert.kind, 'certificates');
    strict_1.default.equal(cert.kind === 'certificates' && cert.certificatePct, 25, 'numeric strings are coerced');
    const service = doc.relationships.find(r => r.id === 'qe5');
    strict_1.default.equal(service.kind === 'service' && service.description, 'Technology services');
});
(0, node_test_1.test)('v4 documents round-trip through JSON unchanged', () => {
    const doc = (0, templates_1.instantiateTemplate)('qorve');
    const restored = (0, migrate_1.parseStructureJSON)((0, migrate_1.serializeDocument)(doc));
    strict_1.default.deepEqual(restored.entities.map(e => e.id), doc.entities.map(e => e.id));
    strict_1.default.deepEqual(restored.activityAssignments, doc.activityAssignments.map(a => ({ ...a, notes: a.notes ?? '' })));
    strict_1.default.equal(restored.productAssignments.length, doc.productAssignments.length);
    strict_1.default.deepEqual(restored.licences.map(l => l.activityIds), doc.licences.map(l => l.activityIds));
    strict_1.default.deepEqual(restored.relationships.map(r => r.kind), doc.relationships.map(r => r.kind));
    // A second round-trip is a fixed point.
    strict_1.default.deepEqual((0, migrate_1.parseStructureJSON)((0, migrate_1.serializeDocument)(restored)), restored);
});
(0, node_test_1.test)('invalid input is rejected with a readable error', () => {
    strict_1.default.throws(() => (0, migrate_1.parseStructureJSON)('not json'), migrate_1.StructureParseError);
    strict_1.default.throws(() => (0, migrate_1.parseStructureDocument)([1, 2]), migrate_1.StructureParseError);
    strict_1.default.throws(() => (0, migrate_1.parseStructureDocument)({ hello: 'world' }), migrate_1.StructureParseError);
    strict_1.default.throws(() => (0, migrate_1.parseStructureDocument)({ schemaVersion: 99, entities: [] }), /newer version/);
});
(0, node_test_1.test)('unknown enum values and dangling references do not crash parsing', () => {
    const doc = (0, migrate_1.parseStructureDocument)({
        schemaVersion: 4,
        entities: [{ id: 'a', name: 'A', status: 'weird' }],
        relationships: [{ id: 'r', from: 'a', to: 'ghost', kind: 'teleport' }, { id: 'r2', from: '', to: 'a' }],
        activityAssignments: [{ activityId: 'nope', entityId: 'a', role: 'boss' }],
        licences: [{ name: 'L', status: 'maybe' }]
    });
    strict_1.default.equal(doc.entities[0].status, 'active');
    strict_1.default.equal(doc.relationships.length, 1, 'relationship without endpoint is dropped');
    strict_1.default.equal(doc.relationships[0].kind, 'ownership');
    strict_1.default.equal(doc.activityAssignments[0].role, 'performs');
    strict_1.default.equal(doc.licences[0].status, 'planned');
    strict_1.default.ok(doc.licences[0].id, 'missing ids are generated');
});
(0, node_test_1.test)('Mermaid import types edges, places nodes and round-trips', () => {
    const doc = (0, mermaid_1.parseMermaid)(`flowchart TD
    founder[Jane Doe] -->|"100% shares"| hold["Holding B.V."]
    hold -->|60%| bank["Bank N.V."]
    tech["Tech B.V."] -.->|Technology services| bank
    found["Stichting Custody"] -.->|Custody| bank`);
    strict_1.default.equal(doc.entities.length, 5);
    strict_1.default.equal(doc.entities.find(e => e.name === 'Jane Doe')?.type, 'NaturalPerson');
    strict_1.default.equal(doc.entities.find(e => e.name === 'Stichting Custody')?.type, 'Stichting');
    const kinds = doc.relationships.map(r => r.kind);
    strict_1.default.deepEqual(kinds, ['ownership', 'ownership', 'service', 'custody']);
    const positions = new Set(doc.entities.map(e => `${e.x},${e.y}`));
    strict_1.default.equal(positions.size, doc.entities.length, 'every imported entity gets its own position');
    const again = (0, mermaid_1.parseMermaid)((0, mermaid_1.exportMermaid)(doc));
    strict_1.default.deepEqual(again.relationships.map(r => r.kind), kinds);
});
