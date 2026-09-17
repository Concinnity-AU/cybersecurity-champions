-- 0003 — campaign attribution + funnel events
--
-- sessions : one row per challenge start, carrying first-touch attribution
--            (UTMs + referrer host). Completions, leads and events join to it
--            on session_id, so every funnel stage can be broken down by source.
-- events   : click-level funnel steps that have no table of their own
--            (course CTA click, workshop link click).
-- leads    : gain session_id (direct link, independent of completions),
--            utm_content (creative ID, e.g. from Publer) and referrer.
--
-- Additive only. Apply local first, then remote — see docs/how-to/run-migrations.md.
-- ALTER TABLE ADD COLUMN is not idempotent in SQLite: apply this file once.

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  referrer TEXT,
  embedded INTEGER NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'en',
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('course_cta_click', 'workshop_click')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE leads ADD COLUMN session_id TEXT;
ALTER TABLE leads ADD COLUMN utm_content TEXT;
ALTER TABLE leads ADD COLUMN referrer TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_started ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_source ON sessions(utm_source, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_events_session_type ON events(session_id, event_type);
CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(session_id);
