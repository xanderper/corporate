"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const M = __importStar(require("../src/lib/model"));
const templates_1 = require("../src/lib/templates");
function baseDoc() {
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
(0, node_test_1.test)('operations never mutate the input document', () => {
    const doc = baseDoc();
    const frozen = JSON.stringify(doc);
    M.updateEntity(doc, 'h', { name: 'Renamed' });
    M.deleteEntities(doc, ['h']);
    M.addActivity(doc, M.createActivity({ id: 'a' }));
    strict_1.default.equal(JSON.stringify(doc), frozen);
});
(0, node_test_1.test)('update with no matching id returns the same reference', () => {
    const doc = baseDoc();
    strict_1.default.equal(M.updateEntity(doc, 'missing', { name: 'x' }), doc);
    strict_1.default.equal(M.updateActivity(doc, 'missing', { name: 'x' }), doc);
});
(0, node_test_1.test)('creating, editing and deleting an activity cleans every reference', () => {
    let doc = baseDoc();
    doc = M.addActivity(doc, M.createActivity({ id: 'a1', name: 'Payment services', requiresLicence: true }));
    doc = M.addActivity(doc, M.createActivity({ id: 'a2', name: 'Checkout operations', relatedActivityIds: ['a1'] }));
    doc = M.assignActivity(doc, { id: 'aa1', activityId: 'a1', entityId: 's', role: 'performs' });
    doc = M.assignActivity(doc, { id: 'aa2', activityId: 'a1', entityId: 't', role: 'supports' });
    doc = M.addProduct(doc, M.createProduct({ id: 'p1', activityIds: ['a1'] }));
    doc = M.addLicence(doc, M.createLicence({ id: 'l1', holderEntityId: 's', activityIds: ['a1'] }));
    doc = M.updateActivity(doc, 'a1', { status: 'operational', name: 'Payments' });
    strict_1.default.equal(doc.activities.find(a => a.id === 'a1')?.name, 'Payments');
    doc = M.deleteActivity(doc, 'a1');
    strict_1.default.equal(doc.activities.length, 1);
    strict_1.default.deepEqual(doc.activities[0].relatedActivityIds, []);
    strict_1.default.equal(doc.activityAssignments.length, 0);
    strict_1.default.deepEqual(doc.products[0].activityIds, []);
    strict_1.default.deepEqual(doc.licences[0].activityIds, []);
});
(0, node_test_1.test)('assignActivity ignores exact duplicates but allows a second role', () => {
    let doc = M.addActivity(baseDoc(), M.createActivity({ id: 'a1' }));
    doc = M.assignActivity(doc, { id: 'x1', activityId: 'a1', entityId: 's', role: 'performs' });
    const same = M.assignActivity(doc, { id: 'x2', activityId: 'a1', entityId: 's', role: 'performs' });
    strict_1.default.equal(same, doc);
    doc = M.assignActivity(doc, { id: 'x3', activityId: 'a1', entityId: 's', role: 'supports' });
    strict_1.default.equal(doc.activityAssignments.length, 2);
});
(0, node_test_1.test)('reassigning an activity moves responsibility to another entity', () => {
    let doc = M.addActivity(baseDoc(), M.createActivity({ id: 'a1' }));
    doc = M.assignActivity(doc, { id: 'x1', activityId: 'a1', entityId: 's', role: 'performs' });
    doc = M.updateActivityAssignment(doc, 'x1', { entityId: 't' });
    strict_1.default.equal(doc.activityAssignments[0].entityId, 't');
    strict_1.default.equal(M.getEntityLinks(doc, 's').activities.length, 0);
    strict_1.default.equal(M.getEntityLinks(doc, 't').activities.length, 1);
});
(0, node_test_1.test)('products and product assignments are independent of entities', () => {
    let doc = M.addProduct(baseDoc(), M.createProduct({ id: 'p1', name: 'Qorve Checkout' }));
    doc = M.assignProduct(doc, { id: 'pa1', productId: 'p1', entityId: 's', role: 'provider' });
    doc = M.assignProduct(doc, { id: 'pa2', productId: 'p1', entityId: 't', role: 'dependency' });
    doc = M.updateProduct(doc, 'p1', { status: 'live' });
    strict_1.default.equal(doc.entities.length, 3, 'adding products never creates entities');
    strict_1.default.equal(doc.products[0].status, 'live');
    doc = M.deleteProduct(doc, 'p1');
    strict_1.default.equal(doc.productAssignments.length, 0);
});
(0, node_test_1.test)('licences keep their record when the holder is deleted', () => {
    let doc = M.addLicence(baseDoc(), M.createLicence({ id: 'l1', holderEntityId: 's', licenceType: 'payment_institution' }));
    strict_1.default.equal(doc.licences[0].authority, 'De Nederlandsche Bank (DNB)', 'default authority from licence type metadata');
    doc = M.updateLicence(doc, 'l1', { status: 'submitted', applicationDate: '2026-01-10' });
    strict_1.default.equal(doc.licences[0].status, 'submitted');
    doc = M.deleteEntities(doc, ['s']);
    strict_1.default.equal(doc.licences.length, 1);
    strict_1.default.equal(doc.licences[0].holderEntityId, null);
});
(0, node_test_1.test)('deleting an entity cascades to relationships, assignments and group membership', () => {
    let doc = baseDoc();
    doc = M.addActivity(doc, M.createActivity({ id: 'a1' }));
    doc = M.assignActivity(doc, { id: 'aa1', activityId: 'a1', entityId: 's', role: 'performs' });
    doc = M.addGroup(doc, M.createGroup({ id: 'g', members: ['s', 't'] }));
    const impact = M.describeEntityDeletion(doc, ['s']);
    strict_1.default.deepEqual(impact, { relationships: 1, activityAssignments: 1, productAssignments: 0, licences: 0 });
    doc = M.deleteEntities(doc, ['s']);
    strict_1.default.equal(doc.relationships.length, 0);
    strict_1.default.equal(doc.activityAssignments.length, 0);
    strict_1.default.equal(doc.activities.length, 1, 'activity definitions are kept');
    strict_1.default.deepEqual(doc.groups[0].members, ['t']);
});
(0, node_test_1.test)('changing relationship kind rebuilds a valid union member and drops stale fields', () => {
    let doc = baseDoc();
    doc = M.updateRelationship(doc, 'r1', { kind: 'service', description: 'IT services' });
    const rel = doc.relationships[0];
    strict_1.default.equal(rel.kind, 'service');
    strict_1.default.ok(!('sharePct' in rel));
    strict_1.default.equal(rel.kind === 'service' && rel.description, 'IT services');
    doc = M.updateRelationship(doc, 'r1', { kind: 'ownership', sharePct: 60 });
    const own = doc.relationships[0];
    strict_1.default.equal(own.kind, 'ownership');
    strict_1.default.equal(own.kind === 'ownership' && own.sharePct, 60);
    strict_1.default.ok(!('description' in own));
});
(0, node_test_1.test)('reverseRelationship swaps endpoints', () => {
    const doc = M.reverseRelationship(baseDoc(), 'r1');
    strict_1.default.equal(doc.relationships[0].from, 's');
    strict_1.default.equal(doc.relationships[0].to, 'h');
});
(0, node_test_1.test)('relationship labels', () => {
    const own = M.buildRelationship('x', 'ownership', { from: 'a', to: 'b', sharePct: 60, votingPct: 80 });
    strict_1.default.equal(M.formatRelationshipLabel(own), '60% shares · 80% votes');
    const cert = M.buildRelationship('y', 'certificates', { from: 'a', to: 'b', certificatePct: 12.5 });
    strict_1.default.equal(M.formatRelationshipLabel(cert), '12.5% certificates');
    const custody = M.buildRelationship('z', 'custody', { from: 'a', to: 'b' });
    strict_1.default.equal(M.formatRelationshipLabel(custody), 'Custody');
});
(0, node_test_1.test)('duplicateEntity copies details but not relationships', () => {
    const { doc, entity } = M.duplicateEntity(baseDoc(), 'h', 'copy');
    strict_1.default.equal(entity?.name, 'Holding B.V. (copy)');
    strict_1.default.equal(doc.entities.length, 4);
    strict_1.default.equal(doc.relationships.filter(r => r.from === 'copy' || r.to === 'copy').length, 0);
});
(0, node_test_1.test)('entity index is memoised across position-only changes', () => {
    const doc = (0, templates_1.instantiateTemplate)('qorve');
    const first = M.getEntityIndex(doc);
    const moved = M.moveEntities(doc, new Map([['q1', { x: 999, y: 999 }]]));
    strict_1.default.notEqual(moved.entities, doc.entities);
    strict_1.default.equal(M.getEntityIndex(moved), first, 'dragging must not rebuild the index');
    const links = M.getEntityLinks(doc, 'q3');
    strict_1.default.ok(links.activities.length >= 3);
    strict_1.default.equal(links.activities[0].assignment.role, 'performs');
});
(0, node_test_1.test)('isLicenceInForce respects status and dates', () => {
    const l = M.createLicence({ status: 'granted', effectiveDate: '2026-01-01', expiryDate: '2026-12-31' });
    strict_1.default.equal(M.isLicenceInForce(l, '2026-06-01'), true);
    strict_1.default.equal(M.isLicenceInForce(l, '2025-06-01'), false);
    strict_1.default.equal(M.isLicenceInForce(l, '2027-01-01'), false);
    strict_1.default.equal(M.isLicenceInForce({ ...l, status: 'submitted' }, '2026-06-01'), false);
});
(0, node_test_1.test)('reverseRelationship swaps fromPort and toPort', () => {
    const doc = baseDoc();
    const withPorts = M.updateRelationship(doc, 'r1', { fromPort: 'right', toPort: 'top' });
    strict_1.default.equal(withPorts.relationships[0].fromPort, 'right');
    strict_1.default.equal(withPorts.relationships[0].toPort, 'top');
    const reversed = M.reverseRelationship(withPorts, 'r1');
    strict_1.default.equal(reversed.relationships[0].from, 's');
    strict_1.default.equal(reversed.relationships[0].to, 'h');
    strict_1.default.equal(reversed.relationships[0].fromPort, 'top');
    strict_1.default.equal(reversed.relationships[0].toPort, 'right');
});
