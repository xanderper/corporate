'use client';

import { useUi, useUiActions } from '../editor-context';

export function Toast() {
  const toast = useUi(s => s.toast);
  const uiActions = useUiActions();
  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toast && (
        <div className="toast-bubble" key={toast.id}>
          <span className="toast-text">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                toast.action?.run();
                uiActions.dismissToast();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
