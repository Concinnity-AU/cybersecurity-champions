import { config } from './config';
import type {
  ChallengesResponse,
  CompletePayload,
  CompleteResponse,
  LeadPayload,
  LeadResponse,
  SharePayload,
} from './types';

const url = (path: string) => `${config.apiBase}${path}`;

async function jsonFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      /* ignore */
    }
    throw new Error(`HTTP ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
}

export function fetchChallenges(lang = 'en', count = 10): Promise<ChallengesResponse> {
  return jsonFetch<ChallengesResponse>(
    url(`/api/challenges?lang=${encodeURIComponent(lang)}&count=${count}`),
  );
}

export function postComplete(payload: CompletePayload): Promise<CompleteResponse> {
  return jsonFetch<CompleteResponse>(url('/api/complete'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function postLead(payload: LeadPayload): Promise<LeadResponse> {
  return jsonFetch<LeadResponse>(url('/api/lead'), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function postShare(payload: SharePayload): void {
  // Fire-and-forget — analytics shouldn't block UX
  fetch(url('/api/share'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}
