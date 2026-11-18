'use client';

import { useState } from 'react';
import { copyPNGToClipboard, copySVGToClipboard, downloadFile, exportPDF, exportPNG, exportSVG, getSafeFilename, type ExportSVGOptions } from '../../lib/export';
import { serializeDocument } from '../../lib/migrate';
import { exportMermaid } from '../../lib/mermaid';
import { VIEW_MODES } from '../../lib/view-filters';
import { useEditorContext } from '../editor-context';
import { Modal } from './Modal';

type Background = NonNullable<ExportSVGOptions['background']>;

export function ExportModal() {
  const { store, uiActions } = useEditorContext();
  const [background, setBackground] = useState<Background>('paper');
  const [scale, setScale] = useState(2);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeLegend, setIncludeLegend] = useState(true);
  const doc = store.getState().doc;
  const opts: ExportSVGOptions = { background, includeHeader, includeLegend };
  const done = (message: string) => {
    uiActions.notify({ message });
    uiActions.closeModal();
  };

  return (
    <Modal title="Export" glyph="↓" size="lg" onClose={uiActions.closeModal} footer={<button type="button" className="btn-ghost" onClick={uiActions.closeModal}>Close</button>}>
      <p className="modal-intro">
        Images show the current <strong>{VIEW_MODES[doc.preferences.mode].label.toLowerCase()}</strong> view. JSON contains the complete structure,
        including activities, products and licences. Exported files are not access-controlled; share them as you would the structure itself.
      </p>
      <div className="export-settings-card">
        <div className="form-group">
          <span className="form-label">Background</span>
          <div className="style-chips-row" role="radiogroup" aria-label="Background">
            {(['paper', 'white', 'dark', 'transparent'] as Background[]).map(b => (
              <button key={b} type="button" role="radio" aria-checked={background === b} className={`style-chip ${background === b ? 'active' : ''}`} onClick={() => setBackground(b)}>
                {b[0].toUpperCase() + b.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <span className="form-label">PNG resolution</span>
          <div className="style-chips-row" role="radiogroup" aria-label="PNG resolution">
            {[1, 2, 4].map(s => (
              <button key={s} type="button" role="radio" aria-checked={scale === s} className={`style-chip ${scale === s ? 'active' : ''}`} onClick={() => setScale(s)}>{s}×</button>
            ))}
          </div>
        </div>
        <div className="checkbox-list inline-checkboxes">
          <label className="checkbox-item"><input type="checkbox" checked={includeHeader} onChange={e => setIncludeHeader(e.target.checked)} /><span>Header (title, counts, date)</span></label>
          <label className="checkbox-item"><input type="checkbox" checked={includeLegend} onChange={e => setIncludeLegend(e.target.checked)} /><span>Legend</span></label>
        </div>
      </div>

      <div className="export-formats-grid">
        <div className="export-format-card">
          <span className="format-title">SVG (vector)</span>
          <p className="format-desc">For slides, documents and design tools.</p>
          <div className="format-actions">
            <button type="button" className="btn-secondary btn-sm" onClick={async () => { await copySVGToClipboard(doc, opts); done('Copied SVG'); }}>Copy</button>
            <button type="button" className="btn-primary btn-sm" onClick={() => { exportSVG(doc, opts); done('Downloaded SVG'); }}>Download</button>
          </div>
        </div>
        <div className="export-format-card">
          <span className="format-title">PNG ({scale}×)</span>
          <p className="format-desc">For email and chat.</p>
          <div className="format-actions">
            <button type="button" className="btn-secondary btn-sm" onClick={async () => { const ok = await copyPNGToClipboard(doc, { ...opts, scale }); done(ok ? 'Copied image' : 'Clipboard unavailable — downloaded PNG instead'); }}>Copy</button>
            <button type="button" className="btn-primary btn-sm" onClick={() => { exportPNG(doc, { ...opts, scale }); done('Downloaded PNG'); }}>Download</button>
          </div>
        </div>
        <div className="export-format-card">
          <span className="format-title">PDF</span>
          <p className="format-desc">Landscape print layout via the browser print dialog.</p>
          <div className="format-actions">
            <button type="button" className="btn-primary btn-sm" onClick={() => { exportPDF(doc, opts); uiActions.closeModal(); }}>Print / save PDF</button>
          </div>
        </div>
        <div className="export-format-card">
          <span className="format-title">Data</span>
          <p className="format-desc">Full JSON backup (schema v{doc.schemaVersion}) or Mermaid flowchart of entities and relationships.</p>
          <div className="format-actions">
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(exportMermaid(doc));
                  done('Copied Mermaid code');
                } catch {
                  downloadFile(getSafeFilename(doc.chartTitle, 'mmd'), exportMermaid(doc), 'text/plain');
                  done('Clipboard unavailable — downloaded Mermaid file');
                }
              }}
            >
              Copy Mermaid
            </button>
            <button type="button" className="btn-primary btn-sm" onClick={() => { downloadFile(getSafeFilename(doc.chartTitle, 'json'), serializeDocument(doc), 'application/json'); done('Downloaded JSON backup'); }}>JSON backup</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ExportModal;
