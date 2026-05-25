/* GET /api/challenges?lang=en&count=10 */

import { fetchActiveChallenges } from '../_shared/db';
import { selectChallenges } from '../_shared/selection';
import type { Env } from '../_shared/types';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'en';
  const count = Math.min(
    Math.max(parseInt(url.searchParams.get('count') || '10', 10) || 10, 1),
    15,
  );

  const pool = await fetchActiveChallenges(env.DB, lang);
  if (pool.length === 0) {
    return new Response(
      JSON.stringify({ error: 'No active challenges available' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const selected = selectChallenges(pool, count);
  const session_id = crypto.randomUUID();

  return new Response(
    JSON.stringify({
      session_id,
      challenges: selected.map((c) => ({
        key: c.key,
        type: c.type,
        category: c.category,
        difficulty: c.difficulty,
        metadata: c.metadata,
        prompt: c.prompt,
        options: c.options,
        correct_answer: c.correct_answer,
        explanation: c.explanation,
      })),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
