/**
 * MusicController — simplified reliable version
 * Uses plain HTMLAudioElement only. No Web Audio routing for real files.
 * Web Audio only used for ambient piano fallback.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SECTIONS } from '../hooks/useMediaStore';
import useStore from '../hooks/useStore';

const VOL = 0.8;

/* ── Ambient piano (Web Audio, no external files) ─────── */
function startPiano() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return () => {};
  const ctx   = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0.08;
  master.connect(ctx.destination);

  const notes = [261.63,329.63,392,523.25,440,349.23,293.66,261.63];
  let t = ctx.currentTime + 0.1, idx = 0, running = true;

  function tick() {
    if (!running) return;
    const f = notes[idx++ % notes.length];
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + 1.5);
    t += 0.75;
    setTimeout(tick, 650);
  }
  tick();
  return () => { running = false; setTimeout(() => ctx.close(), 2000); };
}

export default function MusicController({ active: enabled, activeSection }) {
  const store = useStore();

  const [playing,   setPlaying]   = useState(false);
  const [volume,    setVolume]    = useState(VOL);
  const [showVol,   setShowVol]   = useState(false);
  const [expanded,  setExpanded]  = useState(true);
  const [trackName, setTrackName] = useState('');
  const [status,    setStatus]    = useState('');  // debug

  const audioRef    = useRef(null);   // current HTMLAudioElement
  const pianoStop   = useRef(null);   // piano cleanup fn
  const startedRef  = useRef(false);  // music has been started at least once
  const currentUrl  = useRef('');     // URL of currently playing track
  const volumeRef   = useRef(VOL);

  useEffect(() => { volumeRef.current = volume; }, [volume]);

  /* ── Core: switch to a new track URL ───────────────── */
  const switchTrack = (url, name) => {
    // Stop current audio
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (pianoStop.current) {
      pianoStop.current();
      pianoStop.current = null;
    }

    currentUrl.current = url || '';

    if (url && url.trim() && !url.startsWith('__idb__:')) {
      // Real file
      const el = new Audio();
      el.src    = url;
      el.loop   = true;
      el.volume = volumeRef.current;
      audioRef.current = el;

      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setStatus('▶ playing');
            setTrackName(name || '♪ Playing');
            setPlaying(true);
          })
          .catch(err => {
            setStatus('blocked: ' + err.message);
            // Autoplay blocked — will resume on next user interaction
            const resume = () => {
              el.play().then(() => { setStatus('▶ resumed'); setPlaying(true); }).catch(() => {});
              document.removeEventListener('click', resume);
            };
            document.addEventListener('click', resume, { once: true });
            setTrackName(name || '♪ Ready');
          });
      }
    } else if (!url || url.trim() === '') {
      // No track set — start piano
      pianoStop.current = startPiano();
      setTrackName('Ambient Piano');
      setStatus('▶ piano');
      setPlaying(true);
    } else {
      // IDB ref not yet resolved
      setStatus('waiting IDB…');
      setTrackName('Loading…');
    }
  };

  /* ── Start music when "Begin Journey" is clicked ──── */
  useEffect(() => {
    if (!enabled || startedRef.current) return;
    // Wait until store has resolved (not just defaultStore)
    // If sectionTracks has an unresolved IDB ref, wait for next store update
    const t = store.sectionTracks?.[activeSection || 'home'];
    const url = t?.url || '';
    if (url.startsWith('__idb__:')) return; // not resolved yet, wait
    startedRef.current = true;
    switchTrack(url, t?.name || '');
  }, [enabled, store.sectionTracks]); // re-check when store updates

  /* ── Section changes ────────────────────────────────── */
  const lastSection = useRef(null);
  useEffect(() => {
    if (!startedRef.current) return;
    if (activeSection === lastSection.current) return;
    lastSection.current = activeSection;
    const t = store.sectionTracks?.[activeSection];
    const url = t?.url || '';
    if (url !== currentUrl.current) {
      switchTrack(url, t?.name || '');
    }
  }, [activeSection]);

  /* ── Store resolves → restart if current URL changes ─ */
  useEffect(() => {
    if (!startedRef.current) return;
    const t   = store.sectionTracks?.[activeSection];
    const url = t?.url || '';
    if (!url || url === currentUrl.current || url.startsWith('__idb__:')) return;
    // URL changed (IDB resolved) — restart with real URL
    switchTrack(url, t?.name || '');
  }, [store.sectionTracks]);

  /* ── Volume changes ─────────────────────────────────── */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  /* ── Play / Pause toggle ────────────────────────────── */
  const togglePlay = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      const t = store.sectionTracks?.[activeSection || 'home'];
      switchTrack(t?.url || '', t?.name || '');
      return;
    }
    if (playing) {
      if (audioRef.current) audioRef.current.pause();
      setPlaying(false);
    } else {
      if (audioRef.current) audioRef.current.play().catch(() => {});
      else {
        const t = store.sectionTracks?.[activeSection];
        switchTrack(t?.url || '', t?.name || '');
      }
      setPlaying(true);
    }
  };

  const sectionLabel = SECTIONS.find(s => s.id === activeSection)?.label || '';

  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 500,
        background: 'rgba(16,16,16,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(20px)',
        borderRadius: '40px', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Play/Pause */}
      <motion.button onClick={togglePlay}
        whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
        style={{
          width:'32px', height:'32px', borderRadius:'50%', border:'none',
          background: playing ? 'var(--accent,#E50914)' : 'rgba(255,255,255,0.1)',
          color:'#fff', fontSize:'0.75rem', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
        }}
      >
        {playing ? '⏸' : '▶'}
      </motion.button>

      {/* Track info */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity:0, width:0 }} animate={{ opacity:1, width:'auto' }}
            exit={{ opacity:0, width:0 }} transition={{ duration:0.22 }}
            style={{ overflow:'hidden', minWidth:0 }}
          >
            <div style={{ whiteSpace:'nowrap' }}>
              <p style={{ color:'#fff', fontSize:'0.68rem', fontFamily:'Inter, sans-serif', fontWeight:600, lineHeight:1.3 }}>
                {trackName || (playing ? 'Playing…' : 'Paused')}
              </p>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.58rem', fontFamily:'Inter, sans-serif' }}>
                {sectionLabel} {status ? `· ${status}` : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EQ bars */}
      {playing ? (
        <div style={{ display:'flex', alignItems:'flex-end', gap:'2px', height:'16px', flexShrink:0 }}>
          {[1,2,3,4].map(i => (
            <motion.div key={i}
              style={{ width:'3px', borderRadius:'2px', background:'var(--accent,#E50914)' }}
              animate={{ height:['3px',`${6+i*3}px`,'3px'] }}
              transition={{ duration:0.4+i*0.1, repeat:Infinity, ease:'easeInOut', delay:i*0.1 }}
            />
          ))}
        </div>
      ) : (
        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.85rem' }}>♪</span>
      )}

      {/* Volume */}
      <button onClick={() => setShowVol(v => !v)}
        style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.4)', fontSize:'0.8rem', flexShrink:0 }}
      >
        {volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊'}
      </button>

      <AnimatePresence>
        {showVol && (
          <motion.div
            initial={{ opacity:0, width:0 }} animate={{ opacity:1, width:'72px' }}
            exit={{ opacity:0, width:0 }} style={{ overflow:'hidden', flexShrink:0 }}
          >
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ width:'72px', accentColor:'var(--accent,#E50914)', cursor:'pointer' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse */}
      <button onClick={() => setExpanded(v => !v)}
        style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:'0.65rem', flexShrink:0 }}
      >
        {expanded ? '◀' : '▶'}
      </button>
    </motion.div>
  );
}
