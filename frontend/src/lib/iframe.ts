import { useEffect } from 'react';
import { isEmbedded } from './config';

/* Post the current document height to the parent so the embed iframe
   can resize. We debounce via requestAnimationFrame and also listen
   for resize/mutation events so any internal layout change re-posts. */

export function postHeight(): void {
  if (!isEmbedded) return;
  try {
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );
    window.parent.postMessage({ type: 'cybersec:resize', height: h }, '*');
  } catch {
    /* ignore — cross-origin parents will reject silently */
  }
}

export function useAutoResize(dep: unknown): void {
  useEffect(() => {
    if (!isEmbedded) return;
    let raf = 0;
    const fire = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(postHeight);
    };
    fire();
    const ro = new ResizeObserver(fire);
    ro.observe(document.body);
    window.addEventListener('resize', fire);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', fire);
    };
  }, [dep]);
}
