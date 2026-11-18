/**
 * @file layout.ts
 * @description Hierarchical auto layout, placement of new entities and viewport fitting.
 *
 * Layout is only computed on explicit request (or for newly created entities), never
 * during dragging, so its cost stays out of high-frequency interaction paths.
 */

import type { GroupCluster, LayoutDirection, LegalEntity, Relationship } from './types';
import { CARD_BASE_HEIGHT, ZOOM_MAX, ZOOM_MIN, isHierarchicalKind } from './constants';

export interface LayoutOptions {
  direction: LayoutDirection;
  cardWidth: number;
  /** Rendered card height per entity (cards grow in the activities/products views). */
  heights?: ReadonlyMap<string, number>;
  rankGap?: number;
  nodeGap?: number;
  origin?: { x: number; y: number };
}

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  groups: GroupCluster[];
}

const snap = (v: number) => Math.round(v / 10) * 10;
const ARRANGEMENT_WEIGHT = 0.35;
const GROUP_HEADER = 44;
const GROUP_PADDING = 28;

/**
 * Layered (Sugiyama-style) layout:
 *  1. ranks from the hierarchical relationships (ownership, certificates, control),
 *     with cycles broken and parent-less entities pulled down next to their children;
 *  2. entities linked only by arrangements (services, custody, …) join the rank of
 *     their partner so e.g. a custody foundation sits next to the entity it serves;
 *  3. barycentric ordering sweeps reduce crossings while keeping group members contiguous;
 *  4. coordinates centre parents over children without overlaps.
 * Locked entities keep their position.
 */
