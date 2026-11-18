/**
 * @file mermaid.ts
 * @description Mermaid flowchart import/export for entities and relationships.
 */

import type { EntityType, StructureDocument } from './types';
import { RELATIONSHIP_KINDS } from './constants';
import { formatRelationshipLabel, moveEntities } from './model';
import { StructureParseError, parseLegacyEdgeLabel, parseStructureDocument } from './migrate';
import { computeAutoLayout } from './layout';

export function inferEntityType(label: string): EntityType {
  const s = label.trim();
  if (/Stichting Administratiekantoor|\bSTAK\b/i.test(s)) return 'STAK';
  if (/Stichting|Foundation/i.test(s)) return 'Stichting';
  if (/\bN\.?V\.?$/i.test(s)) return 'NV';
  if (/\bB\.?V\.?$|Ltd|LLC|GmbH|Inc\.?$|Corp|S\.[AL]\.?$/i.test(s)) return 'BV';
  if (/Fund|SPV|Capital|Ventures/i.test(s)) return 'Fund';
  if (/Holding|Beheer/i.test(s)) return 'BV';
  if (s.split(/\s+/).length <= 3 && !/[.&]/.test(s)) return 'NaturalPerson';
  return 'BV';
}

interface RawNode {
  id: string;
  name: string;
  type: EntityType;
}

export function parseMermaid(src: string): StructureDocument {
  if (!src.trim()) throw new StructureParseError('Mermaid input is empty.');

  const nodes = new Map<string, RawNode>();
  const edges: { from: string; to: string; label: string; kind: string }[] = [];
  const groups: { id: string; name: string; members: string[] }[] = [];
  let activeGroup: { id: string; name: string; members: string[] } | null = null;

  const touch = (key: string, label?: string) => {
    const existing = nodes.get(key);
    if (!existing) {
      const name = label || key;
      nodes.set(key, { id: key, name, type: inferEntityType(name) });
    } else if (label && existing.name === key) {
      existing.name = label;
      existing.type = inferEntityType(label);
    }
    if (activeGroup && !activeGroup.members.includes(key)) activeGroup.members.push(key);
  };

  const endpoint = (raw: string) => {
    const m = raw.trim().match(/^([\w$.-]+)\s*(?:[[({]+\s*["']?([\s\S]*?)["']?\s*[\])}]+)?$/);
    return m ? { key: m[1], label: m[2]?.replace(/\\n|<br\s*\/?>/g, ' ').trim() } : null;
  };

  for (const rawLine of src.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/;$/, '');
    if (!line || line.startsWith('%%') || /^(flowchart|graph)\b/i.test(line) || /^(classDef|class|style|linkStyle)\b/.test(line)) continue;
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
      const left = endpoint(edge ? edge[1] : labelled![1]);
      const right = endpoint(edge ? edge[4] : labelled![3]);
      const label = (edge ? edge[3] : labelled![2]) ?? '';
      if (left && right) {
        touch(left.key, left.label);
        touch(right.key, right.label);
        const parsed = parseLegacyEdgeLabel(label);
        // Dotted links without a recognisable label are treated as services.
        const kind = edge && edge[2] === '-.->' && parsed.kind === 'ownership' && parsed.pct === null ? 'service' : parsed.kind;
        edges.push({ from: left.key, to: right.key, label, kind });
      }
      continue;
    }
    const decl = endpoint(line);
    if (decl) touch(decl.key, decl.label);
  }

  if (nodes.size === 0) throw new StructureParseError('No nodes found in the Mermaid code.');

  const doc = parseStructureDocument({
    schemaVersion: 3,
    chartTitle: 'Imported structure',
    nodes: [...nodes.values()].map(n => ({ ...n, x: 0, y: 0 })),
    edges: edges.map((e, i) => ({ id: `e${i + 1}`, from: e.from, to: e.to, kind: e.kind, label: e.label })),
    groups: groups.map(g => ({ ...g, x: 0, y: 0, w: 400, h: 200 }))
  });
  const layout = computeAutoLayout(doc.entities, doc.relationships, doc.groups, {
    direction: 'TB',
    cardWidth: doc.preferences.cardWidth
  });
  return { ...moveEntities(doc, layout.positions), groups: layout.groups };
}

function quote(text: string) {
  return `"${text.replace(/"/g, '#quot;')}"`;
}

export function exportMermaid(doc: StructureDocument): string {
  const safe = (id: string) => id.replace(/[^\w$.-]/g, '_');
  let out = 'flowchart TD\n';
  const grouped = new Set<string>();
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
  for (const e of doc.entities) if (!grouped.has(e.id)) out += `  ${safe(e.id)}[${quote(e.name)}]\n`;
  out += '\n';
  for (const r of doc.relationships) {
    const arrow = RELATIONSHIP_KINDS[r.kind].hierarchical ? '-->' : '-.->';
    const label = r.kind === 'certificates' ? `${formatRelationshipLabel(r)} (STAK)` : formatRelationshipLabel(r);
    out += `  ${safe(r.from)} ${arrow}|${quote(label)}| ${safe(r.to)}\n`;
  }
  return out;
}
