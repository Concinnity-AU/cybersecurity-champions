/* Server-side types shared across Pages Functions. */

export interface Env {
  DB: D1Database;
  TURNSTILE_SECRET: string;
  TURNSTILE_SITE_KEY: string;
  PRIMARY_DOMAIN: string;
  EMBED_PARENT_DOMAINS: string;
}

export type ChallengeType = 'spot_it' | 'pick_stronger' | 'scenario' | 'real_ai';
export type Tier = 'learner' | 'aware' | 'defender' | 'champion';

export interface DbChallengeRow {
  id: number;
  key: string;
  type: ChallengeType;
  category: string;
  difficulty: number;
  correct_answer: string;
  metadata: string | null;
  source_note: string | null;
}

export interface DbTranslationRow {
  challenge_id: number;
  prompt: string;
  options: string;
  explanation: string;
}
