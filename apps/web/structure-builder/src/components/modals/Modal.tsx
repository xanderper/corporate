'use client';

import { useEffect, useId, useRef } from 'react';

/** Accessible dialog shell: labelled, focus moved in on open and restored on close. */
export function Modal({
  title,
  glyph,
  size = 'md',
  onClose,
  footer,
  children
}: {
  title: string;
  glyph?: string;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = dialogRef.current?.querySelector<HTMLElement>('[autofocus], textarea, input, select, button:not(.modal-close-btn)');
    (first ?? dialogRef.current)?.focus();
    return () => previous?.focus?.();
  }, []);

  const trapTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter(el => !el.hasAttribute('disabled'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="modal-backdrop" onPointerDown={e => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className={`modal-dialog modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={trapTab}>
        <div className="modal-header">
          <div className="modal-title-lockup">
            {glyph && <span className="modal-glyph" aria-hidden="true">{glyph}</span>}
            <h2 className="modal-title" id={titleId}>{title}</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
