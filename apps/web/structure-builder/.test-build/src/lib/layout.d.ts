/**
 * @file layout.ts
 * @description Hierarchical auto layout, placement of new entities and viewport fitting.
 *
 * Layout is only computed on explicit request (or for newly created entities), never
 * during dragging, so its cost stays out of high-frequency interaction paths.
 */
import type { GroupCluster, LayoutDirection, LegalEntity, Relationship } from './types';
export interface LayoutOptions {
    direction: LayoutDirection;
    cardWidth: number;
    /** Rendered card height per entity (cards grow in the activities/products views). */
    heights?: ReadonlyMap<string, number>;
    rankGap?: number;
    nodeGap?: number;
    origin?: {
        x: number;
        y: number;
    };
}
export interface LayoutResult {
    positions: Map<string, {
        x: number;
        y: number;
    }>;
    groups: GroupCluster[];
}
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
export declare function computeAutoLayout(entities: LegalEntity[], relationships: Relationship[], groups: GroupCluster[], options: LayoutOptions): LayoutResult;
export declare function fitGroupsToMembers(groups: GroupCluster[], entities: LegalEntity[], cardWidth: number, heightOf?: (id: string) => number): GroupCluster[];
/** Finds the free slot nearest to `near` that does not overlap any existing card. */
export declare function findFreePosition(entities: LegalEntity[], near: {
    x: number;
    y: number;
}, cardWidth: number, heightOf?: (id: string) => number, newHeight?: number): {
    x: number;
    y: number;
};
export interface Bounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
}
export declare function computeBounds(entities: LegalEntity[], groups: GroupCluster[], cardWidth: number, heightOf?: (id: string) => number): Bounds | null;
export interface ViewTransform {
    zoom: number;
    panX: number;
    panY: number;
}
export declare function fitBoundsTransform(bounds: Bounds | null, viewportWidth: number, viewportHeight: number, padding?: number, maxZoom?: number): ViewTransform;
export declare function clampZoom(zoom: number): number;
/** Zoom keeping the canvas point under (cx, cy) in screen space fixed. */
export declare function zoomAround(view: ViewTransform, nextZoom: number, cx: number, cy: number): ViewTransform;
//# sourceMappingURL=layout.d.ts.map