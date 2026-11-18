'use client';

import { useState } from 'react';
import type { Diagnostic, DiagnosticSeverity } from '../../lib/types';
import { SEVERITY_META, countBySeverity } from '../../lib/validation';
import { useActions, useUiActions } from '../editor-context';

const ORDER: DiagnosticSeverity[] = ['error', 'warning', 'regulatory', 'info'];

export function ChecksPanel({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const actions = useActions();
  const uiActions = useUiActions();
  const [hidden, setHidden] = useState<Set<DiagnosticSeverity>>(() => new Set<DiagnosticSeverity>(['info']));
  const counts = countBySeverity(diagnostics);
  const shown = diagnostics.filter(d => !hidden.has(d.severity));

  const inspect = (d: Diagnostic) => {
    if (!d.target) return;
    actions.selectRef(d.target);
    uiActions.patch({ sidebarTab: 'inspector', entitySection: 'overview' });
    if (d.target.type === 'entity') uiActions.focusEntities([d.target.id]);
  };

  return (
    <div className="checks-panel">
      <div className="panel-header">
        <div className="checks-summary-row" role="group" aria-label="Show severities">
          {ORDER.map(sev => (
            <button
              key={sev}
              type="button"
              aria-pressed={!hidden.has(sev)}
              className={`summary-pill ${counts[sev] ? SEVERITY_META[sev].badgeClass : 'badge-neutral'} ${hidden.has(sev) ? 'is-off' : ''}`}
              onClick={() => setHidden(h => {
                const next = new Set(h);
                if (next.has(sev)) next.delete(sev);
                else next.add(sev);
                return next;
              })}
            >
              <span aria-hidden="true">{SEVERITY_META[sev].icon}</span> {counts[sev]} {SEVERITY_META[sev].label}
            </button>
          ))}
        </div>
      </div>

      <div className="checks-content">
        {shown.length === 0 ? (
          <div className="clean-structure-box">
            <span className="clean-icon" aria-hidden="true">✓</span>
            <h4 className="clean-title">{diagnostics.length === 0 ? 'No issues found' : 'No issues in the selected categories'}</h4>
          </div>
        ) : (
          <ul className="diagnostics-list">
            {shown.map(d => (
              <li key={d.id}>
                <button type="button" className={`diagnostic-card category-${d.severity}`} onClick={() => inspect(d)}>
                  <span className={`category-tag ${SEVERITY_META[d.severity].badgeClass}`}>
                    <span aria-hidden="true">{SEVERITY_META[d.severity].icon}</span> {SEVERITY_META[d.severity].label}
                  </span>
                  <span className="diag-card-title">{d.title}</span>
                  <span className="diag-card-message">{d.message}</span>
                  {d.remediation && <span className="remediation-text">→ {d.remediation}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="legal-disclaimer-box">
          <span className="disclaimer-title">Modelling checks, not legal advice</span>
          <p className="disclaimer-text">
            These checks test the consistency of the model and the licence data entered. They do not establish whether an
            activity is authorised or whether the structure is legally compliant.
          </p>
        </div>
      </div>
    </div>
  );
}
