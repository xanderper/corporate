'use client';

import type { ConnectionStyle, GridStyle } from '../../lib/types';
import { useActions, useEditor } from '../editor-context';
import { CheckboxField, Section } from './fields';

export function StylePanel() {
  const actions = useActions();
  const prefs = useEditor(s => s.doc.preferences);
  const expected = useEditor(s => s.doc.settings.expectedOwnershipTotal);
  const set = actions.setPreferences;

  return (
    <div className="style-panel">
      <div className="style-content">
        <Section title="Cards">
          <div className="form-group">
            <div className="label-with-value">
              <label className="form-label" htmlFor="card-width">Card width</label>
              <span className="value-tag">{prefs.cardWidth}px</span>
            </div>
            <input id="card-width" type="range" min="160" max="280" step="10" className="form-slider" value={prefs.cardWidth} onChange={e => set({ cardWidth: Number(e.target.value) })} />
          </div>
          <CheckboxField label="Licence summary on cards (activities view)" checked={prefs.showLicenceBadges} onChange={v => set({ showLicenceBadges: v })} />
          <CheckboxField label="Show arrangements in ownership view" hint="Services, financing, custody, personnel and partners." checked={prefs.showArrangements} onChange={v => set({ showArrangements: v })} />
        </Section>

        <Section title="Lines">
          <div className="style-chips-row" role="radiogroup" aria-label="Line routing">
            {(['elbow', 'bezier', 'straight'] as ConnectionStyle[]).map(style => (
              <button key={style} type="button" role="radio" aria-checked={prefs.connectionStyle === style} className={`style-chip ${prefs.connectionStyle === style ? 'active' : ''}`} onClick={() => set({ connectionStyle: style })}>
                {style === 'elbow' ? 'Orthogonal' : style === 'bezier' ? 'Curved' : 'Straight'}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Grid">
          <div className="style-chips-row" role="radiogroup" aria-label="Background grid">
            {(['dots', 'lines', 'blank'] as GridStyle[]).map(grid => (
              <button key={grid} type="button" role="radio" aria-checked={prefs.gridStyle === grid} className={`style-chip ${prefs.gridStyle === grid ? 'active' : ''}`} onClick={() => set({ gridStyle: grid })}>
                {grid === 'dots' ? 'Dots' : grid === 'lines' ? 'Lines' : 'None'}
              </button>
            ))}
          </div>
          <CheckboxField label="Snap to grid while dragging" checked={prefs.snapToGrid} onChange={v => set({ snapToGrid: v })} />
        </Section>

        <Section title="Validation">
          <div className="form-group">
            <label className="form-label" htmlFor="expected-total">Expected ownership total</label>
            <div className="input-suffix">
              <input
                id="expected-total"
                type="number"
                min={1}
                max={100}
                className="form-input"
                value={expected}
                onChange={e => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v) && v >= 1 && v <= 100) actions.setSettings({ expectedOwnershipTotal: v });
                }}
              />
              <span aria-hidden="true">%</span>
            </div>
            <p className="form-hint">Share percentages per company are checked against this total.</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
