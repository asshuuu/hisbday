import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import confetti from 'canvas-confetti';

const finalMessage = [
  `Thank you for every smile, every laugh, every memory, and every beautiful chapter we've written together.`,
  `May your life always be filled with happiness, success, peace, and endless love.`,
  `This is only the beginning...\nOur best chapters are still waiting to be written.`,
];

/* ── Typewriter ───────────────────────────────────────────── */
function TypewriterText({ text, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(p => p + text[idx]);
        setIdx(i => i + 1);
      }, 30);
      return () => clearTimeout(t);
    } else if (!done) {
      setDone(true);
      onDone?.();
    }
  }, [idx, text, onDone, done]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          style={{ color: '#E50914' }}
        >
          |
        </motion.span>
      )}
    </span>
  );
}

/* ── Floating hearts ──────────────────────────────────────── */
function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        left: Math.random() * 100,
        duration: Math.random() * 4 + 4,
        delay: Math.random() * 6,
        dx: (Math.random() - 0.5) * 90,
        em: Math.random() > 0.5 ? '❤️' : '✨',
      })),
    []
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 200,
        overflow: 'hidden',
      }}
    >
      {hearts.map((h, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${h.left}%`,
            bottom: '-40px',
            fontSize: '1.5rem',
            lineHeight: 1,
          }}
          animate={{
            y: [0, -(window.innerHeight + 80)],
            x: [0, h.dx],
            opacity: [0, 1, 1, 0],
            scale: [0.6, 1, 0.75],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          {h.em}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Sparkles ─────────────────────────────────────────────── */
function Sparkles() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 0.8 + 0.9,
        duration: Math.random() * 2 + 1.2,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {sparks.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            fontSize: `${s.size}rem`,
            lineHeight: 1,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.4, 0], rotate: [0, 180, 360] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}

/* ── Main section ─────────────────────────────────────────── */
export default function BirthdaySection({ onReplay }) {
  const [ref, inView] = useInView({ threshold: 0.25, triggerOnce: true });
  const [phase, setPhase] = useState(0);
  const [showHearts, setShowHearts] = useState(false);
  const [confettiFired, setConfettiFired] = useState(false);

  useEffect(() => {
    if (inView && phase === 0) setTimeout(() => setPhase(1), 700);
  }, [inView, phase]);

  const handleQuoteDone = () => {
    setTimeout(() => setPhase(2), 900);
    setTimeout(() => {
      setPhase(3);
      setShowHearts(true);
    }, 2200);
  };

  const fireConfetti = () => {
    if (confettiFired) return;
    setConfettiFired(true);
    const colors = ['#E50914', '#ffffff', '#C9A84C', '#ff6b6b', '#ffd700'];
    const end = Date.now() + 5000;
    (function frame() {
      confetti({ particleCount: 5, angle: 60,  spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  useEffect(() => {
    if (phase === 3) fireConfetti();
  }, [phase]);

  return (
    <>
      {showHearts && <FloatingHearts />}

      <section
        id="birthday"
        ref={ref}
        className="section-wrap"
        style={{
          background: '#0B0B0B',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {phase >= 3 && <Sparkles />}

        {/* Red radial glow */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at center, rgba(229,9,20,0.14) 0%, transparent 68%)',
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            maxWidth: '720px',
            margin: '0 auto',
            padding: '0 24px',
            textAlign: 'center',
          }}
        >
          {/* Phase 1 — Typewriter quote */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{ marginBottom: '48px' }}
              >
                <p
                  className="font-elegant"
                  style={{
                    fontSize: 'clamp(1.15rem, 3vw, 1.7rem)',
                    color: 'rgba(255,255,255,0.62)',
                    fontStyle: 'italic',
                    lineHeight: 1.8,
                    minHeight: '72px',
                  }}
                >
                  <TypewriterText
                    text='"Some stories are written by fate. Ours became my favorite."'
                    onDone={handleQuoteDone}
                  />
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 2 — Title */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.82, y: 28 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                style={{ marginBottom: '32px' }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: 'clamp(2rem, 7vw, 4.2rem)',
                    fontWeight: 700,
                    lineHeight: 1.18,
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #E50914 48%, #C9A84C 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ✨ Happy Birthday,
                  <br />
                  My Dear Sailu ❤️ ✨
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3 — Message + emoji + button */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
              >
                {/* Red divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7 }}
                  style={{
                    width: '80px',
                    height: '2px',
                    background: '#E50914',
                    margin: '0 auto 32px',
                    borderRadius: '1px',
                  }}
                />

                {/* Message card */}
                <div
                  className="glass-card"
                  style={{
                    borderRadius: '20px',
                    padding: '32px 36px',
                    marginBottom: '36px',
                    borderColor: 'rgba(229,9,20,0.18)',
                    textAlign: 'center',
                  }}
                >
                  {finalMessage.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.22 }}
                      className="font-elegant"
                      style={{
                        color: 'rgba(255,255,255,0.78)',
                        fontSize: 'clamp(1rem, 2.8vw, 1.12rem)',
                        fontStyle: 'italic',
                        lineHeight: 1.95,
                        marginBottom: i < finalMessage.length - 1 ? '20px' : 0,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>

                {/* Floating emojis */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    fontSize: '2rem',
                    marginBottom: '40px',
                  }}
                >
                  {['🎉', '❤️', '✨', '🎂', '🥂'].map((em, i) => (
                    <motion.span
                      key={i}
                      style={{ lineHeight: 1 }}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 1.6,
                        delay: i * 0.14,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {em}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Replay button */}
                <motion.button
                  className="btn-primary"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  onClick={onReplay}
                  whileHover={{ scale: 1.06, boxShadow: '0 0 60px rgba(229,9,20,0.7)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    fontSize: '0.9rem',
                    padding: '16px 44px',
                    animation: 'pulse-red 2s ease-in-out infinite',
                  }}
                >
                  ▶ Replay Our Story
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
