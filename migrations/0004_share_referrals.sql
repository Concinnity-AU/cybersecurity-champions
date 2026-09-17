-- 0004 — participant share referrals
--
-- sessions.shared_by : the session_id whose share link brought this visitor in
--                      (from the `shared_by` query param set by the /r/ share
--                      landing page). NULL for every other kind of traffic.
--                      Join sessions → sessions on it to follow a share chain
--                      back to the sharer's own campaign.
-- shares.platform    : now also 'linkedin' (no CHECK constraint, no change).
--
-- Additive only. Apply local first, then remote — see docs/how-to/run-migrations.md.
-- ALTER TABLE ADD COLUMN is not idempotent in SQLite: apply this file once.

ALTER TABLE sessions ADD COLUMN shared_by TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_shared_by ON sessions(shared_by);
