'use client';

import type { ViewMode } from '../../lib/types';
import { countBySeverity, getDiagnostics, sameDiagnostics } from '../../lib/validation';
import { VIEW_MODES } from '../../lib/view-filters';
import { useEditor, useEditorContext, useUi } from '../editor-context';
import { QuickCreate } from './QuickCreate';
import { EcosystemMenu } from './EcosystemMenu';

export function Topbar() {
  const { actions, uiActions } = useEditorContext();
  const title = useEditor(s => s.doc.chartTitle);
  const subtitle = useEditor(s => s.doc.chartSubtitle);
  const mode = useEditor(s => s.doc.preferences.mode);
  const direction = useEditor(s => s.doc.preferences.layoutDirection);
  const canUndo = useEditor(s => s.past.length > 0);
  const canRedo = useEditor(s => s.future.length > 0);
  const diagnostics = useEditor(s => getDiagnostics(s.doc), sameDiagnostics);
  const counts = countBySeverity(diagnostics);
  const attention = counts.warning + counts.regulatory;

  return (
    <header className="aurel-topbar">
      <div className="topbar-left">
        <div className="brand-mark">
          <a href="http://localhost:3200" className="brand-lockup-link" title="Virex Holding Group">
            <span className="brand-dots" aria-hidden="true">
              <span className="dot" /><span className="dot" /><span className="dot" /><span className="dot" />
            </span>
            <div className="brand-text">
              <span className="brand-name">VIREX</span>
              <span className="brand-sub">STRUCTURE BUILDER</span>
            </div>
          </a>
        </div>
        <EcosystemMenu />
        <div className="title-block">
          <input className="title-input" aria-label="Structure title" value={title} onChange={e => actions.setTitle(e.target.value)} placeholder="Structure title" />
          <input className="subtitle-input" aria-label="Structure subtitle" value={subtitle} onChange={e => actions.setSubtitle(e.target.value)} placeholder="Subtitle, date or version" />
        </div>
      </div>

      <div className="topbar-center">
        <div className="pill-group" role="radiogroup" aria-label="View">
          {(Object.keys(VIEW_MODES) as ViewMode[]).map((m, i) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              className={`pill-btn ${mode === m ? 'active' : ''}`}
              title={`${VIEW_MODES[m].desc} (${i + 1})`}
              onClick={() => actions.setPreferences({ mode: m })}
            >
              {VIEW_MODES[m].label}
            </button>
          ))}
        </div>
        <div className="button-group">
          <button type="button" className="btn-ghost" onClick={() => actions.autoLayout()} title="Arrange automatically (L). Locked entities stay in place; undo with ⌘Z.">
            Auto layout
          </button>
          <button
            type="button"
            className="btn-ghost icon-btn"
            onClick={() => actions.autoLayout(direction === 'TB' ? 'LR' : 'TB')}
            aria-label={`Layout direction: ${direction === 'TB' ? 'top to bottom' : 'left to right'}. Switch and re-arrange.`}
            title="Switch layout direction and re-arrange"
          >
            {direction === 'TB' ? '↓' : '→'}
          </button>
        </div>
        <QuickCreate />
      </div>

      <div className="topbar-right">
        <button
          type="button"
          className={`diagnostics-pill ${counts.error ? 'has-errors' : attention ? 'has-warnings' : 'is-clean'}`}
          onClick={() => uiActions.showSidebar('checks')}
          title="Open checks"
        >
          <span className="diag-icon" aria-hidden="true">{counts.error ? '⚠' : attention ? '!' : '✓'}</span>
          <span className="diag-text">
            {counts.error ? `${counts.error} error${counts.error > 1 ? 's' : ''}` : attention ? `${attention} to review` : 'No issues'}
          </span>
        </button>

        <SaveStatus />

        <div className="button-group">
          <button type="button" className="btn-icon-subtle" disabled={!canUndo} onClick={actions.undo} aria-label="Undo" title="Undo (⌘Z)">↩</button>
          <button type="button" className="btn-icon-subtle" disabled={!canRedo} onClick={actions.redo} aria-label="Redo" title="Redo (⌘⇧Z)">↪</button>
        </div>
        <div className="divider-v" />
        <button type="button" className="btn-ghost hide-narrow" onClick={() => uiActions.openModal('templates')}>Templates</button>
        <button type="button" className="btn-ghost hide-narrow" onClick={() => uiActions.openModal('import')}>Import</button>
        <button type="button" className="btn-secondary" onClick={() => uiActions.openModal('export')}>Export</button>
        <button type="button" className="btn-kbd hide-narrow" onClick={() => uiActions.openModal('command')} aria-label="Command palette" title="Command palette (⌘K)">⌘K</button>
        <button type="button" className="btn-icon-subtle hide-narrow" onClick={() => uiActions.openModal('shortcuts')} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">?</button>
        <button type="button" className="btn-ghost sidebar-toggle" onClick={() => uiActions.showSidebar('inspector')} aria-label="Open details panel">Details</button>
      </div>
    </header>
  );
}

function SaveStatus() {
  const { persistence } = useEditorContext();
  const save = useUi(s => s.save);
  const label = { saved: 'Saved', unsaved: 'Unsaved', saving: 'Saving…', error: 'Not saved', conflict: 'Changed elsewhere' }[save.status];
  const time = save.savedAt ? new Date(save.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`autosave-indicator status-${save.status}`} role="status" aria-live="polite">
      <span className={`status-dot ${save.status}`} aria-hidden="true" />
      <span className="status-label" title={save.message ?? (time ? `Saved in this browser at ${time}` : 'Saved in this browser')}>{label}</span>
      {save.status === 'error' && <button type="button" className="btn-ghost btn-sm" onClick={persistence.retry}>Retry</button>}
      {save.status === 'conflict' && (
        <span className="conflict-actions">
          <button type="button" className="btn-ghost btn-sm" onClick={persistence.loadLatest} title="Discard local changes and load the version saved in the other tab">Load theirs</button>
          <button type="button" className="btn-ghost btn-sm" onClick={persistence.keepMine} title="Overwrite the other tab’s version with this one">Keep mine</button>
        </span>
      )}
    </div>
  );
}
