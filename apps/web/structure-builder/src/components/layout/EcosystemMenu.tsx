'use client';

import { useState, useRef, useEffect } from 'react';

interface EcosystemApp {
  name: string;
  role: string;
  url: string;
  active?: boolean;
}

const APPS: EcosystemApp[] = [
  {
    name: 'Virex Holding Group',
    role: 'Long-term ownership, STAK governance & group strategy',
    url: 'http://localhost:3200',
  },
  {
    name: 'Virex Capital',
    role: 'Private investment & operating group',
    url: 'http://localhost:3202',
  },
  {
    name: 'Virex Portal',
    role: 'Corporate access, documents & entity management',
    url: 'http://localhost:3203',
  },
  {
    name: 'Structure Builder',
    role: 'Interactive architecture, activities & licence modelling',
    url: 'http://localhost:3204',
    active: true,
  },
];

export function EcosystemMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="ecosystem-container" ref={ref}>
      <button
        type="button"
        className={`ecosystem-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Virex Corporate Ecosystem"
      >
        <span className="ecosystem-pill">Ecosystem</span>
        <svg className="ecosystem-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="ecosystem-popover" role="menu">
          <div className="ecosystem-popover-header">
            <span className="ecosystem-brand-title">VIREX CORPORATE ECOSYSTEM</span>
            <span className="ecosystem-brand-desc">Connected Architecture & Operating Platforms</span>
          </div>
          <div className="ecosystem-app-list">
            {APPS.map(app => (
              <a
                key={app.name}
                href={app.url}
                className={`ecosystem-app-card ${app.active ? 'is-active' : ''}`}
                target={app.active ? undefined : '_blank'}
                rel="noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <div className="ecosystem-app-details">
                  <div className="ecosystem-app-title-row">
                    <span className="ecosystem-app-name">{app.name}</span>
                    {app.active ? (
                      <span className="ecosystem-status-badge">Current App</span>
                    ) : (
                      <span className="ecosystem-link-arrow">↗</span>
                    )}
                  </div>
                  <span className="ecosystem-app-role">{app.role}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
