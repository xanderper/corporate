/**
 * @file editor-actions.ts
 * @description User-level editing commands. Each command is one undo step built from
 * the pure operations in `model.ts`; the React layer only calls these.
 */
import type { ActivityAssignment, ActivityRole, BusinessActivity, GroupCluster, ItemRef, LayoutDirection, LegalEntity, Licence, Product, ProductAssignment, ProductRole, RelationshipKind, RelationshipPatch, Selection, StructureDocument, StructureSettings, ViewPreferences } from './types';
import type { EditorStore } from './editor-store';
import { type TemplateKey } from './templates';
export interface Notice {
    message: string;
    action?: {
        label: string;
        run: () => void;
    };
}
export type Notify = (notice: Notice) => void;
export declare function refToSelection(ref: ItemRef): Selection;
export declare function createEditorActions(store: EditorStore, notify: Notify): {
    undo(): void;
    redo(): void;
    select(selection: Selection): void;
    selectRef(ref: ItemRef): void;
    toggleEntitySelection(id: string, additive: boolean): void;
    clearSelection(): void;
    setTitle(chartTitle: string): void;
    setSubtitle(chartSubtitle: string): void;
    /** View preferences are saved with the document but are not undoable edits. */
    setPreferences(patch: Partial<ViewPreferences>): void;
    setSettings(patch: Partial<StructureSettings>): void;
    loadDocument(next: StructureDocument, label?: string): void;
    loadTemplate(key: TemplateKey): void;
    createEntity(partial?: Partial<LegalEntity>, near?: {
        x: number;
        y: number;
    }): string;
    addSubsidiary(parentId: string): string | null;
    updateEntity(id: string, patch: Partial<Omit<LegalEntity, "id">>, field?: string): void;
    /** Call once when a drag actually starts moving; subsequent `dragEntities` calls are free of history. */
    beginDrag(label?: string): void;
    dragEntities(positions: ReadonlyMap<string, {
        x: number;
        y: number;
    }>): void;
    nudgeSelection(dx: number, dy: number): void;
    deleteEntities(ids: string[]): void;
    duplicateEntities(ids: string[]): void;
    connect(from: string, to: string, kind?: RelationshipKind, patch?: RelationshipPatch): string | null;
    updateRelationship(id: string, patch: RelationshipPatch, field?: string): void;
    /** Adjusts a routed edge's mid segment while dragging its handle; call `beginDrag` first. */
    dragRelationshipOffset(id: string, midOffset: number): void;
    reverseRelationship(id: string): void;
    deleteRelationship(id: string): void;
    createActivity(partial?: Partial<BusinessActivity>, assignTo?: {
        entityId: string;
        role?: ActivityRole;
    }): string;
    updateActivity(id: string, patch: Partial<Omit<BusinessActivity, "id">>, field?: string): void;
    deleteActivity(id: string): void;
    assignActivity(activityId: string, entityId: string, role?: ActivityRole): void;
    updateActivityAssignment(id: string, patch: Partial<Omit<ActivityAssignment, "id">>): void;
    unassignActivity(id: string): void;
    setRelatedActivity(activityId: string, relatedId: string, on: boolean): void;
    createProduct(partial?: Partial<Product>, assignTo?: {
        entityId: string;
        role?: ProductRole;
    }): string;
    updateProduct(id: string, patch: Partial<Omit<Product, "id">>, field?: string): void;
    deleteProduct(id: string): void;
    assignProduct(productId: string, entityId: string, role?: ProductRole): void;
    updateProductAssignment(id: string, patch: Partial<Omit<ProductAssignment, "id">>): void;
    unassignProduct(id: string): void;
    setProductActivity(productId: string, activityId: string, on: boolean): void;
    createLicence(partial?: Partial<Licence>): string;
    updateLicence(id: string, patch: Partial<Omit<Licence, "id">>, field?: string): void;
    deleteLicence(id: string): void;
    setLicenceActivity(licenceId: string, activityId: string, on: boolean): void;
    createGroup(partial?: Partial<GroupCluster>): string;
    updateGroup(id: string, patch: Partial<Omit<GroupCluster, "id">>, field?: string): void;
    /** Moves a group box together with its (unlocked) members; call `beginDrag` first. */
    dragGroup(id: string, x: number, y: number, memberPositions: ReadonlyMap<string, {
        x: number;
        y: number;
    }>): void;
    deleteGroup(id: string): void;
    autoLayout(direction?: LayoutDirection): void;
};
export type EditorActions = ReturnType<typeof createEditorActions>;
//# sourceMappingURL=editor-actions.d.ts.map