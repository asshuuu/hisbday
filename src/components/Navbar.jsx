import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Home',           href: '#home' },
  { label: 'Childhood',      href: '#childhood' },
  { label: 'Our Story',      href: '#our-story' },
  { label: 'Gallery',        href: '#gallery' },
  { label: 'Surprises',      href: '#surprises' },
  { label: 'Birthday Letter', href: '#birthday' },
];

export default function Navbar({ onAdminOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
      const sections = navLinks.map(l => l.href.replace('#', ''));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActive(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[400] transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(11,11,11,0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-6 flex items-center justify-between"
          style={{ height: '70px' }}
        >
          {/* Logo */}
          <motion.a
            onClick={() => scrollTo('#home')}
            className="cursor-pointer flex items-center gap-2"
            whileHover={{ scale: 1.03 }}
          >
            <span style={{ color: '#E50914', fontSize: '1.3rem' }}>❤</span>
            <span
              className="font-display text-white"
              style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              Saill
            </span>
          </motion.a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {navLinks.map(link => (
              <li key={link.href}>
                <button
                  onClick={() => scrollTo(link.href)}
                  className="relative text-sm font-medium transition-colors duration-300"
                  style={{
                    color: active === link.href.replace('#', '')
                      ? '#ffffff'
                      : 'rgba(255,255,255,0.55)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    fontFamily: 'Inter, sans-serif',
                    padding: '4px 0',
                  }}
                >
                  {link.label}
                  {active === link.href.replace('#', '') && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px"
                      style={{ background: '#E50914' }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="block w-6 h-px bg-white"
                animate={{
                  rotate: menuOpen ? (i === 0 ? 45 : i === 2 ? -45 : 0) : 0,
                  y: menuOpen ? (i === 0 ? 8 : i === 2 ? -8 : 0) : 0,
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[399] md:hidden flex flex-col items-center justify-center gap-8"
            style={{
              background: 'rgba(11,11,11,0.98)',
              backdropFilter: 'blur(30px)',
            }}
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 text-white text-2xl"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
            {navLinks.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => scrollTo(link.href)}
                className="font-display text-3xl text-white"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: active === link.href.replace('#', '') ? '#E50914' : 'white',
                }}
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}