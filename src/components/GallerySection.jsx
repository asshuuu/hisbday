import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const galleryItems = [
  { id: 1,  emoji: '❤️', label: 'Our First Memory',   span: 'tall',   color: 'rgba(229,9,20,0.20)' },
  { id: 2,  emoji: '😊', label: 'Smiles & Laughter',  span: 'normal', color: 'rgba(201,168,76,0.15)' },
  { id: 3,  emoji: '✨', label: 'Beautiful Moments',  span: 'normal', color: 'rgba(229,9,20,0.15)' },
  { id: 4,  emoji: '🌍', label: 'Adventures',         span: 'wide',   color: 'rgba(201,168,76,0.20)' },
  { id: 5,  emoji: '💬', label: 'Endless Talks',      span: 'normal', color: 'rgba(229,9,20,0.12)' },
  { id: 6,  emoji: '🎉', label: 'Special Days',       span: 'tall',   color: 'rgba(201,168,76,0.18)' },
  { id: 7,  emoji: '📸', label: 'Captured Forever',   span: 'normal', color: 'rgba(229,9,20,0.18)' },
  { id: 8,  emoji: '😂', label: 'Silly Moments',      span: 'normal', color: 'rgba(201,168,76,0.12)' },
  { id: 9,  emoji: '🤍', label: 'Every High & Low',   span: 'wide',   color: 'rgba(229,9,20,0.10)' },
  { id: 10, emoji: '⭐', label: 'Dreams Together',    span: 'normal', color: 'rgba(201,168,76,0.15)' },
  { id: 11, emoji: '🏡', label: 'Our World',          span: 'normal', color: 'rgba(229,9,20,0.12)' },
  { id: 12, emoji: '👶', label: 'The Beginning',      span: 'tall',   color: 'rgba(201,168,76,0.20)' },
];

const spanHeight = { normal: 200, tall: 280, wide: 210 };

/* ── Gallery card ─────────────────────────────────────────── */
function GalleryCard({ item, index, onClick }) {
  const [ref, inView] = useInView({ threshold: 0.08, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      className="masonry-item group"
      onClick={() => onClick(item)}
      style={{ height: spanHeight[item.span] || 200 }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(145deg, ${item.color}, rgba(18,18,18,0.85))`,
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
        }}
        whileHover={{ scale: 1.04 }}
        transition={{ duration: 0.28 }}
      >
        {/* Hover inner glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,255,255,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            padding: '16px',
          }}
        >
          <div style={{ fontSize: '2.4rem', marginBottom: '10px', lineHeight: 1 }}>
            {item.emoji}
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.76rem',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.04em',
              lineHeight: 1.4,
            }}
          >
            {item.label}
          </p>
          <p
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: '0.66rem',
              fontFamily: 'Inter, sans-serif',
              marginTop: '6px',
            }}
          >
            Add your photo
          </p>
        </div>

        {/* Bottom hover overlay */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.75rem',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.12em',
            }}
          >
            View ✨
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Lightbox ─────────────────────────────────────────────── */
function Lightbox({ item, onClose }) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(32px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.82, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-card"
            style={{
              borderRadius: '22px',
              padding: '32px',
              maxWidth: '460px',
              width: '100%',
              textAlign: 'center',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '3.5rem', marginBottom: '20px', lineHeight: 1 }}>
              {item.emoji}
            </div>

            {/* Photo area */}
            <div
              style={{
                height: '260px',
                borderRadius: '14px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: `linear-gradient(145deg, ${item.color}, rgba(18,18,18,0.7))`,
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: '0.82rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                📷 Add your favorite photo here
              </p>
            </div>

            <h3
              className="font-display"
              style={{
                color: '#fff',
                fontSize: '1.45rem',
                fontWeight: 600,
                marginBottom: '8px',
                lineHeight: 1.25,
              }}
            >
              {item.label}
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.42)',
                fontSize: '0.83rem',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
              }}
            >
              A beautiful memory worth keeping forever ❤️
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Section header ───────────────────────────────────────── */
function SectionHeader() {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  return (
    <div ref={ref} className="section-header">
      <motion.span
        className="chapter-tag"
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        Our Gallery
      </motion.span>

      <motion.h2
        className="section-title font-display"
        style={{ color: '#fff' }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Moments Captured
      </motion.h2>

      <div className="title-divider" />

      <motion.span
        className="subtitle"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        Every photo tells a chapter of our story
      </motion.span>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────── */
export default function GallerySection() {
  const [lightboxItem, setLightboxItem] = useState(null);

  return (
    <>
      <section
        id="gallery"
        className="section-wrap"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 60%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <SectionHeader />

          {/* Masonry grid */}
          <div className="masonry-grid">
            {galleryItems.map((item, i) => (
              <GalleryCard key={item.id} item={item} index={i} onClick={setLightboxItem} />
            ))}
          </div>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="font-elegant"
            style={{
              textAlign: 'center',
              marginTop: '40px',
              color: 'rgba(255,255,255,0.28)',
              fontSize: '0.92rem',
              fontStyle: 'italic',
            }}
          >
            Click on any memory to relive it ✨
          </motion.p>
        </div>
      </section>

      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </>
  );
}
