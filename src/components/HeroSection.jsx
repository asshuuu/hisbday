import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function HeroSection({ onBegin }) {
  const scrollToExplore = () => {
    document.getElementById('childhood')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Pre-generate stable star positions so they don't re-randomise on every render
  const stars = useMemo(
    () =>
      Array.from({ length: 55 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 1.8 + 0.8,
        opacity: Math.random() * 0.45 + 0.08,
        duration: Math.random() * 3 + 2.5,
        delay: Math.random() * 5,
      })),
    []
  );

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
        /* push content below the navbar */
        paddingTop: 'var(--nav-h)',
      }}
    >
      {/* ── Background layer ─────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* Base gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse at 28% 38%, rgba(229,9,20,0.13) 0%, transparent 58%),
              radial-gradient(ellipse at 72% 62%, rgba(201,168,76,0.06) 0%, transparent 55%),
              linear-gradient(155deg, #0f0f0f 0%, #0B0B0B 60%, #111 100%)
            `,
          }}
        />

        {/* Animated orbs */}
        {[
          { x: '14%', y: '22%', size: 320, color: 'rgba(229,9,20,0.09)', delay: 0 },
          { x: '76%', y: '68%', size: 420, color: 'rgba(229,9,20,0.05)', delay: 2 },
          { x: '54%', y: '14%', size: 220, color: 'rgba(201,168,76,0.04)', delay: 1 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: 'blur(32px)',
              transform: 'translate(-50%,-50%)',
            }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 7, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.68) 100%)',
          }}
        />

        {/* Stars */}
        {stars.map((s, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#fff',
              opacity: s.opacity,
            }}
            animate={{ opacity: [s.opacity * 0.3, s.opacity, s.opacity * 0.3] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Gradient fades (top / bottom) ────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to bottom, #000 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(to top, #0B0B0B 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Hero content ─────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Chapter badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            marginBottom: '28px',
          }}
        >
          <div style={{ height: '1px', width: '56px', background: 'rgba(229,9,20,0.6)' }} />
          <span
            style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.7rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            A Cinematic Story
          </span>
          <div style={{ height: '1px', width: '56px', background: 'rgba(229,9,20,0.6)' }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="hero-title font-display"
          style={{ color: '#fff', marginBottom: '20px' }}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
        >
          The Story of{' '}
          <motion.span
            style={{ color: '#E50914', fontStyle: 'italic', display: 'inline-block' }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Saill
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="quote-text"
          style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '48px' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          "Every beautiful story has a beginning."
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <motion.button
            className="btn-primary"
            onClick={onBegin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{ minWidth: '192px' }}
          >
            <span>▶</span>Begin the Journey
          </motion.button>

          <motion.button
            className="btn-outline"
            onClick={scrollToExplore}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{ minWidth: '148px' }}
          >
            <span>↓</span>Explore
          </motion.button>
        </motion.div>
      </div>

      {/* ── Scroll indicator (absolutely placed in section) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            color: 'rgba(255,255,255,0.28)',
            fontSize: '0.6rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', lineHeight: 1 }}
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
