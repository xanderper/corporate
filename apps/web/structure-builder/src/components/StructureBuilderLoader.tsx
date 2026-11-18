'use client';

import dynamic from 'next/dynamic';

/**
 * The editor's document lives in the browser (localStorage) and the canvas measures
 * the DOM, so it is rendered on the client only. Server-rendering it would show a
 * default structure that is then replaced after hydration.
 */
const StructureBuilder = dynamic(() => import('./StructureBuilder'), {
  ssr: false,
  loading: () => <EditorSkeleton />
});

export function StructureBuilderLoader() {
  return <StructureBuilder />;
}

function EditorSkeleton() {
  return (
    <div className="app-container" aria-busy="true">
      <header className="aurel-topbar">
        <div className="topbar-left">
          <div className="brand-mark">
            <span className="brand-name">VIREX</span>
          </div>
        </div>
      </header>
      <main className="app-body">
        <div className="canvas-viewport-container grid-dots editor-loading" role="status">
          Loading structure…
        </div>
        <aside className="aurel-sidebar" aria-hidden="true" />
      </main>
    </div>
  );
}
