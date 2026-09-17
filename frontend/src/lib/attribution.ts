/* Campaign attribution — captured once on landing, reused for every retake
   in the same tab.

   Standalone (cybersecurity.tims.org.au/?utm_source=…): UTMs are read from our
   own URL and the referrer from document.referrer.

   Embedded (Squarespace iframe): the parent page's UTMs are invisible to us, so
   the embed snippet copies them onto the iframe src, plus `ref` — the parent's
   referrer hostname. See embed/EMBED_SNIPPET.html.

   Only hostnames are kept for referrers — never paths or query strings. */

import { isEmbedded } from './config';
import type { Attribution } from './types';

const STORAGE_KEY = 'cc_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  referrer: null,
};

let cached: Attribution | null = null;

function hostOf(value: string | null): string | null {
  if (!value) return null;
  try {
    const host = new URL(value.includes('://') ? value : `https://${value}`).hostname.toLowerCase();
    return host && host !== window.location.hostname ? host : null;
  } catch {
    return null;
  }
}

function clip(value: string | null): string | null {
  const v = value?.trim();
  return v ? v.slice(0, 120) : null;
}

function fromUrl(): Attribution {
  const p = new URLSearchParams(window.location.search);
  const out: Attribution = { ...EMPTY };
  for (const k of UTM_KEYS) out[k] = clip(p.get(k));
  out.referrer = hostOf(isEmbedded ? p.get('ref') ?? document.referrer : document.referrer);
  return out;
}

export function getAttribution(): Attribution {
  if (cached) return cached;
  try {
    const current = fromUrl();
    const hasUtm = UTM_KEYS.some((k) => current[k]);
    const stored = sessionStorage.getItem(STORAGE_KEY);
    // A fresh campaign click wins; otherwise keep the tab's first touch.
    if (!hasUtm && stored) {
      cached = { ...EMPTY, ...(JSON.parse(stored) as Partial<Attribution>) };
    } else {
      cached = current;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch {
    try {
      cached = fromUrl();
    } catch {
      cached = { ...EMPTY };
    }
  }
  return cached;
}
