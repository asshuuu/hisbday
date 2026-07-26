import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ChildhoodSection from './components/ChildhoodSection';
import OurStorySection from './components/OurStorySection';
import GallerySection from './components/GallerySection';
import BirthdaySection from './components/BirthdaySection';
import MusicController from './components/MusicController';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [musicActive, setMusicActive] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const handleLoadComplete = () => {
    setShowContent(true);
  };

  const handleBeginJourney = () => {
    setMusicActive(true);
    document.getElementById('childhood')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReplay = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cursor glow effect
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    document.body.appendChild(cursor);

    const move = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      cursor.remove();
    };
  }, []);

  return (
    <>
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Loading screen */}
      {loading && (
        <LoadingScreen
          onComplete={() => {
            setLoading(false);
            setShowContent(true);
          }}
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
            <Navbar />

            <main>
              <HeroSection onBegin={handleBeginJourney} />
              <ChildhoodSection />
              <OurStorySection />
              <GallerySection />
              <BirthdaySection onReplay={handleReplay} />
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
              <p
                className="font-elegant"
                style={{
                  color: 'rgba(255,255,255,0.28)',
                  fontSize: '0.88rem',
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                }}
              >
                Made with ❤️ for Saill · A story worth telling forever
              </p>
              <p
                style={{
                  color: 'rgba(229,9,20,0.55)',
                  fontSize: '0.72rem',
                  marginTop: '8px',
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Happy Birthday 🎉
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music controller */}
      <MusicController active={musicActive} />
    </>
  );
}
