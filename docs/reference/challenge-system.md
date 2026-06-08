# Reference: Challenge system

How challenges are typed, how a quiz set is assembled, and how scores map to
tiers.

## Challenge types

Defined as a CHECK constraint on `challenges.type` and the `ChallengeType` union
(`functions/_shared/types.ts`):

| Type | Meaning |
|---|---|
| `spot_it` | "Is this a scam or legit?" — spot the red flags. |
| `pick_stronger` | Choose the stronger/safer option of two (e.g. passwords). |
| `scenario` | A situational multiple-choice — "what would you do?". |
| `real_ai` | "Real or AI-generated?" challenges. |

The translatable text (`prompt`, `options`, `explanation`) lives in
`challenge_translations`; the type-specific shape of `options`/`metadata` is JSON
and interpreted by the matching React component under
`frontend/src/components/`.

## Scoring tiers

The tier is computed **server-side** from the raw score in
`functions/_shared/tiers.ts` and stored on the completion. With the default
10-question quiz:

| Score (out of 10) | Tier value | Display label | Colour |
|---|---|---|---|
| 9–10 | `champion` | Cyber Champion | `#FFA51C` |
| 7–8 | `defender` | Cyber Defender | `#2E8B65` |
| 4–6 | `aware` | Cyber Aware | `#F0C020` |
| 0–3 | `learner` | Cyber Learner | `#F15A29` |

```ts
export function tierFor(score: number): Tier {
  if (score >= 9) return 'champion';
  if (score >= 7) return 'defender';
  if (score >= 4) return 'aware';
  return 'learner';
}
```

> The thresholds are absolute score counts (not percentages), tuned for a
> 10-question quiz. If you change the default `count`, revisit these thresholds.

## Selection algorithm

`functions/_shared/selection.ts` builds each quiz from the pool of active
challenges. Goal: a balanced, gently-ramping set that's different each play.

**Type distribution** (for a 10-question quiz, scaled proportionally for other
counts):

| Type | Target count |
|---|---|
| `spot_it` | 4 |
| `pick_stronger` | 2 |
| `scenario` | 3 |
| `real_ai` | 1 |

**Rules applied, in order:**

1. **Bucket** the pool by type and shuffle each bucket.
2. **`spot_it` balance** — ensure at least one "legit" answer is included (so
   the quiz isn't "everything is a scam"), then fill the rest with scams, then
   any remaining legits.
3. **Fill other types** to their targets (shuffled, capped at what's available).
4. **Top-up** — if the combined set is short of `count` (because some pool was
   too small), pull random unused challenges from the whole pool.
5. **Difficulty order** — sort the final set ascending by `difficulty` so it
   ramps up.
6. **Trick placement** — if there's a hard (`difficulty 3`) *legit* item, move
   it to around question 7 (index 6) for a late curveball.
7. **Trim** to `count`.

The algorithm degrades gracefully: if a bucket is empty or small, it takes what
it can and tops up from the rest of the pool rather than failing.

## How a play flows through the system

1. SPA calls `GET /api/challenges?count=10` → gets a `session_id` + ordered
   challenges (with answers + explanations for instant client-side feedback).
2. User answers; the SPA tracks score, streak, and a per-question answer log
   (`App.tsx`).
3. On the last question, SPA calls `POST /api/complete` with the session,
   score, and answer log → server stores the completion and returns the tier +
   share/OG URLs.
4. Optionally, the user submits the lead form → `POST /api/lead` (Turnstile
   verified) → links the lead to the completion.
5. Sharing fires `POST /api/share` per platform.

See [Explanation: Architecture](../explanation/architecture.md) for the request
diagram and [Reference: API](api.md) for endpoint details.
</content>
