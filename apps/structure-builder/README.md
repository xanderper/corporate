# Virex Structure Builder

Editor for corporate structures: legal entities, typed relationships (shares, depositary
receipts, control, services, personnel, custody, financing, partners), reusable business
activities, products, and licences.

```bash
pnpm dev        # http://localhost:3000
pnpm test       # unit tests (tsc → node --test, no extra dependencies)
pnpm typecheck
pnpm lint
pnpm build
```

## Architecture

- `src/app/page.tsx` — Server Component shell. The editor is a client island loaded with
  `ssr: false` (`components/StructureBuilderLoader.tsx`) because its data lives in the
  browser and the canvas measures the DOM.
- `src/lib/` — framework-free domain code, covered by `tests/`:
  - `types.ts` schema v4 domain model (discriminated `Relationship` union, activity and
    product assignments, licences)
  - `model.ts` pure, immutable document operations; `migrate.ts` runtime parsing and
    v1–v3 → v4 migration; `validation.ts` checks; `layout.ts` auto layout and fitting
  - `editor-store.ts` external store with structural-sharing undo/redo and coalescing;
    `editor-actions.ts` user-level commands (one undo step each)
  - `persistence.ts` localStorage envelope with revision-based conflict detection
- `src/components/` — React layer. Components subscribe to slices of the store with
  `useSyncExternalStore`, so dragging one card re-renders that card and the edges only.
  Pan/zoom is applied directly to the stage transform and stored separately from the
  document (it is not undoable and does not trigger validation or autosave).

## Persistence

Structures are stored in this browser's `localStorage` (key `virex_structure_builder_v4`),
as before; there is no server, database or authentication in this app. Data saved by
earlier versions is migrated on load and the old keys are left untouched. Use
Export → JSON backup to move a structure between browsers.

Validation results are modelling checks and do not establish legal compliance.
