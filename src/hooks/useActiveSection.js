/**
 * useActiveSection
 * Watches all section IDs via IntersectionObserver and returns
 * the one that is most visible in the viewport.
 */
import { useState, useEffect } from 'react';
import { SECTIONS } from './useMediaStore';

const SECTION_IDS = SECTIONS.map(s => s.id);

export default function useActiveSection() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const ratios = {};

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          ratios[e.target.id] = e.intersectionRatio;
        });
        // Pick the section with the highest visible ratio
        let best = 'home', bestRatio = -1;
        SECTION_IDS.forEach(id => {
          if ((ratios[id] ?? 0) > bestRatio) {
            bestRatio = ratios[id] ?? 0;
            best = id;
          }
        });
        setActive(best);
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i * 0.05),
        rootMargin: '-10% 0px -10% 0px',
      }
    );

    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}
