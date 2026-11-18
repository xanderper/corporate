"use strict";
/**
 * @file persistence.ts
 * @description Browser persistence (localStorage, the application's existing storage)
 * with a versioned envelope, backward-compatible loading and optimistic concurrency:
 * a save is refused when another tab/session stored a newer revision in the meantime,
 * so newer edits are never silently overwritten.
 *
 * All functions take a `StorageLike` so they are testable without a browser.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORRUPT_BACKUP_KEY = void 0;
exports.readStoredMeta = readStoredMeta;
exports.loadDocument = loadDocument;
exports.saveDocument = saveDocument;
exports.loadViewport = loadViewport;
exports.saveViewport = saveViewport;
const types_1 = require("./types");
const constants_1 = require("./constants");
const migrate_1 = require("./migrate");
const ENVELOPE_FORMAT = 'virex-structure';
exports.CORRUPT_BACKUP_KEY = `${constants_1.STORAGE_KEY}_unreadable_backup`;
function readMeta(raw) {
    if (!(0, migrate_1.isRecord)(raw) || raw.format !== ENVELOPE_FORMAT)
        return null;
    return {
        revision: typeof raw.revision === 'number' ? raw.revision : 0,
        sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : '',
        savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : ''
    };
}
function readStoredMeta(storage) {
    const raw = storage.getItem(constants_1.STORAGE_KEY);
    if (!raw)
        return null;
    try {
        return readMeta(JSON.parse(raw));
    }
    catch {
        return null;
    }
}
function loadDocument(storage) {
    const current = storage.getItem(constants_1.STORAGE_KEY);
    if (current) {
        try {
            const envelope = JSON.parse(current);
            const meta = readMeta(envelope);
            if (!meta || !(0, migrate_1.isRecord)(envelope))
                throw new Error('Unrecognised storage format.');
            const doc = (0, migrate_1.parseStructureDocument)(envelope.document);
            const storedVersion = (0, migrate_1.isRecord)(envelope.document) && typeof envelope.document.schemaVersion === 'number' ? envelope.document.schemaVersion : types_1.CURRENT_SCHEMA_VERSION;
            return { status: 'loaded', doc, meta, migratedFrom: storedVersion < types_1.CURRENT_SCHEMA_VERSION ? storedVersion : null, legacyViewport: null };
        }
        catch (err) {
            // Keep the unreadable data so it is never lost by the next autosave.
            try {
                storage.setItem(exports.CORRUPT_BACKUP_KEY, current);
            }
            catch {
                /* backup is best effort */
            }
            return { status: 'error', message: err instanceof Error ? err.message : 'Stored structure could not be read.' };
        }
    }
    for (const key of constants_1.LEGACY_STORAGE_KEYS) {
        const legacy = storage.getItem(key);
        if (!legacy)
            continue;
        try {
            const raw = JSON.parse(legacy);
            const doc = (0, migrate_1.parseStructureDocument)(raw);
            const version = (0, migrate_1.isRecord)(raw) && typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;
            return {
                status: 'loaded',
                doc,
                meta: { revision: 0, sessionId: '', savedAt: '' },
                migratedFrom: version,
                legacyViewport: (0, migrate_1.extractLegacyViewport)(raw)
            };
        }
        catch {
            // Ignore unreadable legacy data; the legacy key itself is left untouched.
        }
    }
    return { status: 'empty' };
}
function saveDocument(storage, doc, baseRevision, sessionId, options = {}) {
    const stored = readStoredMeta(storage);
    if (!options.force && stored && stored.sessionId !== sessionId && stored.revision > baseRevision) {
        return { ok: false, reason: 'conflict', storedRevision: stored.revision, savedAt: stored.savedAt };
    }
    const revision = Math.max(stored?.revision ?? 0, baseRevision) + 1;
    const savedAt = (options.now ?? new Date()).toISOString();
    try {
        storage.setItem(constants_1.STORAGE_KEY, JSON.stringify({ format: ENVELOPE_FORMAT, schemaVersion: types_1.CURRENT_SCHEMA_VERSION, revision, savedAt, sessionId, document: doc }));
        return { ok: true, revision, savedAt };
    }
    catch (err) {
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
function loadViewport(storage) {
    try {
        const raw = JSON.parse(storage.getItem(constants_1.VIEWPORT_STORAGE_KEY) ?? 'null');
        if (!(0, migrate_1.isRecord)(raw))
            return null;
        const { zoom, panX, panY } = raw;
        if (typeof zoom !== 'number' || typeof panX !== 'number' || typeof panY !== 'number')
            return null;
        if (![zoom, panX, panY].every(Number.isFinite))
            return null;
        return { zoom, panX, panY };
    }
    catch {
        return null;
    }
}
function saveViewport(storage, view) {
    try {
        storage.setItem(constants_1.VIEWPORT_STORAGE_KEY, JSON.stringify(view));
    }
    catch {
        /* viewport persistence is best effort */
    }
}
