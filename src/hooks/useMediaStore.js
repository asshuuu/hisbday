/**
 * useMediaStore
 * ─────────────────────────────────────────────────────────
 * Storage strategy:
 *
 *  IF Supabase is configured:
 *    • Files (images/video/audio) → Supabase Storage bucket
 *    • Config (text, labels, etc.) → Supabase DB table `saill_config`
 *    • localStorage used only as a fast read-cache
 *
 *  ELSE (no Supabase):
 *    • Files → IndexedDB (browser-local, does not sync across devices)
 *    • Config → localStorage
 *
 * Table schema (saill_config):
 *   id    TEXT PRIMARY KEY   -- e.g. "heroVideo", "scratchLabel"
 *   value TEXT               -- JSON-encoded value
 *
 * Storage bucket: "saill-media" (public, no auth required for GET)
 */

import { useState, useEffect } from 'react';
import { supabase, BUCKET, TABLE, hasSupabase } from '../lib/supabase';

/* ─── Section list ──────────────────────────────────────── */
export const SECTIONS = [
  { id: 'home',      label: 'Hero',      icon: '🎬' },
  { id: 'our-story', label: 'Our Story', icon: '❤️' },
  { id: 'gallery',   label: 'Gallery',   icon: '🖼️' },
  { id: 'surprises', label: 'Surprises', icon: '🎁' },
  { id: 'birthday',  label: 'Birthday',  icon: '🎂' },
];

/* ─── Defaults ──────────────────────────────────────────── */
export const defaultQuestions = [
  { id: 'q1', question: 'What is your favourite flower?',       answer: '' },
  { id: 'q2', question: 'Which city holds our best memory?',    answer: '' },
  { id: 'q3', question: 'What was the first movie we watched?', answer: '' },
  { id: 'q4', question: 'What do you call me as a nickname?',   answer: '' },
];

const defaultTimelineImages = {
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
  scratchSrc2:          null,
  scratchLabel:         'Our Special Surprise 💫',
  scratchRevealMessage: 'Every moment with you is a gift I never want to stop unwrapping. You make every single day brighter just by being you. Today and always — I am so grateful you exist. 🌸',
  surpriseBg:           null,
  birthdayLetter:       '',
  questions:            defaultQuestions,
  galleryPhotos:        [],
  sectionTracks:        defaultSectionTracks,
  timelineImages:       defaultTimelineImages,
};

/* ─── localStorage cache key ────────────────────────────── */
const LS_KEY = 'saill_media_store';

/* ═════════════════════════════════════════════════════════
   SUPABASE BACKEND
═════════════════════════════════════════════════════════ */

/**
 * Upload a file (dataURL or File) to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadToSupabase(dataUrlOrFile, path) {
  if (!supabase) throw new Error('Supabase not configured');

  let file;
  if (typeof dataUrlOrFile === 'string' && dataUrlOrFile.startsWith('data:')) {
    // Convert base64 dataURL → Blob
    const [header, b64] = dataUrlOrFile.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(b64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    file = new Blob([arr], { type: mime });
  } else {
    file = dataUrlOrFile;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return urlData.publicUrl;
}

/** Read entire config from Supabase DB */
async function readSupabaseStore() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(TABLE).select('id, value');
    if (error) return null;
    const store = { ...defaultStore };
    for (const row of data || []) {
      try { store[row.id] = JSON.parse(row.value); } catch { store[row.id] = row.value; }
    }
    // Ensure nested defaults
    store.questions     = defaultQuestions.map((dq, i) =>
      store.questions?.[i] ? { ...dq, ...store.questions[i] } : dq
    );
    store.sectionTracks  = { ...defaultSectionTracks,  ...(store.sectionTracks  || {}) };
    store.timelineImages = { ...defaultTimelineImages, ...(store.timelineImages || {}) };
    return store;
  } catch { return null; }
}

/** Write a single key to Supabase DB */
async function writeSupabaseKey(key, value) {
  if (!supabase) return;
  await supabase.from(TABLE).upsert({ id: key, value: JSON.stringify(value) });
}

/* ═════════════════════════════════════════════════════════
   LOCAL FALLBACK (IndexedDB + localStorage)
═════════════════════════════════════════════════════════ */

