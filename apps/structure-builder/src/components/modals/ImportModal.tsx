'use client';

import { useState } from 'react';
import { StructureParseError, parseStructureJSON } from '../../lib/migrate';
import { parseMermaid } from '../../lib/mermaid';
import { validateStructure } from '../../lib/validation';
import { useEditorContext } from '../editor-context';
import { Modal } from './Modal';

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export function ImportModal() {
  const { actions, uiActions } = useEditorContext();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    const raw = text.trim();
    if (!raw) {
      setError('Paste JSON or Mermaid code, or choose a file.');
      return;
    }
    try {
      const doc = raw.startsWith('{') ? parseStructureJSON(raw) : parseMermaid(raw);
      const errors = validateStructure(doc).filter(d => d.severity === 'error').length;
      actions.loadDocument(doc);
      if (errors) uiActions.notify({ message: `Imported with ${errors} error(s) to review under Checks` });
      uiActions.closeModal();
    } catch (err) {
      setError(err instanceof StructureParseError ? err.message : 'The input could not be read as JSON or Mermaid.');
    }
  };

  return (
    <Modal
      title="Import structure"
      glyph="↑"
      onClose={uiActions.closeModal}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={uiActions.closeModal}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleImport}>Replace current structure</button>
        </>
      }
    >
      <p className="modal-intro">
        Paste a JSON backup (any version of this builder) or a Mermaid flowchart. The current structure is replaced; you can undo the import with ⌘Z.
      </p>
      <div className="form-group">
        <label className="form-label" htmlFor="import-text">JSON or Mermaid</label>
        <textarea
          id="import-text"
          className="form-textarea code-textarea"
          rows={10}
          value={text}
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'import-error' : undefined}
          onChange={e => {
            setText(e.target.value);
            setError(null);
          }}
          placeholder={'{ "schemaVersion": 4, "entities": [ … ] }\n\nor\n\nflowchart TD\n  A[Holding B.V.] -->|100%| B[Sub B.V.]'}
        />
      </div>
      <label className="file-upload-label">
        <span>Or choose a file (.json, .mmd, .txt)</span>
        <input
          type="file"
          accept=".json,.mmd,.txt,application/json,text/plain"
          className="file-upload-input"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > MAX_IMPORT_BYTES) {
              setError('The file is larger than 5 MB.');
              return;
            }
            setText(await file.text());
            setError(null);
          }}
        />
      </label>
      {error && <div className="notice-box notice-error" id="import-error" role="alert">{error}</div>}
    </Modal>
  );
}

export default ImportModal;
