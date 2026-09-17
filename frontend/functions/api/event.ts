/* POST /api/event — records a click-level funnel step (course CTA, workshop link).
   Ignored unless the session was started, mirroring /api/share. */

import { z } from 'zod';
import type { Env } from '../_shared/types';

const Schema = z.object({
  session_id: z.string().uuid(),
  event_type: z.enum(['course_cta_click', 'workshop_click']),
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
      `INSERT INTO events (session_id, event_type)
       SELECT ?, ? WHERE EXISTS (SELECT 1 FROM sessions WHERE session_id = ?)`,
    )
    .bind(d.session_id, d.event_type, d.session_id)
    .run();

  return new Response(null, { status: 204 });
};
