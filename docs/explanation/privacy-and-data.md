# Explanation: Privacy and data

What the app collects, what it deliberately doesn't, and the reasoning. This is a
community cybersecurity-awareness tool — it should model good data hygiene.

## Two kinds of data

The system separates **anonymous engagement data** from **personal data**:

| | `sessions`, `completions`, `events`, `shares` | `leads` |
|---|---|---|
| Contains PII? | No | Yes (first name, email) |
| Written by | `/api/start`, `/api/complete`, `/api/event`, `/api/share` | `/api/lead` |
| Requires consent? | No | Yes (`consent_program`) |
| Requires Turnstile? | No | Yes |
| Keyed by | `session_id` (random UUID) | `id`; carries `session_id`, and is linked from a completion via `lead_id` |

A `session` is recorded for **everyone who starts** the quiz and a `completion`
for everyone who finishes, regardless of whether they fill in the sign-up form.
Together with click `events` they carry campaign attribution, the score, tier,
timing, and the answer log — but **no identity**. The score is shown straight
away; the sign-up form is optional. Only if the user submits it is a `lead`
created and linked by `session_id`.

This split means you get aggregate engagement analytics (how many started and
finished, how they scored, which campaigns brought them, who clicked through to
the course) without tying it to people, and a separate, consented list of people
who chose to be recorded as program participants.

## What is NOT collected

- **No IP addresses** are stored in the database.
- **No accounts, passwords, or login** — there's nothing to breach.
- **No third-party analytics / tracking scripts** baked into the app.
- **No per-question tracking** — a start is recorded, but not how far someone got
  before leaving.
- **No full referrer URLs** — only the referring hostname (see
  [Attribution](#attribution--utm) below).
- **No cookies.** Attribution is cached in the tab's `sessionStorage` and never
  leaves the browser except with `/api/start` and `/api/lead`.

> Recording every start (the `sessions` table) is a change from launch, when only
> completions were stored. Sessions are anonymous and IP-free, but make sure the
> TIMS privacy notice covers anonymous usage and campaign analytics.

## Consent model

`/api/lead` enforces:

- `consent_program` — **required true** to submit at all. This is consent to be
  recorded as a participant in the Cybersecurity Champions program.
- `consent_marketing` — **separate in the API, defaults false**.

The form is an optional participant record: name and email only, with a
**single checkbox** consenting to TIMS recording the person as a program
participant. It sends `consent_program = true` and `consent_marketing = false`.
There are no newsletters or marketing emails. Leads submitted between the
funnel release and this change may have `consent_marketing = 1` from the
earlier "updates and resources" wording; that consent is not acted on.

> **Phone and postcode:** the `leads` table and the `/api/lead` schema still
> accept optional `phone` and `postcode`, but the current form collects neither.
> Older leads may have a phone number.

## Collection notice and funding acknowledgement

The program is funded under a Department of Home Affairs grant agreement, which
requires TIMS to comply with the Privacy Act 1988 (clause 14) and to
acknowledge the Commonwealth's support in all published material (clause 3.2).

- **Collection notice (APP 5):** an expandable "How TIMS handles your details"
  panel under the participant form says who collects the details and why, that
  they may be included in reports to Home Affairs, that giving them is optional,
  where they're stored (Concinnity, on Cloudflare, possibly offshore), what is
  recorded anonymously, and how to seek access, correction or make a complaint
  (connect@tims.org.au, then the OAIC). TIMS has no public privacy policy to
  link to; if one is published, link it from this panel. Copy lives in
  `STRINGS.result.privacy*` in `frontend/src/lib/strings.ts`.
- **Acknowledgement:** "Supported by the Australian Government through the
  Department of Home Affairs." appears in the app footer (`STRINGS.fundingAck`),
  on the `/r/:session_id` share page, and on the `/og/:session_id.png` share
  image. Home Affairs has not prescribed wording; update all three if it does.

## Data residency & retention

- Data lives in **Cloudflare D1** in Concinnity's account. There's no automated
  retention/expiry — rows persist until you remove them. If TIMS adopts a
  retention policy, implement it as a periodic delete query.
- There's no automated export pipeline; leads are pulled on demand with wrangler
  and followed up manually. No email is sent by the app.

## Handling a deletion request

The schema makes erasure clean: unlink the lead from its completion(s), then
delete the lead row. That is sufficient — the `sessions`, `completions`,
`events` and `shares` rows hold no personal data, and once the lead is gone
nothing ties them to a person. They remain, so analytics aren't distorted.
Step-by-step in
[How-to: Export and manage leads](../how-to/export-and-manage-leads.md#deleting-a-lead-right-to-erasure-request).

## Attribution / UTM

`frontend/src/lib/attribution.ts` captures, on landing:

- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` from the URL
  (optional, ≤120 chars each; `utm_content` typically holds a Publer creative ID).
- `referrer` — the referring site's **hostname only** (e.g. `l.facebook.com`),
  never a path or query string. The server rejects anything that isn't a bare
  hostname.
- `shared_by`: when someone arrives through a participant's share link, the
  sharer's anonymous `session_id`. The share link already contains it, so this
  exposes nothing new. It is stored on the new `sessions` row only, never on
  `leads`.

These are stored on the anonymous `sessions` row (via `/api/start`) and, if the
person signs up, on their `leads` row (via `/api/lead`), so starts, completions,
course clicks and sign-ups can all be attributed to a flyer, email, or social
campaign. When embedded, the Squarespace snippet forwards the host page's UTMs
and referrer hostname to the iframe for the same purpose.

## Source attribution for content

The quiz content references real scams reported to **Scamwatch (ACCC)**, the
**NASC**, the **ASD**, **Services Australia**, and **IDCARE**. Per-challenge
provenance can be stored in `challenges.source_note`, and the app surfaces an
in-app Sources list. This keeps the educational content credible and traceable.
