"use strict";
/**
 * @file mermaid.ts
 * @description Mermaid flowchart import/export for entities and relationships.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferEntityType = inferEntityType;
exports.parseMermaid = parseMermaid;
exports.exportMermaid = exportMermaid;
const constants_1 = require("./constants");
const model_1 = require("./model");
const migrate_1 = require("./migrate");
const layout_1 = require("./layout");
function inferEntityType(label) {
    const s = label.trim();
    if (/Stichting Administratiekantoor|\bSTAK\b/i.test(s))
        return 'STAK';
    if (/Stichting|Foundation/i.test(s))
        return 'Stichting';
    if (/\bN\.?V\.?$/i.test(s))
        return 'NV';
    if (/\bB\.?V\.?$|Ltd|LLC|GmbH|Inc\.?$|Corp|S\.[AL]\.?$/i.test(s))
        return 'BV';
    if (/Fund|SPV|Capital|Ventures/i.test(s))
        return 'Fund';
    if (/Holding|Beheer/i.test(s))
        return 'BV';
    if (s.split(/\s+/).length <= 3 && !/[.&]/.test(s))
        return 'NaturalPerson';
    return 'BV';
}
function parseMermaid(src) {
    if (!src.trim())
        throw new migrate_1.StructureParseError('Mermaid input is empty.');
    const nodes = new Map();
    const edges = [];
    const groups = [];
    let activeGroup = null;
    const touch = (key, label) => {
        const existing = nodes.get(key);
        if (!existing) {
            const name = label || key;
            nodes.set(key, { id: key, name, type: inferEntityType(name) });
        }
        else if (label && existing.name === key) {
            existing.name = label;
            existing.type = inferEntityType(label);
        }
        if (activeGroup && !activeGroup.members.includes(key))
            activeGroup.members.push(key);
    };
    const endpoint = (raw) => {
        const m = raw.trim().match(/^([\w$.-]+)\s*(?:[[({]+\s*["']?([\s\S]*?)["']?\s*[\])}]+)?$/);
        return m ? { key: m[1], label: m[2]?.replace(/\\n|<br\s*\/?>/g, ' ').trim() } : null;
    };
    for (const rawLine of src.split(/\r?\n/)) {
        const line = rawLine.trim().replace(/;$/, '');
        if (!line || line.startsWith('%%') || /^(flowchart|graph)\b/i.test(line) || /^(classDef|class|style|linkStyle)\b/.test(line))
            continue;
        if (line === 'end') {
            activeGroup = null;
            continue;
        }
        const sg = line.match(/^subgraph\s+([\w$.-]+)(?:\s*\[\s*["']?(.+?)["']?\s*\])?$/i);
        if (sg) {
            activeGroup = { id: sg[1], name: sg[2] || sg[1], members: [] };
            groups.push(activeGroup);
            continue;
        }
        const edge = line.match(/^(.+?)\s*(-\.->|-->|==>|---)\s*(?:\|\s*["']?([^|]*?)["']?\s*\|)?\s*(.+)$/);
        const labelled = edge ? null : line.match(/^(.+?)\s*--\s*["']?(.+?)["']?\s*-->\s*(.+)$/);
        if (edge || labelled) {
            const left = endpoint(edge ? edge[1] : labelled[1]);
            const right = endpoint(edge ? edge[4] : labelled[3]);
            const label = (edge ? edge[3] : labelled[2]) ?? '';
            if (left && right) {
                touch(left.key, left.label);
                touch(right.key, right.label);
                const parsed = (0, migrate_1.parseLegacyEdgeLabel)(label);
                // Dotted links without a recognisable label are treated as services.
                const kind = edge && edge[2] === '-.->' && parsed.kind === 'ownership' && parsed.pct === null ? 'service' : parsed.kind;
                edges.push({ from: left.key, to: right.key, label, kind });
            }
            continue;
        }
        const decl = endpoint(line);
        if (decl)
            touch(decl.key, decl.label);
    }
    if (nodes.size === 0)
        throw new migrate_1.StructureParseError('No nodes found in the Mermaid code.');
    const doc = (0, migrate_1.parseStructureDocument)({
        schemaVersion: 3,
        chartTitle: 'Imported structure',
        nodes: [...nodes.values()].map(n => ({ ...n, x: 0, y: 0 })),
        edges: edges.map((e, i) => ({ id: `e${i + 1}`, from: e.from, to: e.to, kind: e.kind, label: e.label })),
        groups: groups.map(g => ({ ...g, x: 0, y: 0, w: 400, h: 200 }))
    });
    const layout = (0, layout_1.computeAutoLayout)(doc.entities, doc.relationships, doc.groups, {
        direction: 'TB',
        cardWidth: doc.preferences.cardWidth
    });
    return { ...(0, model_1.moveEntities)(doc, layout.positions), groups: layout.groups };
}
function quote(text) {
    return `"${text.replace(/"/g, '#quot;')}"`;
}
function exportMermaid(doc) {
    const safe = (id) => id.replace(/[^\w$.-]/g, '_');
    let out = 'flowchart TD\n';
    const grouped = new Set();
    doc.groups.forEach((g, idx) => {
        out += `  subgraph G${idx + 1}[${quote(g.name)}]\n`;
        for (const id of g.members) {
            const e = doc.entities.find(x => x.id === id);
            if (e) {
                out += `    ${safe(e.id)}[${quote(e.name)}]\n`;
                grouped.add(e.id);
            }
        }
        out += '  end\n';
    });
    for (const e of doc.entities)
        if (!grouped.has(e.id))
            out += `  ${safe(e.id)}[${quote(e.name)}]\n`;
    out += '\n';
    for (const r of doc.relationships) {
        const arrow = constants_1.RELATIONSHIP_KINDS[r.kind].hierarchical ? '-->' : '-.->';
        const label = r.kind === 'certificates' ? `${(0, model_1.formatRelationshipLabel)(r)} (STAK)` : (0, model_1.formatRelationshipLabel)(r);
        out += `  ${safe(r.from)} ${arrow}|${quote(label)}| ${safe(r.to)}\n`;
    }
    return out;
}
