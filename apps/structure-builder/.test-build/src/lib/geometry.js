"use strict";
/**
 * @file geometry.ts
 * @description Card sizing, edge routing and edge-label placement shared by the
 * canvas and the SVG exporter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LABEL_HEIGHT = exports.CARD_MAX_ROWS = exports.CARD_ROW_HEIGHT = void 0;
exports.escapeHTML = escapeHTML;
exports.cardRowCount = cardRowCount;
exports.getCardHeight = getCardHeight;
exports.getCardHeights = getCardHeights;
exports.getPortPosition = getPortPosition;
exports.prepareEdgeRouting = prepareEdgeRouting;
exports.calculateEdgePath = calculateEdgePath;
exports.estimateLabelWidth = estimateLabelWidth;
exports.resolveLabelPositions = resolveLabelPositions;
const constants_1 = require("./constants");
const model_1 = require("./model");
function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));
}
// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
exports.CARD_ROW_HEIGHT = 19;
exports.CARD_MAX_ROWS = 4;
const SECTION_HEADER = 24;
const LICENCE_ROW = 22;
function cardRowCount(mode, links) {
    if (mode === 'activities')
        return links.activities.length;
    if (mode === 'products')
        return links.products.length;
    return 0;
}
function getCardHeight(mode, links, showLicenceBadges) {
    if (mode === 'ownership')
        return constants_1.CARD_BASE_HEIGHT;
    const rows = cardRowCount(mode, links);
    let height = constants_1.CARD_BASE_HEIGHT;
    if (rows > 0) {
        height += SECTION_HEADER + Math.min(exports.CARD_MAX_ROWS, rows) * exports.CARD_ROW_HEIGHT + (rows > exports.CARD_MAX_ROWS ? 16 : 0);
    }
    if (mode === 'activities' && showLicenceBadges && links.licences.length > 0)
        height += LICENCE_ROW;
    return height;
}
/** Card heights for every entity in the current view mode. */
function getCardHeights(doc, prefs = doc.preferences) {
    const index = (0, model_1.getEntityIndex)(doc);
    const empty = { activities: [], products: [], licences: [] };
    const heights = new Map();
    for (const e of doc.entities) {
        heights.set(e.id, getCardHeight(prefs.mode, index.get(e.id) ?? empty, prefs.showLicenceBadges));
    }
    return heights;
}
// ---------------------------------------------------------------------------
// Edges
// ---------------------------------------------------------------------------
function getPortPosition(node, port, width, height) {
    switch (port) {
        case 'top':
            return { x: node.x + width / 2, y: node.y };
        case 'bottom':
            return { x: node.x + width / 2, y: node.y + height };
        case 'left':
            return { x: node.x, y: node.y + height / 2 };
        case 'right':
            return { x: node.x + width, y: node.y + height / 2 };
        default:
            return { x: node.x + width / 2, y: node.y + height / 2 };
    }
}
/**
 * Spreads the terminals of multiple edges entering the top of the same card and
 * staggers their horizontal lanes so parallel elbows do not overlap.
 */
