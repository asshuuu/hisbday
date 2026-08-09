/**
 * useMediaStore
 * ─────────────────────────────────────────────────────────
 * Strategy:
 *   • Small text/config  → localStorage  (fast, synchronous)
 *   • Binary blobs       → IndexedDB     (no size limit)
 *
 * A value is treated as a "blob" when it starts with "data:"
 * (i.e. a FileReader base64 dataURL).  External URLs (http/https)
 * are stored as plain strings in localStorage like everything else.
 *
 * Public API (all unchanged for callers):
 *   readStore()          → returns store snapshot (sync, blobs as IDB keys)
 *   writeStore(data)     → persists + dispatches 'saill_store_updated'
 *   readStoreAsync()     → resolves with full store including blob URLs
 *   BLOB_PREFIX          → internal prefix used to mark IDB references
 */

import { useState, useEffect } from 'react';

/* ─── constants ─────────────────────────────────────────── */
const LS_KEY      = 'saill_media_store';
const IDB_NAME    = 'saill_blobs';
const IDB_STORE   = 'blobs';
const BLOB_PREFIX = '__idb__:';   // marks a value as "look up this key in IDB"

export const SECTIONS = [
  { id: 'home',      label: 'Hero',      icon: '🎬' },
  { id: 'our-story', label: 'Our Story', icon: '❤️' },
  { id: 'gallery',   label: 'Gallery',   icon: '🖼️' },
  { id: 'surprises', label: 'Surprises', icon: '🎁' },
  { id: 'birthday',  label: 'Birthday',  icon: '🎂' },
];

export const defaultQuestions = [
  { id: 'q1', question: 'What is your favourite flower?',       answer: '' },
  { id: 'q2', question: 'Which city holds our best memory?',    answer: '' },
  { id: 'q3', question: 'What was the first movie we watched?', answer: '' },
  { id: 'q4', question: 'What do you call me as a nickname?',   answer: '' },
];

const defaultTimelineImages = {
  c1:'',c2:'',c3:'',c4:'',
  s1:'',s2:'',s3:'',s4:'',s5:'',
  s6:'',s7:'',s8:'',s9:'',s10:'',
};

const defaultSectionTracks = Object.fromEntries(
  SECTIONS.map(s => [s.id, { url: '', name: '' }])
);

export const defaultStore = {
  heroVideo:            null,
  heroFallback:         null,
  scratchSrc:           null,
  scratchSrc2:          null,    // second surprise image shown after reveal
  scratchLabel:         'Our Special Surprise 💫',
  scratchRevealMessage: 'Every moment with you is a gift I never want to stop unwrapping. You make every single day brighter just by being you. Today and always — I am so grateful you exist. 🌸',
  surpriseBg:           null,
  birthdayLetter:       '',
  questions:            defaultQuestions,
  galleryPhotos:        [],
  sectionTracks:        defaultSectionTracks,
  timelineImages:       defaultTimelineImages,
};

/* ─── IndexedDB helpers ─────────────────────────────────── */
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror    = (e) => reject(e.target.error);
  });
}

async function idbPut(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror   = (e) => reject(e.target.error);
  });
}

async function idbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = (e) => resolve(e.target.result ?? null);
    req.onerror   = (e) => reject(e.target.error);
  });
}

async function idbDelete(key) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(key);
    tx.oncomplete = resolve;
  });
}

/* ─── Blob detection ────────────────────────────────────── */
function isBlob(v) {
  return typeof v === 'string' && v.startsWith('data:');
}
function idbKey(path) {
  return `${LS_KEY}::${path}`;
}
function idbRef(path) {
  return `${BLOB_PREFIX}${idbKey(path)}`;
}
function isIdbRef(v) {
  return typeof v === 'string' && v.startsWith(BLOB_PREFIX);
}
function getIdbKey(ref) {
  return ref.slice(BLOB_PREFIX.length);
}

/* ─── Deep-walk: separate blobs from config ─────────────── */
async function separateBlobs(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) {
    return Promise.all(obj.map((v, i) => separateBlobs(v, `${path}[${i}]`)));
  }
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (isBlob(v)) {
      const key = idbKey(p);
      await idbPut(key, v);
      result[k] = idbRef(p);
    } else if (typeof v === 'object' && v !== null) {
      result[k] = await separateBlobs(v, p);
    } else {
      result[k] = v;
    }
  }
  return result;
}

/* ─── Deep-walk: restore blobs from IDB ─────────────────── */
export async function restoreBlobs(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(v => restoreBlobs(v)));
  }
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isIdbRef(v)) {
      result[k] = (await idbGet(getIdbKey(v))) ?? '';
    } else if (typeof v === 'object' && v !== null) {
      result[k] = await restoreBlobs(v);
    } else {
      result[k] = v;
    }
  }
  return result;
}

/* ─── Public: read from localStorage (sync, IDB refs kept) ─ */
export function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return structuredClone(defaultStore);
    const parsed = JSON.parse(raw);
    const questions     = defaultQuestions.map((dq, i) =>
      parsed.questions?.[i] ? { ...dq, ...parsed.questions[i] } : dq
    );
    const sectionTracks  = { ...defaultSectionTracks,  ...(parsed.sectionTracks  || {}) };
    const timelineImages = { ...defaultTimelineImages, ...(parsed.timelineImages || {}) };
    return { ...defaultStore, ...parsed, questions, sectionTracks, timelineImages };
  } catch {
    return structuredClone(defaultStore);
  }
}

/* ─── Public: read fully (async, blobs resolved from IDB) ── */
export async function readStoreAsync() {
  const base = readStore();
  try {
    return await restoreBlobs(base);
  } catch {
    return base;
  }
}

/* ─── Public: write (blobs → IDB, config → localStorage) ─── */
export async function writeStore(data) {
  try {
    // Store blobs in IDB, keep lightweight refs in localStorage
    const lsData = await separateBlobs(data);
    localStorage.setItem(LS_KEY, JSON.stringify(lsData));
    // Dispatch the FULL resolved data (with real dataURLs) for instant reactivity
    // 'data' already has the real dataURLs since it comes from in-memory state
    window.dispatchEvent(new CustomEvent('saill_store_updated', { detail: data }));
  } catch (e) {
    console.warn('writeStore failed:', e);
    try {
      // Last resort: strip blobs and save config only
      const safe = JSON.parse(JSON.stringify(data, (k, v) =>
        typeof v === 'string' && v.startsWith('data:') ? '[blob]' : v
      ));
      localStorage.setItem(LS_KEY, JSON.stringify(safe));
      window.dispatchEvent(new CustomEvent('saill_store_updated', { detail: data }));
    } catch {}
  }
}

/* ─── Public: derive scratch unlock code ───────────────────  */
export function deriveCode(questions) {
  return questions
    .map(q => (q.answer || '').trim().charAt(0).toLowerCase())
    .join('');
}

/* ─── Hook: reactive store with full blob resolution ──────── */
export function useMediaStore() {
  const [store, setStore] = useState(readStore);

  // On mount, resolve any IDB refs in the initial state
  useEffect(() => {
    let cancelled = false;
    readStoreAsync().then(full => {
      if (!cancelled) setStore(full);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = (e) => setStore({ ...e.detail });
    window.addEventListener('saill_store_updated', handler);
    return () => window.removeEventListener('saill_store_updated', handler);
  }, []);

  const update = (patch) => {
    const next = { ...store, ...patch };
    writeStore(next);   // async — updates IDB + LS
    setStore(next);     // immediate in-memory update
  };

  return [store, update];
}
