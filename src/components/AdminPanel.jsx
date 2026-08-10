import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { readStore, readStoreAsync, writeStore, deriveCode, SECTIONS, uploadToSupabase } from '../hooks/useMediaStore';
import { THEMES, applyTheme, getSavedThemeId } from '../hooks/useTheme';
import useStore from '../hooks/useStore';
import { hasSupabase } from '../lib/supabase';

/* ─── Password (change this!) ─────────────────────────── */
const ADMIN_PASSWORD = 'saill2024';

/* ─── helpers ─────────────────────────────────────────── */
function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

/** Upload a file — to Supabase Storage if confirmed, else base64 for images, blob URL for video/audio */
async function uploadFile(file, pathPrefix = 'media') {
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isBig   = file.size > 5 * 1024 * 1024; // > 5MB

  if (hasSupabase()) {
    try {
      const ext  = file.name.split('.').pop();
      const path = `${pathPrefix}/${Date.now()}.${ext}`;
      return await uploadToSupabase(file, path);
    } catch (e) {
      console.warn('Supabase storage not ready:', e.message);
    }
  }

  // For large files (video/audio > 5MB) — create a temporary blob URL
  // It works for the current session but won't persist across reloads.
  // Solution: use a URL instead of uploading a file for videos.
  if (isVideo || isAudio || isBig) {
    // Store as blob URL — works this session only
    const blobUrl = URL.createObjectURL(file);
    return blobUrl;
  }

  // Small images — convert to base64 (persists in IDB)
  return fileToDataURL(file);
}

function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(229,9,20,0.95)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </motion.div>
  );
}

/* ─── Section label ───────────────────────────────────── */
function Label({ children }) {
  return (
    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', fontWeight: 600, marginBottom: '10px' }}>
      {children}
    </p>
  );
}

/* ─── Input (immediate — for non-text fields like URLs) ── */
function Input({ placeholder, value, onChange, type = 'text' }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#fff',
        fontSize: '0.85rem',
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s',
      }}
      onFocus={e => (e.target.style.borderColor = '#E50914')}
      onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
    />
  );
}

/* ─── DebouncedInput (for text fields that save to store) ─ */
function DebouncedInput({ placeholder, value: externalValue, onSave, type = 'text' }) {
  const [local, setLocal] = useState(externalValue || '');
  const timerRef          = useRef(null);
  const isFocused         = useRef(false);

  useEffect(() => {
    if (!isFocused.current) setLocal(externalValue || '');
  }, [externalValue]);

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={local}
      onChange={e => {
        setLocal(e.target.value);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => onSave(e.target.value), 600);
      }}
      onFocus={e => { isFocused.current = true; e.target.style.borderColor = '#E50914'; }}
      onBlur={e  => {
        isFocused.current = false;
        clearTimeout(timerRef.current);
        onSave(local);
        e.target.style.borderColor = 'rgba(255,255,255,0.12)';
      }}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#fff',
        fontSize: '0.85rem',
        fontFamily: 'Inter, sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s',
      }}
    />
  );
}

