# Reference: API

All API routes are Cloudflare Pages Functions under `frontend/functions/`,
served from the same origin as the SPA. File-based routing maps paths to files.

- `/api/*` routes live in `functions/api/` and are wrapped by
  `functions/api/_middleware.ts`, which adds CORS headers and answers `OPTIONS`
  preflight requests (see [Explanation: Security](../explanation/security.md)).
- `/r/:session_id` and `/og/:session_id.png` are **not** under `/api/` and so do
  **not** get CORS headers — they're meant to be loaded directly by browsers and
  social crawlers.

Request bodies are validated with [Zod](https://zod.dev/). Validation failures
return `400` — with the Zod issue list for `/api/complete` and `/api/lead`, and
an empty body for the fire-and-forget endpoints (`/api/start`, `/api/event`,
`/api/share`).

Base URL in production: `https://cybersecurity.tims.org.au`

---

## `GET /api/health`

Liveness check. No parameters.

**Response `200`**

```json
{ "ok": true }
```

Source: `functions/api/health.ts`

---

## `GET /api/challenges`

Returns a randomised, ordered set of active challenges plus a fresh
`session_id`. The session ID is generated here and threaded through
`/api/start`, `/api/complete`, `/api/event`, `/api/lead`, and `/api/share`.

**Query parameters**

| Param | Type | Default | Notes |
|---|---|---|---|
| `lang` | string | `en` | Language code; selects the matching row in `challenge_translations`. |
| `count` | int | `10` | Clamped to the range **1–15**. |

**Response `200`**

```json
{
  "session_id": "uuid-v4",
  "challenges": [
    {
      "key": "fake_mygov_sms_01",
      "type": "spot_it",
      "category": "phishing",
      "difficulty": 1,
      "metadata": { },
      "prompt": "…",
      "options": [ ],
      "correct_answer": "scam",
      "explanation": "…"
    }
  ]
}
```

> **Note:** `correct_answer` and `explanation` are sent to the client. Scoring
> happens client-side; this is a low-stakes awareness quiz, not an exam, so the
> answers are intentionally available to the SPA for instant feedback.

**Response `503`** — no active challenges in the database (run the seed
migration):

```json
{ "error": "No active challenges available" }
```

Selection logic (type distribution, difficulty ordering) is documented in
[Reference: Challenge system](challenge-system.md). Source:
`functions/api/challenges.ts` + `functions/_shared/selection.ts`.

---

## `POST /api/start`

Fire-and-forget analytics: records a challenge start (funnel stage 1) with its
first-touch campaign attribution. The SPA sends it as soon as `/api/challenges`
returns, with `keepalive: true`, and ignores the response. Idempotent per
`session_id` (`INSERT OR IGNORE` into `sessions`).

**Request body**

| Field | Type | Rules |
|---|---|---|
| `session_id` | string | UUID, required |
| `embedded` | boolean | default `false`; `true` when running inside the Squarespace iframe |
| `language` | string | 2–8 chars, default `en` |
| `utm_source` / `utm_medium` / `utm_campaign` | string\|null | optional, ≤120 after trimming; **lower-cased**; empty → `null` |
| `utm_content` | string\|null | optional, ≤120 after trimming; stored **verbatim** (creative IDs, e.g. from Publer, may be case-sensitive); empty → `null` |
| `referrer` | string\|null | optional; a bare hostname (`^[a-z0-9.-]+$` after lower-casing, ≤253) — no scheme, path or query; empty → `null` |
| `shared_by` | string\|null | optional; the sharer's `session_id` when the visitor came through a participant share link. Dropped (the start is still recorded) if it isn't a UUID or equals `session_id` |

The attribution fields are shared with `/api/lead`
(`functions/_shared/attribution.ts`).

**Responses** — all bodyless:

| Status | Meaning |
|---|---|
| `204` | Recorded, **or** the session already existed (silently ignored). |
| `400` | Invalid JSON or validation failure. |

Source: `functions/api/start.ts`.

---

## `POST /api/complete`

Records an **anonymous** completion (no PII). Idempotent per `session_id`: a
second call for the same session updates the existing row rather than inserting
a duplicate. Computes the tier server-side and returns the share + OG URLs.

**Request body**

| Field | Type | Rules |
|---|---|---|
| `session_id` | string | UUID, required |
| `score` | int | 0–100 |
| `total` | int | 1–100 |
| `max_streak` | int | 0–100 |
| `duration_seconds` | int | 0–86400, optional |
| `challenges_seen` | string[] | ≥1 item; challenge keys |
| `answers` | object[] | ≥1 item; `{ key, answer, correct, timeMs }` |
| `language` | string | 2–8 chars, default `en` |

**Response `201`**

```json
{
  "completion_id": 123,
  "session_id": "uuid-v4",
  "tier": "defender",
  "share_url": "https://cybersecurity.tims.org.au/r/uuid-v4",
  "og_image_url": "https://cybersecurity.tims.org.au/og/uuid-v4.png"
}
```

**Errors** — `400` on invalid JSON or validation failure.

`tier` is derived from `score` (see [Challenge system](challenge-system.md)).
Source: `functions/api/complete.ts`.

---

## `POST /api/event`

Fire-and-forget analytics: records a click-level funnel step that has no table
of its own. The client sends it with `keepalive: true` (so it completes even
though the click opens a new tab) and ignores the response.

**Request body**

| Field | Type | Rules |
|---|---|---|
| `session_id` | string | UUID, required |
| `event_type` | enum | `course_cta_click` (the "Start the free course" button) or `workshop_click` (the "Ask about workshops" link) |

Only inserted if a `sessions` row exists for `session_id` (i.e. `/api/start` was
recorded); otherwise silently ignored. Repeat clicks insert repeat rows — count
distinct sessions when reporting.

**Responses** — all bodyless:

| Status | Meaning |
|---|---|
| `204` | Recorded, **or** no matching session found (silently ignored). |
| `400` | Invalid JSON or validation failure. |

Source: `functions/api/event.ts`.

---

## `POST /api/lead`

Captures the optional participant record — name and email (PII), stores it with its
`session_id` and attribution, and links it to the completion (if any). A lead is
a separate measure from a completion, not a gate — the score is shown before the
form. This is the **only** endpoint that requires Turnstile verification.

**Request body**

| Field | Type | Rules |
|---|---|---|
| `session_id` | string | UUID, required |
| `first_name` | string | 1–100 chars |
| `email` | string | valid email, ≤254 chars |
| `phone` | string | optional; `^[+0-9\s()-]{6,}$`, ≤40; empty string allowed. Not sent by the current form. |
| `postcode` | string | optional; `^\d{4}$` (4-digit AU); empty allowed. Not sent by the current form. |
| `consent_program` | boolean | **must be `true`** |
| `consent_marketing` | boolean | default `false`. The current form always sends `false` (no newsletters or marketing). |
| `turnstile_token` | string | required, ≥1 char |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` / `referrer` | string\|null | optional; same rules as [`/api/start`](#post-apistart) |

Flow: validate → require `consent_program` → verify Turnstile token against
Cloudflare's siteverify → `INSERT` into `leads` (including `session_id` and
attribution) → `UPDATE completions.lead_id` for the matching session.

> Requires migration `0003` — without the new `leads` columns the insert fails.

> The `language` column is currently hard-coded to `'en'` on insert (multilingual
> content is a phase-2 item).

**Response `201`**

```json
{ "ok": true, "lead_id": 456 }
```

**Errors**

| Status | Cause |
|---|---|
| `400` | Invalid JSON, validation failure, or `consent_program` not `true`. |
| `403` | `{ "error": "Turnstile verification failed" }` — token invalid or `TURNSTILE_SECRET` wrong/missing. |

Source: `functions/api/lead.ts` + `functions/_shared/turnstile.ts`.

---

## `POST /api/share`

Fire-and-forget analytics: records that a completion was shared on a platform.
The client sends it with `keepalive: true` and ignores the response.

**Request body**

| Field | Type | Rules |
|---|---|---|
| `session_id` | string | UUID, required |
| `platform` | enum | one of `facebook`, `whatsapp`, `linkedin`, `native`, `copy`, `twitter` (X) — `SHARE_PLATFORMS` in `functions/_shared/share.ts` |

`native` is the device share sheet. Where there is none (most desktop
browsers), the Share button copies the link instead and records `copy`.

**Responses** — all bodyless:

| Status | Meaning |
|---|---|
| `204` | Recorded, **or** no matching completion found (silently ignored). |
| `400` | Invalid JSON or validation failure. |

Source: `functions/api/share.ts`.

---

## `GET /r/:session_id`

Server-rendered HTML share landing page with Open Graph and Twitter Card meta
tags, so links pasted into Facebook/WhatsApp/LinkedIn render a rich preview.
Looks up the completion (and the lead's first name, if any) to personalise the
title and description. Falls back to generic copy if the session isn't found.

**Share referrals.** The result screen hands out one link per platform:
`/r/:session_id?via=<platform>`. `via` must be one of the `/api/share`
platforms; anything else is ignored. The page keeps `via` on `og:url`
(Facebook and LinkedIn link the post to `og:url`), and its "Take the
challenge" button points to:

```
https://<PRIMARY_DOMAIN>/?utm_source=<via>&utm_medium=share&utm_campaign=participant_share&shared_by=<session_id>
```

Links with no valid `via` (including links shared before this change) get
`utm_source=shared_link`. If the session isn't found, the button goes to the
plain home page with no referral.

- `Content-Type: text/html`
- `Cache-Control: public, max-age=300, s-maxage=300`
- `Content-Security-Policy: frame-ancestors 'self' https://tims.org.au https://www.tims.org.au`

Source: `functions/r/[session_id].ts`.

---

## `GET /og/:session_id.png`

Dynamically renders a personalised 1200×630 PNG using **satori** (HTML/CSS →
SVG) and **@resvg/resvg-wasm** (SVG → PNG). Used as the `og:image`. Looks up the
completion to embed score, tier, and name; falls back to a generic 10/10
"champion" card if the session isn't found.

- `Content-Type: image/png`
- `Cache-Control: public, max-age=31536000, immutable`
- Returns `500` with body `OG render failed` if rendering throws (check logs;
  usually a missing/incorrect font file).

Source: `functions/og/[session_id].png.ts` + `functions/_shared/og-image.ts`.

---

## Client API wrapper

The SPA calls these endpoints through `frontend/src/lib/api.ts`, which centralises
fetch logic and error handling. `postStart`, `postEvent` and `postShare` are
fire-and-forget (`keepalive: true`, errors ignored); the others throw
`Error("HTTP <status>: <detail>")` on non-2xx so the UI can show an error state.
Attribution values come from `frontend/src/lib/attribution.ts`.
