'use client';

import { countBySeverity, getDiagnostics, sameDiagnostics } from '../../lib/validation';
import { useEditor, useUi, useUiActions } from '../editor-context';
import type { SidebarTab } from '../ui-state';
import { Inspector } from './Inspector';
import { BrowsePanel } from './BrowsePanel';
import { ChecksPanel } from './ChecksPanel';
import { StylePanel } from './StylePanel';

const TABS: { key: SidebarTab; label: string }[] = [
  { key: 'inspector', label: 'Details' },
  { key: 'browse', label: 'Browse' },
  { key: 'checks', label: 'Checks' },
  { key: 'style', label: 'View' }
];

export function Sidebar() {
  const tab = useUi(s => s.sidebarTab);
  const open = useUi(s => s.sidebarOpen);
  const uiActions = useUiActions();
  const diagnostics = useEditor(s => getDiagnostics(s.doc), sameDiagnostics);
  const counts = countBySeverity(diagnostics);
  const badge = counts.error || counts.warning + counts.regulatory;

  return (
    <aside className={`aurel-sidebar ${open ? 'is-open' : ''}`} aria-label="Details panel">
      <nav className="sidebar-tab-nav" role="tablist" aria-label="Panel sections">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => uiActions.patch({ sidebarTab: t.key })}
          >
            <span className="tab-label">{t.label}</span>
            {t.key === 'checks' && badge > 0 && (
              <span className={`tab-badge ${counts.error ? 'badge-error' : 'badge-warning'}`} aria-label={`${badge} issues`}>{badge}</span>
            )}
          </button>
        ))}
        <button type="button" className="sidebar-close" aria-label="Close panel" onClick={uiActions.closeSidebar}>×</button>
      </nav>
      <div className="sidebar-panel-container" role="tabpanel">
        {tab === 'inspector' && <Inspector />}
        {tab === 'browse' && <BrowsePanel />}
        {tab === 'checks' && <ChecksPanel diagnostics={diagnostics} />}
        {tab === 'style' && <StylePanel />}
      </div>
    </aside>
  );
}
