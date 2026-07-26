import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A gentle piano-like ambient tone generated via Web Audio API
function createAmbientMusic(audioCtx) {
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 2);
  masterGain.connect(audioCtx.destination);

  // Soft reverb-like delay
  const delay = audioCtx.createDelay(2);
  delay.delayTime.value = 0.4;
  const delayGain = audioCtx.createGain();
  delayGain.gain.value = 0.25;
  delay.connect(delayGain);
  delayGain.connect(delay);
  delayGain.connect(masterGain);

  // Piano-ish notes — a gentle progression
  const notes = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.0,  // G4
    440.0,  // A4
    493.88, // B4
    523.25, // C5
    440.0,
    392.0,
    349.23,
    329.63,
    293.66,
    261.63,
  ];

  let time = audioCtx.currentTime + 0.5;
  let noteIndex = 0;

  const scheduleNote = () => {
    if (audioCtx.state === 'closed') return;

    const freq = notes[noteIndex % notes.length];
    noteIndex++;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Also add a harmonic for richness
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);
    gain2.gain.setValueAtTime(0.03, time);
    osc2.connect(gain2);
    gain2.connect(masterGain);
    gain2.connect(delay);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.08, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

    osc.connect(gain);
    gain.connect(masterGain);
    gain.connect(delay);

    osc.start(time);
    osc.stop(time + 1.5);
    osc2.start(time);
    osc2.stop(time + 1.2);

    time += 0.8;
    setTimeout(scheduleNote, 600);
  };

  scheduleNote();
  return masterGain;
}

export default function MusicController({ active }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const startedRef = useRef(false);

  const startMusic = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    masterGainRef.current = createAmbientMusic(ctx);
    setPlaying(true);
  };

  const togglePlay = () => {
    if (!startedRef.current) {
      startMusic();
      return;
    }
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (playing) {
      ctx.suspend();
      setPlaying(false);
    } else {
      ctx.resume();
      setPlaying(true);
    }
  };

  useEffect(() => {
    if (active && !startedRef.current) {
      startMusic();
    }
  }, [active]);

  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        volume * 0.15,
        audioCtxRef.current.currentTime + 0.3
      );
    }
  }, [volume]);

  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="music-controller"
      style={{ zIndex: 500 }}
    >
      {/* Play/Pause button */}
      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: playing ? '#E50914' : 'rgba(255,255,255,0.1)',
          border: 'none',
          cursor: 'pointer',
          color: 'white',
          fontSize: '0.75rem',
        }}
      >
        {playing ? '⏸' : '▶'}
      </motion.button>

      {/* Song info */}
      <div style={{ overflow: 'hidden', maxWidth: expanded ? '120px' : '0px', transition: 'max-width 0.3s ease' }}>
        <div style={{ whiteSpace: 'nowrap', paddingRight: '4px' }}>
          <p style={{ color: 'white', fontSize: '0.7rem', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Our Story
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontFamily: 'Inter, sans-serif' }}>
            {playing ? '♪ Playing...' : 'Paused'}
          </p>
        </div>
      </div>

      {/* Animated bars */}
      {playing && (
        <div className="flex items-end gap-0.5" style={{ height: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              style={{ width: '3px', borderRadius: '2px', background: '#E50914' }}
              animate={{ height: ['4px', `${8 + i * 3}px`, '4px'] }}
              transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 }}
            />
          ))}
        </div>
      )}

      {/* Note icon when paused */}
      {!playing && (
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>♪</span>
      )}

      {/* Volume toggle */}
      <button
        onClick={() => setShowVolume(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}
      >
        🔊
      </button>

      {/* Volume slider */}
      <AnimatePresence>
        {showVolume && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '80px' }}
            exit={{ opacity: 0, width: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{
                width: '80px',
                accentColor: '#E50914',
                cursor: 'pointer',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}
      >
        {expanded ? '◀' : '▶'}
      </button>
    </motion.div>
  );
}
