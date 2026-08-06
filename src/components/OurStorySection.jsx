import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import useStore from '../hooks/useStore';

const storyChapters = [
  {
    id: 1,
    icon: '❤️',
    label: 'The Spark',
    title: 'Our First Conversation',
    date: 'Day One',
    color: '#E50914',
    note: `It started with a simple hello — but nothing about it felt ordinary. Words flowing like we'd known each other for years. That first conversation was the beginning of everything.`,
    caption: 'The moment two worlds quietly collided.',
  },
  {
    id: 2,
    icon: '😊',
    label: 'A New Feeling',
    title: 'Your First Smile',
    date: 'The Beginning',
    color: '#C9A84C',
    note: `The first time you really smiled — not just at something funny, but at something between us — I knew this was going to be something beautiful. That smile became my favorite thing in the world.`,
    caption: 'The smile that started it all.',
  },
  {
    id: 3,
    icon: '📸',
    label: 'Captured',
    title: 'Our First Picture',
    date: 'Frozen in Time',
    color: '#E50914',
    note: `A photo is just light and shadow — but this one holds an entire feeling. The first time we were captured in the same frame. Two people who had no idea how much they'd mean to each other.`,
    caption: 'The picture that holds a thousand feelings.',
  },
  {
    id: 4,
    icon: '💬',
    label: 'Connection',
    title: 'Endless Conversations',
    date: 'Every Day',
    color: '#C9A84C',
    note: `Hours that felt like minutes. Topics that ranged from the deepest to the silliest. We talked about everything and nothing, and somehow every single conversation felt like the best one yet.`,
    caption: 'Words that never ran out.',
  },
  {
    id: 5,
    icon: '✨',
    label: 'Magic',
    title: 'Beautiful Memories',
    date: 'Always',
    color: '#E50914',
    note: `You have a way of turning ordinary moments into something extraordinary. Even the quiet evenings, the inside jokes, the little things — with you, everything becomes a memory worth keeping forever.`,
    caption: 'Ordinary days made extraordinary by you.',
  },
  {
    id: 6,
    icon: '🌍',
    label: 'Together',
    title: 'Adventures Together',
    date: 'Everywhere',
    color: '#C9A84C',
    note: `Every adventure is twice as good when you're there. Whether it's a grand trip or a spontaneous detour — with you, even getting lost becomes the best part of the journey.`,
    caption: 'Wherever we go, we go together.',
  },
  {
    id: 7,
    icon: '😂',
    label: 'Joy',
    title: 'Silly Moments',
    date: 'Always Laughing',
    color: '#E50914',
    note: `The laughs that came out of nowhere. The jokes only we understood. The silly moments that we promised to never let anyone else hear about — but secretly hoped would never stop. Life is lighter with you.`,
    caption: 'Laughter that echoes long after the moment.',
  },
  {
    id: 8,
    icon: '🤍',
    label: 'Depth',
    title: 'Through Every High and Low',
    date: 'Through Everything',
    color: '#C9A84C',
    note: `The real beauty of our story isn't just in the perfect moments — it's in the ones that tested us. Through every difficulty, every quiet struggle, every uncertain day, we showed up for each other. That means everything.`,
    caption: 'We showed up, even when it was hard.',
  },
  {
    id: 9,
    icon: '🎉',
    label: 'Celebration',
    title: 'Special Days Together',
    date: 'Every Celebration',
    color: '#E50914',
    note: `Every occasion became more special because you were part of it. Birthdays, little victories, random celebrations for no reason at all — you make every single day feel worth celebrating.`,
    caption: 'Every day with you is worth celebrating.',
  },
  {
    id: 10,
    icon: '❤️',
    label: 'Now',
    title: 'Today',
    date: 'Right Now',
    color: '#C9A84C',
    note: `And here we are. All those moments led to this — to right now, to this day. You are not just a chapter in my story. You are the story. Happy Birthday, Saill. Today, we celebrate you.`,
    caption: 'All roads led here. To this moment. To you.',
  },
];

