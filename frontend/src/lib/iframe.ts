import { useEffect } from 'react';
import { isEmbedded } from './config';

/* Post the current document height to the parent so the embed iframe
   can resize. We debounce via requestAnimationFrame and also listen
   for resize/mutation events so any internal layout change re-posts.
   The `is-embed` class on <html> is set once at startup so CSS can
   drop viewport-relative sizing that would create resize feedback loops. */

if (typeof document !== 'undefined' && isEmbedded) {
  document.documentElement.classList.add('is-embed');
}

const HEIGHT_HYSTERESIS_PX = 4;
let lastPostedHeight = 0;

export function postHeight(): void {
  if (!isEmbedded) return;
  try {
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );
    // Hysteresis: ignore tiny deltas that would otherwise create an
    // oscillation loop with the parent.
    if (Math.abs(h - lastPostedHeight) < HEIGHT_HYSTERESIS_PX) return;
    lastPostedHeight = h;
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
