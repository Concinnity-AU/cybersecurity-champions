# Explanation: Privacy and data

What the app collects, what it deliberately doesn't, and the reasoning. This is a
community cybersecurity-awareness tool — it should model good data hygiene.

## Two kinds of data

The system separates **anonymous engagement data** from **personal data**:

| | `completions` (+ `shares`) | `leads` |
|---|---|---|
| Contains PII? | No | Yes (name, email, optional phone/postcode) |
| Written by | `/api/complete`, `/api/share` | `/api/lead` |
| Requires consent? | No | Yes (`consent_program`) |
| Requires Turnstile? | No | Yes |
| Keyed by | `session_id` (random UUID) | `id`, linked from a completion via `lead_id` |

A `completion` is recorded for **everyone who finishes** the quiz, regardless of
whether they fill in the lead form. It carries the score, tier, timing, and the
answer log — but **no identity**. Only if the user then submits the lead form is
a `lead` created and linked back via `lead_id`.

This split means you get aggregate engagement analytics (how many played, how
they scored, what they shared) without tying it to people, and a separate,
consented list of people who actually want follow-up.

## What is NOT collected

- **No IP addresses** are stored in the database.
- **No accounts, passwords, or login** — there's nothing to breach.
- **No third-party analytics / tracking scripts** baked into the app.
- **No mid-quiz / dropout tracking** today — people who start but bail leave no
  row. (Adding this is a considered roadmap item; see the top-level
  [README](../../README.md) "Roadmap" section — note it would mean recording
  every visit, which is a privacy-notice change.)

## Consent model

`/api/lead` enforces:

- `consent_program` — **required true** to submit at all. This is consent to be
  contacted about the Cybersecurity Champions program.
- `consent_marketing` — **separate, defaults false**. Broader marketing consent
  is opt-in and tracked independently, so you can export "program only" vs
  "marketing OK" segments (see
  [How-to: Export and manage leads](../how-to/export-and-manage-leads.md)).

## Data residency & retention

- Data lives in **Cloudflare D1** in Concinnity's account. There's no automated
  retention/expiry — rows persist until you remove them. If TIMS adopts a
  retention policy, implement it as a periodic delete query.
- There's no automated export pipeline; leads are pulled on demand with wrangler
  and followed up manually. No email is sent by the app.

## Handling a deletion request

The schema makes erasure clean: unlink the lead from its completion(s), then
delete the lead row. The anonymous completion remains, so analytics aren't
distorted. Step-by-step in
[How-to: Export and manage leads](../how-to/export-and-manage-leads.md#deleting-a-lead-right-to-erasure-request).

## Attribution / UTM

`utm_source`, `utm_medium`, and `utm_campaign` are captured from the URL (read
client-side in `lib/config.ts`) and stored on the lead, so you can attribute
sign-ups to a flyer, email, or social campaign. They're optional and length-capped.

## Source attribution for content

The quiz content references real scams reported to **Scamwatch (ACCC)**, the
**NASC**, the **ASD**, **Services Australia**, and **IDCARE**. Per-challenge
provenance can be stored in `challenges.source_note`, and the app surfaces an
in-app Sources list. This keeps the educational content credible and traceable.
</content>
