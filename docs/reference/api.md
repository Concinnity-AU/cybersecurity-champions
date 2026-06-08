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
return `400` with the Zod issue list.

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
`/api/complete`, `/api/lead`, and `/api/share`.

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

## `POST /api/lead`

Captures a lead (PII) and links it to the completion via `session_id`. This is
the **only** endpoint that requires Turnstile verification.

**Request body**

| Field | Type | Rules |
|---|---|---|
| `session_id` | string | UUID, required |
| `first_name` | string | 1–100 chars |
| `email` | string | valid email, ≤254 chars |
| `phone` | string | optional; `^[+0-9\s()-]{6,}$`; empty string allowed |
| `postcode` | string | optional; `^\d{4}$` (4-digit AU); empty allowed |
| `consent_program` | boolean | **must be `true`** |
| `consent_marketing` | boolean | default `false` |
| `turnstile_token` | string | required, ≥1 char |
| `utm_source` / `utm_medium` / `utm_campaign` | string\|null | optional, ≤120 |

Flow: validate → require `consent_program` → verify Turnstile token against
Cloudflare's siteverify → `INSERT` into `leads` → `UPDATE completions.lead_id`
for the matching session.

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
| `platform` | enum | one of `facebook`, `whatsapp`, `copy`, `native`, `twitter` |

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
fetch logic and error handling. `postShare` is fire-and-forget; the others throw
`Error("HTTP <status>: <detail>")` on non-2xx so the UI can show an error state.
</content>