export function computeAutoLayout(
  entities: LegalEntity[],
  relationships: Relationship[],
  groups: GroupCluster[],
  options: LayoutOptions
): LayoutResult {
  const positions = new Map<string, { x: number; y: number }>();
  if (entities.length === 0) return { positions, groups };

  const isLR = options.direction === 'LR';
  const heights = options.heights ?? new Map<string, number>();
  const heightOf = (id: string) => heights.get(id) ?? CARD_BASE_HEIGHT;
  const crossSize = (id: string) => (isLR ? heightOf(id) : options.cardWidth);
  const rankGap = options.rankGap ?? (isLR ? 90 : 90);
  const nodeGap = options.nodeGap ?? (isLR ? 28 : 40);
  const origin = options.origin ?? { x: 80, y: 80 };

  const ids = entities.map(e => e.id);
  const known = new Set(ids);
  const groupOf = new Map<string, string>();
  for (const g of groups) for (const m of g.members) if (!groupOf.has(m)) groupOf.set(m, g.id);

  // ---- 1. hierarchical graph with cycles removed --------------------------
  const children = new Map<string, string[]>(ids.map(id => [id, []]));
  const parents = new Map<string, string[]>(ids.map(id => [id, []]));
  const arrangements = new Map<string, string[]>(ids.map(id => [id, []]));

  const hierEdges = relationships.filter(r => isHierarchicalKind(r.kind) && known.has(r.from) && known.has(r.to) && r.from !== r.to);
  const state = new Map<string, number>();
  const outgoing = new Map<string, string[]>(ids.map(id => [id, []]));
  for (const r of hierEdges) outgoing.get(r.from)!.push(r.to);
  const dropped = new Set<string>();
  const dfs = (u: string) => {
    state.set(u, 1);
    for (const v of outgoing.get(u)!) {
      const s = state.get(v) ?? 0;
      if (s === 1) dropped.add(`${u}|${v}`);
      else if (s === 0) dfs(v);
    }
    state.set(u, 2);
  };
  for (const id of ids) if (!state.get(id)) dfs(id);

  for (const r of hierEdges) {
    if (dropped.has(`${r.from}|${r.to}`) || children.get(r.from)!.includes(r.to)) continue;
    children.get(r.from)!.push(r.to);
    parents.get(r.to)!.push(r.from);
  }
  for (const r of relationships) {
    if (isHierarchicalKind(r.kind) || !known.has(r.from) || !known.has(r.to) || r.from === r.to) continue;
    arrangements.get(r.from)!.push(r.to);
    arrangements.get(r.to)!.push(r.from);
  }

  // ---- 2. ranks -------------------------------------------------------------
  const rank = new Map<string, number>();
  const indeg = new Map(ids.map(id => [id, parents.get(id)!.length]));
  const queue = ids.filter(id => indeg.get(id) === 0);
  const topo: string[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    topo.push(u);
    for (const v of children.get(u)!) {
      indeg.set(v, indeg.get(v)! - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }
  for (const u of topo) {
    const r = Math.max(0, ...parents.get(u)!.map(p => (rank.get(p) ?? 0) + 1));
    rank.set(u, r);
  }
  // Pull parent-less entities down so they sit directly above their highest child.
  for (const u of [...topo].reverse()) {
    if (parents.get(u)!.length > 0 || children.get(u)!.length === 0) continue;
    rank.set(u, Math.min(...children.get(u)!.map(c => rank.get(c)!)) - 1);
  }
  // Entities without any hierarchical link adopt the rank of an arrangement partner.
  const hierarchical = (id: string) => parents.get(id)!.length > 0 || children.get(id)!.length > 0;
  for (const id of ids) {
    if (hierarchical(id)) continue;
    const partner = arrangements.get(id)!.find(hierarchical);
    rank.set(id, partner ? rank.get(partner)! : 0);
  }
  const minRank = Math.min(...rank.values());
  for (const id of ids) rank.set(id, rank.get(id)! - minRank);

  const layerCount = Math.max(...rank.values()) + 1;
  const layers: string[][] = Array.from({ length: layerCount }, () => []);

  // Initial order: depth-first from roots keeps subtrees together.
  const placed = new Set<string>();
  const visitOrder = (u: string) => {
    if (placed.has(u)) return;
    placed.add(u);
    layers[rank.get(u)!].push(u);
    for (const c of children.get(u)!) visitOrder(c);
    for (const a of arrangements.get(u)!) if (!hierarchical(a)) visitOrder(a);
  };
  const roots = ids.filter(id => parents.get(id)!.length === 0 && hierarchical(id));
  // Respect the current left-to-right order of roots so re-layouts feel stable.
  const entityById = new Map(entities.map(e => [e.id, e]));
  roots.sort((a, b) => (isLR ? entityById.get(a)!.y - entityById.get(b)!.y : entityById.get(a)!.x - entityById.get(b)!.x));
  for (const r of roots) visitOrder(r);
  for (const id of ids) visitOrder(id);

  // ---- 3. crossing reduction -----------------------------------------------
  const neighbours = (id: string, towardsRank: number): { id: string; w: number }[] => {
    const out: { id: string; w: number }[] = [];
    for (const p of parents.get(id)!) if (rank.get(p) === towardsRank) out.push({ id: p, w: 1 });
    for (const c of children.get(id)!) if (rank.get(c) === towardsRank) out.push({ id: c, w: 1 });
    for (const a of arrangements.get(id)!) if (rank.get(a) === towardsRank) out.push({ id: a, w: ARRANGEMENT_WEIGHT });
    return out;
  };
  const orderIndex = () => {
    const idx = new Map<string, number>();
    for (const layer of layers) layer.forEach((id, i) => idx.set(id, i));
    return idx;
  };
  const sortLayer = (r: number, ref: number) => {
    const idx = orderIndex();
    const bary = new Map<string, number>();
    for (const id of layers[r]) {
      const ns = neighbours(id, ref);
      const wSum = ns.reduce((s, n) => s + n.w, 0);
      bary.set(id, wSum > 0 ? ns.reduce((s, n) => s + idx.get(n.id)! * n.w, 0) / wSum : idx.get(id)!);
    }
    // Keep members of the same visual group contiguous.
    const groupBary = new Map<string, number>();
    for (const id of layers[r]) {
      const g = groupOf.get(id);
      if (!g) continue;
      const members = layers[r].filter(m => groupOf.get(m) === g);
      groupBary.set(g, members.reduce((s, m) => s + bary.get(m)!, 0) / members.length);
    }
    const key = (id: string) => {
      const g = groupOf.get(id);
      return g ? groupBary.get(g)! : bary.get(id)!;
    };
    layers[r] = [...layers[r]].sort((a, b) => key(a) - key(b) || bary.get(a)! - bary.get(b)! || idx.get(a)! - idx.get(b)!);
  };
  for (let iter = 0; iter < 4; iter++) {
    for (let r = 1; r < layerCount; r++) sortLayer(r, r - 1);
    for (let r = layerCount - 2; r >= 0; r--) sortLayer(r, r + 1);
  }

  // ---- 4. coordinates ------------------------------------------------------
  const cross = new Map<string, number>();
  for (const layer of layers) {
    let c = 0;
    for (const id of layer) {
      cross.set(id, c);
      c += crossSize(id) + nodeGap;
    }
  }
  const centre = (id: string) => cross.get(id)! + crossSize(id) / 2;

  const placeLayer = (layer: string[], desiredCentre: Map<string, number>) => {
    if (layer.length === 0) return;
    const want = layer.map(id => (desiredCentre.get(id) ?? centre(id)) - crossSize(id) / 2);
    const a: number[] = [];
    const b: number[] = new Array(layer.length);
    layer.forEach((id, i) => {
      a[i] = i === 0 ? want[i] : Math.max(want[i], a[i - 1] + crossSize(layer[i - 1]) + nodeGap);
    });
    for (let i = layer.length - 1; i >= 0; i--) {
      b[i] = i === layer.length - 1 ? want[i] : Math.min(want[i], b[i + 1] - crossSize(layer[i]) - nodeGap);
    }
    layer.forEach((id, i) => cross.set(id, (a[i] + b[i]) / 2));
  };
  const alignTo = (r: number, ref: number) => {
    const desired = new Map<string, number>();
    for (const id of layers[r]) {
      const ns = neighbours(id, ref);
      const wSum = ns.reduce((s, n) => s + n.w, 0);
      if (wSum > 0) desired.set(id, ns.reduce((s, n) => s + centre(n.id) * n.w, 0) / wSum);
    }
    placeLayer(layers[r], desired);
  };
  for (let iter = 0; iter < 6; iter++) {
    for (let r = layerCount - 2; r >= 0; r--) alignTo(r, r + 1);
    for (let r = 1; r < layerCount; r++) alignTo(r, r - 1);
  }

  // Rank coordinate: accumulate the tallest card (TB) or the card width (LR) per layer.
  const rankPos: number[] = [];
  let acc = 0;
  for (let r = 0; r < layerCount; r++) {
    rankPos[r] = acc;
    const extent = isLR ? options.cardWidth : Math.max(CARD_BASE_HEIGHT, ...layers[r].map(heightOf));
    acc += extent + rankGap + (groups.length > 0 ? GROUP_HEADER / 2 : 0);
  }

  const minCross = Math.min(...ids.map(id => cross.get(id)!));
  for (const e of entities) {
    if (e.locked) continue;
    const c = cross.get(e.id)! - minCross;
    const rp = rankPos[rank.get(e.id)!];
    positions.set(e.id, isLR ? { x: snap(origin.x + rp), y: snap(origin.y + c) } : { x: snap(origin.x + c), y: snap(origin.y + rp) });
  }

  const placedEntities = entities.map(e => ({ ...e, ...(positions.get(e.id) ?? {}) }));
  return { positions, groups: fitGroupsToMembers(groups, placedEntities, options.cardWidth, heightOf) };
}

export function fitGroupsToMembers(
  groups: GroupCluster[],
  entities: LegalEntity[],
  cardWidth: number,
  heightOf: (id: string) => number = () => CARD_BASE_HEIGHT
): GroupCluster[] {
  const byId = new Map(entities.map(e => [e.id, e]));
  return groups.map(g => {
    const members = g.members.map(id => byId.get(id)).filter((e): e is LegalEntity => Boolean(e));
    if (members.length === 0) return g;
    const minX = Math.min(...members.map(e => e.x));
    const minY = Math.min(...members.map(e => e.y));
    const maxX = Math.max(...members.map(e => e.x + cardWidth));
    const maxY = Math.max(...members.map(e => e.y + heightOf(e.id)));
    return {
      ...g,
      x: snap(minX - GROUP_PADDING),
      y: snap(minY - GROUP_HEADER),
      w: snap(maxX - minX + GROUP_PADDING * 2),
      h: snap(maxY - minY + GROUP_HEADER + GROUP_PADDING)
    };
  });
}

// ---------------------------------------------------------------------------
// Placement of newly created entities
// ---------------------------------------------------------------------------

/** Finds the free slot nearest to `near` that does not overlap any existing card. */
export function findFreePosition(
  entities: LegalEntity[],
  near: { x: number; y: number },
  cardWidth: number,
  heightOf: (id: string) => number = () => CARD_BASE_HEIGHT,
  newHeight = CARD_BASE_HEIGHT
): { x: number; y: number } {
  const margin = 24;
  const overlaps = (x: number, y: number) =>
    entities.some(e => {
      const h = heightOf(e.id);
      return x < e.x + cardWidth + margin && x + cardWidth + margin > e.x && y < e.y + h + margin && y + newHeight + margin > e.y;
    });
  const stepX = cardWidth + 40;
  const stepY = newHeight + 40;
  const start = { x: snap(near.x), y: snap(near.y) };
  if (!overlaps(start.x, start.y)) return start;
  for (let ring = 1; ring < 12; ring++) {
    // Prefer horizontal neighbours (siblings), then rows below, then above.
    const candidates: { x: number; y: number }[] = [];
    for (let dx = -ring; dx <= ring; dx++) {
      candidates.push({ x: start.x + dx * stepX, y: start.y });
    }
    for (let dy = 1; dy <= ring; dy++) {
      for (let dx = -ring; dx <= ring; dx++) candidates.push({ x: start.x + dx * stepX, y: start.y + dy * stepY });
    }
    for (let dy = -1; dy >= -ring; dy--) {
      for (let dx = -ring; dx <= ring; dx++) candidates.push({ x: start.x + dx * stepX, y: start.y + dy * stepY });
    }
    candidates.sort((a, b) => Math.hypot(a.x - start.x, (a.y - start.y) * 1.5) - Math.hypot(b.x - start.x, (b.y - start.y) * 1.5));
    const free = candidates.find(c => !overlaps(c.x, c.y));
    if (free) return free;
  }
  return { x: start.x, y: start.y + stepY };
}

// ---------------------------------------------------------------------------
// Bounds & viewport fitting
// ---------------------------------------------------------------------------

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function computeBounds(
  entities: LegalEntity[],
  groups: GroupCluster[],
  cardWidth: number,
  heightOf: (id: string) => number = () => CARD_BASE_HEIGHT
): Bounds | null {
  if (entities.length === 0 && groups.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const e of entities) {
    minX = Math.min(minX, e.x);
    minY = Math.min(minY, e.y);
    maxX = Math.max(maxX, e.x + cardWidth);
    maxY = Math.max(maxY, e.y + heightOf(e.id));
  }
  for (const g of groups) {
    minX = Math.min(minX, g.x);
    minY = Math.min(minY, g.y);
    maxX = Math.max(maxX, g.x + g.w);
    maxY = Math.max(maxY, g.y + g.h);
  }
  return { minX, minY, maxX, maxY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
}

export interface ViewTransform {
  zoom: number;
  panX: number;
  panY: number;
}

export function fitBoundsTransform(
  bounds: Bounds | null,
  viewportWidth: number,
  viewportHeight: number,
  padding = 60,
  maxZoom = 1.2
): ViewTransform {
  if (!bounds) return { zoom: 1, panX: 60, panY: 60 };
  const availableW = Math.max(1, viewportWidth - padding * 2);
  const availableH = Math.max(1, viewportHeight - padding * 2);
  const zoom = clampZoom(Math.min(maxZoom, availableW / bounds.width, availableH / bounds.height));
  return {
    zoom,
    panX: Math.round((viewportWidth - bounds.width * zoom) / 2 - bounds.minX * zoom),
    panY: Math.round((viewportHeight - bounds.height * zoom) / 2 - bounds.minY * zoom)
  };
}

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

/** Zoom keeping the canvas point under (cx, cy) in screen space fixed. */
export function zoomAround(view: ViewTransform, nextZoom: number, cx: number, cy: number): ViewTransform {
  const zoom = clampZoom(nextZoom);
  const ratio = zoom / view.zoom;
  return { zoom, panX: cx - (cx - view.panX) * ratio, panY: cy - (cy - view.panY) * ratio };
}
