/**
 * ScratchSection
 * ─────────────────────────────────────────────────────────
 * Flow:
 *   1. User sees 4 questions (set by admin)
 *   2. First letter of each correct answer builds the code
 *   3. Once all 4 are answered → single scratch card unlocks
 *   4. Scratch ≥55% → full reveal with fade animation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { deriveCode } from '../hooks/useMediaStore';
import useStore from '../hooks/useStore';

const SCRATCH_RADIUS   = 30;
const REVEAL_THRESHOLD = 55;

/* ═══════════════════════════════════════════════════════════
   QUESTION GATE
═══════════════════════════════════════════════════════════ */
function QuestionGate({ questions, onUnlocked }) {
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [current, setCurrent] = useState(0);
  const [shake,   setShake]   = useState(false);
  const [hint,    setHint]    = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Delay focus slightly so it doesn't auto-scroll on page load
    const t = setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);
    return () => clearTimeout(t);
  }, [current]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const typed = answers[current].trim();
    if (!typed) return;

    const correctFirst = (questions[current]?.answer || '').trim().charAt(0).toLowerCase();
    const typedFirst   = typed.charAt(0).toLowerCase();

    if (typedFirst === correctFirst) {
      if (current < 3) {
        setCurrent(c => c + 1);
        setHint('');
      } else {
        const code = [...answers.slice(0, 3), typed]
          .map(a => a.trim().charAt(0).toLowerCase())
          .join('');
        onUnlocked(code);
      }
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setHint('✗ Not quite — try again!');
      setAnswers(prev => { const a = [...prev]; a[current] = ''; return a; });
    }
  };

  const collectedLetters = answers
    .slice(0, current)
    .map(a => a.trim().charAt(0).toUpperCase());

  return (
    <motion.div
      key="gate"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '520px', margin: '0 auto' }}
    >
      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '32px' }}>
        {[0,1,2,3].map(i => (
          <motion.div key={i}
            animate={{
              scale:      i === current ? 1.25 : 1,
              background: i < current  ? '#E50914'
                        : i === current ? '#C9A84C'
                        : 'rgba(255,255,255,0.1)',
            }}
            transition={{ duration: 0.3 }}
            style={{ width: '12px', height: '12px', borderRadius: '50%' }}
          />
        ))}
      </div>

      {/* Collected letter tiles */}
      {collectedLetters.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}
        >
          {collectedLetters.map((l, i) => (
            <motion.div key={i}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #E50914, #C9A84C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1.15rem', fontWeight: 700,
                fontFamily: 'Playfair Display, serif',
                boxShadow: '0 4px 18px rgba(229,9,20,0.45)',
              }}
            >{l}</motion.div>
          ))}
          {Array.from({ length: 4 - collectedLetters.length }).map((_, i) => (
            <div key={`e${i}`} style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.12)',
            }} />
          ))}
        </motion.div>
      )}

      {/* Question card */}
      <motion.div key={current}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '18px', padding: '32px 28px',
        }}
      >
        <p style={{
          color: '#E50914', fontSize: '0.68rem', letterSpacing: '0.25em',
          textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
          fontWeight: 600, marginBottom: '12px',
        }}>
          Question {current + 1} of 4
        </p>

        <h3 style={{
          color: '#fff', fontSize: 'clamp(1rem, 3vw, 1.22rem)',
          fontFamily: 'Playfair Display, serif', fontWeight: 600,
          lineHeight: 1.45, marginBottom: '24px',
        }}>
          {questions[current]?.question || '— Question not set in admin panel yet —'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <motion.div
            animate={shake ? { x: [-8,8,-6,6,-4,4,0] } : { x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ flex: 1 }}
          >
            <input
              ref={inputRef}
              type="text"
              value={answers[current]}
              onChange={e => {
                const a = [...answers]; a[current] = e.target.value;
                setAnswers(a); setHint('');
              }}
              placeholder="Type your answer…"
              autoComplete="off"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${shake ? '#E50914' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '10px', padding: '12px 16px',
                color: '#fff', fontSize: '0.95rem',
                fontFamily: 'Inter, sans-serif', outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = '#C9A84C')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </motion.div>
          <button type="submit" style={{
            background: '#E50914', border: 'none', borderRadius: '10px',
            padding: '0 22px', color: '#fff', fontSize: '0.85rem',
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {current < 3 ? 'Next →' : 'Unlock ✨'}
          </button>
        </form>

        {hint && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ color: '#E50914', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', marginTop: '10px' }}
          >{hint}</motion.p>
        )}

        <p style={{
          color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem',
          fontFamily: 'Inter, sans-serif', marginTop: '14px', lineHeight: 1.6,
        }}>
          💡 Only the first letter of each answer counts
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SINGLE SCRATCH CARD
═══════════════════════════════════════════════════════════ */
function ScratchCard({ src, label, onRevealed }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [revealed,   setRevealed]   = useState(false);
  const [scratching, setScratching] = useState(false);
  const [pct,        setPct]        = useState(0);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#232323'); grad.addColorStop(0.4, '#383838');
    grad.addColorStop(0.7, '#2a2a2a'); grad.addColorStop(1, '#191919');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 10) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
    for (let x = -H; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x+H,H); ctx.stroke(); }

    const bw = 200, bh = 44, bx = W/2 - bw/2, by = H/2 - bh/2;
    ctx.fillStyle = 'rgba(229,9,20,0.9)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 22); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '600 13px Inter, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('✦  SCRATCH TO REVEAL  ✦', W/2, H/2);
    ctx.font = '26px serif';
    ctx.fillText('🎁', 34, 34); ctx.fillText('✨', W-34, 34);
    ctx.fillText('❤️', 34, H-34); ctx.fillText('🎉', W-34, H-34);
  }, []);

  const measureCleared = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return 0;
    const data = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    let t = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 128) t++;
    return Math.round((t / (canvas.width * canvas.height)) * 100);
  }, []);

  const triggerReveal = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let alpha = 1;
    const fade = () => {
      alpha -= 0.05;
      if (alpha <= 0) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        setRevealed(true);
        onRevealed?.();   // ← notify parent
        return;
      }
      ctx.globalAlpha = alpha; ctx.fillStyle = '#232323';
      ctx.fillRect(0,0,canvas.width,canvas.height); ctx.globalAlpha = 1;
      requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }, [onRevealed]);

  const scratch = useCallback((x, y) => {
    const canvas = canvasRef.current; if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    const cleared = measureCleared(); setPct(cleared);
    if (cleared >= REVEAL_THRESHOLD) triggerReveal();
  }, [revealed, measureCleared, triggerReveal]);

  const relXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = canvasRef.current.width / rect.width, sy = canvasRef.current.height / rect.height;
    const pt = e.touches ? e.touches[0] : e;
    return { x: (pt.clientX - rect.left)*sx, y: (pt.clientY - rect.top)*sy };
  };

  const onDown = (e) => { e.preventDefault(); isDrawing.current=true; setScratching(true); const {x,y}=relXY(e); scratch(x,y); };
  const onMove = (e) => { e.preventDefault(); if(!isDrawing.current) return; const {x,y}=relXY(e); scratch(x,y); };
  const onUp   = ()  => { isDrawing.current=false; setScratching(false); };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = canvas.offsetWidth || 480; canvas.height = canvas.offsetHeight || 360;
    initCanvas();
  }, [initCanvas]);

  const reset = () => { setRevealed(false); setPct(0); onRevealed?.(false); setTimeout(initCanvas, 60); };

  return (
    <motion.div key="card"
      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.6 }}
      style={{
        maxWidth: '520px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden',
        background: '#181818', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        cursor: revealed ? 'default' : scratching ? 'crosshair' : 'pointer',
        userSelect: 'none', WebkitUserSelect: 'none',
      }}
    >
      {/* Photo layer */}
      <div style={{ width:'100%', paddingBottom:'75%', position:'relative',
        background: src ? 'transparent' : 'linear-gradient(135deg,rgba(229,9,20,0.1),rgba(201,168,76,0.08))'
      }}>
        {src
          ? <img src={src} alt={label} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          : <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'10px' }}>
              <span style={{ fontSize:'3rem' }}>📷</span>
              <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'0.8rem', fontFamily:'Inter, sans-serif' }}>Add photo in Admin Panel</p>
            </div>
        }
        {/* Canvas */}
        <canvas ref={canvasRef}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', display: revealed ? 'none' : 'block', touchAction:'none' }}
        />
        <AnimatePresence>
          {revealed && (
            <motion.div initial={{ opacity:0, scale:0.6, y:-10 }} animate={{ opacity:1, scale:1, y:0 }}
              style={{ position:'absolute', top:'14px', right:'14px',
                background:'linear-gradient(135deg,#E50914,#C9A84C)', color:'#fff',
                borderRadius:'20px', padding:'5px 14px', fontSize:'0.72rem',
                fontFamily:'Inter, sans-serif', fontWeight:600, letterSpacing:'0.08em',
                boxShadow:'0 4px 16px rgba(229,9,20,0.5)',
              }}
            >✨ Revealed!</motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      {!revealed && pct > 0 && (
        <div style={{ height:'3px', background:'rgba(255,255,255,0.07)' }}>
          <motion.div style={{ height:'100%', background:'linear-gradient(to right,#E50914,#C9A84C)' }}
            animate={{ width:`${pct}%` }} transition={{ duration:0.08 }} />
        </div>
      )}

      {/* Label + reset */}
      <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.88rem', fontFamily:'Inter, sans-serif', fontWeight:500 }}>{label}</p>
        {revealed && (
          <button onClick={reset} style={{ background:'none', border:'1px solid rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.45)', borderRadius:'6px', padding:'4px 12px', fontSize:'0.7rem', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
            ↺ Reset
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING HEARTS  — burst on reveal
═══════════════════════════════════════════════════════════ */
function HeartBurst() {
  const hearts = Array.from({ length: 24 }, (_, i) => ({
    id:       i,
    angle:    (i / 24) * 360,
    distance: 80 + Math.random() * 120,
    size:     0.9 + Math.random() * 1.2,
    delay:    Math.random() * 0.3,
    emoji:    ['❤️','💖','💗','💓','✨','🌸'][Math.floor(Math.random() * 6)],
  }));

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 600, overflow: 'hidden' }}>
      {/* Central burst */}
      {hearts.map(h => {
        const rad   = (h.angle * Math.PI) / 180;
        const tx    = Math.cos(rad) * h.distance;
        const ty    = Math.sin(rad) * h.distance;
        return (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0, x: '-50%', y: '-50%', left: '50%', top: '45%' }}
            animate={{ opacity: 0, scale: h.size, x: `calc(-50% + ${tx}px)`, y: `calc(-50% + ${ty}px)` }}
            transition={{ duration: 1.2, delay: h.delay, ease: 'easeOut' }}
            style={{ position: 'absolute', fontSize: `${h.size * 1.4}rem`, lineHeight: 1 }}
          >
            {h.emoji}
          </motion.div>
        );
      })}

      {/* Rising hearts from bottom */}
      {Array.from({ length: 16 }, (_, i) => (
        <motion.div
          key={`rise-${i}`}
          initial={{ opacity: 0, y: '100vh', x: `${5 + i * 6}%` }}
          animate={{ opacity: [0, 1, 1, 0], y: '-20vh' }}
          transition={{ duration: 2.5 + Math.random() * 2, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
          style={{ position: 'absolute', bottom: 0, fontSize: `${1 + Math.random()}rem`, lineHeight: 1 }}
        >
          {['❤️','💖','✨','🌸','💫'][i % 5]}
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   REVEAL CELEBRATION  — title + message card
═══════════════════════════════════════════════════════════ */
function RevealCelebration({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
      style={{ maxWidth: '520px', margin: '32px auto 0', textAlign: 'center' }}
    >
      {/* Happy Birthday title */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 200 }}
        style={{ marginBottom: '20px' }}
      >
        {/* Glowing hearts row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
          {['❤️','💖','❤️'].map((em, i) => (
            <motion.span
              key={i}
              style={{ fontSize: '1.6rem', lineHeight: 1 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
            >{em}</motion.span>
          ))}
        </div>

        <h2
          className="font-display"
          style={{
            fontSize: 'clamp(1.6rem, 6vw, 2.8rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #ffffff 0%, #E50914 45%, #C9A84C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Happy Birthday<br />Sailu Nanna ✨
        </h2>
      </motion.div>

      {/* Message card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(229,9,20,0.2)',
          borderRadius: '20px',
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle red corner glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(to right, transparent, #E50914, transparent)',
        }} />

        {/* Open-quote */}
        <p style={{
          color: 'rgba(229,9,20,0.3)',
          fontSize: '4rem',
          fontFamily: 'Playfair Display, serif',
          lineHeight: 0.6,
          marginBottom: '8px',
          textAlign: 'left',
        }}>"</p>

        <p
          className="font-elegant"
          style={{
            color: 'rgba(255,255,255,0.82)',
            fontSize: 'clamp(1rem, 2.8vw, 1.12rem)',
            fontStyle: 'italic',
            lineHeight: 2,
            whiteSpace: 'pre-line',
            textAlign: 'center',
          }}
        >
          {message || 'Wishing you all the happiness in the world today and every day. You deserve every beautiful thing life has to offer. 🌸'}
        </p>

        <p style={{
          color: 'rgba(229,9,20,0.3)',
          fontSize: '4rem',
          fontFamily: 'Playfair Display, serif',
          lineHeight: 0.6,
          marginTop: '8px',
          textAlign: 'right',
        }}>"</p>

        {/* Signature */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', marginTop: '16px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(229,9,20,0.2)' }} />
          <span style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.78rem',
            fontFamily: 'Playfair Display, serif',
            fontStyle: 'italic',
          }}>with love ❤️</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(229,9,20,0.2)' }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   UNLOCKED BANNER  (shown between gate and card)
═══════════════════════════════════════════════════════════ */
function UnlockedBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, ease: 'backOut' }}
      style={{ textAlign: 'center', marginBottom: '36px' }}
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{ fontSize: '3rem', marginBottom: '12px', display: 'inline-block' }}
      >🎉</motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          color: '#fff', fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 600,
          marginBottom: '8px',
        }}
      >
        You unlocked the surprise! ✨
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif' }}
      >
        Now scratch the card below to reveal your gift 👇
      </motion.p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION HEADER
═══════════════════════════════════════════════════════════ */
function SectionHeader({ inView }) {
  return (
    <div className="section-header">
      <motion.span className="chapter-tag"
        initial={{ opacity:0, y:10 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.5 }}
      >Birthday Surprises</motion.span>

      <motion.h2 className="section-title font-display" style={{ color:'#fff' }}
        initial={{ opacity:0, y:20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration:0.7, delay:0.1 }}
      >Scratch & Discover</motion.h2>

      <div className="title-divider" />

      <motion.span className="subtitle"
        initial={{ opacity:0 }} animate={inView ? { opacity:1 } : {}} transition={{ duration:0.7, delay:0.2 }}
      >
        Answer 4 questions to unlock your surprise ✨
      </motion.span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════ */
export default function ScratchSection() {
  const store       = useStore();
  const [phase,        setPhase]        = useState('gate');
  const [cardRevealed, setCardRevealed] = useState(false);
  const [showBurst,    setShowBurst]    = useState(false);
  const [titleRef,     titleInView]     = useInView({ threshold: 0.3, triggerOnce: true });

  // Live-sync with admin panel changes


  const handleUnlocked = () => {
    setPhase('unlocked');
    setTimeout(() => setPhase('scratch'), 2800);
  };

  // Called by ScratchCard when reveal completes (true) or reset (false)
  const handleCardRevealed = (val = true) => {
    setCardRevealed(val);
    if (val) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 3000); // burst disappears after 3s
    }
  };

  return (
    <section id="surprises" style={{
      position: 'relative',
      padding: 'var(--section-py) var(--section-px)',
      background: 'radial-gradient(ellipse at 60% 30%, rgba(229,9,20,0.06) 0%, transparent 60%), #0B0B0B',
      overflow: 'hidden',
    }}>
      {/* Heart burst — renders fixed over whole page */}
      <AnimatePresence>{showBurst && <HeartBurst key="burst" />}</AnimatePresence>
      {/* Decorative orb */}
      <div style={{
        position:'absolute', top:'10%', right:'-10%',
        width:'500px', height:'500px', borderRadius:'50%',
        background:'radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 70%)',
        filter:'blur(60px)', pointerEvents:'none',
      }} />

      <div style={{ maxWidth:'var(--container-max)', margin:'0 auto', position:'relative', zIndex:1 }}>
        <div ref={titleRef}>
          <SectionHeader inView={titleInView} />
        </div>

        {/* Step indicator — wraps on mobile */}
        <motion.div
          initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          style={{
            display:'flex',
            flexWrap:'wrap',
            justifyContent:'center',
            alignItems:'center',
            gap:'6px',
            marginBottom:'40px',
            padding:'0 8px',
          }}
        >
          {[
            { label:'Answer Questions', icon:'🧠', done: phase !== 'gate' },
            { label:'Unlock',           icon:'🔓', done: phase === 'scratch' },
            { label:'Scratch & Reveal', icon:'🎁', done: false },
          ].map((step, i, arr) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <div style={{
                display:'flex', alignItems:'center', gap:'5px',
                padding:'5px 10px', borderRadius:'20px',
                background: step.done ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${step.done ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                <span style={{ fontSize:'0.8rem', lineHeight:1 }}>{step.icon}</span>
                <span style={{
                  color: step.done ? '#E50914' : 'rgba(255,255,255,0.38)',
                  fontSize:'clamp(0.58rem, 2vw, 0.7rem)',
                  fontFamily:'Inter, sans-serif',
                  whiteSpace:'nowrap',
                }}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <span style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.7rem' }}>→</span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Phase transitions */}
        <AnimatePresence mode="wait">
          {phase === 'gate' && (
            <QuestionGate key="gate" questions={store.questions} onUnlocked={handleUnlocked} />
          )}

          {phase === 'unlocked' && (
            <UnlockedBanner key="banner" />
          )}

          {phase === 'scratch' && (
            <motion.div key="scratch"
              initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.6 }}
            >
              <UnlockedBanner />
              <ScratchCard
                src={store.scratchSrc}
                label={store.scratchLabel}
                onRevealed={handleCardRevealed}
              />

              {/* Celebration appears below card after reveal */}
              <AnimatePresence>
                {cardRevealed && (
                  <RevealCelebration message={store.scratchRevealMessage} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play again */}
        {phase === 'scratch' && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1 }}
            style={{ textAlign:'center', marginTop:'28px' }}
          >
            <button
              onClick={() => { setPhase('gate'); setCardRevealed(false); }}
              style={{
                background:'none', border:'1px solid rgba(255,255,255,0.12)',
                color:'rgba(255,255,255,0.35)', borderRadius:'8px',
                padding:'8px 20px', fontSize:'0.75rem',
                fontFamily:'Inter, sans-serif', cursor:'pointer',
                letterSpacing:'0.08em',
              }}
            >
              ↺ Try Questions Again
            </button>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.5 }}
          className="font-elegant"
          style={{ textAlign:'center', marginTop:'40px', color:'rgba(255,255,255,0.2)', fontSize:'0.88rem', fontStyle:'italic' }}
        >
          Every answer brings you one step closer to the surprise ❤️
        </motion.p>
      </div>
    </section>
  );
}