const IDB_NAME  = 'saill_blobs';
const IDB_STORE = 'blobs';
const BLOB_PREFIX = '__idb__:';
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess  = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror    = (e) => reject(e.target.error);
  });
}
async function idbPut(key, value) {
  const db  = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).put(value, key);
    req.onsuccess = () => res(); req.onerror = (e) => rej(e.target.error);
  });
}
async function idbGet(key) {
  const db  = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = (e) => res(e.target.result ?? null);
    req.onerror   = (e) => rej(e.target.error);
  });
}

function isBlob(v)   { return typeof v === 'string' && v.startsWith('data:'); }
function idbKey(p)   { return `${LS_KEY}::${p}`; }
function idbRef(p)   { return `${BLOB_PREFIX}${idbKey(p)}`; }
function isIdbRef(v) { return typeof v === 'string' && v.startsWith(BLOB_PREFIX); }
function getIdbKey(r){ return r.slice(BLOB_PREFIX.length); }

async function separateBlobs(obj, path = '') {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return Promise.all(obj.map((v,i) => separateBlobs(v, `${path}[${i}]`)));
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (isBlob(v)) { await idbPut(idbKey(p), v); result[k] = idbRef(p); }
    else if (typeof v === 'object' && v !== null) result[k] = await separateBlobs(v, p);
    else result[k] = v;
  }
  return result;
}

export async function restoreBlobs(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return Promise.all(obj.map(v => restoreBlobs(v)));
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isIdbRef(v))                              result[k] = (await idbGet(getIdbKey(v))) ?? '';
    else if (typeof v === 'object' && v !== null) result[k] = await restoreBlobs(v);
    else                                          result[k] = v;
  }
  return result;
}

/* ═════════════════════════════════════════════════════════
   PUBLIC API
═════════════════════════════════════════════════════════ */

/** Sync read from localStorage cache */
export function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaultStore };
    const parsed = JSON.parse(raw);
    const questions     = defaultQuestions.map((dq, i) =>
      parsed.questions?.[i] ? { ...dq, ...parsed.questions[i] } : dq
    );
    const sectionTracks  = { ...defaultSectionTracks,  ...(parsed.sectionTracks  || {}) };
    const timelineImages = { ...defaultTimelineImages, ...(parsed.timelineImages || {}) };
    return { ...defaultStore, ...parsed, questions, sectionTracks, timelineImages };
  } catch { return { ...defaultStore }; }
}

/** Async full read — uses Supabase if available, else IDB */
export async function readStoreAsync() {
  if (hasSupabase()) {
    const remote = await readSupabaseStore();
    if (remote) {
      // Cache remotely-fetched store to localStorage for fast next load
      try { localStorage.setItem(LS_KEY, JSON.stringify(remote)); } catch {}
      return remote;
    }
  }
  // Fallback: resolve IDB blob refs
  return restoreBlobs(readStore());
}

/** Write — uses Supabase if available, else IDB+localStorage */
export async function writeStore(data) {
  // Always dispatch event immediately with full in-memory data
  window.dispatchEvent(new CustomEvent('saill_store_updated', { detail: data }));

  if (hasSupabase()) {
    // Write each top-level key to Supabase
    const writes = Object.entries(data).map(([key, value]) =>
      writeSupabaseKey(key, value)
    );
    await Promise.all(writes).catch(e => console.warn('Supabase write error:', e));
    // Update local cache too
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
  } else {
    // Local fallback
    try {
      const lsData = await separateBlobs(data);
      localStorage.setItem(LS_KEY, JSON.stringify(lsData));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  }
}

/** Derive scratch unlock code */
export function deriveCode(questions) {
  return questions.map(q => (q.answer || '').trim().charAt(0).toLowerCase()).join('');
}

/** Reactive hook */
export function useMediaStore() {
  const [store, setStore] = useState(readStore);

  useEffect(() => {
    let cancelled = false;
    readStoreAsync().then(full => { if (!cancelled) setStore(full); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const h = (e) => setStore({ ...e.detail });
    window.addEventListener('saill_store_updated', h);
    return () => window.removeEventListener('saill_store_updated', h);
  }, []);

  const update = (patch) => {
    const next = { ...store, ...patch };
    writeStore(next);
    setStore(next);
  };

  return [store, update];
}
