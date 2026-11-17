/**
 * @file geometry.ts
 * @description Card sizing, edge routing and edge-label placement shared by the
 * canvas and the SVG exporter.
 */
import type { ConnectionStyle, LegalEntity, PortPosition, Relationship, StructureDocument, ViewMode, ViewPreferences } from './types';
import { type EntityLinks } from './model';
export declare function escapeHTML(str: string): string;
export declare const CARD_ROW_HEIGHT = 19;
export declare const CARD_MAX_ROWS = 4;
export declare function cardRowCount(mode: ViewMode, links: EntityLinks): number;
export declare function getCardHeight(mode: ViewMode, links: EntityLinks, showLicenceBadges: boolean): number;
/** Card heights for every entity in the current view mode. */
export declare function getCardHeights(doc: StructureDocument, prefs?: ViewPreferences): Map<string, number>;
export declare function getPortPosition(node: LegalEntity, port: PortPosition, width: number, height: number): {
    x: number;
    y: number;
};
export interface RouteHint {
    targetTerminalX?: number;
    defaultLaneY?: number;
}
/**
 * Spreads the terminals of multiple edges entering the top of the same card and
 * staggers their horizontal lanes so parallel elbows do not overlap.
 */
export declare function prepareEdgeRouting(nodes: LegalEntity[], edges: Relationship[], cardWidth: number, nodeHeights: ReadonlyMap<string, number>): Map<string, RouteHint>;
export interface EdgePathData {
    d: string;
    midX: number;
    midY: number;
    waypointX: number;
    waypointY: number;
}
export declare function calculateEdgePath(fromNode: LegalEntity, toNode: LegalEntity, edge: Pick<Relationship, 'routing' | 'fromPort' | 'toPort' | 'midOffset'>, globalStyle: ConnectionStyle, cardWidth: number, fromHeight: number, toHeight: number, routeHint?: RouteHint | null): EdgePathData;
export declare const LABEL_HEIGHT = 20;
export declare function estimateLabelWidth(text: string): number;
export interface LabelBox {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}
/**
 * Greedy collision avoidance for edge labels: a label that would overlap an already
 * placed label or a card is nudged a little along the vertical axis. Labels that cannot
 * be placed near their line are reported with `clear: false` so callers can hide them
 * rather than draw them detached from their edge.
 */
export declare function resolveLabelPositions(labels: LabelBox[], obstacles?: LabelBox[], maxAttempts?: number): Map<string, {
    x: number;
    y: number;
    clear: boolean;
}>;
//# sourceMappingURL=geometry.d.ts.map