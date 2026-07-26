import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const milestones = [
  {
    id: 1,
    icon: '👶',
    year: 'The Beginning',
    title: 'A Star is Born',
    subtitle: 'The world became brighter the day Saill arrived.',
    caption: 'Every great story begins with a single breath — and the world was never the same.',
    memory: `On the day you were born, the universe quietly made a note: something special just arrived. Tiny hands, curious eyes, and a smile that would one day change everything. This is where your story begins — not just as a date on a calendar, but as the start of a journey that would touch every heart it encountered.`,
    color: '#E50914',
    bg: 'rgba(229,9,20,0.08)',
  },
  {
    id: 2,
    icon: '🏡',
    year: 'Childhood',
    title: 'Childhood Adventures',
    subtitle: 'A world seen through innocent, wondering eyes.',
    caption: 'Every corner was a new discovery. Every day was magic.',
    memory: `The neighborhood was your kingdom. Every street a new adventure, every sunset a promise of tomorrow. You ran through those childhood days with a joy that most people spend their whole lives searching for. Those adventures — big and small — were building the extraordinary person you would become.`,
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
  },
  {
    id: 3,
    icon: '🎈',
    year: 'Precious Moments',
    title: 'Precious Memories',
    subtitle: 'The moments that live forever in the heart.',
    caption: 'Not all treasures are made of gold — some are made of laughter and moments like these.',
    memory: `Some memories don't fade with time — they grow warmer, like photographs kept close to the heart. The laughter that echoed through childhood rooms, the little triumphs that felt like everything, the quiet moments that turned out to be the most precious of all. Every single one of them shaped the beautiful soul that you are.`,
    color: '#E50914',
    bg: 'rgba(229,9,20,0.08)',
  },
  {
    id: 4,
    icon: '⭐',
    year: 'Growing Up',
    title: 'Dreams Started Here',
    subtitle: "Where a child's wonder became a young soul's compass.",
    caption: 'The biggest dreams always start from the smallest sparks.',
    memory: `There was a moment — maybe you remember it, maybe you don't — when you looked at the sky and felt something stir. A quiet knowing that you were meant for something beautiful. That spark? It never went out. It only grew stronger with every year, every challenge, every dream you dared to hold onto.`,
    color: '#C9A84C',
    bg: 'rgba(201,168,76,0.08)',
  },
];

/* ── Single milestone row ─────────────────────────────────── */
function TimelineRow({ milestone, index, onClick }) {
  const [ref, inView] = useInView({ threshold: 0.25, triggerOnce: true });
  const isLeft = index % 2 === 0; // even → card on left, odd → card on right

  const cardContent = (
    <motion.div
      onClick={() => onClick(milestone)}
      className="glass-card timeline-card"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      whileHover={{
        background: milestone.bg,
        borderColor: milestone.color + '50',
        boxShadow: `0 20px 56px ${milestone.color}18`,
      }}
      transition={{ duration: 0.25 }}
    >
      {/* Tag row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{milestone.icon}</span>
        <span
          style={{
            color: milestone.color,
            fontSize: '0.68rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
          }}
        >
          {milestone.year}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-display"
        style={{
          color: '#fff',
          fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
          fontWeight: 600,
          lineHeight: 1.25,
          marginBottom: '8px',
        }}
      >
        {milestone.title}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '0.875rem',
          lineHeight: 1.65,
          marginBottom: '16px',
        }}
      >
        {milestone.subtitle}
      </p>

      {/* CTA */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: milestone.color,
          fontSize: '0.78rem',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
        }}
      >
        Open Memory <span>→</span>
      </div>
    </motion.div>
  );

  const dotNode = (
    <div className="timeline-dot-col">
      <motion.div
        className="timeline-dot"
        style={{
          border: `2px solid ${milestone.color}`,
          boxShadow: `0 0 18px ${milestone.color}40`,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        {milestone.icon}
      </motion.div>
    </div>
  );

  return (
    <motion.div
      ref={ref}
      className="timeline-row"
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: 'easeOut' }}
    >
      {isLeft ? (
        <>
          <div className="timeline-card-left">{cardContent}</div>
          {dotNode}
          <div /> {/* empty right col */}
        </>
      ) : (
        <>
          <div /> {/* empty left col */}
          {dotNode}
          <div className="timeline-card-right">{cardContent}</div>
        </>
      )}
    </motion.div>
  );
}

