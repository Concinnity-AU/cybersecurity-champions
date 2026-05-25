/* GET /og/:session_id.png — personalised 1200×630 OG image. */

import { renderOgPng } from '../_shared/og-image';
import { tierFor } from '../_shared/tiers';
import type { Env, Tier } from '../_shared/types';

interface LookupRow {
  score: number;
  total: number;
  tier: string;
  first_name: string | null;
}

export const onRequestGet: PagesFunction<Env, 'session_id'> = async ({ params, env, request }) => {
  const sessionId = String(params.session_id || '');
  if (!sessionId) return new Response('Not found', { status: 404 });

  let input: { score: number; total: number; tier: Tier; firstName: string | null };
  const row = await env.DB
    .prepare(
      `SELECT c.score, c.total, c.tier, l.first_name
         FROM completions c
         LEFT JOIN leads l ON l.id = c.lead_id
        WHERE c.session_id = ?`,
    )
    .bind(sessionId)
    .first<LookupRow>();

  if (!row) {
    input = { score: 10, total: 10, tier: 'champion', firstName: null };
  } else {
    input = {
      score: row.score,
      total: row.total,
      tier: (row.tier as Tier) || tierFor(row.score),
      firstName: row.first_name,
    };
  }

  try {
    const png = await renderOgPng({ ...input, domain: env.PRIMARY_DOMAIN, requestUrl: request.url });
    return new Response(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(png.byteLength),
      },
    });
  } catch (e) {
    console.error('OG render failed:', e);
    return new Response('OG render failed', { status: 500 });
  }
};
