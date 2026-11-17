/**
 * @file validation.ts
 * @description Structural and licence-modelling checks.
 *
 * These are data-quality checks on the model. They do not establish whether a
 * business is legally compliant.
 */
import type { Diagnostic, DiagnosticSeverity, LegalEntity, Relationship, StructureDocument } from './types';
export declare const SEVERITY_META: Record<DiagnosticSeverity, {
    label: string;
    badgeClass: string;
    icon: string;
    order: number;
}>;
/** Returns each distinct cycle (as entity ids, first id repeated at the end) in the hierarchy. */
export declare function findOwnershipCycles(entities: LegalEntity[], relationships: Relationship[]): string[][];
export interface ValidationOptions {
    /** ISO date used for expiry checks; injectable for tests. */
    today?: string;
}
export declare function validateStructure(doc: StructureDocument, options?: ValidationOptions): Diagnostic[];
export declare function countBySeverity(diagnostics: Diagnostic[]): Record<DiagnosticSeverity, number>;
/** Equality used by UI selectors so diagnostics consumers skip re-rendering while dragging. */
export declare function sameDiagnostics(a: Diagnostic[], b: Diagnostic[]): boolean;
/**
 * Validation memoised on the document. Moving entities does not re-run validation,
 * so diagnostics stay off the drag path.
 */
export declare function getDiagnostics(doc: StructureDocument): Diagnostic[];
//# sourceMappingURL=validation.d.ts.map