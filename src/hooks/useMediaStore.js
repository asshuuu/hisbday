/**
 * useMediaStore — IDB + localStorage storage
 * No Supabase calls here. Supabase is used only in AdminPanel
 * for file uploads when the bucket is confirmed working.
 * Small files (images) → base64 in IndexedDB
 * Large files (video/audio) → must use URL (paste in admin panel)
 */
import { useState, useEffect } from 'react';

export const SECTIONS = [
  { id: 'home',      label: 'Hero',      icon: '🎬' },
  { id: 'our-story', label: 'Our Story', icon: '❤️' },
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
  s1:'',s2:'',s3:'',s4:'',s5:'',
  s6:'',s7:'',s8:'',s9:'',s10:'',
};

const defaultSectionTracks = Object.fromEntries(
  SECTIONS.map(s => [s.id, { url: '', name: '' }])
);

export const defaultStore = {
  heroVideo:            '',
  heroFallback:         '',
  scratchSrc:           '',
  scratchSrc2:          '',
  scratchLabel:         'Our Special Surprise 💫',
  scratchRevealMessage: 'Every moment with you is a gift I never want to stop unwrapping. You make every single day brighter just by being you. Today and always — I am so grateful you exist. 🌸',
  surpriseBg:           '',
  birthdayLetter:       '',
  questions:            defaultQuestions,
  sectionTracks:        defaultSectionTracks,
  timelineImages:       defaultTimelineImages,
};

/* ─── IndexedDB helpers ──────────────────────────────── */
const IDB_NAME    = 'saill_blobs';
const IDB_STORE   = 'blobs';
const LS_KEY      = 'saill_media_store';
const BLOB_PREFIX = '__idb__:';
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((res, rej) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess  = e => { _db = e.target.result; res(_db); };
    req.onerror    = e => rej(e.target.error);
  });
}
async function idbPut(key, val) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(val, key).onsuccess = res;
    tx.onerror = e => rej(e.target.error);
  });
}
async function idbGet(key) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(key);
    req.onsuccess = e => res(e.target.result ?? null);
    req.onerror   = e => rej(e.target.error);
  });
}

function isBase64(v) { return typeof v === 'string' && v.startsWith('data:'); }
function idbRef(k)   { return `${BLOB_PREFIX}${k}`; }
function isRef(v)    { return typeof v === 'string' && v.startsWith(BLOB_PREFIX); }
function refKey(v)   { return v.slice(BLOB_PREFIX.length); }

/** Walk an object, store base64 blobs in IDB, replace with refs */
async function separateBlobs(obj, path = '') {
  if (typeof obj !== 'object' || !obj) return obj;
  if (Array.isArray(obj)) return Promise.all(obj.map((v,i) => separateBlobs(v, `${path}[${i}]`)));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (isBase64(v)) { await idbPut(p, v); out[k] = idbRef(p); }
    else if (typeof v === 'object' && v) out[k] = await separateBlobs(v, p);
    else out[k] = v;
  }
  return out;
}

/** Walk an object, replace IDB refs with real blobs */
export async function restoreBlobs(obj) {
  if (typeof obj !== 'object' || !obj) return obj;
  if (Array.isArray(obj)) return Promise.all(obj.map(v => restoreBlobs(v)));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (isRef(v))                              out[k] = (await idbGet(refKey(v))) ?? '';
    else if (typeof v === 'object' && v)       out[k] = await restoreBlobs(v);
    else                                       out[k] = v;
  }
  return out;
}

/* ─── Public API ─────────────────────────────────────── */

export function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaultStore };
    const p = JSON.parse(raw);
    return {
      ...defaultStore,
      ...p,
      questions:     defaultQuestions.map((dq,i) => p.questions?.[i] ? { ...dq, ...p.questions[i] } : dq),
      sectionTracks: { ...defaultSectionTracks,  ...(p.sectionTracks  || {}) },
      timelineImages:{ ...defaultTimelineImages, ...(p.timelineImages || {}) },
    };
  } catch { return { ...defaultStore }; }
}

/** Walk an object, strip any blob: URLs (they're dead after page reload) */
function stripBlobUrls(obj) {
  if (typeof obj !== 'object' || !obj) return obj;
  if (Array.isArray(obj)) return obj.map(v => stripBlobUrls(v));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && v.startsWith('blob:')) out[k] = '';
    else if (typeof v === 'object' && v) out[k] = stripBlobUrls(v);
    else out[k] = v;
  }
  return out;
}

export async function readStoreAsync() {
  const raw = readStore();
  const cleaned = stripBlobUrls(raw);
  return restoreBlobs(cleaned);
}

export async function writeStore(data) {
  window.dispatchEvent(new CustomEvent('saill_store_updated', { detail: data }));
  try {
    const lsData = await separateBlobs(data);
    localStorage.setItem(LS_KEY, JSON.stringify(lsData));
  } catch (e) { console.warn('writeStore failed:', e); }
}

export function deriveCode(questions) {
  return questions.map(q => (q.answer||'').trim().charAt(0).toLowerCase()).join('');
}

export function useMediaStore() {
  const [store, setStore] = useState(readStore);
  useEffect(() => {
    let c = false;
    readStoreAsync().then(full => { if (!c) setStore(full); });
    return () => { c = true; };
  }, []);
  useEffect(() => {
    const h = e => setStore({ ...e.detail });
    window.addEventListener('saill_store_updated', h);
    return () => window.removeEventListener('saill_store_updated', h);
  }, []);
  const update = (patch) => {
    const next = { ...store, ...patch };
    writeStore(next); setStore(next);
  };
  return [store, update];
}
