import { config } from './config';
import type {
  ChallengesResponse,
  CompletePayload,
  CompleteResponse,
  EventPayload,
  LeadPayload,
  LeadResponse,
  SharePayload,
  StartPayload,
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

// Fire-and-forget — analytics shouldn't block UX. keepalive lets the request
// finish even when the click opens a new tab or navigates away.
function beacon(path: string, payload: unknown): void {
  fetch(url(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    /* ignore */
  });
}

export function postShare(payload: SharePayload): void {
  beacon('/api/share', payload);
}

export function postStart(payload: StartPayload): void {
  beacon('/api/start', payload);
}

export function postEvent(payload: EventPayload): void {
  beacon('/api/event', payload);
}
