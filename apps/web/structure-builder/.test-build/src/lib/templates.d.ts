/**
 * @file templates.ts
 * @description Starter documents. Illustrative only — not legal advice.
 */
import { type StructureDocument } from './types';
export type TemplateKey = 'qorve' | 'blank';
export declare const TEMPLATES: Record<TemplateKey, {
    label: string;
    description: string;
    document: StructureDocument;
}>;
/** Returns a fresh copy so editing never mutates the shared template object. */
export declare function instantiateTemplate(key: TemplateKey): StructureDocument;
//# sourceMappingURL=templates.d.ts.map