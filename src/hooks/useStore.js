/**
 * useStore
 * ─────────────────────────────────────────────────────────
 * Single reactive hook for all site components.
 *
 * Boot sequence:
 *  1. readStore() — instant sync (may contain __idb__: refs)
 *  2. readStoreAsync() — resolves IDB refs → real dataURLs (~5ms)
 *  3. On every admin save: re-resolves the freshly-dispatched data
 */

import { useState, useEffect } from 'react';
import { readStore, readStoreAsync, restoreBlobs } from './useMediaStore';

export default function useStore() {
  const [store, setStore] = useState(readStore); // immediate bootstrap

  // On mount: resolve any __idb__ refs that survived from last session
  useEffect(() => {
    let cancelled = false;
    readStoreAsync().then(full => {
      if (!cancelled) setStore(full);
    });
    return () => { cancelled = true; };
  }, []);

  // On every admin save: the event carries the latest data.
  // It may still contain raw base64 (fast path) or __idb__ refs (if
  // the save path went through IDB). Resolve either way.
  useEffect(() => {
    let cancelled = false;
    const h = async (e) => {
      try {
        const resolved = await restoreBlobs(e.detail);
        if (!cancelled) setStore(resolved);
      } catch {
        // fallback — use raw detail as-is
        if (!cancelled) setStore({ ...e.detail });
      }
    };
    window.addEventListener('saill_store_updated', h);
    return () => {
      cancelled = true;
      window.removeEventListener('saill_store_updated', h);
    };
  }, []);

  return store;
}