/* ─── File-or-URL picker ──────────────────────────────── */
function MediaPicker({ label, accept, currentSrc, onSave }) {
  const [url,  setUrl]  = useState('');
  const [mode, setMode] = useState('url'); // 'url' | 'file'
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    try {
      const path = isVideo ? 'videos' : isAudio ? 'audio' : 'images';
      const url = await uploadFile(file, path);
      onSave(url);
      if (isVideo && url.startsWith('blob:')) {
        // Show info that blob URL is temporary
        console.info('Video loaded as temporary URL. For permanent storage, use a URL (YouTube/Drive/Cloudinary).');
      }
    } catch (err) {
      console.warn('Upload failed, used local fallback');
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <Label>{label}</Label>

      {/* Preview */}
      {currentSrc && (
        <div style={{ marginBottom: '10px', borderRadius: '8px', overflow: 'hidden', maxHeight: '120px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {currentSrc.startsWith('data:video') || currentSrc.endsWith('.mp4') || currentSrc.endsWith('.webm') ? (
            <video src={currentSrc} muted style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
          ) : (
            <img src={currentSrc} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
          )}
        </div>
      )}

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        {['url','file'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: mode === m ? '#E50914' : 'rgba(255,255,255,0.12)',
              background: mode === m ? 'rgba(229,9,20,0.15)' : 'transparent',
              color: mode === m ? '#fff' : 'rgba(255,255,255,0.45)',
              fontSize: '0.75rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {m === 'url' ? '🔗 URL' : '📁 Upload'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            placeholder="Paste URL here…"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button
            onClick={() => { if (url.trim()) { onSave(url.trim()); setUrl(''); } }}
            style={{
              background: '#E50914',
              border: 'none',
              borderRadius: '8px',
              padding: '0 16px',
              color: '#fff',
              fontSize: '0.8rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Save
          </button>
        </div>
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px dashed rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.82rem',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
            }}
          >
            Click to select file
          </button>
        </>
      )}

      {/* Clear */}
      {currentSrc && (
        <button
          onClick={() => onSave(null)}
          style={{ marginTop: '8px', background: 'none', border: 'none', color: 'rgba(229,9,20,0.6)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          ✕ Remove
        </button>
      )}
    </div>
  );
}

/* ─── Music URL + file picker ─────────────────────────── */
function MusicPicker({ currentUrl, onSave }) {
  const [url,  setUrl]  = useState('');
  const [mode, setMode] = useState('url');
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, 'audio');
      onSave(url);
    } catch (err) {
      console.error('Audio upload failed:', err);
      console.warn('Upload failed, used local fallback');
    }
    e.target.value = '';
  };

  return (
    <div>
      {/* Current preview */}
      {currentUrl && (
        <div style={{ marginBottom:'8px' }}>
          <audio
            src={currentUrl}
            controls
            style={{ width:'100%', height:'32px', accentColor:'#E50914', filter:'invert(0.1)' }}
          />
        </div>
      )}

      {/* Mode toggle */}
      <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
        {['url','file'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex:1, padding:'6px 0', borderRadius:'6px', border:'1px solid',
            borderColor: mode===m ? '#E50914' : 'rgba(255,255,255,0.1)',
            background: mode===m ? 'rgba(229,9,20,0.12)' : 'transparent',
            color: mode===m ? '#fff' : 'rgba(255,255,255,0.4)',
            fontSize:'0.72rem', fontFamily:'Inter, sans-serif', cursor:'pointer',
            textTransform:'uppercase', letterSpacing:'0.08em',
          }}>
            {m === 'url' ? '🔗 URL' : '📁 Upload'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <div style={{ display:'flex', gap:'6px' }}>
          <input
            type="text"
            placeholder="Paste .mp3 / .ogg URL…"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'7px', padding:'8px 12px', color:'#fff', fontSize:'0.8rem', fontFamily:'Inter, sans-serif', outline:'none' }}
            onFocus={e => (e.target.style.borderColor='#E50914')}
            onBlur={e  => (e.target.style.borderColor='rgba(255,255,255,0.1)')}
          />
          <button
            onClick={() => { if (url.trim()) { onSave(url.trim()); setUrl(''); } }}
            style={{ background:'#E50914', border:'none', borderRadius:'7px', padding:'0 12px', color:'#fff', fontSize:'0.75rem', fontFamily:'Inter, sans-serif', fontWeight:600, cursor:'pointer', flexShrink:0 }}
          >Save</button>
        </div>
      ) : (
        <>
          <input ref={fileRef} type="file" accept="audio/*" onChange={handleFile} style={{ display:'none' }} />
          <button onClick={() => fileRef.current?.click()} style={{ width:'100%', padding:'8px', borderRadius:'7px', border:'1px dashed rgba(255,255,255,0.15)', background:'transparent', color:'rgba(255,255,255,0.4)', fontSize:'0.78rem', fontFamily:'Inter, sans-serif', cursor:'pointer' }}>
            🎵 Choose audio file…
          </button>
        </>
      )}

      {/* Clear */}
      {currentUrl && (
        <button onClick={() => onSave('')} style={{ marginTop:'6px', background:'none', border:'none', color:'rgba(229,9,20,0.55)', fontSize:'0.7rem', cursor:'pointer', fontFamily:'Inter, sans-serif' }}>
          ✕ Remove track
        </button>
      )}
    </div>
  );
}

