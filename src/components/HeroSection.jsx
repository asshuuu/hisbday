import { motion } from 'framer-motion';
import { useMemo, useRef, useState, useEffect } from 'react';
import useStore from '../hooks/useStore';

export default function HeroSection({ onBegin }) {
  const store = useStore();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError,  setVideoError]  = useState(false);
  const [videoKey,    setVideoKey]    = useState(0);
  const prevSrc = useRef('');

  // Use heroVideo from store — defaults to /herobg.mp4 (set in useMediaStore.js)
  const videoSrc = store.heroVideo || '/herobg.mp4';
  const fallbackSrc = store.heroFallback || '';

  // Reset video element whenever source changes
  useEffect(() => {
    if (videoSrc !== prevSrc.current) {
      prevSrc.current = videoSrc;
      setVideoLoaded(false);
      setVideoError(false);
      setVideoKey(k => k + 1);
    }
  }, [videoSrc]);

  const scrollToExplore = () =>
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });

  const stars = useMemo(() =>
    Array.from({ length: 55 }, () => ({
      left:     Math.random() * 100,
      top:      Math.random() * 100,
      size:     Math.random() * 1.8 + 0.8,
      opacity:  Math.random() * 0.45 + 0.08,
      duration: Math.random() * 3 + 2.5,
      delay:    Math.random() * 5,
    })), []
  );

  const showVideo   = !videoError;
  const showFallback = !!fallbackSrc && (!videoLoaded || videoError);

  return (
    <section
      id="home"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: 'var(--nav-h)',
      }}
    >
      {/* ── VIDEO ─────────────────────────────────────────── */}
      {showVideo && (
        <video
          key={videoKey}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          onError={() => { setVideoError(true); setVideoLoaded(false); }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0,
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 1.2s ease',
          }}
          src={videoSrc}
        />
      )}

      {/* ── FALLBACK IMAGE ────────────────────────────────── */}
      {showFallback && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${fallbackSrc})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      )}

      {/* ── BASE GRADIENT ────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: videoLoaded && showVideo
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.3) 50%, rgba(11,11,11,0.78) 100%)'
          : `radial-gradient(ellipse at 28% 38%, rgba(229,9,20,0.13) 0%, transparent 58%),
             radial-gradient(ellipse at 72% 62%, rgba(201,168,76,0.06) 0%, transparent 55%),
             linear-gradient(155deg, #0f0f0f 0%, var(--bg,#0B0B0B) 60%, #111 100%)`,
      }} />

      {/* Stars — only when no video playing */}
      {(!videoLoaded || videoError) && stars.map((s, i) => (
        <motion.div key={i} style={{
          position: 'absolute',
          left: `${s.left}%`, top: `${s.top}%`,
          width: s.size, height: s.size,
          borderRadius: '50%', background: '#fff',
          opacity: s.opacity, zIndex: 1,
        }}
          animate={{ opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Top / bottom fades */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'140px', background:'linear-gradient(to bottom,#000 0%,transparent 100%)', pointerEvents:'none', zIndex:3 }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'180px', background:'linear-gradient(to top,var(--bg,#0B0B0B) 0%,transparent 100%)', pointerEvents:'none', zIndex:3 }} />

      {/* ── CONTENT ──────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 10,
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: '900px', width: '100%',
        margin: '0 auto',
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.3, duration:0.8 }}
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'14px', marginBottom:'28px' }}
        >
          <div style={{ height:'1px', width:'56px', background:'rgba(229,9,20,0.6)' }} />
          <span style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.7rem', letterSpacing:'0.35em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>
            A Cinematic Story
          </span>
          <div style={{ height:'1px', width:'56px', background:'rgba(229,9,20,0.6)' }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="hero-title font-display"
          style={{
            color: '#fff', marginBottom: '20px',
            textShadow: videoLoaded ? '0 2px 20px rgba(0,0,0,0.9)' : 'none',
          }}
          initial={{ opacity:0, y:36 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.5, duration:1, ease:'easeOut' }}
        >
          The Story of{' '}
          <motion.span
            style={{ color:'var(--accent,#E50914)', fontStyle:'italic', display:'inline-block' }}
            animate={{ y:[0,-4,0] }}
            transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
          >
            Saill
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="quote-text"
          style={{ color:'rgba(255,255,255,0.68)', marginBottom:'48px', textShadow: videoLoaded ? '0 1px 10px rgba(0,0,0,0.8)' : 'none' }}
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:0.8, duration:0.8 }}
        >
          "Every beautiful story has a beginning."
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          transition={{ delay:1.1, duration:0.8 }}
          style={{ display:'flex', flexDirection:'column', alignItems:'stretch', gap:'12px', width:'100%', maxWidth:'320px', margin:'0 auto' }}
        >
          <motion.button className="btn-primary" onClick={onBegin}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.96 }}
            style={{ width:'100%', justifyContent:'center' }}
          >
            <span>▶</span>Begin the Journey
          </motion.button>
          <motion.button className="btn-outline" onClick={scrollToExplore}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.96 }}
            style={{ width:'100%', justifyContent:'center' }}
          >
            <span>↓</span>Explore
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }}
        transition={{ delay:2.2, duration:1 }}
        style={{ position:'absolute', bottom:'32px', left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}
      >
        <span style={{ color:'rgba(255,255,255,0.28)', fontSize:'0.6rem', letterSpacing:'0.3em', textTransform:'uppercase', fontFamily:'Inter, sans-serif' }}>Scroll</span>
        <motion.div
          animate={{ y:[0,7,0] }} transition={{ duration:1.6, repeat:Infinity, ease:'easeInOut' }}
          style={{ color:'rgba(255,255,255,0.3)', fontSize:'1.2rem', lineHeight:1 }}
        >↓</motion.div>
      </motion.div>
    </section>
  );
}
