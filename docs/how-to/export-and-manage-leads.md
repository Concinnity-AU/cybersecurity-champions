# How-to: Export and manage leads

Leads are captured by `POST /api/lead` (the optional participant form —
name and email — on the result screen) into the `leads` table. Each lead stores its
`session_id` and campaign attribution, and is linked from its completion via
`lead_id`.

This app has no admin UI. For browsing, filtering and CSV export, use
**Concinnity Studio** (the internal read-only dashboard over the same D1) — it
lists leads, sessions and completions with their source, and its Analytics page
shows the start → complete → course-click funnel and a by-source table. For
anything else, query D1 directly with wrangler as below. All commands run from
`frontend/`.

Table shape: [Reference: Database schema](../reference/database-schema.md).
Privacy context: [Explanation: Privacy and data](../explanation/privacy-and-data.md).

## Export all leads to a file

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT id, first_name, email, phone, postcode, consent_program,
                    consent_marketing, utm_source, utm_medium, utm_campaign,
                    utm_content, referrer, session_id, created_at
               FROM leads ORDER BY created_at DESC;" \
  --json > leads-export.json
```

`--json` gives a machine-readable file you can import into a spreadsheet or CRM.
Drop `--json` for a readable table in the terminal.

> `leads-export.json` contains PII. Keep it out of the repo (it's not gitignored
> by default — don't commit it), store it securely, and delete it when done.

> Leads are a participant record only — there are no newsletters or marketing
> emails, so don't use this list for mailouts (see
> [Explanation: Privacy and data](../explanation/privacy-and-data.md#consent-model)).

## Leads with their quiz result

Join `leads` to `completions` to see how each lead scored (a lead whose
completion wasn't recorded won't appear):

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT l.first_name, l.email, c.score, c.total, c.tier, c.completed_at
               FROM leads l JOIN completions c ON c.lead_id = l.id
              ORDER BY c.completed_at DESC;" --json > leads-with-results.json
```

## Count leads over a period

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT date(created_at) AS day, count(*) AS leads
               FROM leads GROUP BY day ORDER BY day DESC;"
```

## Basic completion / share analytics

```sh
# completions by tier
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT tier, count(*) FROM completions GROUP BY tier;"

# shares by platform
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT platform, count(*) FROM shares GROUP BY platform ORDER BY 2 DESC;"

# completions that also left their details
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT
               count(*) AS completions,
               sum(CASE WHEN lead_id IS NOT NULL THEN 1 ELSE 0 END) AS leads
             FROM completions;"
```

## Funnel by source

Every stage joins to `sessions` on `session_id`. Sessions only exist from
migration `0003` onwards, so older completions and leads don't appear here.
Counts are distinct sessions (attempts — a retake is a new session). Leads are a
separate measure, not a step after the course click.

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT COALESCE(s.utm_source, s.referrer, '(direct)') AS source,
                    s.utm_medium AS medium, s.utm_campaign AS campaign,
                    s.utm_content AS creative,
                    count(DISTINCT s.session_id) AS started,
                    count(DISTINCT c.session_id) AS completed,
                    count(DISTINCT e.session_id) AS course_clicks,
                    count(DISTINCT l.session_id) AS leads
               FROM sessions s
               LEFT JOIN completions c ON c.session_id = s.session_id
               LEFT JOIN events e ON e.session_id = s.session_id
                                 AND e.event_type = 'course_cta_click'
               LEFT JOIN leads l ON l.session_id = s.session_id
              WHERE s.started_at >= datetime('now', '-90 days')
              GROUP BY 1, 2, 3, 4
              ORDER BY started DESC;"
```

`source` falls back to the referring hostname, then `(direct)`, when there's no
`utm_source`. Course enrolment happens on Tribal Habits and isn't visible here —
`course_clicks` is the last stage we can measure. Swap `'course_cta_click'` for
`'workshop_click'` to count workshop-link clicks instead.

Participant shares show up here as `medium = share`,
`campaign = participant_share`, with the share platform as `source`.

## Share referrals

A share link carries the sharer's session, so a visitor who arrives through it
has `sessions.shared_by` set (from migration `0004`). That lets you follow a
chain: *Facebook campaign → participant scores 7/10 → shares to WhatsApp →
friend completes*.

```sh
# what each sharer's share links brought in, by the sharer's own source
npx wrangler d1 execute cybersecurity-champions-db --remote \n  --command="SELECT COALESCE(a.utm_source, a.referrer, '(direct)') AS sharer_source,
                    a.utm_campaign AS sharer_campaign,
                    f.utm_source AS shared_via,
                    count(DISTINCT f.session_id) AS referred_started,
                    count(DISTINCT c.session_id) AS referred_completed,
                    count(DISTINCT e.session_id) AS referred_course_clicks
               FROM sessions f
               JOIN sessions a ON a.session_id = f.shared_by
               LEFT JOIN completions c ON c.session_id = f.session_id
               LEFT JOIN events e ON e.session_id = f.session_id
                                 AND e.event_type = 'course_cta_click'
              GROUP BY 1, 2, 3
              ORDER BY referred_started DESC;"

# share clicks vs. people they actually brought in, per platform
npx wrangler d1 execute cybersecurity-champions-db --remote \n  --command="SELECT p.platform, p.share_clicks,
                    count(DISTINCT f.session_id) AS referred_started,
                    count(DISTINCT c.session_id) AS referred_completed
               FROM (SELECT platform, count(*) AS share_clicks FROM shares GROUP BY platform) p
               LEFT JOIN sessions f ON f.shared_by IS NOT NULL AND f.utm_source = p.platform
               LEFT JOIN completions c ON c.session_id = f.session_id
              GROUP BY p.platform, p.share_clicks
              ORDER BY referred_started DESC;"
```

The `a` join only walks one step back. A referred visitor who shares again
starts a new link in the chain, so repeat the join to go further. A sharer
who opens their own link counts as a referral: there is nothing in the data to
tell them apart.

## Deleting a lead (right-to-erasure request)

If someone asks to be removed:

```sh
# find them first
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT id, first_name, email FROM leads WHERE email='person@example.com';"

# unlink from completions, then delete the lead row
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="UPDATE completions SET lead_id=NULL WHERE lead_id=<id>;"
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="DELETE FROM leads WHERE id=<id>;"
```

Deleting the lead row is all that's needed. The completion, session, event and
share rows stay — they hold no personal data, and nothing links them to the
person once the lead is gone — so your analytics aren't skewed.
