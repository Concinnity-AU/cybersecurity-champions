/* Challenge selection algorithm.
   Distribution: 4 spot_it, 2 pick_stronger, 3 scenario, 1 real_ai.
   Within spot_it, ensure ≥1 "legit" trick is included.
   Difficulty: ascending overall, with one difficulty-3 placed around q7-q8.
   Fall back gracefully if any pool is smaller than the target. */

import type { JoinedChallenge } from './db';

const DEFAULT_DIST = { spot_it: 4, pick_stronger: 2, scenario: 3, real_ai: 1 };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectChallenges(pool: JoinedChallenge[], count = 10): JoinedChallenge[] {
  const byType: Record<string, JoinedChallenge[]> = {
    spot_it: [],
    pick_stronger: [],
    scenario: [],
    real_ai: [],
  };
  for (const c of pool) {
    if (byType[c.type]) byType[c.type].push(c);
  }

  const scale = count / 10;
  const targetCounts: Record<string, number> = {
    spot_it: Math.round(DEFAULT_DIST.spot_it * scale),
    pick_stronger: Math.round(DEFAULT_DIST.pick_stronger * scale),
    scenario: Math.round(DEFAULT_DIST.scenario * scale),
    real_ai: Math.round(DEFAULT_DIST.real_ai * scale),
  };

  const spots = shuffle(byType.spot_it);
  const legits = spots.filter((c) => c.correct_answer === 'legit');
  const scams = spots.filter((c) => c.correct_answer !== 'legit');
  const chosenSpots: JoinedChallenge[] = [];
  const wantSpots = Math.min(targetCounts.spot_it, spots.length);
  if (legits.length && wantSpots > 0) chosenSpots.push(legits[0]);
  for (const c of scams) {
    if (chosenSpots.length >= wantSpots) break;
    chosenSpots.push(c);
  }
  for (const c of legits.slice(1)) {
    if (chosenSpots.length >= wantSpots) break;
    chosenSpots.push(c);
  }

  const chosenPwds = shuffle(byType.pick_stronger).slice(0, Math.min(targetCounts.pick_stronger, byType.pick_stronger.length));
  const chosenScenes = shuffle(byType.scenario).slice(0, Math.min(targetCounts.scenario, byType.scenario.length));
  const chosenAi = shuffle(byType.real_ai).slice(0, Math.min(targetCounts.real_ai, byType.real_ai.length));

  let selected = [...chosenSpots, ...chosenPwds, ...chosenScenes, ...chosenAi];

  if (selected.length < count) {
    const taken = new Set(selected.map((c) => c.key));
    for (const c of shuffle(pool)) {
      if (selected.length >= count) break;
      if (!taken.has(c.key)) {
        selected.push(c);
        taken.add(c.key);
      }
    }
  }

  selected.sort((a, b) => a.difficulty - b.difficulty);
  const trick = selected.find((c) => c.difficulty === 3 && c.correct_answer === 'legit');
  if (trick) {
    selected = selected.filter((c) => c !== trick);
    const insertAt = Math.min(6, selected.length);
    selected.splice(insertAt, 0, trick);
  }

  return selected.slice(0, count);
}