/* ─── Theme Picker ────────────────────────────────────── */
function ThemePicker() {
  const [activeId, setActiveId] = useState(getSavedThemeId);

  const pick = (id) => {
    setActiveId(id);
    applyTheme(id);
  };

  return (
    <div>
      <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.75rem', fontFamily:'Inter, sans-serif', marginBottom:'14px', lineHeight:1.6 }}>
        Choose a colour palette. Changes apply instantly across the entire site.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => pick(theme.id)}
            style={{
              background: activeId === theme.id ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.025)',
              border: `2px solid ${activeId === theme.id ? theme.vars['--accent'] : 'rgba(255,255,255,0.07)'}`,
              borderRadius:'12px', padding:'12px', cursor:'pointer',
              textAlign:'left', transition:'all 0.2s',
              boxShadow: activeId === theme.id ? `0 0 16px ${theme.vars['--accent']}30` : 'none',
            }}
          >
            {/* Colour swatches */}
            <div style={{ display:'flex', gap:'5px', marginBottom:'8px' }}>
              {theme.preview.map((col, i) => (
                <div key={i} style={{
                  width:'18px', height:'18px', borderRadius:'50%',
                  background: col,
                  border:'1px solid rgba(255,255,255,0.1)',
                  flexShrink:0,
                }} />
              ))}
            </div>
            {/* Name */}
            <p style={{
              color: activeId === theme.id ? '#fff' : 'rgba(255,255,255,0.6)',
              fontSize:'0.78rem', fontFamily:'Inter, sans-serif', fontWeight:600,
              marginBottom:'2px', lineHeight:1.2,
            }}>
              {theme.name}
              {activeId === theme.id && (
                <span style={{ marginLeft:'6px', color: theme.vars['--accent'], fontSize:'0.65rem' }}>✓ Active</span>
              )}
            </p>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.65rem', fontFamily:'Inter, sans-serif', lineHeight:1.4 }}>
              {theme.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Custom accent picker */}
      <div style={{ marginTop:'16px', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'14px 16px' }}>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Inter, sans-serif', fontWeight:600, marginBottom:'10px' }}>
          Custom Accent Colour
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <input
            type="color"
            defaultValue={getSavedThemeId() === 'crimson' ? '#E50914' : THEMES.find(t=>t.id===getSavedThemeId())?.vars['--accent'] || '#E50914'}
            onChange={e => {
              const v = e.target.value;
              const currentTheme = THEMES.find(t => t.id === activeId) || THEMES[0];
              document.documentElement.style.setProperty('--accent', v);
              document.documentElement.style.setProperty('--accent-light', v + 'cc');
              // Also update scrollbar with new accent + current bg
              applyTheme(activeId === 'custom' ? 'crimson' : activeId, v);
              setActiveId('custom');
            }}
            style={{ width:'40px', height:'40px', borderRadius:'8px', border:'none', cursor:'pointer', background:'none', padding:0 }}
          />
          <div>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem', fontFamily:'Inter, sans-serif', fontWeight:500 }}>Pick any accent</p>
            <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.68rem', fontFamily:'Inter, sans-serif' }}>Overrides the selected theme's accent</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Debounced Textarea ─────────────────────────────── */
function DebouncedTextarea({ value: externalValue, onSave, placeholder, rows = 5, style = {} }) {
  const [local, setLocal]   = useState(externalValue || '');
  const timerRef            = useRef(null);
  const isFocused           = useRef(false);

  // Sync external value only when not focused (avoids clobbering user input)
  useEffect(() => {
    if (!isFocused.current) {
      setLocal(externalValue || '');
    }
  }, [externalValue]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocal(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSave(val), 800);
  };

  const handleBlur = (e) => {
    isFocused.current = false;
    clearTimeout(timerRef.current);
    onSave(local);
    e.target.style.borderColor = 'rgba(255,255,255,0.12)';
  };

  return (
    <textarea
      value={local}
      onChange={handleChange}
      onFocus={e => { isFocused.current = true; e.target.style.borderColor = '#E50914'; }}
      onBlur={handleBlur}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px',
        padding: '12px 14px',
        color: '#fff',
        outline: 'none',
        resize: 'vertical',
        lineHeight: 1.8,
        transition: 'border-color 0.2s',
        ...style,
      }}
    />
  );
}