/* ── Story row ────────────────────────────────────────────── */
function StoryRow({ chapter, index, onClick }) {
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      className="story-row"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.35), ease: 'easeOut' }}
    >
      {/* Dot */}
      <motion.div
        className="story-dot"
        style={{
          border: `2px solid ${chapter.color}`,
          boxShadow: `0 0 16px ${chapter.color}35`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35) + 0.1 }}
      >
        {chapter.icon}
      </motion.div>

      {/* Card */}
      <motion.div
        className="glass-card story-card"
        onClick={() => onClick(chapter)}
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        whileHover={{
          background:
            chapter.color === '#E50914'
              ? 'rgba(229,9,20,0.08)'
              : 'rgba(201,168,76,0.08)',
          borderColor: chapter.color + '45',
          boxShadow: `0 16px 48px ${chapter.color}14`,
        }}
        transition={{ duration: 0.25 }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              color: chapter.color,
              fontSize: '0.68rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
            }}
          >
            {chapter.label}
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.72rem',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {chapter.date}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-display"
          style={{
            color: '#fff',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            fontWeight: 600,
            lineHeight: 1.25,
            marginBottom: '8px',
          }}
        >
          {chapter.title}
        </h3>

        {/* Caption */}
        <p
          style={{
            color: 'rgba(255,255,255,0.52)',
            fontSize: '0.86rem',
            lineHeight: 1.6,
            marginBottom: '14px',
          }}
        >
          {chapter.caption}
        </p>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: chapter.color,
            fontSize: '0.75rem',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
          }}
        >
          Read More <span>→</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Chapter modal ────────────────────────────────────────── */
function ChapterModal({ chapter, imgSrc, onClose }) {
  return (
    <AnimatePresence>
      {chapter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(10px, 3vw, 24px)',
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(28px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'backOut' }}
            className="glass-card"
            style={{
              borderRadius: '22px',
              maxWidth: '520px',
              width: '100%',
              padding: 'clamp(18px, 5vw, 36px)',
              maxHeight: '92vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
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

            {/* Icon */}
            <div style={{ textAlign: 'center', fontSize: '2.8rem', marginBottom: '10px' }}>
              {chapter.icon}
            </div>

            {/* Label + date */}
            <p
              style={{
                textAlign: 'center',
                color: chapter.color,
                fontSize: '0.68rem',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '8px',
              }}
            >
              {chapter.label} · {chapter.date}
            </p>

            {/* Title */}
            <h2
              className="font-display"
              style={{
                textAlign: 'center',
                color: '#fff',
                fontSize: 'clamp(1.3rem, 4vw, 1.9rem)',
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: '14px',
              }}
            >
              {chapter.title}
            </h2>

            {/* Divider */}
            <div
              style={{
                width: '36px',
                height: '2px',
                background: chapter.color,
                margin: '0 auto 20px',
                borderRadius: '1px',
              }}
            />

            {/* Photo — real or placeholder */}
            <div
              style={{
                borderRadius: '12px',
                marginBottom: '20px',
                overflow: 'hidden',
                border: `1px solid ${chapter.color}22`,
                background: '#0d0d0d',
                // Let the image define its own height, capped at 70vw for mobile
                maxHeight: '70vw',
                minHeight: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={chapter.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '70vw',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{
                  width:'100%', height:'160px',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px',
                  background: `linear-gradient(135deg, rgba(${chapter.color === '#E50914' ? '229,9,20' : '201,168,76'},0.1), rgba(255,255,255,0.02))`,
                }}>
                  <span style={{ fontSize:'2rem', opacity:0.5 }}>{chapter.icon}</span>
                  <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', fontFamily:'Inter, sans-serif' }}>
                    Add your photo in Admin Panel
                  </p>
                </div>
              )}
            </div>

            {/* Caption */}
            <p
              className="font-elegant"
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.65)',
                fontSize: '1.05rem',
                fontStyle: 'italic',
                lineHeight: 1.7,
                marginBottom: '20px',
              }}
            >
              "{chapter.caption}"
            </p>

            {/* Diary note */}
            <div
              style={{
                borderRadius: '10px',
                padding: '18px 20px',
                background: 'rgba(255,255,255,0.025)',
                borderLeft: `3px solid ${chapter.color}`,
              }}
            >
              <p
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.9,
                  fontSize: '0.91rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {chapter.note}
              </p>
            </div>
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
        Chapter Two
      </motion.span>

      <motion.h2
        className="section-title font-display"
        style={{ color: '#fff' }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Our Story
      </motion.h2>

      <div className="title-divider" />

      <motion.span
        className="subtitle"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        The moments that made us
      </motion.span>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────── */
export default function OurStorySection() {
  const [selected, setSelected] = useState(null);
  const store = useStore();

  const getImg = (id) => store.timelineImages?.[`s${id}`] || '';

  return (
    <>
      <section
        id="our-story"
        className="section-wrap"
        style={{
          background: 'radial-gradient(ellipse at 80% 40%, rgba(229,9,20,0.06) 0%, transparent 60%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <SectionHeader />
          <div className="story-timeline">
            <div className="story-spine" />
            {storyChapters.map((ch, i) => (
              <StoryRow key={ch.id} chapter={ch} index={i} onClick={setSelected} />
            ))}
          </div>
        </div>
      </section>

      <ChapterModal
        chapter={selected}
        imgSrc={selected ? getImg(selected.id) : ''}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
