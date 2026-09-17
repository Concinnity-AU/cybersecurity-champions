/* POST /api/start — records a challenge start (funnel stage 1) with its
   first-touch attribution. Idempotent per session_id. */

import { z } from 'zod';
import { AttributionSchema } from '../_shared/attribution';
import type { Env } from '../_shared/types';

const Schema = AttributionSchema.extend({
  session_id: z.string().uuid(),
  embedded: z.boolean().default(false),
  language: z.string().min(2).max(8).default('en'),
});

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 400 });
  const d = parsed.data;

  await env.DB
    .prepare(
      `INSERT OR IGNORE INTO sessions
         (session_id, utm_source, utm_medium, utm_campaign, utm_content, referrer, embedded, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      d.session_id,
      d.utm_source,
      d.utm_medium,
      d.utm_campaign,
      d.utm_content,
      d.referrer,
      d.embedded ? 1 : 0,
      d.language,
    )
    .run();

  return new Response(null, { status: 204 });
};
