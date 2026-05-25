/* POST /api/share — records a share event for analytics. */

import { z } from 'zod';
import type { Env } from '../_shared/types';

const Schema = z.object({
  session_id: z.string().uuid(),
  platform: z.enum(['facebook', 'whatsapp', 'copy', 'native', 'twitter']),
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
  const data = parsed.data;

  const completion = await env.DB
    .prepare('SELECT id FROM completions WHERE session_id = ?')
    .bind(data.session_id)
    .first<{ id: number }>();

  if (!completion) return new Response(null, { status: 204 });

  await env.DB
    .prepare('INSERT INTO shares (completion_id, platform) VALUES (?, ?)')
    .bind(completion.id, data.platform)
    .run();

  return new Response(null, { status: 204 });
};
