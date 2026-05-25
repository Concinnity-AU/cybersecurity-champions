/* POST /api/complete — records an anonymous completion. */

import { z } from 'zod';
import { tierFor } from '../_shared/tiers';
import type { Env } from '../_shared/types';

const Schema = z.object({
  session_id: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  total: z.number().int().min(1).max(100),
  max_streak: z.number().int().min(0).max(100),
  duration_seconds: z.number().int().min(0).max(86400).optional(),
  challenges_seen: z.array(z.string().min(1)).min(1),
  answers: z
    .array(
      z.object({
        key: z.string().min(1),
        answer: z.string().min(1),
        correct: z.boolean(),
        timeMs: z.number().int().min(0),
      }),
    )
    .min(1),
  language: z.string().min(2).max(8).default('en'),
});

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return json({ error: 'Validation failed', details: parsed.error.issues }, 400);
  }
  const data = parsed.data;
  const tier = tierFor(data.score);
  const primary = env.PRIMARY_DOMAIN;
  const shareUrl = `https://${primary}/r/${data.session_id}`;
  const ogImageUrl = `https://${primary}/og/${data.session_id}.png`;

  const existing = await env.DB
    .prepare('SELECT id FROM completions WHERE session_id = ?')
    .bind(data.session_id)
    .first<{ id: number }>();

  let completionId: number;
  if (existing) {
    await env.DB
      .prepare(
        `UPDATE completions
            SET score = ?, total = ?, max_streak = ?, tier = ?,
                duration_seconds = ?, challenges_seen = ?, answers = ?, language = ?
          WHERE session_id = ?`,
      )
      .bind(
        data.score,
        data.total,
        data.max_streak,
        tier,
        data.duration_seconds ?? null,
        JSON.stringify(data.challenges_seen),
        JSON.stringify(data.answers),
        data.language,
        data.session_id,
      )
      .run();
    completionId = existing.id;
  } else {
    const ins = await env.DB
      .prepare(
        `INSERT INTO completions
           (session_id, score, total, max_streak, tier, duration_seconds,
            challenges_seen, answers, language)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        data.session_id,
        data.score,
        data.total,
        data.max_streak,
        tier,
        data.duration_seconds ?? null,
        JSON.stringify(data.challenges_seen),
        JSON.stringify(data.answers),
        data.language,
      )
      .run();
    completionId = Number(ins.meta.last_row_id);
  }

  return json(
    {
      completion_id: completionId,
      session_id: data.session_id,
      tier,
      share_url: shareUrl,
      og_image_url: ogImageUrl,
    },
    201,
  );
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
