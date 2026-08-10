import { useState, useEffect } from 'react';
import { readStore } from './useMediaStore';

export default function useStore() {
  const [store, setStore] = useState(readStore);

  useEffect(() => {
    const h = e => setStore({ ...e.detail });
    window.addEventListener('saill_store_updated', h);
    return () => window.removeEventListener('saill_store_updated', h);
  }, []);

  return store;
}
