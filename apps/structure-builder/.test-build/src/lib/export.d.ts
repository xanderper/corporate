/**
 * @file export.ts
 * @description Standalone SVG rendering of the current view, plus PNG/PDF/clipboard
 * helpers built on top of it. Browser-only helpers guard against server execution.
 */
import type { StructureDocument } from './types';
export interface ExportSVGOptions {
    background?: 'paper' | 'white' | 'dark' | 'transparent';
    includeHeader?: boolean;
    includeLegend?: boolean;
}
export declare function downloadBlob(blob: Blob, filename: string): void;
export declare function downloadFile(filename: string, content: string, mimeType: string): void;
export declare function getSafeFilename(title: string, ext: string): string;
export declare function generateExportSVG(doc: StructureDocument, options?: ExportSVGOptions): string;
export declare function exportSVG(state: StructureDocument, options?: ExportSVGOptions): void;
export declare function renderSVGToCanvas(svgStr: string, scale: number, callback: (canvas: HTMLCanvasElement) => void): void;
export declare function exportPNG(state: StructureDocument, options?: ExportSVGOptions & {
    scale?: number;
}): void;
export declare function copyPNGToClipboard(state: StructureDocument, options?: ExportSVGOptions & {
    scale?: number;
}): Promise<boolean>;
export declare function copySVGToClipboard(state: StructureDocument, options?: ExportSVGOptions): Promise<boolean>;
export declare function exportPDF(state: StructureDocument, options?: ExportSVGOptions): void;
//# sourceMappingURL=export.d.ts.map