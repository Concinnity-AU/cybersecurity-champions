/* Runtime config. In production, Cloudflare Pages writes window.__CONFIG__
   via a tiny inline script; in dev, we fall back to Vite env vars. */

import type { AppConfig } from './types';

declare global {
  interface Window {
    __CONFIG__?: Partial<AppConfig>;
  }
}

const env = import.meta.env;

export const config: AppConfig = {
  apiBase: window.__CONFIG__?.apiBase ?? env.VITE_API_BASE ?? '',
  turnstileSiteKey:
    window.__CONFIG__?.turnstileSiteKey ??
    env.VITE_TURNSTILE_SITE_KEY ??
    '1x00000000000000000000AA',
  tribalHabitsEnrolUrl:
    window.__CONFIG__?.tribalHabitsEnrolUrl ??
    env.VITE_TRIBAL_HABITS_ENROL_URL ??
    'https://tims.org.au/cybersecurity',
  workshopEnquiryUrl:
    window.__CONFIG__?.workshopEnquiryUrl ??
    env.VITE_WORKSHOP_ENQUIRY_URL ??
    'mailto:connect@tims.org.au?subject=Cybersecurity%20Champions%20Workshop',
  scamwatchSubscribeUrl:
    window.__CONFIG__?.scamwatchSubscribeUrl ??
    env.VITE_SCAMWATCH_SUBSCRIBE_URL ??
    'https://www.scamwatch.gov.au/about-us/news-and-alerts/subscribe-to-scam-alert-emails',
  primaryDomain:
    window.__CONFIG__?.primaryDomain ??
    env.VITE_PRIMARY_DOMAIN ??
    'cybersecurity.tims.org.au',
};

export const isEmbedded = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

export function getUtmParams(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
} {
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get('utm_source'),
      utm_medium: p.get('utm_medium'),
      utm_campaign: p.get('utm_campaign'),
    };
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }
}
