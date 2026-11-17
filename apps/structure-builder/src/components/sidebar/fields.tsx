'use client';

import { useId, useState } from 'react';

/**
 * Inspector form controls. Edits are committed to the store as the user types; the
 * store coalesces consecutive keystrokes into one undo step, so there is never an
 * "unsaved form" to lose when switching selection or sections.
 */

interface BaseProps {
  label: string;
  hint?: string;
  className?: string;
}

function FieldShell({ id, label, hint, className, children }: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={`form-group ${className ?? ''}`}>
      <label className="form-label" htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="form-hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  hint,
  className,
  value,
  onChange,
  placeholder,
  list,
  autoFocus
}: BaseProps & { value: string; onChange: (v: string) => void; placeholder?: string; list?: string; autoFocus?: boolean }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <input
        id={id}
        type="text"
        className="form-input"
        value={value}
        placeholder={placeholder}
        list={list}
        autoFocus={autoFocus}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={e => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  value,
  onChange,
  placeholder,
  rows = 3
}: BaseProps & { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <textarea id={id} className="form-textarea" rows={rows} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </FieldShell>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  className,
  value,
  onChange,
  options
}: BaseProps & { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <select id={id} className="form-select" value={value} onChange={e => onChange(e.target.value as T)}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldShell>
  );
}

export function DateField({ label, hint, className, value, onChange }: BaseProps & { value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <input id={id} type="date" className="form-input" value={value} onChange={e => onChange(e.target.value)} />
    </FieldShell>
  );
}

/** Percentage input that keeps intermediate text (e.g. "12.") while typing. */
export function PercentField({
  label,
  hint,
  className,
  value,
  onChange,
  placeholder
}: BaseProps & { value: number | null; onChange: (v: number | null) => void; placeholder?: string }) {
  const id = useId();
  const [draft, setDraft] = useState<{ text: string; value: number | null } | null>(null);
  const text = draft && draft.value === value ? draft.text : value === null ? '' : String(value);
  const invalid = value !== null && (value < 0 || value > 100);
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <div className="input-suffix">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={`form-input ${invalid ? 'is-invalid' : ''}`}
          value={text}
          placeholder={placeholder}
          aria-invalid={invalid}
          onChange={e => {
            const raw = e.target.value.replace(',', '.');
            if (!/^\d*\.?\d*$/.test(raw)) return;
            const parsed = raw === '' || raw === '.' ? null : Number(raw);
            setDraft({ text: e.target.value, value: parsed });
            onChange(parsed);
          }}
          onBlur={() => setDraft(null)}
        />
        <span aria-hidden="true">%</span>
      </div>
    </FieldShell>
  );
}

export function CheckboxField({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="checkbox-label">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span>
        {label}
        {hint && <span className="checkbox-hint">{hint}</span>}
      </span>
    </label>
  );
}

export function Section({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="inspector-section">
      <div className="content-action-row">
        <h4 className="section-title">{title}</h4>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Destructive action with an inline confirmation that states the consequences. */
export function DeleteButton({ label, consequence, onConfirm }: { label: string; consequence?: string; onConfirm: () => void }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" className="btn-danger-ghost" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }
  return (
    <div className="confirm-box" role="alertdialog" aria-label={`Confirm: ${label}`}>
      <p>{consequence ?? 'This can be undone with ⌘Z.'}</p>
      <div className="confirm-actions">
        <button type="button" className="btn-ghost btn-sm" onClick={() => setConfirming(false)} autoFocus>
          Cancel
        </button>
        <button
          type="button"
          className="btn-danger btn-sm"
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

export function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span className="status-pill" style={{ color, borderColor: `${color}55`, background: `${color}12` }}>
      {label}
    </span>
  );
}
