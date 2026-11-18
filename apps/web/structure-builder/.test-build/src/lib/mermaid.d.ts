/**
 * @file mermaid.ts
 * @description Mermaid flowchart import/export for entities and relationships.
 */
import type { EntityType, StructureDocument } from './types';
export declare function inferEntityType(label: string): EntityType;
export declare function parseMermaid(src: string): StructureDocument;
export declare function exportMermaid(doc: StructureDocument): string;
//# sourceMappingURL=mermaid.d.ts.map