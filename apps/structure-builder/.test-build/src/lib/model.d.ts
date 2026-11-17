/**
 * @file model.ts
 * @description Factories, normalisation and pure document operations.
 *
 * Every operation takes a `StructureDocument` and returns a new one without mutating
 * the input, so the editor store can keep cheap structural-sharing snapshots for
 * undo/redo and React can compare collections by reference.
 */
import { type ActivityAssignment, type BusinessActivity, type GroupCluster, type LegalEntity, type Licence, type Product, type ProductAssignment, type Relationship, type RelationshipKind, type RelationshipPatch, type StructureDocument } from './types';
export declare function createId(prefix?: string): string;
export declare function createEmptyDocument(title?: string, subtitle?: string): StructureDocument;
export declare function createEntity(partial?: Partial<LegalEntity>): LegalEntity;
export declare function createActivity(partial?: Partial<BusinessActivity>): BusinessActivity;
export declare function createProduct(partial?: Partial<Product>): Product;
export declare function createLicence(partial?: Partial<Licence>): Licence;
export declare function createGroup(partial?: Partial<GroupCluster>): GroupCluster;
export declare function parsePct(value: unknown): number | null;
/**
 * Builds a valid `Relationship` for `kind` from a loose record. Fields that do not
 * belong to the kind are dropped, so switching kind never leaves stale metadata.
 */
export declare function buildRelationship(id: string, kind: RelationshipKind, source: RelationshipPatch & {
    from: string;
    to: string;
}): Relationship;
export declare function applyRelationshipPatch(rel: Relationship, patch: RelationshipPatch): Relationship;
export declare function formatPct(value: number | null): string;
export declare function formatRelationshipLabel(rel: Relationship): string;
export declare function toggleId(ids: string[], id: string, on: boolean): string[];
export declare function addEntity(doc: StructureDocument, entity: LegalEntity): StructureDocument;
export declare function updateEntity(doc: StructureDocument, id: string, patch: Partial<Omit<LegalEntity, 'id'>>): StructureDocument;
export declare function moveEntities(doc: StructureDocument, positions: ReadonlyMap<string, {
    x: number;
    y: number;
}>): StructureDocument;
export interface EntityDeletionImpact {
    relationships: number;
    activityAssignments: number;
    productAssignments: number;
    licences: number;
}
export declare function describeEntityDeletion(doc: StructureDocument, ids: string[]): EntityDeletionImpact;
/**
 * Deletion rules: relationships touching the entity and its activity/product
 * assignments are removed; activity, product and licence definitions are kept
 * (licences become unassigned so the record and its history are preserved).
 */
export declare function deleteEntities(doc: StructureDocument, ids: string[]): StructureDocument;
/** Copies the entity's own details (not its relationships or assignments). */
export declare function duplicateEntity(doc: StructureDocument, id: string, newId?: string): {
    doc: StructureDocument;
    entity: LegalEntity | null;
};
export declare function addRelationship(doc: StructureDocument, rel: Relationship): StructureDocument;
export declare function updateRelationship(doc: StructureDocument, id: string, patch: RelationshipPatch): StructureDocument;
export declare function reverseRelationship(doc: StructureDocument, id: string): StructureDocument;
export declare function deleteRelationships(doc: StructureDocument, ids: string[]): StructureDocument;
export declare function addActivity(doc: StructureDocument, activity: BusinessActivity): StructureDocument;
export declare function updateActivity(doc: StructureDocument, id: string, patch: Partial<Omit<BusinessActivity, 'id'>>): StructureDocument;
export declare function deleteActivity(doc: StructureDocument, id: string): StructureDocument;
/** Adds the assignment unless an identical (activity, entity, role) one exists. */
export declare function assignActivity(doc: StructureDocument, assignment: ActivityAssignment): StructureDocument;
export declare function updateActivityAssignment(doc: StructureDocument, id: string, patch: Partial<Omit<ActivityAssignment, 'id'>>): StructureDocument;
export declare function removeActivityAssignment(doc: StructureDocument, id: string): StructureDocument;
export declare function addProduct(doc: StructureDocument, product: Product): StructureDocument;
export declare function updateProduct(doc: StructureDocument, id: string, patch: Partial<Omit<Product, 'id'>>): StructureDocument;
export declare function deleteProduct(doc: StructureDocument, id: string): StructureDocument;
export declare function assignProduct(doc: StructureDocument, assignment: ProductAssignment): StructureDocument;
export declare function updateProductAssignment(doc: StructureDocument, id: string, patch: Partial<Omit<ProductAssignment, 'id'>>): StructureDocument;
export declare function removeProductAssignment(doc: StructureDocument, id: string): StructureDocument;
export declare function addLicence(doc: StructureDocument, licence: Licence): StructureDocument;
export declare function updateLicence(doc: StructureDocument, id: string, patch: Partial<Omit<Licence, 'id'>>): StructureDocument;
export declare function deleteLicence(doc: StructureDocument, id: string): StructureDocument;
export declare function addGroup(doc: StructureDocument, group: GroupCluster): StructureDocument;
export declare function updateGroup(doc: StructureDocument, id: string, patch: Partial<Omit<GroupCluster, 'id'>>): StructureDocument;
export declare function deleteGroup(doc: StructureDocument, id: string): StructureDocument;
export interface EntityLinks {
    activities: {
        assignment: ActivityAssignment;
        activity: BusinessActivity;
    }[];
    products: {
        assignment: ProductAssignment;
        product: Product;
    }[];
    licences: Licence[];
}
/**
 * Per-entity view of activities, products and licences. Memoised on the source
 * collections (not on entity positions), so dragging does not rebuild it and
 * entity cards keep referentially stable link objects.
 */
export declare function getEntityIndex(doc: StructureDocument): Map<string, EntityLinks>;
export declare function getEntityLinks(doc: StructureDocument, entityId: string): EntityLinks;
export declare function isLicenceInForce(licence: Licence, today: string): boolean;
/** ISO date (YYYY-MM-DD) in local time. */
export declare function todayIso(now?: Date): string;
/** id → entity lookup, memoised per `entities` array. */
export declare function getEntityMap(entities: LegalEntity[]): Map<string, LegalEntity>;
/** Sensible relationship kind when connecting two entities by dragging. */
export declare function defaultRelationshipKind(fromType: string, toType: string): RelationshipKind;
export { exportMermaid, parseMermaid } from './mermaid';
export { parseStructureDocument as parseJSON } from './migrate';
export declare function exportJSON(doc: any): string;
//# sourceMappingURL=model.d.ts.map