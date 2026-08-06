/**
 * useTheme — applies CSS custom-property themes site-wide
 * Persisted in localStorage under key "saill_theme"
 */

import { useEffect, useState } from 'react';

export const THEMES = [
  {
    id: 'crimson',
    name: 'Crimson Night',
    desc: 'The original — deep red passion on pure black.',
    preview: ['#E50914', '#C9A84C', '#0B0B0B'],
    vars: {
      '--accent':       '#E50914',
      '--accent-light': '#ff2d38',
      '--gold':         '#C9A84C',
      '--bg':           '#0B0B0B',
      '--secondary':    '#181818',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    desc: 'Soft rose blush with warm gold — romantic and luxe.',
    preview: ['#C2185B', '#F48FB1', '#0d0a0b'],
    vars: {
      '--accent':       '#C2185B',
      '--accent-light': '#e91e63',
      '--gold':         '#F8BBD0',
      '--bg':           '#0d0a0b',
      '--secondary':    '#1a1015',
    },
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    desc: 'Deep ocean blue with a shimmer of silver.',
    preview: ['#1565C0', '#90CAF9', '#060a12'],
    vars: {
      '--accent':       '#1976D2',
      '--accent-light': '#42A5F5',
      '--gold':         '#90CAF9',
      '--bg':           '#060a12',
      '--secondary':    '#0d1520',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Dream',
    desc: 'Rich forest green with golden accents.',
    preview: ['#1B5E20', '#A5D6A7', '#060d08'],
    vars: {
      '--accent':       '#2E7D32',
      '--accent-light': '#43A047',
      '--gold':         '#A5D6A7',
      '--bg':           '#060d08',
      '--secondary':    '#0e1a10',
    },
  },
  {
    id: 'violet',
    name: 'Velvet Violet',
    desc: 'Deep purple luxury with golden shimmer.',
    preview: ['#6A1B9A', '#CE93D8', '#09050e'],
    vars: {
      '--accent':       '#7B1FA2',
      '--accent-light': '#AB47BC',
      '--gold':         '#CE93D8',
      '--bg':           '#09050e',
      '--secondary':    '#130a1a',
    },
  },
  {
    id: 'sunset',
    name: 'Golden Sunset',
    desc: 'Warm amber and orange — a sky on fire.',
    preview: ['#E65100', '#FFB74D', '#0e0904'],
    vars: {
      '--accent':       '#E65100',
      '--accent-light': '#FF6D00',
      '--gold':         '#FFB74D',
      '--bg':           '#0e0904',
      '--secondary':    '#1a1208',
    },
  },
];

const THEME_KEY = 'saill_theme';
const SCROLLBAR_STYLE_ID = 'saill-scrollbar-style';

/**
 * Injects a <style> tag with scrollbar + body-bg rules using
 * literal colour values (not CSS vars) so the browser always
 * picks them up immediately.
 */
function injectScrollbarStyle(bg, accent) {
  let el = document.getElementById(SCROLLBAR_STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = SCROLLBAR_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = `
    html, body {
      background-color: ${bg} !important;
    }
    ::-webkit-scrollbar {
      width: 4px;
    }
    ::-webkit-scrollbar-track {
      background: ${bg};
    }
    ::-webkit-scrollbar-thumb {
      background: ${accent};
      border-radius: 2px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${accent}cc;
    }
    /* Firefox */
    * {
      scrollbar-width: thin;
      scrollbar-color: ${accent} ${bg};
    }
  `;
}

export function getSavedThemeId() {
  try { return localStorage.getItem(THEME_KEY) || 'crimson'; }
  catch { return 'crimson'; }
}

export function applyTheme(themeId, customAccent = null) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root  = document.documentElement;

  // Apply all CSS vars
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));

  // If a custom accent was passed, override accent vars
  if (customAccent) {
    root.style.setProperty('--accent', customAccent);
    root.style.setProperty('--accent-light', customAccent + 'cc');
  }

  // Inject concrete scrollbar + bg styles
  const accent = customAccent || theme.vars['--accent'];
  const bg     = theme.vars['--bg'];
  injectScrollbarStyle(bg, accent);

  try { localStorage.setItem(THEME_KEY, themeId); } catch {}
  window.dispatchEvent(new CustomEvent('saill_theme_changed', { detail: { themeId, accent, bg } }));
}

export default function useTheme() {
  const [themeId, setThemeId] = useState(getSavedThemeId);

  // Apply on mount
  useEffect(() => { applyTheme(themeId); }, []);

  // Sync across tabs / admin panel
  useEffect(() => {
    const h = (e) => setThemeId(e.detail.themeId);
    window.addEventListener('saill_theme_changed', h);
    return () => window.removeEventListener('saill_theme_changed', h);
  }, []);

  const setTheme = (id) => {
    setThemeId(id);
    applyTheme(id);
  };

  return { themeId, setTheme, themes: THEMES };
}
