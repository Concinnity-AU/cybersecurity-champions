/* Lightweight loader for Cloudflare Turnstile.
   We use the explicit-render flow so we control mount/unmount. */

import { useEffect, useRef, useState } from 'react';

interface TurnstileWindow extends Window {
  turnstile?: {
    render: (
      el: HTMLElement,
      opts: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        size?: 'normal' | 'compact' | 'invisible' | 'flexible';
        appearance?: 'always' | 'execute' | 'interaction-only';
        theme?: 'auto' | 'light' | 'dark';
      },
    ) => string;
    reset: (widgetId?: string) => void;
    remove: (widgetId: string) => void;
    execute: (widgetId: string) => void;
  };
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

let loadPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  const w = window as TurnstileWindow;
  if (w.turnstile) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Turnstile'));
    };
    document.head.appendChild(s);
  });
  return loadPromise;
}

/* Hook: invisible Turnstile that produces a token on demand. */
export function useTurnstile(sitekey: string): {
  ref: React.RefObject<HTMLDivElement>;
  getToken: () => Promise<string>;
  reset: () => void;
  ready: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const tokenResolverRef = useRef<((t: string) => void) | null>(null);
  const tokenRejecterRef = useRef<((e: Error) => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadScript()
      .then(() => {
        if (!mounted || !ref.current) return;
        const w = window as TurnstileWindow;
        if (!w.turnstile) return;
        widgetIdRef.current = w.turnstile.render(ref.current, {
          sitekey,
          size: 'invisible',
          appearance: 'interaction-only',
          callback: (token: string) => {
            tokenResolverRef.current?.(token);
            tokenResolverRef.current = null;
            tokenRejecterRef.current = null;
          },
          'error-callback': () => {
            tokenRejecterRef.current?.(new Error('Turnstile error'));
            tokenResolverRef.current = null;
            tokenRejecterRef.current = null;
          },
        });
        setReady(true);
      })
      .catch((e) => {
        console.warn('Turnstile load failed:', e);
      });
    return () => {
      mounted = false;
      const w = window as TurnstileWindow;
      if (widgetIdRef.current && w.turnstile) {
        try {
          w.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [sitekey]);

  const getToken = (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const w = window as TurnstileWindow;
      if (!widgetIdRef.current || !w.turnstile) {
        reject(new Error('Turnstile not ready'));
        return;
      }
      tokenResolverRef.current = resolve;
      tokenRejecterRef.current = reject;
      try {
        w.turnstile.execute(widgetIdRef.current);
      } catch (e) {
        reject(e instanceof Error ? e : new Error(String(e)));
      }
      setTimeout(() => {
        if (tokenRejecterRef.current) {
          tokenRejecterRef.current(new Error('Turnstile timed out'));
          tokenResolverRef.current = null;
          tokenRejecterRef.current = null;
        }
      }, 15000);
    });
  };

  const reset = () => {
    const w = window as TurnstileWindow;
    if (widgetIdRef.current && w.turnstile) {
      try {
        w.turnstile.reset(widgetIdRef.current);
      } catch {
        /* ignore */
      }
    }
  };

  return { ref, getToken, reset, ready };
}
