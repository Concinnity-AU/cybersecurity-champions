/* POST /api/lead — captures an optional "updates and resources" sign-up.
   Stored with its session_id and attribution, and linked to the completion
   (if any). A lead is a separate measure from a completion, not a gate. */

import { z } from 'zod';
import { AttributionSchema } from '../_shared/attribution';
import { verifyTurnstile } from '../_shared/turnstile';
import type { Env } from '../_shared/types';

const Schema = AttributionSchema.extend({
  session_id: z.string().uuid(),
  first_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+0-9\s()-]{6,}$/i, 'Looks like an invalid phone number')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  postcode: z
    .string()
    .trim()
    .regex(/^\d{4}$/)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  consent_program: z.boolean(),
  consent_marketing: z.boolean().default(false),
  turnstile_token: z.string().min(1),
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

  if (!data.consent_program) {
    return json({ error: 'consent_program is required' }, 400);
  }

  const ok = await verifyTurnstile(data.turnstile_token, env.TURNSTILE_SECRET);
  if (!ok) {
    return json({ error: 'Turnstile verification failed' }, 403);
  }

  const ins = await env.DB
    .prepare(
      `INSERT INTO leads
         (session_id, first_name, email, phone, postcode, language, consent_program,
          consent_marketing, utm_source, utm_medium, utm_campaign, utm_content, referrer)
       VALUES (?, ?, ?, ?, ?, 'en', ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      data.session_id,
      data.first_name,
      data.email,
      data.phone ?? null,
      data.postcode ?? null,
      data.consent_program ? 1 : 0,
      data.consent_marketing ? 1 : 0,
      data.utm_source,
      data.utm_medium,
      data.utm_campaign,
      data.utm_content,
      data.referrer,
    )
    .run();
  const leadId = Number(ins.meta.last_row_id);

  await env.DB
    .prepare('UPDATE completions SET lead_id = ? WHERE session_id = ?')
    .bind(leadId, data.session_id)
    .run();

  return json({ ok: true, lead_id: leadId }, 201);
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
