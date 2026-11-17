/**
 * @file persistence.ts
 * @description Browser persistence (localStorage, the application's existing storage)
 * with a versioned envelope, backward-compatible loading and optimistic concurrency:
 * a save is refused when another tab/session stored a newer revision in the meantime,
 * so newer edits are never silently overwritten.
 *
 * All functions take a `StorageLike` so they are testable without a browser.
 */

import type { StructureDocument } from './types';
import { CURRENT_SCHEMA_VERSION } from './types';
import { LEGACY_STORAGE_KEYS, STORAGE_KEY, VIEWPORT_STORAGE_KEY } from './constants';
import { extractLegacyViewport, isRecord, parseStructureDocument } from './migrate';
import type { ViewTransform } from './layout';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const ENVELOPE_FORMAT = 'virex-structure';
export const CORRUPT_BACKUP_KEY = `${STORAGE_KEY}_unreadable_backup`;

interface StoredMeta {
  revision: number;
  sessionId: string;
  savedAt: string;
}

export type LoadResult =
  | { status: 'empty' }
  | { status: 'loaded'; doc: StructureDocument; meta: StoredMeta; migratedFrom: number | null; legacyViewport: ViewTransform | null }
  | { status: 'error'; message: string };

export type SaveResult =
  | { ok: true; revision: number; savedAt: string }
  | { ok: false; reason: 'conflict'; storedRevision: number; savedAt: string }
  | { ok: false; reason: 'quota' | 'error'; message: string };

function readMeta(raw: unknown): StoredMeta | null {
  if (!isRecord(raw) || raw.format !== ENVELOPE_FORMAT) return null;
  return {
    revision: typeof raw.revision === 'number' ? raw.revision : 0,
    sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : '',
    savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : ''
  };
}

export function readStoredMeta(storage: StorageLike): StoredMeta | null {
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return readMeta(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function loadDocument(storage: StorageLike): LoadResult {
  const current = storage.getItem(STORAGE_KEY);
  if (current) {
    try {
      const envelope: unknown = JSON.parse(current);
      const meta = readMeta(envelope);
      if (!meta || !isRecord(envelope)) throw new Error('Unrecognised storage format.');
      const doc = parseStructureDocument(envelope.document);
      const storedVersion = isRecord(envelope.document) && typeof envelope.document.schemaVersion === 'number' ? envelope.document.schemaVersion : CURRENT_SCHEMA_VERSION;
      return { status: 'loaded', doc, meta, migratedFrom: storedVersion < CURRENT_SCHEMA_VERSION ? storedVersion : null, legacyViewport: null };
    } catch (err) {
      // Keep the unreadable data so it is never lost by the next autosave.
      try {
        storage.setItem(CORRUPT_BACKUP_KEY, current);
      } catch {
        /* backup is best effort */
      }
      return { status: 'error', message: err instanceof Error ? err.message : 'Stored structure could not be read.' };
    }
  }

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = storage.getItem(key);
    if (!legacy) continue;
    try {
      const raw: unknown = JSON.parse(legacy);
      const doc = parseStructureDocument(raw);
      const version = isRecord(raw) && typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;
      return {
        status: 'loaded',
        doc,
        meta: { revision: 0, sessionId: '', savedAt: '' },
        migratedFrom: version,
        legacyViewport: extractLegacyViewport(raw)
      };
    } catch {
      // Ignore unreadable legacy data; the legacy key itself is left untouched.
    }
  }
  return { status: 'empty' };
}

export function saveDocument(
  storage: StorageLike,
  doc: StructureDocument,
  baseRevision: number,
  sessionId: string,
  options: { force?: boolean; now?: Date } = {}
): SaveResult {
  const stored = readStoredMeta(storage);
  if (!options.force && stored && stored.sessionId !== sessionId && stored.revision > baseRevision) {
    return { ok: false, reason: 'conflict', storedRevision: stored.revision, savedAt: stored.savedAt };
  }
  const revision = Math.max(stored?.revision ?? 0, baseRevision) + 1;
  const savedAt = (options.now ?? new Date()).toISOString();
  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ format: ENVELOPE_FORMAT, schemaVersion: CURRENT_SCHEMA_VERSION, revision, savedAt, sessionId, document: doc })
    );
    return { ok: true, revision, savedAt };
  } catch (err) {
    const quota = err instanceof Error && (err.name === 'QuotaExceededError' || /quota/i.test(err.message));
    return {
      ok: false,
      reason: quota ? 'quota' : 'error',
      message: quota ? 'Browser storage is full. Export the structure as JSON to keep a copy.' : 'The structure could not be saved.'
    };
  }
}

// ---------------------------------------------------------------------------
// Viewport (saved view preference, separate from the business document)
// ---------------------------------------------------------------------------

export function loadViewport(storage: StorageLike): ViewTransform | null {
  try {
    const raw: unknown = JSON.parse(storage.getItem(VIEWPORT_STORAGE_KEY) ?? 'null');
    if (!isRecord(raw)) return null;
    const { zoom, panX, panY } = raw;
    if (typeof zoom !== 'number' || typeof panX !== 'number' || typeof panY !== 'number') return null;
    if (![zoom, panX, panY].every(Number.isFinite)) return null;
    return { zoom, panX, panY };
  } catch {
    return null;
  }
}

export function saveViewport(storage: StorageLike, view: ViewTransform): void {
  try {
    storage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(view));
  } catch {
    /* viewport persistence is best effort */
  }
}
