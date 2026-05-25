/* POST /api/lead — captures a lead and links to the completion via session_id. */

import { z } from 'zod';
import { verifyTurnstile } from '../_shared/turnstile';
import type { Env } from '../_shared/types';

const Schema = z.object({
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
  utm_source: z.string().max(120).nullable().optional(),
  utm_medium: z.string().max(120).nullable().optional(),
  utm_campaign: z.string().max(120).nullable().optional(),
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
         (first_name, email, phone, postcode, language, consent_program, consent_marketing,
          utm_source, utm_medium, utm_campaign)
       VALUES (?, ?, ?, ?, 'en', ?, ?, ?, ?, ?)`,
    )
    .bind(
      data.first_name,
      data.email,
      data.phone ?? null,
      data.postcode ?? null,
      data.consent_program ? 1 : 0,
      data.consent_marketing ? 1 : 0,
      data.utm_source ?? null,
      data.utm_medium ?? null,
      data.utm_campaign ?? null,
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