function prepareEdgeRouting(nodes, edges, cardWidth, nodeHeights) {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const hints = new Map();
    const byTarget = new Map();
    for (const e of edges) {
        const list = byTarget.get(e.to) ?? [];
        list.push(e);
        byTarget.set(e.to, list);
    }
    byTarget.forEach((incoming, targetId) => {
        const target = nodeMap.get(targetId);
        if (!target)
            return;
        const fromTop = incoming.filter(e => {
            const from = nodeMap.get(e.from);
            if (!from)
                return false;
            const fromHeight = nodeHeights.get(e.from) ?? constants_1.CARD_BASE_HEIGHT;
            const toPort = e.toPort || 'auto';
            return toPort === 'top' || (toPort === 'auto' && target.y >= from.y + fromHeight / 2);
        });
        fromTop.sort((a, b) => (nodeMap.get(a.from)?.x ?? 0) - (nodeMap.get(b.from)?.x ?? 0));
        const count = fromTop.length;
        fromTop.forEach((e, idx) => {
            const from = nodeMap.get(e.from);
            const fromHeight = nodeHeights.get(e.from) ?? constants_1.CARD_BASE_HEIGHT;
            hints.set(e.id, {
                targetTerminalX: count > 1 ? target.x + ((idx + 1) / (count + 1)) * cardWidth : target.x + cardWidth / 2,
                defaultLaneY: (from.y + fromHeight + target.y) / 2 + (count > 1 ? (idx - (count - 1) / 2) * 14 : 0)
            });
        });
    });
    return hints;
}
function calculateEdgePath(fromNode, toNode, edge, globalStyle, cardWidth, fromHeight, toHeight, routeHint = null) {
    const style = edge.routing && edge.routing !== 'auto' ? edge.routing : globalStyle;
    const fromPortPref = edge.fromPort || 'auto';
    const toPortPref = edge.toPort || 'auto';
    const isBelow = toNode.y >= fromNode.y + fromHeight / 2;
    const isAbove = toNode.y + toHeight <= fromNode.y;
    const sideways = toNode.x > fromNode.x ? 'right' : 'left';
    const fromPort = fromPortPref === 'auto' ? (isBelow ? 'bottom' : isAbove ? 'top' : sideways) : fromPortPref;
    const toPort = toPortPref === 'auto' ? (isBelow ? 'top' : isAbove ? 'bottom' : sideways === 'right' ? 'left' : 'right') : toPortPref;
    const p1 = getPortPosition(fromNode, fromPort, cardWidth, fromHeight);
    const p2 = getPortPosition(toNode, toPort, cardWidth, toHeight);
    if (toPort === 'top' && toPortPref === 'auto' && routeHint?.targetTerminalX !== undefined) {
        p2.x = routeHint.targetTerminalX;
    }
    const offset = edge.midOffset ?? 0;
    if (style === 'straight') {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        return { d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`, midX: mx, midY: my, waypointX: mx, waypointY: my };
    }
    const horizontal = (fromPort === 'left' || fromPort === 'right') && (toPort === 'left' || toPort === 'right');
    if (style === 'bezier') {
        const portNormal = (port) => {
            switch (port) {
                case 'top': return { x: 0, y: -1 };
                case 'bottom': return { x: 0, y: 1 };
                case 'left': return { x: -1, y: 0 };
                case 'right': return { x: 1, y: 0 };
                default: return { x: 0, y: 1 };
            }
        };
        const n1 = portNormal(fromPort);
        const n2 = portNormal(toPort);
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const curvature = Math.max(36, Math.min(dist * 0.45, 160));
        const cp1x = p1.x + n1.x * curvature;
        const cp1y = p1.y + n1.y * curvature;
        const cp2x = p2.x + n2.x * curvature;
        const cp2y = p2.y + n2.y * curvature;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + offset;
        const d = `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        return { d, midX, midY, waypointX: midX, waypointY: midY };
    }
    // Orthogonal elbow
    const fromIsVert = fromPort === 'top' || fromPort === 'bottom';
    const toIsVert = toPort === 'top' || toPort === 'bottom';
    if (!fromIsVert && toIsVert) {
        // Horizontal → Vertical: leaves horizontally from side, turns vertically into top/bottom
        const d = `M ${p1.x} ${p1.y} L ${p2.x} ${p1.y} L ${p2.x} ${p2.y}`;
        return { d, midX: (p1.x + p2.x) / 2, midY: p1.y, waypointX: p2.x, waypointY: (p1.y + p2.y) / 2 };
    }
    if (fromIsVert && !toIsVert) {
        // Vertical → Horizontal: leaves vertically from top/bottom, turns horizontally into side
        const d = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y} L ${p2.x} ${p2.y}`;
        return { d, midX: p1.x, midY: (p1.y + p2.y) / 2, waypointX: (p1.x + p2.x) / 2, waypointY: p2.y };
    }
    if (horizontal) {
        if (fromPort === toPort) {
            // Same side horizontal (right → right or left → left)
            const laneX = fromPort === 'right' ? Math.max(p1.x, p2.x) + 32 + offset : Math.min(p1.x, p2.x) - 32 + offset;
            const d = `M ${p1.x} ${p1.y} L ${laneX} ${p1.y} L ${laneX} ${p2.y} L ${p2.x} ${p2.y}`;
            return { d, midX: laneX, midY: (p1.y + p2.y) / 2, waypointX: laneX, waypointY: (p1.y + p2.y) / 2 };
        }
        const midX = (p1.x + p2.x) / 2 + offset;
        const d = `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
        return { d, midX, midY: (p1.y + p2.y) / 2, waypointX: midX, waypointY: (p1.y + p2.y) / 2 };
    }
    // Both vertical
    const facing = (fromPort === 'top' && toPort === 'bottom') || (fromPort === 'bottom' && toPort === 'top');
    if (!facing) {
        // Same vertical side (top → top or bottom → bottom)
        const laneY = fromPort === 'bottom' ? Math.max(p1.y, p2.y) + 32 + offset : Math.min(p1.y, p2.y) - 32 + offset;
        const d = `M ${p1.x} ${p1.y} L ${p1.x} ${laneY} L ${p2.x} ${laneY} L ${p2.x} ${p2.y}`;
        return { d, midX: (p1.x + p2.x) / 2, midY: laneY, waypointX: (p1.x + p2.x) / 2, waypointY: laneY };
    }
    const midY = (routeHint?.defaultLaneY ?? (p1.y + p2.y) / 2) + offset;
    const r = Math.min(10, Math.abs(p2.x - p1.x) / 2, Math.abs(p2.y - p1.y) / 2);
    if (Math.abs(p1.x - p2.x) < 4 || r < 3) {
        return { d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`, midX: (p1.x + p2.x) / 2, midY: (p1.y + p2.y) / 2, waypointX: (p1.x + p2.x) / 2, waypointY: midY };
    }
    const dirX = p2.x > p1.x ? 1 : -1;
    const dirY1 = midY > p1.y ? 1 : -1;
    const dirY2 = p2.y > midY ? 1 : -1;
    const d = [
        `M ${p1.x} ${p1.y}`,
        `L ${p1.x} ${midY - dirY1 * r}`,
        `Q ${p1.x} ${midY} ${p1.x + dirX * r} ${midY}`,
        `L ${p2.x - dirX * r} ${midY}`,
        `Q ${p2.x} ${midY} ${p2.x} ${midY + dirY2 * r}`,
        `L ${p2.x} ${p2.y}`
    ].join(' ');
    return { d, midX: (p1.x + p2.x) / 2, midY, waypointX: (p1.x + p2.x) / 2, waypointY: midY };
}
// ---------------------------------------------------------------------------
// Edge labels
// ---------------------------------------------------------------------------
exports.LABEL_HEIGHT = 20;
function estimateLabelWidth(text) {
    return Math.max(34, Math.round(text.length * 6.3 + 18));
}
/**
 * Greedy collision avoidance for edge labels: a label that would overlap an already
 * placed label or a card is nudged a little along the vertical axis. Labels that cannot
 * be placed near their line are reported with `clear: false` so callers can hide them
 * rather than draw them detached from their edge.
 */
function resolveLabelPositions(labels, obstacles = [], maxAttempts = 4) {
    const placed = [];
    const out = new Map();
    const hits = (box, list) => list.some(o => Math.abs(box.x - o.x) * 2 < box.w + o.w + 4 && Math.abs(box.y - o.y) * 2 < box.h + o.h + 2);
    const sorted = [...labels].sort((a, b) => a.y - b.y || a.x - b.x);
    for (const label of sorted) {
        let candidate = label;
        const step = label.h + 3;
        let attempt = 0;
        while ((hits(candidate, placed) || hits(candidate, obstacles)) && attempt < maxAttempts) {
            attempt++;
            const dir = attempt % 2 === 1 ? 1 : -1;
            candidate = { ...label, y: label.y + dir * Math.ceil(attempt / 2) * step };
        }
        const clear = !hits(candidate, placed) && !hits(candidate, obstacles);
        if (!clear)
            candidate = label;
        if (clear)
            placed.push(candidate);
        out.set(label.id, { x: candidate.x, y: candidate.y, clear });
    }
    return out;
}
