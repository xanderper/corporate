"use strict";
/**
 * @file validation.ts
 * @description Structural and licence-modelling checks.
 *
 * These are data-quality checks on the model. They do not establish whether a
 * business is legally compliant.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEVERITY_META = void 0;
exports.findOwnershipCycles = findOwnershipCycles;
exports.validateStructure = validateStructure;
exports.countBySeverity = countBySeverity;
exports.sameDiagnostics = sameDiagnostics;
exports.getDiagnostics = getDiagnostics;
const constants_1 = require("./constants");
const model_1 = require("./model");
exports.SEVERITY_META = {
    error: { label: 'Error', badgeClass: 'badge-error', icon: '⚠', order: 0 },
    warning: { label: 'Warning', badgeClass: 'badge-warning', icon: '!', order: 1 },
    regulatory: { label: 'Regulatory review', badgeClass: 'badge-info', icon: '⚖', order: 2 },
    info: { label: 'Info', badgeClass: 'badge-neutral', icon: 'i', order: 3 }
};
const PCT_TOLERANCE = 0.01;
/** Returns each distinct cycle (as entity ids, first id repeated at the end) in the hierarchy. */
function findOwnershipCycles(entities, relationships) {
    const adj = new Map(entities.map(e => [e.id, []]));
    for (const r of relationships) {
        if ((0, constants_1.isHierarchicalKind)(r.kind) && adj.has(r.from) && adj.has(r.to) && r.from !== r.to) {
            adj.get(r.from).push(r.to);
        }
    }
    const state = new Map(); // 0 unvisited, 1 on stack, 2 done
    const stack = [];
    const cycles = [];
    const seen = new Set();
    const visit = (u) => {
        state.set(u, 1);
        stack.push(u);
        for (const v of adj.get(u) ?? []) {
            const s = state.get(v) ?? 0;
            if (s === 0)
                visit(v);
            else if (s === 1) {
                const cycle = stack.slice(stack.indexOf(v));
                const key = [...cycle].sort().join('|');
                if (!seen.has(key)) {
                    seen.add(key);
                    cycles.push([...cycle, v]);
                }
            }
        }
        stack.pop();
        state.set(u, 2);
    };
    for (const e of entities)
        if ((state.get(e.id) ?? 0) === 0)
            visit(e.id);
    return cycles;
}
function validateStructure(doc, options = {}) {
    const today = options.today ?? (0, model_1.todayIso)();
    const entityById = new Map(doc.entities.map(e => [e.id, e]));
    const activityById = new Map(doc.activities.map(a => [a.id, a]));
    const productById = new Map(doc.products.map(p => [p.id, p]));
    const issues = [];
    let seq = 0;
    const add = (ruleId, severity, title, message, target, remediation) => {
        issues.push({ id: `${ruleId}:${target?.id ?? 'doc'}:${seq++}`, ruleId, severity, title, message, target, remediation });
    };
    const entityName = (id) => (id ? entityById.get(id)?.name || id : '—');
    // -------------------------------------------------------------------------
    // Entities
    // -------------------------------------------------------------------------
    for (const e of doc.entities) {
        const ref = { type: 'entity', id: e.id };
        if (!e.name.trim()) {
            add('entity_unnamed', 'error', 'Entity has no name', 'An entity on the canvas has no legal name.', ref, 'Enter the legal name of the entity.');
        }
        const def = (0, constants_1.getEntityType)(e.type);
        if ((def.category === 'company' || def.category === 'foundation') && !e.jurisdiction?.trim()) {
            add('entity_no_jurisdiction', 'info', 'Jurisdiction missing', `${e.name || 'Entity'} has no jurisdiction.`, ref, 'Record the jurisdiction of incorporation.');
        }
        if (def.issuesCertificates) {
            const holdsShares = doc.relationships.some(r => r.kind === 'ownership' && r.from === e.id);
            if (!holdsShares) {
                add('stak_no_shares', 'info', 'STAK holds no shares', `${e.name} issues depositary receipts but no share ownership from it is modelled.`, ref, 'Add the share ownership held by the STAK (legal title to the underlying shares).');
            }
        }
    }
    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------
    const seenRel = new Map();
    const incoming = { ownership: new Map(), certificates: new Map() };
    for (const r of doc.relationships) {
        const ref = { type: 'relationship', id: r.id };
        const from = entityById.get(r.from);
        const to = entityById.get(r.to);
        if (!from || !to) {
            add('relationship_dangling', 'error', 'Relationship references a missing entity', `A relationship points to an entity that no longer exists (${!from ? r.from : r.to}).`, ref, 'Delete the relationship or reconnect it.');
            continue;
        }
        if (r.from === r.to) {
            add('relationship_self', 'error', 'Self-referencing relationship', `${from.name} is connected to itself.`, ref, 'Remove the relationship.');
            continue;
        }
        const key = `${r.kind}|${r.from}|${r.to}`;
        if (seenRel.has(key)) {
            add('relationship_duplicate', 'warning', 'Duplicate relationship', `${from.name} → ${to.name} is modelled twice as ${r.kind}.`, ref, 'Merge the duplicate relationships.');
        }
        seenRel.set(key, r.id);
        const toDef = (0, constants_1.getEntityType)(to.type);
        if (r.kind === 'ownership') {
            if (!toDef.hasShareCapital) {
                add('ownership_of_non_company', 'error', `${toDef.short} cannot have shareholders`, `${to.name} is a ${toDef.label.toLowerCase()} and has no share capital, so ${from.name} cannot hold shares in it.`, ref, toDef.category === 'foundation' ? 'Model the link as control (board appointment) or an arrangement instead.' : 'Reverse or change the relationship.');
            }
            const list = incoming.ownership.get(r.to) ?? [];
            list.push(r);
            incoming.ownership.set(r.to, list);
            for (const [label, value] of [['share', r.sharePct], ['voting', r.votingPct], ['economic', r.economicPct]]) {
                if (value !== null && (value < 0 || value > 100)) {
                    add('pct_out_of_range', 'error', 'Percentage out of range', `The ${label} percentage ${value}% on ${from.name} → ${to.name} is outside 0–100%.`, ref);
                }
            }
        }
        else if (r.kind === 'certificates') {
            if (!toDef.issuesCertificates) {
                add('certificates_non_stak', 'error', 'Depositary receipts from a non-STAK', `${to.name} is not a STAK, so it cannot issue depositary receipts to ${from.name}.`, ref, 'Point the relationship at a STAK, or change the entity type.');
            }
            const list = incoming.certificates.get(r.to) ?? [];
            list.push(r);
            incoming.certificates.set(r.to, list);
        }
        else if (r.kind === 'control' && r.votingPct !== null && (r.votingPct < 0 || r.votingPct > 100)) {
            add('pct_out_of_range', 'error', 'Percentage out of range', `The voting percentage on ${from.name} → ${to.name} is outside 0–100%.`, ref);
        }
    }
    const expected = doc.settings.expectedOwnershipTotal;
    for (const [entityId, rels] of Array.from(incoming.ownership.entries())) {
        const held = entityById.get(entityId);
        if (!(0, constants_1.getEntityType)(held.type).hasShareCapital)
            continue;
        const ref = { type: 'entity', id: entityId };
        const missing = rels.filter((r) => r.kind === 'ownership' && r.sharePct === null);
        if (missing.length > 0 && rels.length > 1) {
            add('ownership_pct_missing', 'warning', 'Share percentage missing', `${held.name} has ${rels.length} shareholders but ${missing.length} without a share percentage.`, { type: 'relationship', id: missing[0].id }, 'Enter the share percentage on every shareholder relationship.');
        }
        const total = rels.reduce((sum, r) => sum + (r.kind === 'ownership' && r.sharePct !== null ? r.sharePct : 0), 0);
        if (total > expected + PCT_TOLERANCE) {
            add('ownership_exceeds_total', 'error', 'Ownership exceeds total', `Share ownership of ${held.name} adds up to ${(0, model_1.formatPct)(total)}, more than the expected ${(0, model_1.formatPct)(expected)}.`, ref, 'Correct the share percentages.');
        }
        else if (missing.length === 0 && total < expected - PCT_TOLERANCE) {
            add('ownership_below_total', 'warning', 'Ownership incomplete', `Only ${(0, model_1.formatPct)(total)} of the shares in ${held.name} are accounted for (expected ${(0, model_1.formatPct)(expected)}).`, ref, 'Add the remaining shareholders, or adjust the expected total in the Style tab if partial modelling is intended.');
        }
    }
    for (const [stakId, rels] of Array.from(incoming.certificates.entries())) {
        const stak = entityById.get(stakId);
        const total = rels.reduce((sum, r) => sum + (r.kind === 'certificates' && r.certificatePct !== null ? r.certificatePct : 0), 0);
        if (total > 100 + PCT_TOLERANCE) {
            add('certificates_exceed_total', 'error', 'Depositary receipts exceed 100%', `Receipts issued by ${stak.name} add up to ${(0, model_1.formatPct)(total)}.`, { type: 'entity', id: stakId }, 'Correct the certificate percentages.');
        }
    }
    for (const cycle of findOwnershipCycles(doc.entities, doc.relationships).slice(0, 5)) {
        add('ownership_cycle', 'error', 'Circular ownership or control', `Circular hierarchy: ${cycle.map(id => entityName(id)).join(' → ')}.`, { type: 'entity', id: cycle[0] }, 'Break the loop by removing or re-typing one of the relationships.');
    }
    // -------------------------------------------------------------------------
    // Activities & assignments
    // -------------------------------------------------------------------------
    const seenAssignment = new Set();
    for (const a of doc.activityAssignments) {
        const activity = activityById.get(a.activityId);
        const ref = { type: 'activity', id: a.activityId };
        if (!activity) {
            add('assignment_dangling', 'error', 'Assignment to missing activity', `An activity assignment of ${entityName(a.entityId)} references a deleted activity.`, { type: 'entity', id: a.entityId });
            continue;
        }
        if (!entityById.has(a.entityId)) {
            add('assignment_entity_missing', 'error', 'Activity assigned to missing entity', `"${activity.name}" is assigned to an entity that no longer exists.`, ref, 'Remove the assignment.');
        }
        const key = `${a.activityId}|${a.entityId}|${a.role}`;
        if (seenAssignment.has(key)) {
            add('assignment_duplicate', 'warning', 'Duplicate activity assignment', `${entityName(a.entityId)} is assigned to "${activity.name}" twice.`, ref, 'Remove the duplicate.');
        }
        seenAssignment.add(key);
    }
    for (const act of doc.activities) {
        const ref = { type: 'activity', id: act.id };
        if (!act.name.trim()) {
            add('activity_unnamed', 'error', 'Activity has no name', 'An activity has no name.', ref);
        }
        if (act.startDate && act.endDate && act.endDate < act.startDate) {
            add('activity_dates', 'error', 'End date before start date', `"${act.name}" ends before it starts.`, ref);
        }
        const performers = doc.activityAssignments.filter(a => a.activityId === act.id && a.role === 'performs' && entityById.has(a.entityId));
        if (performers.length === 0 && act.status !== 'discontinued') {
            add('activity_no_performer', 'warning', 'No responsible entity', `"${act.name}" has no entity that performs it.`, ref, 'Assign the entity that carries out the activity (role "Performs").');
        }
        if (!act.requiresLicence)
            continue;
        const covering = doc.licences.filter(l => l.activityIds.includes(act.id));
        if (covering.length === 0) {
            add('licence_missing', 'regulatory', 'Licence requirement without licence record', `"${act.name}" is configured as requiring ${act.requiredLicenceType ? `a ${(0, constants_1.getLicenceTypeLabel)(act.requiredLicenceType)}` : 'a licence'}, but no licence record covers it.`, ref, 'Create a licence record (any status) held by the performing entity and link this activity.');
            continue;
        }
        for (const performer of performers) {
            const holderLicences = covering.filter(l => l.holderEntityId === performer.entityId);
            const name = entityName(performer.entityId);
            if (holderLicences.length === 0) {
                add('licence_holder_mismatch', 'regulatory', 'Licence held by a different entity', `"${act.name}" is performed by ${name}, but the linked licence is held by ${covering.map(l => entityName(l.holderEntityId)).join(', ')}.`, ref, 'Check which entity performs the regulated activity and which entity holds the licence.');
            }
            else if (act.status === 'operational' && !holderLicences.some(l => l.status === 'granted' && (!l.expiryDate || l.expiryDate >= today))) {
                const statuses = holderLicences.map(l => constants_1.LICENCE_STATUSES[l.status].label.toLowerCase()).join(', ');
                add('operational_without_granted_licence', 'regulatory', 'Operational activity without a granted licence', `"${act.name}" is marked operational at ${name}, but its licence is ${statuses}. A planned, submitted or lapsed licence does not authorise the activity.`, ref, 'Change the activity status, or update the licence once it has actually been granted.');
            }
        }
    }
    // -------------------------------------------------------------------------
    // Products
    // -------------------------------------------------------------------------
    for (const a of doc.productAssignments) {
        if (!productById.has(a.productId)) {
            add('product_assignment_dangling', 'error', 'Assignment to missing product', `A product assignment of ${entityName(a.entityId)} references a deleted product.`, { type: 'entity', id: a.entityId });
        }
        else if (!entityById.has(a.entityId)) {
            add('product_assignment_entity_missing', 'error', 'Product assigned to missing entity', `A product is assigned to an entity that no longer exists.`, { type: 'product', id: a.productId });
        }
    }
    for (const p of doc.products) {
        const ref = { type: 'product', id: p.id };
        if (!p.name.trim())
            add('product_unnamed', 'error', 'Product has no name', 'A product has no name.', ref);
        const providers = doc.productAssignments.filter(a => a.productId === p.id && a.role === 'provider' && entityById.has(a.entityId));
        if (providers.length === 0 && p.status !== 'deprecated') {
            add('product_no_provider', p.status === 'concept' ? 'info' : 'warning', 'No providing entity', `"${p.name}" has no entity that provides it to customers.`, ref, 'Assign the contracting entity with role "Provider".');
        }
        for (const activityId of p.activityIds) {
            if (!activityById.has(activityId)) {
                add('product_activity_missing', 'error', 'Product references missing activity', `"${p.name}" references a deleted activity.`, ref);
            }
        }
    }
    // -------------------------------------------------------------------------
    // Licences
    // -------------------------------------------------------------------------
    for (const l of doc.licences) {
        validateLicence(l, { add, entityById, activityName: id => activityById.get(id)?.name, today });
    }
    return issues.sort((a, b) => exports.SEVERITY_META[a.severity].order - exports.SEVERITY_META[b.severity].order);
}
function validateLicence(l, ctx) {
    const ref = { type: 'licence', id: l.id };
    const { add, today } = ctx;
    if (!l.name.trim())
        add('licence_unnamed', 'error', 'Licence has no name', 'A licence record has no name.', ref);
    if (!l.holderEntityId) {
        add('licence_no_holder', 'warning', 'Licence has no holder', `"${l.name}" is not linked to a holder entity.`, ref, 'Select the legal entity that holds (or will hold) the licence.');
    }
    else if (!ctx.entityById.has(l.holderEntityId)) {
        add('licence_holder_missing', 'error', 'Licence holder no longer exists', `"${l.name}" references a deleted entity.`, ref, 'Select a new holder.');
    }
    if (l.status === 'granted' && !l.grantDate) {
        add('licence_granted_no_date', 'warning', 'Granted licence without grant date', `"${l.name}" is marked granted but has no grant date.`, ref, 'Record the grant date from the authority’s decision.');
    }
    if (l.expiryDate && l.expiryDate < today && (l.status === 'granted' || l.status === 'suspended')) {
        add('licence_expired_date', 'warning', 'Expiry date has passed', `"${l.name}" expired on ${l.expiryDate} but is still marked ${constants_1.LICENCE_STATUSES[l.status].label.toLowerCase()}.`, ref, 'Update the status or the expiry date.');
    }
    if (l.effectiveDate && l.expiryDate && l.expiryDate < l.effectiveDate) {
        add('licence_dates', 'error', 'Expiry before effective date', `"${l.name}" expires before it takes effect.`, ref);
    }
    if (l.grantDate && l.applicationDate && l.grantDate < l.applicationDate) {
        add('licence_dates', 'error', 'Granted before application', `"${l.name}" has a grant date before its application date.`, ref);
    }
    if (constants_1.LICENCE_STATUSES[l.status].pending) {
        add('licence_pending', 'info', `Licence ${constants_1.LICENCE_STATUSES[l.status].label.toLowerCase()}`, `"${l.name}" is not granted. Activities it covers should not be presented as authorised.`, ref);
    }
    for (const activityId of l.activityIds) {
        if (!ctx.activityName(activityId)) {
            add('licence_activity_missing', 'error', 'Licence references missing activity', `"${l.name}" covers an activity that was deleted.`, ref);
        }
    }
}
function countBySeverity(diagnostics) {
    const counts = { error: 0, warning: 0, regulatory: 0, info: 0 };
    for (const d of diagnostics)
        counts[d.severity]++;
    return counts;
}
/** Equality used by UI selectors so diagnostics consumers skip re-rendering while dragging. */
function sameDiagnostics(a, b) {
    if (a === b)
        return true;
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].ruleId !== b[i].ruleId || a[i].message !== b[i].message || a[i].target?.id !== b[i].target?.id)
            return false;
    }
    return true;
}
let validationCache = null;
/** True when two documents differ at most in entity positions (validation ignores layout). */
function sameExceptPositions(a, b) {
    if (a === b)
        return true;
    if (a.relationships !== b.relationships ||
        a.activities !== b.activities ||
        a.activityAssignments !== b.activityAssignments ||
        a.products !== b.products ||
        a.productAssignments !== b.productAssignments ||
        a.licences !== b.licences ||
        a.settings !== b.settings ||
        a.entities.length !== b.entities.length) {
        return false;
    }
    return a.entities.every((e, i) => {
        const o = b.entities[i];
        return e === o || (e.id === o.id && e.name === o.name && e.type === o.type && e.jurisdiction === o.jurisdiction);
    });
}
/**
 * Validation memoised on the document. Moving entities does not re-run validation,
 * so diagnostics stay off the drag path.
 */
function getDiagnostics(doc) {
    const today = (0, model_1.todayIso)();
    const c = validationCache;
    if (c && c.today === today && sameExceptPositions(c.doc, doc)) {
        c.doc = doc;
        return c.result;
    }
    const result = validateStructure(doc, { today });
    validationCache = { doc, today, result };
    return result;
}
