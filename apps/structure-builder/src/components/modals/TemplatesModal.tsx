'use client';

import { TEMPLATES, type TemplateKey } from '../../lib/templates';
import { useEditorContext } from '../editor-context';
import { Modal } from './Modal';

export function TemplatesModal() {
  const { actions, uiActions } = useEditorContext();
  return (
    <Modal title="Start from a template" glyph="▤" onClose={uiActions.closeModal} footer={<button type="button" className="btn-ghost" onClick={uiActions.closeModal}>Cancel</button>}>
      <p className="modal-intro">The current structure is replaced. You can undo this with ⌘Z.</p>
      <div className="templates-list">
        {(Object.keys(TEMPLATES) as TemplateKey[]).map(key => {
          const t = TEMPLATES[key];
          const d = t.document;
          return (
            <button
              key={key}
              type="button"
              className="template-card"
              onClick={() => {
                actions.loadTemplate(key);
                uiActions.closeModal();
              }}
            >
              <span className="template-name">{t.label}</span>
              <span className="template-desc">{t.description}</span>
              <span className="template-stats">
                {d.entities.length} entities · {d.relationships.length} relationships · {d.activities.length} activities · {d.products.length} products · {d.licences.length} licences
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

export default TemplatesModal;
