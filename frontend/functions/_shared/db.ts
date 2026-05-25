/* D1 query helpers. */

import type { DbChallengeRow, DbTranslationRow, ChallengeType } from './types';

export interface JoinedChallenge {
  key: string;
  type: ChallengeType;
  category: string;
  difficulty: number;
  metadata: unknown;
  prompt: string;
  options: unknown;
  correct_answer: string;
  explanation: string;
}

export async function fetchActiveChallenges(
  db: D1Database,
  lang: string,
): Promise<JoinedChallenge[]> {
  const stmt = db.prepare(
    `SELECT c.key, c.type, c.category, c.difficulty, c.correct_answer, c.metadata,
            t.prompt, t.options, t.explanation
       FROM challenges c
       JOIN challenge_translations t
         ON t.challenge_id = c.id
        AND t.language_code = ?
      WHERE c.is_active = 1`,
  );
  const result = await stmt.bind(lang).all<DbChallengeRow & DbTranslationRow>();
  const rows = result.results || [];
  return rows.map((r) => ({
    key: r.key,
    type: r.type,
    category: r.category,
    difficulty: r.difficulty,
    correct_answer: r.correct_answer,
    metadata: safeJson(r.metadata),
    prompt: r.prompt,
    options: safeJson(r.options),
    explanation: r.explanation,
  }));
}

export function safeJson(s: string | null | undefined): unknown {
  if (s == null) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
