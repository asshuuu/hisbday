/**
 * useMediaStore — simple localStorage-only config store
 *
 * Media files (images, video, audio) are served from /public directly.
 * This store only holds TEXT config: labels, messages, questions, section track names.
 *
 * To add media:  drop files into /public and reference them by path e.g. "/herovideo.mp4"
 */
import { useState, useEffect } from 'react';

export const SECTIONS = [
  { id: 'home',      label: 'Hero',      icon: '🎬' },
  { id: 'our-story', label: 'Our Story', icon: '❤️' },
  { id: 'surprises', label: 'Surprises', icon: '🎁' },
  { id: 'birthday',  label: 'Birthday',  icon: '🎂' },
];

export const defaultQuestions = [
  { id: 'q1', question: 'Your Favourite Hero?',       answer: 'ramcharan' },
  { id: 'q2', question: 'Our first Movie?',    answer: 'tereishqmein' },
  { id: 'q3', question: 'Our First Hackathon?', answer: 'sankalp' },
  { id: 'q4', question: 'What do you call me as a nickname?',   answer: 'junghu' },
];

const defaultSectionTracks = Object.fromEntries(
  SECTIONS.map(s => [s.id, { url: '/song.mp3', name: 'Our Song 🎵' }])
);

export const defaultStore = {
  // ── Labels & text (admin-editable) ────────────────────
  scratchLabel:         'Our Special Surprise 💫',
  scratchRevealMessage: 'Nenu yeppudu neetho unnanu,nuvvu asshu tho happy ga undu.Eppati nunchi ninnu nuvvu thittukoku alane nuvvu puttadame sad adhi idhi anaku.sare na Mummy mata vinu Inkeppudu badha padaku nenu lenu nenu unnanu nanna.I Love You Sailuu Bangaram.Nenu yeppudu neetho unnanu,nuvvu asshu tho happy ga undu.Eppati nunchi ninnu nuvvu thittukoku alane nuvvu puttadame sad adhi idhi anaku.sare na Mummy mata vinu Inkeppudu badha padaku nenu lenu nenu unnanu nanna.I Love You Sailuu Bangaram.',
  birthdayLetter:       'My Dear Sailll, My Dudu My Bangaram,\n\nI love you sooo much.......infinity\n\nNenu ni birthday ni ee year special ga chesano ledho naku telidhu but chala try chesa best ivvadaniki.\n\nHappy Birthday King Dudu\n\nErojuki mathrame nuvvuu KING so be Happy\n\nBUBU RANI eroju ninnu kottaddhu thittadhu so jagratha ga unduu. ❤️',
  questions:            defaultQuestions,
  sectionTracks:        defaultSectionTracks,

  // ── Media paths (edit directly in code or via admin URL field) ─
  // Drop files in /public and set the path here, OR paste a URL in admin panel
  heroVideo:    'https://sqzpswpmkucpetunjpek.supabase.co/storage/v1/object/public/saill-media/herobg.mp4',
  heroFallback: '',
  scratchSrc:   '/scratch1.png',   // ← put path here e.g. '/scratch.jpg'
  scratchSrc2:  '/scratch2.png',   // ← put path here e.g. '/scratch2.jpg'

  // Our story timeline image paths — set to e.g. '/story/s1.jpg'
  timelineImages: {
    s1:'/convo.jpeg', s2:'/smiles.jpeg', s3:'/firstpic.jpeg', s4:'/endcon.jpeg', s5:'/beaut.jpeg',
    s6:'/adv.jpeg', s7:'/silly.jpeg', s8:'/highlow.jpeg', s9:'/together.jpeg', s10:'/today.jpeg',
  },
};

const LS_KEY = 'saill_config';

export function readStore() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...defaultStore };
    const p = JSON.parse(raw);
    return {
      ...defaultStore,
      ...p,
      questions:      defaultQuestions.map((dq, i) => p.questions?.[i] ? { ...dq, ...p.questions[i] } : dq),
      sectionTracks:  { ...defaultSectionTracks, ...(p.sectionTracks || {}) },
      timelineImages: { ...defaultStore.timelineImages, ...(p.timelineImages || {}) },
    };
  } catch { return { ...defaultStore }; }
}

export function writeStore(data) {
  // Never store large blobs — only text/paths/URLs
  const safe = JSON.parse(JSON.stringify(data, (k, v) => {
    if (typeof v === 'string' && v.startsWith('data:')) return ''; // strip base64
    if (typeof v === 'string' && v.startsWith('blob:'))  return ''; // strip blob
    return v;
  }));
  try { localStorage.setItem(LS_KEY, JSON.stringify(safe)); } catch (e) { console.warn(e); }
  window.dispatchEvent(new CustomEvent('saill_store_updated', { detail: data }));
}

export function deriveCode(questions) {
  return questions.map(q => (q.answer || '').trim().charAt(0).toLowerCase()).join('');
}

// Simple sync hook — no async IDB needed
export function useMediaStore() {
  const [store, setStore] = useState(readStore);
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

// readStoreAsync is now just sync (no IDB to wait for)
export async function readStoreAsync() { return readStore(); }
export async function restoreBlobs(obj) { return obj; }
