import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

import LoadingScreen    from './components/LoadingScreen';
import Navbar           from './components/Navbar';
import HeroSection      from './components/HeroSection';
import OurStorySection  from './components/OurStorySection';
import GallerySection   from './components/GallerySection';
import ScratchSection   from './components/ScratchSection';
import BirthdaySection  from './components/BirthdaySection';
import MusicController  from './components/MusicController';
import AdminPanel       from './components/AdminPanel';
import useActiveSection from './hooks/useActiveSection';
import { applyTheme, getSavedThemeId } from './hooks/useTheme';

// Apply saved theme immediately before first render
applyTheme(getSavedThemeId());

export default function App() {
  const [loading,      setLoading]      = useState(true);
  const [showContent,  setShowContent]  = useState(false);
  const [musicActive,  setMusicActive]  = useState(false);
  const [adminOpen,    setAdminOpen]    = useState(false);
  const activeSection = useActiveSection();

  /* ── prevent browser scroll restoration ─────────────── */
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);
  const handleBeginJourney = () => {
    setMusicActive(true);
    document.getElementById('childhood')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReplay = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* ── secret key combo: Ctrl+Shift+A ──────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') setAdminOpen(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ── cursor glow ──────────────────────────────────────── */
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    document.body.appendChild(cursor);
    const move = (e) => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => { window.removeEventListener('mousemove', move); cursor.remove(); };
  }, []);

  return (
    <>
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Loading screen */}
      {loading && (
        <LoadingScreen
          onComplete={() => { setLoading(false); setShowContent(true); }}
        />
      )}

      {/* Main content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <Navbar onAdminOpen={() => setAdminOpen(true)} />

            <main>
              <HeroSection      onBegin={handleBeginJourney} />
              <OurStorySection  />
              <GallerySection   />
              <ScratchSection   />
              <BirthdaySection  onReplay={handleReplay} />
            </main>

            {/* Footer */}
            <footer
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                background: '#0B0B0B',
              }}
            >
              <p className="font-elegant" style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.88rem', fontStyle: 'italic', lineHeight: 1.7 }}>
                Made with ❤️ for Saill · A story worth telling forever
              </p>
              <p style={{ color: 'rgba(229,9,20,0.55)', fontSize: '0.72rem', marginTop: '8px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Happy Birthday 🎉
              </p>

              {/* Discreet admin link */}
              <button
                onClick={() => setAdminOpen(true)}
                title="Admin Panel"
                style={{
                  marginTop: '20px',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.15)',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '0.6rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.target.style.color = 'rgba(229,9,20,0.6)'; e.target.style.borderColor = 'rgba(229,9,20,0.25)'; }}
                onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.15)'; e.target.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                ⚙ admin
              </button>
              <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.58rem', marginTop: '6px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.08em' }}>
                or press Ctrl+Shift+A
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music controller */}
      <MusicController active={musicActive} activeSection={activeSection} />

      {/* Admin Panel */}
      <AnimatePresence>
        {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
