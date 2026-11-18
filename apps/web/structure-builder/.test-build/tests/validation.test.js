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
const validation_1 = require("../src/lib/validation");
const templates_1 = require("../src/lib/templates");
const TODAY = '2026-10-27';
const rules = (doc) => (0, validation_1.validateStructure)(doc, { today: TODAY }).map(d => d.ruleId);
function doc(partial) {
    return { ...M.createEmptyDocument(), ...partial };
}
const ent = (id, type = 'BV') => M.createEntity({ id, name: id.toUpperCase(), type, jurisdiction: 'NL' });
(0, node_test_1.test)('ownership totals: above expected is an error, below is a warning', () => {
    const base = doc({
        entities: [ent('a'), ent('b'), ent('c')],
        relationships: [
            M.buildRelationship('r1', 'ownership', { from: 'a', to: 'c', sharePct: 60 }),
            M.buildRelationship('r2', 'ownership', { from: 'b', to: 'c', sharePct: 50 })
        ]
    });
    strict_1.default.ok(rules(base).includes('ownership_exceeds_total'));
    const below = M.updateRelationship(base, 'r2', { sharePct: 30 });
    strict_1.default.ok(rules(below).includes('ownership_below_total'));
    const custom = { ...below, settings: { expectedOwnershipTotal: 90 } };
    strict_1.default.ok(!rules(custom).some(r => r.startsWith('ownership_')), 'expected total is configurable');
});
(0, node_test_1.test)('missing share percentage is flagged when there are several shareholders', () => {
    const d = doc({
        entities: [ent('a'), ent('b'), ent('c')],
        relationships: [
            M.buildRelationship('r1', 'ownership', { from: 'a', to: 'c', sharePct: 60 }),
            M.buildRelationship('r2', 'ownership', { from: 'b', to: 'c' })
        ]
    });
    const issue = (0, validation_1.validateStructure)(d, { today: TODAY }).find(i => i.ruleId === 'ownership_pct_missing');
    strict_1.default.ok(issue);
    strict_1.default.deepEqual(issue.target, { type: 'relationship', id: 'r2' }, 'points at the relationship to fix');
});
(0, node_test_1.test)('foundations and persons cannot be owned; certificates must target a STAK', () => {
    const d = doc({
        entities: [ent('a'), ent('f', 'Stichting'), ent('p', 'NaturalPerson'), ent('b')],
        relationships: [
            M.buildRelationship('r1', 'ownership', { from: 'a', to: 'f', sharePct: 100 }),
            M.buildRelationship('r2', 'ownership', { from: 'a', to: 'p', sharePct: 100 }),
            M.buildRelationship('r3', 'certificates', { from: 'p', to: 'b', certificatePct: 100 })
        ]
    });
    const r = rules(d);
    strict_1.default.equal(r.filter(x => x === 'ownership_of_non_company').length, 2);
    strict_1.default.ok(r.includes('certificates_non_stak'));
});
(0, node_test_1.test)('a STAK separates legal title (shares) from depositary receipts', () => {
    const d = doc({
        entities: [ent('p', 'NaturalPerson'), ent('stak', 'STAK'), ent('h')],
        relationships: [
            M.buildRelationship('c', 'certificates', { from: 'p', to: 'stak', certificatePct: 100 }),
            M.buildRelationship('o', 'ownership', { from: 'stak', to: 'h', sharePct: 100 })
        ]
    });
    strict_1.default.deepEqual((0, validation_1.validateStructure)(d, { today: TODAY }).filter(i => i.severity === 'error'), []);
    const withoutShares = { ...d, relationships: d.relationships.filter(r => r.id !== 'o') };
    strict_1.default.ok(rules(withoutShares).includes('stak_no_shares'));
});
(0, node_test_1.test)('circular ownership is detected once per cycle', () => {
    const entities = [ent('a'), ent('b'), ent('c')];
    const relationships = [
        M.buildRelationship('1', 'ownership', { from: 'a', to: 'b', sharePct: 100 }),
        M.buildRelationship('2', 'ownership', { from: 'b', to: 'c', sharePct: 100 }),
        M.buildRelationship('3', 'control', { from: 'c', to: 'a' }),
        M.buildRelationship('4', 'service', { from: 'c', to: 'b' })
    ];
    const cycles = (0, validation_1.findOwnershipCycles)(entities, relationships);
    strict_1.default.equal(cycles.length, 1);
    strict_1.default.deepEqual(cycles[0], ['a', 'b', 'c', 'a']);
    strict_1.default.equal(rules(doc({ entities, relationships })).filter(r => r === 'ownership_cycle').length, 1);
});
(0, node_test_1.test)('dangling, self and duplicate relationships', () => {
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
    strict_1.default.ok(r.includes('relationship_dangling'));
    strict_1.default.ok(r.includes('relationship_self'));
    strict_1.default.ok(r.includes('relationship_duplicate'));
});
(0, node_test_1.test)('activity without performer, and a supporting entity does not count as responsible', () => {
    let d = doc({ entities: [ent('t')], activities: [M.createActivity({ id: 'a', name: 'Payments' })] });
    strict_1.default.ok(rules(d).includes('activity_no_performer'));
    d = M.assignActivity(d, { id: 'x', activityId: 'a', entityId: 't', role: 'supports' });
    strict_1.default.ok(rules(d).includes('activity_no_performer'));
    d = M.updateActivityAssignment(d, 'x', { role: 'performs' });
    strict_1.default.ok(!rules(d).includes('activity_no_performer'));
});
(0, node_test_1.test)('licence requirement checks: missing record, holder mismatch, operational without grant', () => {
    let d = doc({
        entities: [ent('bank'), ent('tech')],
        activities: [M.createActivity({ id: 'pay', name: 'Payments', requiresLicence: true, status: 'operational' })],
        activityAssignments: [{ id: 'x', activityId: 'pay', entityId: 'bank', role: 'performs' }]
    });
    strict_1.default.ok(rules(d).includes('licence_missing'));
    d = M.addLicence(d, M.createLicence({ id: 'l', name: 'PI licence', holderEntityId: 'tech', status: 'granted', grantDate: '2026-01-01', activityIds: ['pay'] }));
    strict_1.default.ok(rules(d).includes('licence_holder_mismatch'));
    d = M.updateLicence(d, 'l', { holderEntityId: 'bank', status: 'submitted' });
    const r = rules(d);
    strict_1.default.ok(r.includes('operational_without_granted_licence'), 'a submitted licence does not authorise');
    strict_1.default.ok(r.includes('licence_pending'));
    d = M.updateLicence(d, 'l', { status: 'granted' });
    strict_1.default.ok(!rules(d).some(x => x.startsWith('licence_') || x.startsWith('operational_')));
});
(0, node_test_1.test)('creating a licence never marks the activity as authorised by itself', () => {
    const d = doc({
        entities: [ent('bank')],
        activities: [M.createActivity({ id: 'dep', name: 'Deposits', requiresLicence: true, status: 'operational' })],
        activityAssignments: [{ id: 'x', activityId: 'dep', entityId: 'bank', role: 'performs' }],
        licences: [M.createLicence({ id: 'l', holderEntityId: 'bank', activityIds: ['dep'] })]
    });
    strict_1.default.equal(d.licences[0].status, 'planned', 'new licences default to planned');
    strict_1.default.ok(rules(d).includes('operational_without_granted_licence'));
});
(0, node_test_1.test)('licence data-quality: granted without date, expired by date, inconsistent dates', () => {
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
    strict_1.default.ok(r.includes('licence_granted_no_date'));
    strict_1.default.ok(r.includes('licence_expired_date'));
    strict_1.default.ok(r.includes('licence_dates'));
    strict_1.default.ok(r.includes('licence_no_holder'));
});
(0, node_test_1.test)('every diagnostic is actionable (has a target) and severities are ordered', () => {
    const issues = (0, validation_1.validateStructure)((0, templates_1.instantiateTemplate)('qorve'), { today: TODAY });
    strict_1.default.ok(issues.length > 0);
    for (const i of issues)
        strict_1.default.ok(i.target, `${i.ruleId} has a navigation target`);
    const order = { error: 0, warning: 1, regulatory: 2, info: 3 };
    for (let k = 1; k < issues.length; k++)
        strict_1.default.ok(order[issues[k - 1].severity] <= order[issues[k].severity]);
});
(0, node_test_1.test)('the Qorve template has no structural errors', () => {
    const errors = (0, validation_1.validateStructure)((0, templates_1.instantiateTemplate)('qorve'), { today: TODAY }).filter(i => i.severity === 'error');
    strict_1.default.deepEqual(errors, []);
});