/* ── Memory modal ─────────────────────────────────────────── */
function MemoryModal({ milestone, onClose }) {
  return (
    <AnimatePresence>
      {milestone && (
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
            padding: '24px',
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(24px)',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass-card"
            style={{
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              padding: '40px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ✕
            </button>

            {/* Icon */}
            <div style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '12px' }}>
              {milestone.icon}
            </div>

            {/* Year label */}
            <p
              style={{
                textAlign: 'center',
                color: milestone.color,
                fontSize: '0.7rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                marginBottom: '8px',
              }}
            >
              {milestone.year}
            </p>

            {/* Title */}
            <h2
              className="font-display"
              style={{
                textAlign: 'center',
                color: '#fff',
                fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: '16px',
              }}
            >
              {milestone.title}
            </h2>

            {/* Divider */}
            <div
              style={{
                width: '40px',
                height: '2px',
                background: milestone.color,
                margin: '0 auto 20px',
                borderRadius: '1px',
              }}
            />

            {/* Caption */}
            <p
              className="font-elegant"
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                lineHeight: 1.7,
                marginBottom: '24px',
              }}
            >
              "{milestone.caption}"
            </p>

            {/* Photo placeholder */}
            <div
              style={{
                height: '200px',
                borderRadius: '14px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: `linear-gradient(135deg, ${milestone.bg}, rgba(255,255,255,0.02))`,
                border: `1px solid ${milestone.color}25`,
              }}
            >
              <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>{milestone.icon}</span>
              <p
                style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '0.78rem',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Add your photo here
              </p>
            </div>

            {/* Memory text */}
            <p
              style={{
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.9,
                fontSize: '0.93rem',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {milestone.memory}
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
        Chapter One
      </motion.span>

      <motion.h2
        className="section-title font-display"
        style={{ color: '#fff' }}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Where It All Began
      </motion.h2>

      <div className="title-divider" />

      <motion.span
        className="subtitle"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        A journey through the years that made Saill who he is today
      </motion.span>
    </div>
  );
}

/* ── Transition quote ─────────────────────────────────────── */
function TransitionQuote() {
  const [ref, inView] = useInView({ threshold: 0.4, triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9 }}
      style={{
        textAlign: 'center',
        marginTop: '96px',
        paddingLeft: '24px',
        paddingRight: '24px',
      }}
    >
      {/* Ornament */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={{ height: '1px', width: '64px', background: 'rgba(229,9,20,0.45)' }} />
        <span style={{ color: '#E50914', fontSize: '1rem' }}>❤</span>
        <div style={{ height: '1px', width: '64px', background: 'rgba(229,9,20,0.45)' }} />
      </div>

      <p
        className="quote-text font-elegant"
        style={{
          color: 'rgba(255,255,255,0.72)',
          maxWidth: '640px',
          margin: '0 auto',
        }}
      >
        "Every journey eventually leads to someone who changes everything."
      </p>

      {/* Connector line to next section */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ delay: 0.5, duration: 1.2 }}
        style={{
          width: '2px',
          height: '80px',
          background: 'linear-gradient(to bottom, #E50914, transparent)',
          margin: '36px auto 0',
          transformOrigin: 'top',
        }}
      />
    </motion.div>
  );
}

/* ── Main export ──────────────────────────────────────────── */
export default function ChildhoodSection() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <section
        id="childhood"
        className="section-wrap"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(229,9,20,0.05) 0%, transparent 65%)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Container */}
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <SectionHeader />

          {/* Timeline */}
          <div className="timeline-container">
            {/* Spine */}
            <div className="timeline-spine" />

            {milestones.map((m, i) => (
              <TimelineRow
                key={m.id}
                milestone={m}
                index={i}
                onClick={setSelected}
              />
            ))}
          </div>
        </div>

        {/* Transition quote — full-width, inside section */}
        <TransitionQuote />
      </section>

      <MemoryModal milestone={selected} onClose={() => setSelected(null)} />
    </>
  );
}
