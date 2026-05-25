import type { Tier } from './types';

export function tierFor(score: number): Tier {
  if (score >= 9) return 'champion';
  if (score >= 7) return 'defender';
  if (score >= 4) return 'aware';
  return 'learner';
}

export const TIER_LABELS: Record<Tier, string> = {
  learner: 'Cyber Learner',
  aware: 'Cyber Aware',
  defender: 'Cyber Defender',
  champion: 'Cyber Champion',
};

export const TIER_COLORS: Record<Tier, string> = {
  learner: '#F15A29',
  aware: '#F0C020',
  defender: '#2E8B65',
  champion: '#FFA51C',
};