/* ─── Divider ─────────────────────────────────────────── */
function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0 20px' }}>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
      <span style={{ color: '#E50914', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );
}

/* ─── Gallery photo row ───────────────────────────────── */
function GalleryPhotoRow({ photo, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
      <img src={photo.src} alt="" style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
      <p style={{ flex: 1, color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {photo.label || 'Photo'}
      </p>
      <button onClick={onRemove} style={{ background: 'rgba(229,9,20,0.2)', border: '1px solid rgba(229,9,20,0.3)', color: '#E50914', borderRadius: '6px', padding: '4px 10px', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
        ✕
      </button>
    </div>
  );
}

/* ─── Main admin panel ────────────────────────────────── */
export default function AdminPanel({ onClose }) {
  const [authed,    setAuthed]    = useState(false);
  const [password,  setPassword]  = useState('');
  const [pwError,   setPwError]   = useState(false);
  const [toast,     setToast]     = useState(null);

  // useStore handles IDB resolution + live sync automatically
  const liveStore = useStore();
  // Keep a local copy so save() can do optimistic updates
  const [store, setStore] = useState(liveStore);
  useEffect(() => { setStore(liveStore); }, [liveStore]);

  // new gallery photo fields
  const [newPhotoSrc,   setNewPhotoSrc]   = useState('');
  const [newPhotoLabel, setNewPhotoLabel] = useState('');
  const newPhotoFileRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const save = async (patch) => {
    const next = { ...store, ...patch };
    setStore(next);          // instant in-memory update
    await writeStore(next);  // async — blobs go to IDB, config to localStorage
    showToast('✅ Saved!');
  };

  /* ── questions update ───────────────────────────────── */
  const updateQuestion = (id, field, value) => {
    const questions = store.questions.map(q => q.id === id ? { ...q, [field]: value } : q);
    save({ questions });
  };

  /* ── gallery ─────────────────────────────────────────── */
  const addGalleryPhoto = async (srcOrFile) => {
    let src = srcOrFile;
    if (srcOrFile instanceof File) {
      try {
        src = await uploadFile(srcOrFile, 'gallery');
      } catch (err) {
        console.error('Gallery upload failed:', err);
        console.warn('Upload failed, used local fallback');
        return;
      }
    }
    if (!src) return;
    const photos = [...store.galleryPhotos, { id: Date.now().toString(), src, label: newPhotoLabel || 'Memory' }];
    setNewPhotoSrc('');
    setNewPhotoLabel('');
    save({ galleryPhotos: photos });
  };

  const removeGalleryPhoto = (id) => {
    const photos = store.galleryPhotos.filter(p => p.id !== id);
    save({ galleryPhotos: photos });
  };

  /* ── login ───────────────────────────────────────────── */
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPassword('');
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', zIndex: 1000 }}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          background: '#111',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* ── Header ────────────────────────────────────── */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0d0d0d',
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#E50914', fontSize: '1.1rem' }}>⚙</span>
            <div>
              <p style={{ color: '#fff', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: 1 }}>
                Admin Panel
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                {authed ? 'Authenticated ✓' : 'Locked 🔒'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <div style={{ padding: '24px', flex: 1 }}>

          {/* ════ LOGIN ════════════════════════════════════ */}
          {!authed ? (
            <form onSubmit={handleLogin}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔐</div>
                <p style={{ color: '#fff', fontSize: '1rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, marginBottom: '6px' }}>
                  Enter Admin Password
                </p>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>
                  Only authorised access allowed
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPwError(false); }}
                />
                {pwError && (
                  <p style={{ color: '#E50914', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', marginTop: '6px' }}>
                    ✕ Incorrect password. Try again.
                  </p>
                )}
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#E50914',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                }}
              >
                Unlock Panel →
              </button>
            </form>

          ) : (
            /* ════ ADMIN CONTENT ══════════════════════════ */
            <>

              {/* ── 1. HERO VIDEO ───────────────────────── */}
              <Divider label="🎬 Hero Section" />

              <MediaPicker
                label="Background Video"
                accept="video/mp4,video/webm"
                currentSrc={store.heroVideo}
                onSave={(v) => save({ heroVideo: v })}
              />
              <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.7rem', fontFamily:'Inter, sans-serif', marginBottom:'16px', lineHeight:1.6, marginTop:'-16px' }}>
                💡 For best results, paste a video URL (Google Drive, Cloudinary, etc.) instead of uploading. Uploaded video files only work in the current session.
              </p>

              <MediaPicker
                label="Fallback Image (shown while video loads)"
                accept="image/*"
                currentSrc={store.heroFallback}
                onSave={(v) => save({ heroFallback: v })}
              />

              {/* ── 2. SECTION MUSIC ────────────────────── */}
              <Divider label="🎵 Section Music" />

              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.75rem', fontFamily:'Inter, sans-serif', marginBottom:'16px', lineHeight:1.6 }}>
                Set a different song for each section. Music crossfades automatically as Saill scrolls.
                Paste a direct audio URL (mp3/ogg/wav) or upload a file.
              </p>

              {SECTIONS.map(section => {
                const track = store.sectionTracks?.[section.id] || { url: '', name: '' };
                return (
                  <div key={section.id} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'14px 16px', marginBottom:'10px' }}>
                    {/* Section label */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                      <span style={{ fontSize:'1rem' }}>{section.icon}</span>
                      <p style={{ color:'#fff', fontSize:'0.82rem', fontFamily:'Inter, sans-serif', fontWeight:600 }}>
                        {section.label}
                      </p>
                      {track.url && (
                        <span style={{ marginLeft:'auto', color:'rgba(229,9,20,0.8)', fontSize:'0.62rem', fontFamily:'Inter, sans-serif', background:'rgba(229,9,20,0.1)', border:'1px solid rgba(229,9,20,0.2)', borderRadius:'10px', padding:'2px 8px' }}>
                          ♪ Set
                        </span>
                      )}
                    </div>

                    {/* Track name */}
                    <div style={{ marginBottom:'8px' }}>
                      <DebouncedInput
                        placeholder="Track name (e.g. Our Song)"
                        value={track.name || ''}
                        onSave={v => {
                          const tracks = { ...store.sectionTracks, [section.id]: { ...track, name: v } };
                          save({ sectionTracks: tracks });
                        }}
                      />
                    </div>

                    {/* Audio URL */}
                    <MusicPicker
                      currentUrl={track.url || ''}
                      onSave={url => {
                        const tracks = { ...store.sectionTracks, [section.id]: { ...track, url } };
                        save({ sectionTracks: tracks });
                      }}
                    />
                  </div>
                );
              })}

              {/* ── 3. SCRATCH CARD + QUESTIONS ─────────── */}
              <Divider label="🎁 Scratch Card & Questions" />

              {/* Single scratch photo */}
              <MediaPicker
                label="Scratch Card Photo (hidden behind scratch)"
                accept="image/*"
                currentSrc={store.scratchSrc}
                onSave={(v) => save({ scratchSrc: v })}
              />

              {/* Second surprise image */}
              <MediaPicker
                label="Second Surprise Image (shown below message after reveal)"
                accept="image/*"
                currentSrc={store.scratchSrc2}
                onSave={(v) => save({ scratchSrc2: v })}
              />

              <div style={{ marginBottom: '20px' }}>
                <Label>Card Label</Label>
                <DebouncedInput
                  placeholder="e.g. Our Special Surprise 💫"
                  value={store.scratchLabel || ''}
                  onSave={v => save({ scratchLabel: v })}
                />
              </div>

              {/* Reveal message */}
              <div style={{ marginBottom: '20px' }}>
                <Label>Reveal Message (shown after scratching)</Label>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontFamily: 'Inter, sans-serif', marginBottom: '8px', lineHeight: 1.5 }}>
                  This appears below the card with "Happy Birthday Sailu Nanna" once the photo is revealed.
                </p>
                <DebouncedTextarea
                  value={store.scratchRevealMessage || ''}
                  onSave={v => save({ scratchRevealMessage: v })}
                  placeholder="Write your birthday message here…"
                  rows={5}
                  style={{ fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {/* Preview of derived unlock code */}
              {(() => {
                const code = deriveCode(store.questions);
                const filled = store.questions.filter(q => q.answer?.trim()).length;
                return filled > 0 ? (
                  <div style={{ background:'rgba(229,9,20,0.08)', border:'1px solid rgba(229,9,20,0.2)', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px' }}>
                    <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Inter, sans-serif', marginBottom:'6px' }}>
                      Derived Unlock Code
                    </p>
                    <p style={{ color:'#E50914', fontSize:'1.4rem', fontFamily:'Playfair Display, serif', fontWeight:700, letterSpacing:'0.3em' }}>
                      {code.toUpperCase() || '—'}
                    </p>
                    <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.7rem', fontFamily:'Inter, sans-serif', marginTop:'4px' }}>
                      First letter of each answer · {filled}/4 answers set
                    </p>
                  </div>
                ) : null;
              })()}

              {/* 4 Questions */}
              <Label>Questions (4 required)</Label>
              {store.questions.map((q, i) => (
                <div key={q.id} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px', marginBottom:'12px' }}>
                  <p style={{ color:'#C9A84C', fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Inter, sans-serif', fontWeight:600, marginBottom:'10px' }}>
                    Question {i + 1}
                  </p>
                  <div style={{ marginBottom:'8px' }}>
                    <DebouncedInput
                      placeholder={`Question ${i+1} (shown to Saill)`}
                      value={q.question}
                      onSave={v => updateQuestion(q.id, 'question', v)}
                    />
                  </div>
                  <DebouncedInput
                    placeholder="Answer (only 1st letter is used as the code)"
                    value={q.answer}
                    onSave={v => updateQuestion(q.id, 'answer', v)}
                  />
                  {q.answer?.trim() && (
                    <p style={{ color:'rgba(229,9,20,0.7)', fontSize:'0.72rem', fontFamily:'Inter, sans-serif', marginTop:'6px' }}>
                      Code letter: <strong style={{ color:'#E50914', fontSize:'1rem', letterSpacing:'0.1em' }}>{q.answer.trim().charAt(0).toUpperCase()}</strong>
                    </p>
                  )}
                </div>
              ))}

              {/* ── 3. TIMELINE IMAGES ──────────────────── */}
              <Divider label="🖼️ Timeline Images" />

              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.75rem', fontFamily:'Inter, sans-serif', marginBottom:'16px', lineHeight:1.6 }}>
                Upload photos for each memory card. They appear when a card is opened.
              </p>

              {/* Childhood */}
              <p style={{ color:'#C9A84C', fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Inter, sans-serif', fontWeight:600, marginBottom:'10px' }}>
                👶 Childhood Timeline
              </p>
              {[
                { key:'c1', label:'A Star is Born' },
                { key:'c2', label:'Childhood Adventures' },
                { key:'c3', label:'Precious Memories' },
                { key:'c4', label:'Dreams Started Here' },
              ].map(item => (
                <div key={item.key} style={{ marginBottom:'16px' }}>
                  <MediaPicker
                    label={item.label}
                    accept="image/*"
                    currentSrc={store.timelineImages?.[item.key] || ''}
                    onSave={v => save({ timelineImages: { ...store.timelineImages, [item.key]: v || '' } })}
                  />
                </div>
              ))}

              {/* Our Story */}
              <p style={{ color:'#E50914', fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase', fontFamily:'Inter, sans-serif', fontWeight:600, margin:'16px 0 10px' }}>
                ❤️ Our Story Timeline
              </p>
              {[
                { key:'s1',  label:'Our First Conversation' },
                { key:'s2',  label:'Your First Smile' },
                { key:'s3',  label:'Our First Picture' },
                { key:'s4',  label:'Endless Conversations' },
                { key:'s5',  label:'Beautiful Memories' },
                { key:'s6',  label:'Adventures Together' },
                { key:'s7',  label:'Silly Moments' },
                { key:'s8',  label:'Through Every High & Low' },
                { key:'s9',  label:'Special Days Together' },
                { key:'s10', label:'Today' },
              ].map(item => (
                <div key={item.key} style={{ marginBottom:'16px' }}>
                  <MediaPicker
                    label={item.label}
                    accept="image/*"
                    currentSrc={store.timelineImages?.[item.key] || ''}
                    onSave={v => save({ timelineImages: { ...store.timelineImages, [item.key]: v || '' } })}
                  />
                </div>
              ))}

              {/* ── 4. BIRTHDAY LETTER ──────────────────── */}
              <Divider label="💌 Birthday Letter" />

              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.75rem', fontFamily:'Inter, sans-serif', marginBottom:'10px', lineHeight:1.6 }}>
                Write Saill's birthday letter here. It appears in the final Birthday section.
                Separate paragraphs with a blank line.
              </p>
              <DebouncedTextarea
                value={store.birthdayLetter || ''}
                onSave={v => save({ birthdayLetter: v })}
                placeholder={"Dear Saill,\n\nWrite your heartfelt message here...\n\nWith love ❤️"}
                rows={8}
                style={{
                  fontSize: '0.88rem',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontStyle: 'italic',
                  marginBottom: '16px',
                }}
              />

              {/* ── 5. COLOUR THEME ─────────────────────── */}
              <Divider label="🎨 Colour Theme" />

              <ThemePicker />

              {/* ── 6. GALLERY PHOTOS ───────────────────── */}
              <Divider label="🖼️ Gallery Photos" />

              {/* Existing photos */}
              {store.galleryPhotos.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  {store.galleryPhotos.map(p => (
                    <GalleryPhotoRow
                      key={p.id}
                      photo={p}
                      onRemove={() => removeGalleryPhoto(p.id)}
                    />
                  ))}
                </div>
              )}

              {/* Add new */}
              <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '8px' }}>
                <Label>Add New Photo</Label>

                <div style={{ marginBottom: '10px' }}>
                  <Input
                    placeholder="Label (e.g. Our first adventure)"
                    value={newPhotoLabel}
                    onChange={e => setNewPhotoLabel(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    placeholder="Paste image URL…"
                    value={newPhotoSrc}
                    onChange={e => setNewPhotoSrc(e.target.value)}
                  />
                  <button
                    onClick={() => { if (newPhotoSrc.trim()) addGalleryPhoto(newPhotoSrc.trim()); }}
                    style={{ background: '#E50914', border: 'none', borderRadius: '8px', padding: '0 14px', color: '#fff', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >
                    Add
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0', color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  or upload file
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>

                <input
                  ref={newPhotoFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files[0]; if (f) addGalleryPhoto(f); e.target.value = ''; }}
                />
                <button
                  onClick={() => newPhotoFileRef.current?.click()}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.18)', background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                >
                  📁 Choose file…
                </button>
              </div>

              {/* ── Danger zone ─────────────────────────── */}
              <Divider label="⚠ Danger Zone" />

              <button
                onClick={() => {
                  if (window.confirm('Reset ALL media to defaults? This cannot be undone.')) {
                    const def = {
                      heroVideo: null, heroFallback: null,
                      scratchSrc: null,
                      scratchLabel: 'Our Special Surprise 💫',
                      scratchRevealMessage: '',
                      surpriseBg: null,
                      birthdayLetter: '',
                      questions: store.questions.map(q => ({ ...q, answer: '' })),
                      galleryPhotos: [],
                      timelineImages: Object.fromEntries(Object.keys(store.timelineImages||{}).map(k=>[k,''])),
                      sectionTracks: Object.fromEntries(
                        Object.keys(store.sectionTracks || {}).map(k => [k, { url:'', name:'' }])
                      ),
                    };
                    writeStore(def); setStore(def);
                    showToast('🗑 All media cleared', 'error');
                  }
                }}
                style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid rgba(229,9,20,0.3)', background: 'rgba(229,9,20,0.08)', color: 'rgba(229,9,20,0.8)', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', cursor: 'pointer', fontWeight: 500 }}
              >
                🗑 Clear All Media
              </button>

              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '20px', lineHeight: 1.7 }}>
                All media is stored in browser localStorage.<br />
                Replace with a database/storage bucket later.
              </p>
            </>
          )}
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </>
  );
}
