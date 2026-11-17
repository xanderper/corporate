'use client';

import { SHORTCUTS } from '../use-shortcuts';
import { useEditorContext } from '../editor-context';
import { Modal } from './Modal';

export function ShortcutsModal() {
  const { uiActions } = useEditorContext();
  return (
    <Modal title="Keyboard shortcuts" glyph="⌨" size="sm" onClose={uiActions.closeModal} footer={<button type="button" className="btn-primary" onClick={uiActions.closeModal}>Close</button>}>
      <dl className="shortcuts-table">
        {SHORTCUTS.map(s => (
          <div key={s.keys} className="shortcut-row">
            <dt className="shortcut-desc">{s.desc}</dt>
            <dd><kbd className="shortcut-kbd">{s.keys}</kbd></dd>
          </div>
        ))}
      </dl>
      <p className="form-hint">On Windows and Linux use Ctrl instead of ⌘.</p>
    </Modal>
  );
}

export default ShortcutsModal;
