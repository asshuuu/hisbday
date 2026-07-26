import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 800);
          }, 600);
          return 100;
        }
        return prev + Math.random() * 4 + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#0B0B0B' }}
        >
          {/* Cinematic bars */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-0 left-0 right-0 h-16 bg-black"
            style={{ transformOrigin: 'left' }}
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 h-16 bg-black"
            style={{ transformOrigin: 'right' }}
          />

          {/* Red orb background glow */}
          <div
            className="absolute"
            style={{
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(229,9,20,0.15) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'backOut' }}
              className="text-5xl"
            >
              ❤️
            </motion.div>

            {/* Main text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-center"
            >
              <p
                className="font-display text-white tracking-widest uppercase text-sm mb-3"
                style={{ letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)' }}
              >
                A Story Begins
              </p>
              <h1
                className="font-display text-white"
                style={{
                  fontSize: 'clamp(1.8rem, 5vw, 3rem)',
                  fontWeight: 400,
                  letterSpacing: '0.05em',
                }}
              >
                Loading{' '}
                <span style={{ color: '#E50914', fontStyle: 'italic' }}>Saill's</span>{' '}
                Story...
              </h1>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="w-64 flex flex-col items-center gap-3"
            >
              <div
                className="w-full h-px relative"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                <motion.div
                  className="absolute top-0 left-0 h-full"
                  style={{
                    background: 'linear-gradient(to right, #E50914, #ff4d4d)',
                    width: `${Math.min(progress, 100)}%`,
                    transition: 'width 0.1s ease',
                  }}
                />
                {/* Glow dot */}
                <div
                  className="absolute top-1/2 w-3 h-3 rounded-full"
                  style={{
                    background: '#E50914',
                    left: `${Math.min(progress, 100)}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px rgba(229,9,20,0.8)',
                    transition: 'left 0.1s ease',
                  }}
                />
              </div>
              <p
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.2em',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {Math.floor(Math.min(progress, 100))}%
              </p>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.8rem',
                fontFamily: 'Cormorant Garamond, serif',
                fontStyle: 'italic',
                letterSpacing: '0.1em',
              }}
            >
              "Every beautiful story has a beginning."
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
